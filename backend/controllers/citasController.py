from flask import request, jsonify
from models.Citas import Citas
from models.Clientes import Clientes
from models.DetalleCitas import DetalleCitas
from models.Facturas import Facturas
from models.DetalleFacturas import DetalleFacturas
from models.ServiciosProductos import ServiciosProductos
from models.Productos import Productos
from models.HistorialProductosUsados import HistorialProductosUsados
from models.InventarioMovimientos import InventarioMovimientos
from models.Pagos import Pagos
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, validate_estado, validate_telefono, validate_nombre
from models.CortesCaja import CortesCaja
from services.paginationService import get_pagination_params, paginated_response
from services.databaseService import get_db
from datetime import datetime, timedelta, date

# Rate limiting para citas publicas
_public_cita_limits = {}

def _validar_horario_salon(fecha_str, hora_str):
    """Valida que la fecha/hora esté dentro del horario del salón.
    Lun-Vie: 9:00-20:00 | Sáb: 9:00-18:00 | Dom: cerrado.
    Retorna (error_msg, code) o (None, None) si es válido.
    """
    try:
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return jsonify({'error': 'Formato de fecha inválido'}), 400

    dia_semana = fecha.weekday()  # 0=Lun ... 6=Dom

    if dia_semana == 6:
        return jsonify({'error': 'El salón está cerrado los domingos'}), 400

    try:
        partes = hora_str.strip().split(':')
        h, m = int(partes[0]), int(partes[1]) if len(partes) > 1 else 0
    except (ValueError, IndexError):
        return jsonify({'error': 'Formato de hora inválido'}), 400

    minutos = h * 60 + m
    apertura = 9 * 60  # 09:00
    if dia_semana <= 4:  # Lun-Vie
        cierre = 20 * 60  # 20:00
    else:  # Sábado
        cierre = 18 * 60  # 18:00

    if minutos < apertura:
        return jsonify({'error': 'El salón abre a las 09:00'}), 400
    if minutos >= cierre:
        return jsonify({'error': f'El salón cierra a las {cierre // 60}:00. La última cita debe ser antes.'}), 400

    return None, None

def _check_public_limit(ip):
    now = datetime.now()
    if ip in _public_cita_limits:
        count, first = _public_cita_limits[ip]
        if count >= 30 and now - first < timedelta(hours=1):
            return False
        if now - first > timedelta(hours=1):
            _public_cita_limits[ip] = [1, now]
            return True
        _public_cita_limits[ip] = [count + 1, first]
    else:
        _public_cita_limits[ip] = [1, now]
    return True

def _formatear_hora(valor):
    """Convierte un valor TIME (timedelta, str, time) a string HH:MM"""
    if valor is None:
        return None
    if hasattr(valor, 'total_seconds'):  # timedelta
        total_secs = int(valor.total_seconds())
        hh, mm = divmod(total_secs // 60, 60)
        return f'{hh:02d}:{mm:02d}'
    # str o cualquier otro
    s = str(valor).strip().split(':')
    if len(s) >= 2:
        return f'{s[0].zfill(2)}:{s[1].zfill(2)}'
    return None

def _calcular_duracion_total(detalle):
    """Suma la duración en minutos de todos los servicios en el detalle.
    Retorna (duracion_total_en_minutos, error_msg_o_None).
    """
    from models.Servicios import Servicios
    total_minutos = 0
    for d in detalle:
        srv = Servicios.get_by_id(d['servicio_id'])
        if not srv:
            return 0, f"El servicio con ID {d['servicio_id']} no existe"
        duracion = srv.get('ser_duracion') or 60  # default 60 min si no tiene
        total_minutos += int(duracion)
    return total_minutos, None


def get_bloques_disponibles():
    """Devuelve las horas de inicio disponibles para un bloque de N minutos.
    Uso: GET /api/citas/bloques-disponibles?fecha=2025-04-10&duracion=120
    """
    try:
        fecha = request.args.get('fecha')
        duracion_str = request.args.get('duracion')
        if not fecha or not duracion_str:
            return jsonify({'error': 'Se requieren los parámetros fecha y duracion'}), 400

        try:
            duracion = int(duracion_str)
        except (ValueError, TypeError):
            return jsonify({'error': 'duracion debe ser un número entero (minutos)'}), 400

        if duracion <= 0:
            return jsonify({'error': 'duracion debe ser mayor a 0'}), 400

        # Obtener rangos ocupados del día
        rangos = Citas.get_ocupados_con_duracion(fecha)

        # Determinar horario del salón
        try:
            fecha_dt = datetime.strptime(fecha, '%Y-%m-%d').date()
        except (ValueError, TypeError):
            return jsonify({'error': 'Formato de fecha inválido'}), 400

        dia_semana = fecha_dt.weekday()
        if dia_semana == 6:
            return jsonify({'fecha': fecha, 'disponibles': []}), 200  # domingo cerrado

        apertura = 9 * 60  # 09:00
        cierre = 18 * 60 if dia_semana == 5 else 20 * 60  # Sáb 18:00, Lun-Vie 20:00

        disponibles = []
        # Iterar cada franja de 30 minutos
        for mins in range(apertura, cierre, 30):
            hora_inicio = f'{mins // 60:02d}:{mins % 60:02d}'
            hora_fin_num = mins + duracion
            if hora_fin_num > cierre:
                continue  # el bloque no cabe antes del cierre

            # Verificar que no se superponga con ningún rango ocupado
            if Citas.is_bloque_disponible(fecha, hora_inicio, duracion):
                disponibles.append(hora_inicio)

        return jsonify({
            'fecha': fecha,
            'duracion': duracion,
            'disponibles': disponibles
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def get_ocupados():
    """Devuelve las horas ocupadas para una fecha (endpoint público)
    Coincide con is_horario_ocupado: excluye solo canceladas/rechazadas.
    """
    try:
        fecha = request.args.get('fecha')
        if not fecha:
            return jsonify({'error': 'Se requiere el parámetro fecha'}), 400
        
        ocupados = Citas.get_ocupados(fecha)
        horas = []
        for o in ocupados:
            h = _formatear_hora(o.get('cit_hora'))
            if h is not None:
                horas.append(h)
        return jsonify({'fecha': fecha, 'ocupados': horas}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def get_bloques_ocupados():
    """Devuelve los rangos ocupados (inicio-fin) para una fecha.
    Uso: GET /api/citas/bloques-ocupados?fecha=2026-06-26
    Retorna cada bloque ocupado con cit_hora, cit_hora_fin y duracion_total.
    """
    try:
        fecha = request.args.get('fecha')
        if not fecha:
            return jsonify({'error': 'Se requiere el parámetro fecha'}), 400
        
        rangos = Citas.get_ocupados_con_duracion(fecha)
        return jsonify({'fecha': fecha, 'bloques': rangos}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def create_cita_public():
    try:
        ip = request.remote_addr or 'unknown'
        if not _check_public_limit(ip):
            return jsonify({'error': 'Has superado el limite de citas. Intenta mas tarde.'}), 429

        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['cli_telefono', 'cli_nombre', 'cit_fecha', 'cit_hora', 'detalle'])
        if err: return err, code

        # ── Validar que detalle tenga al menos un servicio ──
        detalle = data.get('detalle', [])
        if not isinstance(detalle, list) or len(detalle) == 0:
            return jsonify({'error': 'Debe seleccionar al menos un servicio'}), 400
        for d in detalle:
            if not d.get('servicio_id') or not d.get('precio'):
                return jsonify({'error': 'Cada detalle requiere servicio_id y precio'}), 400

        # ── Validar teléfono ──
        err = validate_telefono(data, 'cli_telefono')
        if err: return err
        if data.get('cli_nombre'):
            err = validate_nombre(data, 'cli_nombre')
            if err: return err

        # ── Validación de fechas ──
        try:
            cit_fecha = datetime.strptime(data.get('cit_fecha'), '%Y-%m-%d').date()
            cit_hora = data.get('cit_hora')
            # Normalizar hora (aceptar HH:MM o HH:MM:SS)
            if ':' in cit_hora:
                parts = cit_hora.split(':')
                cit_hora = f'{parts[0]}:{parts[1]}:00'
        except (ValueError, AttributeError):
            return jsonify({'error': 'Formato de fecha/hora inválido'}), 400
        
        hoy = date.today()
        if cit_fecha < hoy:
            return jsonify({'error': 'No se pueden agendar citas en fechas pasadas'}), 400
        
        if cit_fecha == hoy:
            # El servidor corre en UTC, pero el salón está en Colombia (UTC-5)
            # Convertimos la hora que el usuario eligió (hora local Colombia) a UTC
            from datetime import timezone
            COLOMBIA_OFFSET = timedelta(hours=-5)
            ahora_utc = datetime.now(timezone.utc).replace(tzinfo=None)
            try:
                hora_parts = cit_hora.split(':')
                # Hora local del usuario en Colombia
                cita_local = datetime(hoy.year, hoy.month, hoy.day, int(hora_parts[0]), int(hora_parts[1]))
                # Convertir a UTC sumando 5 horas (porque Colombia está 5h atrás de UTC)
                cita_utc = cita_local + timedelta(hours=5)
                if cita_utc <= ahora_utc + timedelta(hours=1):
                    return jsonify({'error': 'La cita debe ser mínimo 1 hora después de la hora actual'}), 400
            except (ValueError, IndexError):
                return jsonify({'error': 'Formato de hora inválido'}), 400
        
        # ── Validar horario del salón ──
        err_horario, code_horario = _validar_horario_salon(data.get('cit_fecha'), cit_hora)
        if err_horario: return err_horario, code_horario

        # ── Validar que los servicios existan ANTES de crear la cita ──
        from models.Servicios import Servicios
        detalle = data.get('detalle', [])
        for d in detalle:
            if not d.get('servicio_id') or not d.get('precio'):
                return jsonify({'error': 'Cada detalle requiere servicio_id y precio'}), 400
            srv = Servicios.get_by_id(d['servicio_id'])
            if not srv:
                return jsonify({'error': f"El servicio con ID {d['servicio_id']} no existe"}), 400

        # ── Validar que el bloque completo quepa en la agenda ──
        duracion_total, err_duracion = _calcular_duracion_total(detalle)
        if err_duracion:
            return jsonify({'error': err_duracion}), 400
        hora_simple = data.get('cit_hora', '').strip()[:5]
        if not Citas.is_bloque_disponible(data.get('cit_fecha'), hora_simple, duracion_total):
            return jsonify({
                'error': f'El bloque de {duracion_total} minutos no está disponible a las {hora_simple}. '
                         f'Intenta con otro horario.'
            }), 409

        # Normalizar teléfono antes de buscar/guardar
        import re
        data['cli_telefono'] = re.sub(r'[\s\-\(\)\+]', '', data['cli_telefono'])

        nombre_form = data.get('cli_nombre', '').strip().lower()
        apellido_form = data.get('cli_apellido', '').strip().lower()
        nombre_completo_form = f'{nombre_form} {apellido_form}'.strip()

        # 1. Si se envía cli_id, buscar por ID (viene de autocompletado en frontend)
        cliente_id = data.get('cli_id')
        if cliente_id:
            cliente = Clientes.get_by_id(cliente_id)
            if not cliente:
                return jsonify({'error': 'Cliente no encontrado'}), 404
            # Actualizar teléfono si cambió
            if cliente.get('cli_telefono') != data.get('cli_telefono'):
                Clientes.update(cliente_id, {
                    'cli_nombre': cliente.get('cli_nombre'),
                    'cli_apellido': cliente.get('cli_apellido'),
                    'cli_telefono': data.get('cli_telefono'),
                    'cli_direccion': cliente.get('cli_direccion', '')
                })
        else:
            # 2. Buscar por teléfono
            cliente = Clientes.get_by_telefono(data.get('cli_telefono'))
            if not cliente:
                # 3. Teléfono nuevo: verificar si el nombre pertenece a un cliente existente
                existente_mismo_nombre = Clientes.query_one(
                    """SELECT * FROM clientes 
                       WHERE LOWER(TRIM(cli_nombre)) = %s 
                          OR CONCAT(LOWER(TRIM(cli_nombre)), ' ', LOWER(TRIM(COALESCE(cli_apellido, '')))) = %s
                       LIMIT 1""",
                    (nombre_completo_form, nombre_completo_form)
                )
                if existente_mismo_nombre:
                    # Actualizar teléfono del cliente existente
                    Clientes.update(existente_mismo_nombre['cli_id'], {
                        'cli_nombre': existente_mismo_nombre.get('cli_nombre'),
                        'cli_apellido': existente_mismo_nombre.get('cli_apellido'),
                        'cli_telefono': data.get('cli_telefono'),
                        'cli_direccion': existente_mismo_nombre.get('cli_direccion', '')
                    })
                    cliente_id = existente_mismo_nombre['cli_id']
                else:
                    cliente_id = Clientes.create({
                        'cli_nombre': data.get('cli_nombre'),
                        'cli_apellido': data.get('cli_apellido'),
                        'cli_telefono': data.get('cli_telefono'),
                        'cli_direccion': data.get('cli_direccion', '')
                    })
            else:
                # Teléfono existe: verificar que el nombre coincida
                nombre_existente = (cliente.get('cli_nombre') or '').strip().lower()
                apellido_existente = (cliente.get('cli_apellido') or '').strip().lower()
                if nombre_form != nombre_existente or apellido_form != apellido_existente:
                    return jsonify({
                        'error': f'El teléfono {data.get("cli_telefono")} ya está registrado con otro nombre. '
                                 f'Usa los datos del cliente existente o contacta al salón.'
                    }), 400
                cliente_id = cliente['cli_id']
        
        cita_id = Citas.create({
            'cit_cliente_id': cliente_id,
            'cit_fecha': data.get('cit_fecha'),
            'cit_hora': cit_hora,
            'cit_estado': 'pendiente'
        })
        
        total = 0
        for d in detalle:
            DetalleCitas.create({
                'dci_cita_id': cita_id,
                'dci_servicio_id': d['servicio_id'],
                'dci_precio': d['precio']
            })
            total += float(d['precio'])
        
        return jsonify({
            'message': 'Cita solicitada exitosamente',
            'cita_id': cita_id,
            'total': total
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_citas():
    try:
        page, limit, offset = get_pagination_params()
        estado = request.args.get('estado')
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        
        citas = Citas.get_all(estado, fecha_inicio, fecha_fin, limit=limit, offset=offset)
        
        for cita in citas:
            cita['detalle'] = DetalleCitas.get_by_cita(cita['cit_id'])
        
        total = Citas.count_all(estado)
        return jsonify(paginated_response(citas, total, page, limit)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_cita(id):
    try:
        cita = Citas.get_by_id(id)
        if not cita:
            return jsonify({'error': 'Cita no encontrada'}), 404
        
        cita['detalle'] = DetalleCitas.get_by_cita(id)
        return jsonify(cita), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def update_cita_estado(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        estado = data.get('estado')
        
        err, code, _ = require_fields(data, ['estado'])
        if err: return err, code
        err = validate_estado(data, 'estado', ['pendiente', 'aprobada', 'rechazada', 'cancelada', 'completada'])
        if err: return err

        # ── Evitar re-completar una cita ya completada ──
        cita_actual = Citas.get_by_id(id)
        if not cita_actual:
            return jsonify({'error': 'Cita no encontrada'}), 404
        if cita_actual['cit_estado'] == estado:
            return jsonify({'message': f'La cita ya está en estado {estado}'}), 200
        if cita_actual['cit_estado'] == 'completada':
            return jsonify({'error': 'No se puede cambiar el estado de una cita ya completada'}), 400
        
        # ── Verificar caja abierta si se completa la cita (genera factura) ──
        if estado == 'completada':
            # ── No permitir completar citas con fecha futura ──
            from datetime import date as dt_date
            cit_fecha = cita_actual['cit_fecha']
            if isinstance(cit_fecha, str):
                cit_fecha = datetime.strptime(cit_fecha, '%Y-%m-%d').date()
            elif isinstance(cit_fecha, datetime):
                cit_fecha = cit_fecha.date()
            if cit_fecha > dt_date.today():
                return jsonify({
                    'error': f'No se puede completar una cita antes de su fecha programada. '
                             f'La cita es para el {cit_fecha.strftime("%d/%m/%Y")}'
                }), 400

            corte = CortesCaja.get_abierto()
            if not corte:
                return jsonify({'error': 'No hay un corte de caja abierto. Debe abrir caja antes de completar citas.'}), 400
            
            # ── No permitir completar citas anteriores a la apertura del corte ──
            # Así los ingresos de servicios pasados no inflan el corte actual.
            cit_fecha = cita_actual['cit_fecha']
            if isinstance(cit_fecha, str):
                cit_fecha = datetime.strptime(cit_fecha, '%Y-%m-%d').date()
            elif isinstance(cit_fecha, datetime):
                cit_fecha = cit_fecha.date()
            apertura = corte['cor_fecha_apertura']
            if isinstance(apertura, str):
                apertura = datetime.fromisoformat(apertura).date()
            elif isinstance(apertura, datetime):
                apertura = apertura.date()
            if cit_fecha < apertura:
                return jsonify({'error': 'No se puede completar una cita con fecha anterior a la apertura de caja'}), 400

            # ── Evitar factura duplicada para la misma cita ──
            existente = Facturas.get_by_cita(id)
            if existente:
                return jsonify({'error': 'Ya existe una factura para esta cita'}), 400

            # ── VERIFICAR STOCK ANTES DE CUALQUIER CAMBIO ──
            detalle = DetalleCitas.get_by_cita(id)
            todos_faltantes = []
            for d in detalle:
                productos_servicio = ServiciosProductos.get_by_servicio(d['dci_servicio_id'])
                for sp in productos_servicio:
                    stock_actual = sp.get('pro_stock') or 0
                    if stock_actual < sp['sep_cantidad']:
                        todos_faltantes.append(
                            f"{sp['pro_nombre']} (disponible: {stock_actual}, requerido: {sp['sep_cantidad']})"
                        )
            if todos_faltantes:
                return jsonify({
                    'error': f"No hay suficiente stock para completar el servicio. Productos faltantes: {'; '.join(todos_faltantes)}"
                }), 400

        Citas.update_estado(id, estado)
        
        if estado == 'completada':
            total = sum(float(d['dci_precio']) for d in detalle)
            factura_id = Facturas.create(id, total)

            # ── Procesar pagos (divididos o único) ──
            pagos = data.get('pagos')
            if pagos:
                suma_pagos = sum(float(p['monto']) for p in pagos)
                if abs(suma_pagos - total) > 0.01:
                    return jsonify({'error': f'La suma de los pagos (${suma_pagos:,.0f}) no coincide con el total (${total:,.0f})'}), 400
                for p in pagos:
                    Pagos.create(factura_id, p['metodo'], p['monto'])
            else:
                # Compatibilidad hacia atrás: un solo pago en efectivo
                Pagos.create(factura_id, 'efectivo', total)

            # Marcar la factura como pagada
            Facturas.update_estado(factura_id, 'pagado')
            
            # Obtener nombre del cliente para agrupar movimientos de la cita
            cliente = Clientes.get_by_id(cita_actual['cit_cliente_id'])
            nombre_cliente = f"{cliente['cli_nombre']} {cliente.get('cli_apellido', '')}".strip()
            motivo_cita = f"Cita #{id} - {nombre_cliente}"
            
            for d in detalle:
                DetalleFacturas.create({
                    'dfa_factura_id': factura_id,
                    'dfa_servicio_id': d['dci_servicio_id'],
                    'dfa_subtotal': d['dci_precio']
                })
                # Descontar stock de los productos asociados al servicio
                productos_servicio = ServiciosProductos.get_by_servicio(d['dci_servicio_id'])
                for sp in productos_servicio:
                    Productos.update_stock(sp['sep_producto_id'], -sp['sep_cantidad'])
                    # Registrar movimiento de inventario (consumo en servicio)
                    InventarioMovimientos.create({
                        'inm_producto_id': sp['sep_producto_id'],
                        'inm_cita_id': id,
                        'inm_tipo': 'Salida',
                        'inm_cantidad': sp['sep_cantidad'],
                        'inm_motivo': motivo_cita
                    })
                    # Registrar en historial de productos usados
                    servicio_nombre = d.get('ser_nombre', 'Servicio')
                    HistorialProductosUsados.create({
                        'hpu_cita_id': id,
                        'hpu_producto_id': sp['sep_producto_id'],
                        'hpu_notas': f'Usado en: {servicio_nombre}'
                    })
        
        return jsonify({'message': f'Cita {estado} exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_cita_admin():
    """Agendar cita manualmente desde el panel de administracion"""
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['cli_nombre', 'cli_telefono', 'cit_fecha', 'cit_hora', 'detalle'])
        if err: return err, code

        # ── Validar nombre y teléfono ──
        err = validate_nombre(data, 'cli_nombre')
        if err: return err
        err = validate_telefono(data, 'cli_telefono')
        if err: return err

        # ── Validar que la fecha no sea pasada ──
        try:
            cit_fecha_dt = datetime.strptime(data.get('cit_fecha'), '%Y-%m-%d').date()
        except (ValueError, TypeError):
            return jsonify({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
        if cit_fecha_dt < date.today():
            return jsonify({'error': 'No se pueden agendar citas en fechas pasadas'}), 400

        # ── Validar horario del salón ──
        err_horario, code_horario = _validar_horario_salon(data.get('cit_fecha'), data.get('cit_hora'))
        if err_horario: return err_horario, code_horario

        # ── Validar que los servicios existan ANTES de crear la cita ──
        from models.Servicios import Servicios
        detalle = data.get('detalle', [])
        for d in detalle:
            if not d.get('servicio_id') or not d.get('precio'):
                return jsonify({'error': 'Cada detalle requiere servicio_id y precio'}), 400
            srv = Servicios.get_by_id(d['servicio_id'])
            if not srv:
                return jsonify({'error': f"El servicio con ID {d['servicio_id']} no existe"}), 400

        # ── Validar que el bloque completo quepa en la agenda ──
        duracion_total, err_duracion = _calcular_duracion_total(detalle)
        if err_duracion:
            return jsonify({'error': err_duracion}), 400
        hora_simple = data.get('cit_hora', '').strip()[:5]
        if not Citas.is_bloque_disponible(data.get('cit_fecha'), hora_simple, duracion_total):
            return jsonify({
                'error': f'El bloque de {duracion_total} minutos no está disponible a las {hora_simple}. '
                         f'Intenta con otro horario.'
            }), 409

        # Si se envía cli_id, usarlo directamente; si no, buscar/crear por teléfono
        cliente_id = data.get('cli_id')
        # Normalizar teléfono antes de buscar/guardar
        import re
        data['cli_telefono'] = re.sub(r'[\s\-\(\)\+]', '', data['cli_telefono'])

        if not cliente_id:
            cliente = Clientes.get_by_telefono(data.get('cli_telefono'))
            if not cliente:
                cliente_id = Clientes.create({
                    'cli_nombre': data.get('cli_nombre'),
                    'cli_apellido': data.get('cli_apellido', ''),
                    'cli_telefono': data.get('cli_telefono'),
                    'cli_direccion': data.get('cli_direccion', '')
                })
            else:
                return jsonify({
                    'error': f"El teléfono {data.get('cli_telefono')} ya pertenece a {cliente.get('cli_nombre', '')} {cliente.get('cli_apellido', '')}. Debes seleccionar ese cliente de la lista."
                }), 400
        
        cita_id = Citas.create({
            'cit_cliente_id': cliente_id,
            'cit_fecha': data.get('cit_fecha'),
            'cit_hora': data.get('cit_hora'),
            'cit_estado': data.get('cit_estado', 'aprobada')
        })
        
        total = 0
        for d in detalle:
            DetalleCitas.create({
                'dci_cita_id': cita_id,
                'dci_servicio_id': d['servicio_id'],
                'dci_precio': d['precio']
            })
            total += float(d['precio'])
        
        return jsonify({
            'message': 'Cita agendada exitosamente',
            'cita_id': cita_id,
            'total': total
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def reprogramar_cita(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['cit_fecha', 'cit_hora'])
        if err: return err, code

        nueva_fecha = data.get('cit_fecha')
        nueva_hora = data.get('cit_hora')

        # ── Validar que la fecha no sea pasada ──
        try:
            fecha_dt = datetime.strptime(nueva_fecha, '%Y-%m-%d').date()
        except (ValueError, TypeError):
            return jsonify({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
        if fecha_dt < date.today():
            return jsonify({'error': 'No se puede reprogramar a una fecha pasada'}), 400

        # ── Validar horario del salón ──
        err_horario, code_horario = _validar_horario_salon(nueva_fecha, nueva_hora)
        if err_horario: return err_horario, code_horario

        # ── Validar bloque completo para la cita existente ──
        detalle = DetalleCitas.get_by_cita(id)
        detalle_simple = [{
            'servicio_id': d['dci_servicio_id'],
            'precio': d.get('dci_precio', 0)
        } for d in detalle]
        if detalle_simple:
            duracion_total, err_duracion = _calcular_duracion_total(detalle_simple)
            if err_duracion:
                return jsonify({'error': err_duracion}), 400
            if not Citas.is_bloque_disponible(nueva_fecha, nueva_hora.strip()[:5], duracion_total, exclude_id=id):
                return jsonify({
                    'error': f'El bloque de {duracion_total} minutos no está disponible a las {nueva_hora.strip()[:5]}. '
                             f'Intenta con otro horario.'
                }), 409

        Citas.reprogramar(id, nueva_fecha, nueva_hora)
        return jsonify({'message': 'Cita reprogramada exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_required
def proximas_citas():
    """Devuelve las próximas citas (hoy + próximos 7 días, pendientes y aprobadas)
    con sus servicios agrupados.
    Endpoint dedicado para la sección 'Próximas citas' del dashboard.
    """
    try:
        db = get_db()
        cursor = db.cursor()
        hoy = date.today()
        hasta = hoy + timedelta(days=7)

        sql = """
            SELECT
                c.cit_id,
                c.cit_hora,
                c.cit_estado,
                c.cit_fecha,
                cl.cli_nombre,
                cl.cli_apellido,
                COALESCE(GROUP_CONCAT(s.ser_nombre SEPARATOR ', '), '') AS servicios,
                COALESCE(SUM(d.dci_precio), 0) AS precio_total
            FROM citas c
            JOIN clientes cl ON c.cit_cliente_id = cl.cli_id
            LEFT JOIN detalle_citas d ON c.cit_id = d.dci_cita_id
            LEFT JOIN servicios s ON d.dci_servicio_id = s.ser_id
            WHERE c.cit_fecha >= %s
              AND c.cit_fecha <= %s
              AND c.cit_estado IN ('pendiente', 'aprobada')
            GROUP BY c.cit_id, c.cit_hora, c.cit_estado, c.cit_fecha, cl.cli_nombre, cl.cli_apellido
            ORDER BY c.cit_fecha ASC, c.cit_hora ASC
            LIMIT 20
        """
        cursor.execute(sql, (hoy, hasta,))
        rows = cursor.fetchall()

        citas = []
        for r in rows:
            # Formatear hora: '09:30:00' → '09:30', timedelta → 'HH:MM'
            hora_raw = r.get('cit_hora')
            if hora_raw is None:
                hora_str = ''
            elif hasattr(hora_raw, 'total_seconds'):
                # timedelta
                total_secs = int(hora_raw.total_seconds())
                h, m = divmod(total_secs // 60, 60)
                hora_str = f'{h:02d}:{m:02d}'
            else:
                # str o time → tomar solo HH:MM
                hora_str = str(hora_raw).strip()[:5].rstrip(':')

            citas.append({
                'cit_id': r['cit_id'],
                'hora': hora_str,
                'fecha': str(r.get('cit_fecha', '')),
                'estado': r.get('cit_estado', ''),
                'cliente': f"{r.get('cli_nombre', '') or ''} {r.get('cli_apellido', '') or ''}".strip(),
                'servicios': r.get('servicios', '') or '',
                'precio_total': float(r.get('precio_total', 0) or 0),
            })

        return jsonify({
            'fecha': hoy.isoformat(),
            'total': len(citas),
            'citas': citas,
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error al obtener próximas citas: {str(e)}'}), 500