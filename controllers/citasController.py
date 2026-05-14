from flask import request, jsonify
from models.Citas import Citas
from models.Clientes import Clientes
from models.DetalleCitas import DetalleCitas
from models.Facturas import Facturas
from models.DetalleFacturas import DetalleFacturas
from models.ServiciosProductos import ServiciosProductos
from models.Productos import Productos
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, validate_estado
from services.paginationService import get_pagination_params, paginated_response
from datetime import datetime, timedelta

# Rate limiting para citas publicas
_public_cita_limits = {}

def _check_public_limit(ip):
    now = datetime.now()
    if ip in _public_cita_limits:
        count, first = _public_cita_limits[ip]
        if count >= 3 and now - first < timedelta(hours=1):
            return False
        if now - first > timedelta(hours=1):
            _public_cita_limits[ip] = [1, now]
            return True
        _public_cita_limits[ip] = [count + 1, first]
    else:
        _public_cita_limits[ip] = [1, now]
    return True

def create_cita_public():
    try:
        ip = request.remote_addr or 'unknown'
        if not _check_public_limit(ip):
            return jsonify({'error': 'Has superado el limite de citas. Intenta mas tarde.'}), 429
        
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['cli_telefono', 'cit_fecha', 'cit_hora'])
        if err: return err, code
        
        cliente = Clientes.get_by_telefono(data.get('cli_telefono'))
        if not cliente:
            cliente_id = Clientes.create({
                'cli_nombre': data.get('cli_nombre'),
                'cli_apellido': data.get('cli_apellido'),
                'cli_telefono': data.get('cli_telefono'),
                'cli_direccion': data.get('cli_direccion', '')
            })
        else:
            cliente_id = cliente['cli_id']
        
        cita_id = Citas.create({
            'cit_cliente_id': cliente_id,
            'cit_fecha': data.get('cit_fecha'),
            'cit_hora': data.get('cit_hora'),
            'cit_estado': 'pendiente'
        })
        
        total = 0
        for detalle in data.get('detalle', []):
            if not detalle.get('servicio_id') or not detalle.get('precio'):
                return jsonify({'error': 'Cada detalle requiere servicio_id y precio'}), 400
            DetalleCitas.create({
                'dci_cita_id': cita_id,
                'dci_servicio_id': detalle.get('servicio_id'),
                'dci_precio': detalle.get('precio')
            })
            total += float(detalle.get('precio', 0))
        
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
        
        Citas.update_estado(id, estado)
        
        if estado == 'completada':
            detalle = DetalleCitas.get_by_cita(id)
            total = sum(float(d['dci_precio']) for d in detalle)
            factura_id = Facturas.create(id, total)
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
        
        return jsonify({'message': f'Cita {estado} exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def reprogramar_cita(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['cit_fecha', 'cit_hora'])
        if err: return err, code
        
        Citas.reprogramar(id, data.get('cit_fecha'), data.get('cit_hora'))
        return jsonify({'message': 'Cita reprogramada exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500