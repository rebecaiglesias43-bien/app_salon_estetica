from flask import request, jsonify
from datetime import date, datetime, timedelta
from services.authService import auth_required
from services.databaseService import get_db

def _get_date_range(periodo):
    """Devuelve (desde, hasta) para el periodo dado."""
    hoy = date.today()
    if periodo == 'diario':
        return hoy, hoy
    elif periodo == 'semanal':
        inicio_semana = hoy - timedelta(days=hoy.weekday())  # lunes
        return inicio_semana, hoy
    elif periodo == 'mensual':
        inicio_mes = hoy.replace(day=1)
        return inicio_mes, hoy
    return None, None  # sin filtro


@auth_required
def dashboard():
    """Endpoint para el dashboard administrativo.
    Vista general (sin corte_id) → métricas de hoy.
    ?corte_id=X → métricas filtradas por ese rango.
    Las próximas citas se obtienen por separado en GET /api/citas/proximas.
    """
    try:
        db = get_db()
        cursor = db.cursor()
        hoy = date.today()

        # ── Determinar si se pidió un corte específico ──
        corte_id = request.args.get('corte_id', type=int)
        if corte_id:
            cursor.execute("SELECT * FROM cortes_caja WHERE cor_id = %s", (corte_id,))
            corte = cursor.fetchone()
            if not corte:
                return jsonify({'error': 'Corte no encontrado'}), 404
            desde_raw = corte['cor_fecha_apertura']
            desde = desde_raw.date() if hasattr(desde_raw, 'date') else datetime.fromisoformat(str(desde_raw)).date()
            hasta_raw = corte.get('cor_fecha_cierre')
            if hasta_raw:
                hasta = hasta_raw.date() if hasattr(hasta_raw, 'date') else datetime.fromisoformat(str(hasta_raw)).date()
            else:
                hasta = hoy
            es_general = False
        else:
            # Vista general: devolver TODAS las citas (sin filtro de fecha)
            desde = None
            hasta = None
            es_general = True

        # Total de citas para HOY (conteo simple)
        cursor.execute(
            "SELECT COUNT(*) as total FROM citas WHERE cit_fecha = %s",
            (hoy,)
        )
        total_citas_hoy = cursor.fetchone()['total']

        # ═══════════════════════════════════════════════════════════
        #  INGRESOS DE HOY
        # ═══════════════════════════════════════════════════════════
        if es_general:
            cursor.execute(
                "SELECT COALESCE(SUM(fac_total), 0) as total FROM facturas WHERE fac_estado = 'pagado' AND DATE(fac_fecha) = %s",
                (hoy,)
            )
        else:
            cursor.execute(
                "SELECT COALESCE(SUM(fac_total), 0) as total FROM facturas WHERE fac_estado = 'pagado' AND DATE(fac_fecha) BETWEEN %s AND %s",
                (desde, hasta)
            )
        ingresos_periodo = float(cursor.fetchone()['total'])

        # ═══════════════════════════════════════════════════════════
        #  CLIENTES NUEVOS (primera cita HOY)
        # ═══════════════════════════════════════════════════════════
        cursor.execute(
            """SELECT COUNT(DISTINCT c.cit_cliente_id) as total
               FROM citas c
               WHERE c.cit_fecha = %s
               AND c.cit_cliente_id IS NOT NULL
               AND c.cit_cliente_id NOT IN (
                   SELECT DISTINCT c2.cit_cliente_id FROM citas c2 WHERE c2.cit_fecha < %s AND c2.cit_cliente_id IS NOT NULL
               )""",
            (hoy, hoy)
        )
        clientes_nuevos = cursor.fetchone()['total']

        # ═══════════════════════════════════════════════════════════
        #  SERVICIOS ACTIVOS
        # ═══════════════════════════════════════════════════════════
        cursor.execute("SELECT COUNT(*) as total FROM servicios")
        servicios_activos = cursor.fetchone()['total']

        # ═══════════════════════════════════════════════════════════
        #  INGRESOS SEMANALES (gráfica)
        # ═══════════════════════════════════════════════════════════
        ingresos_semanales = []
        if es_general:
            for i in range(6, -1, -1):
                dia = hoy - timedelta(days=i)
                cursor.execute(
                    "SELECT COALESCE(SUM(fac_total), 0) as total FROM facturas WHERE fac_estado = 'pagado' AND DATE(fac_fecha) = %s",
                    (dia.isoformat(),)
                )
                total_dia = float(cursor.fetchone()['total'])
                dias_semana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
                nombre = dias_semana[dia.weekday()]
                # Domingos: el salón está cerrado, forzar a 0
                if dia.weekday() == 6:
                    total_dia = 0.0
                ingresos_semanales.append({
                    'name': nombre,
                    'fecha': dia.isoformat(),
                    'ingresos': total_dia
                })

        # ═══════════════════════════════════════════════════════════
        #  ACTIVIDAD RECIENTE
        # ═══════════════════════════════════════════════════════════
        cursor.execute(
            """SELECT 'venta' as tipo, fac_id as id, fac_total as monto, fac_fecha, fac_estado,
                      COALESCE(cl_cita.cli_nombre, cl_dir.cli_nombre) as cli_nombre
               FROM facturas f
               LEFT JOIN citas c ON f.fac_cita_id = c.cit_id
               LEFT JOIN clientes cl_cita ON c.cit_cliente_id = cl_cita.cli_id
               LEFT JOIN clientes cl_dir ON f.fac_cliente_id = cl_dir.cli_id
               ORDER BY f.fac_fecha DESC, f.fac_id DESC
               LIMIT 10"""
        )
        facturas_periodo = cursor.fetchall()

        cursor.execute(
            """SELECT 'compra' as tipo, com_id as id, com_total as monto, com_fecha, com_estado, prv.prv_nombre
               FROM compras co
               JOIN proveedores prv ON co.com_proveedor_id = prv.prv_id
               ORDER BY co.com_fecha DESC, co.com_id DESC
               LIMIT 10"""
        )
        compras_periodo = cursor.fetchall()

        actividad = []
        for f in facturas_periodo:
            actividad.append({
                'tipo': 'venta',
                'texto': f"{f['cli_nombre'] or 'Venta directa'} — Factura #{f['id']}",
                'monto': float(f['monto'] or 0),
                'fecha': f['fac_fecha'].isoformat() if hasattr(f['fac_fecha'], 'isoformat') else str(f['fac_fecha'])
            })
        for c in compras_periodo:
            actividad.append({
                'tipo': 'compra',
                'texto': f"Compra #{c['id']} — {c['prv_nombre']}",
                'monto': float(c['monto'] or 0),
                'fecha': c['com_fecha'].isoformat() if hasattr(c['com_fecha'], 'isoformat') else str(c['com_fecha'])
            })
        actividad.sort(key=lambda x: x['fecha'], reverse=True)
        actividad = actividad[:10]

        return jsonify({
            'ingresos_hoy': ingresos_periodo,
            'total_citas_hoy': total_citas_hoy,
            'clientes_nuevos': clientes_nuevos,
            'servicios_activos': servicios_activos,
            'ingresos_semanales': ingresos_semanales if ingresos_semanales else [{'name': 'Período', 'fecha': '', 'ingresos': ingresos_periodo}],
            'actividad': actividad
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error en dashboard: {str(e)}'}), 500


@auth_required
def resumen():
    """Resumen financiero.
    - Sin parametros → datos historicos TOTALES
    - ?periodo=diario|semanal|mensual → filtra por periodo
    - ?corte_id=X → filtra por ese corte especifico
    - El corte abierto (si existe) se muestra como info adicional, NO como filtro
    """
    from datetime import datetime
    try:
        db = get_db()
        cursor = db.cursor()

        periodo = request.args.get('periodo', '').strip().lower()
        corte_id = request.args.get('corte_id', type=int)

        # ── Determinar filtro de fechas ──
        if corte_id:
            cursor.execute("SELECT * FROM cortes_caja WHERE cor_id = %s", (corte_id,))
            corte = cursor.fetchone()
            if not corte:
                return jsonify({'error': 'Corte no encontrado'}), 404
            desde = corte['cor_fecha_apertura']
            if isinstance(desde, str):
                desde = datetime.fromisoformat(desde)
            hasta = corte.get('cor_fecha_cierre') or datetime.now()
            if isinstance(hasta, str):
                hasta = datetime.fromisoformat(hasta)
            usar_fecha = True
            corte_info = {
                'cor_id': corte['cor_id'], 'fecha_apertura': corte['cor_fecha_apertura'],
                'base_inicial': float(corte['cor_base_inicial']),
                'ingresos': float(corte['cor_ingresos'] or 0),
                'egresos': float(corte['cor_egresos'] or 0),
                'ganancia_neta': float(corte['cor_ganancia_neta'] or 0),
                'periodo': corte['cor_periodo'], 'estado': corte['cor_estado']
            }
        elif periodo:
            desde, hasta = _get_date_range(periodo)
            usar_fecha = bool(desde)
            corte_info = None
        else:
            usar_fecha = False
            corte_info = None

        # Corte abierto como info adicional (no afecta datos)
        if not corte_id:
            cursor.execute("SELECT * FROM cortes_caja WHERE cor_estado = 'Abierto' ORDER BY cor_fecha_apertura DESC LIMIT 1")
            abierto = cursor.fetchone()
            if abierto:
                corte_info = {
                    'cor_id': abierto['cor_id'], 'fecha_apertura': abierto['cor_fecha_apertura'],
                    'base_inicial': float(abierto['cor_base_inicial']),
                    'ingresos': float(abierto['cor_ingresos'] or 0),
                    'egresos': float(abierto['cor_egresos'] or 0),
                    'ganancia_neta': float(abierto['cor_ganancia_neta'] or 0),
                    'periodo': abierto['cor_periodo'], 'estado': abierto['cor_estado']
                }

        # ── CONSULTAS (cada una con su filtro individual) ──
        if usar_fecha:
            if corte_id:
                # ── Filtrar por corte: facturas usan fac_corte_id (evita solapamiento entre cortes) ──
                cursor.execute(
                    "SELECT COALESCE(SUM(fac_total), 0) as total FROM facturas WHERE fac_estado = 'pagado' AND fac_corte_id = %s",
                    (corte_id,)
                )
                ingresos = cursor.fetchone()['total']

                cursor.execute(
                    "SELECT COUNT(*) as total FROM facturas WHERE fac_estado = 'pagado' AND fac_corte_id = %s",
                    (corte_id,)
                )
                total_facturas = cursor.fetchone()['total']

                cursor.execute(
                    "SELECT COUNT(*) as total FROM facturas WHERE fac_estado = 'pagado' AND fac_corte_id = %s AND fac_cita_id IS NOT NULL",
                    (corte_id,)
                )
                citas_completadas = cursor.fetchone()['total']
            else:
                # ── Filtrar por periodo: facturas usan rango de fechas ──
                cursor.execute(
                    "SELECT COALESCE(SUM(fac_total), 0) as total FROM facturas WHERE fac_estado = 'pagado' AND DATE(fac_fecha) BETWEEN DATE(%s) AND DATE(%s)",
                    (desde, hasta)
                )
                ingresos = cursor.fetchone()['total']

                cursor.execute(
                    "SELECT COUNT(*) as total FROM facturas WHERE fac_estado = 'pagado' AND DATE(fac_fecha) BETWEEN DATE(%s) AND DATE(%s)",
                    (desde, hasta)
                )
                total_facturas = cursor.fetchone()['total']

                cursor.execute(
                    "SELECT COUNT(*) as total FROM citas WHERE cit_estado = 'completada' AND cit_fecha BETWEEN %s AND %s",
                    (desde, hasta)
                )
                citas_completadas = cursor.fetchone()['total']

            # Compras y pagos se mantienen por rango de fechas (no tienen corte_id)
            cursor.execute(
                "SELECT COALESCE(SUM(com_total), 0) as total FROM compras WHERE com_estado = 'Completada' AND com_fecha BETWEEN %s AND %s",
                (desde, hasta)
            )
            egresos = cursor.fetchone()['total']

            cursor.execute(
                "SELECT COUNT(*) as total FROM compras WHERE com_estado = 'Completada' AND com_fecha BETWEEN %s AND %s",
                (desde, hasta)
            )
            total_compras = cursor.fetchone()['total']

            cursor.execute(
                "SELECT COALESCE(SUM(pag_monto), 0) as total FROM pagos WHERE pag_fecha BETWEEN %s AND %s",
                (desde, hasta)
            )
            total_pagado = cursor.fetchone()['total']
        else:
            cursor.execute(
                "SELECT COALESCE(SUM(fac_total), 0) as total FROM facturas WHERE fac_estado = 'pagado'"
            )
            ingresos = cursor.fetchone()['total']

            cursor.execute(
                "SELECT COUNT(*) as total FROM facturas WHERE fac_estado = 'pagado'"
            )
            total_facturas = cursor.fetchone()['total']

            cursor.execute(
                "SELECT COALESCE(SUM(com_total), 0) as total FROM compras WHERE com_estado = 'Completada'"
            )
            egresos = cursor.fetchone()['total']

            cursor.execute(
                "SELECT COUNT(*) as total FROM compras WHERE com_estado = 'Completada'"
            )
            total_compras = cursor.fetchone()['total']

            cursor.execute(
                "SELECT COALESCE(SUM(pag_monto), 0) as total FROM pagos"
            )
            total_pagado = cursor.fetchone()['total']

            cursor.execute(
                "SELECT COUNT(*) as total FROM citas WHERE cit_estado = 'completada'"
            )
            citas_completadas = cursor.fetchone()['total']

        cursor.execute("SELECT COUNT(*) as total FROM productos WHERE pro_stock <= 5 AND pro_estado = 'activo'")
        bajo_stock = cursor.fetchone()['total']

        ganancia = float(ingresos) - float(egresos)

        return jsonify({
            'ingresos': float(ingresos), 'egresos': float(egresos),
            'ganancia': ganancia, 'total_facturas': total_facturas,
            'total_compras': total_compras,
            'total_pagado': float(total_pagado),
            'citas_completadas': citas_completadas,
            'bajo_stock': bajo_stock,
            'corte_abierto': corte_info
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
