from flask import request, jsonify
from datetime import datetime
from models.CortesCaja import CortesCaja
from models.Facturas import Facturas
from models.Compras import Compras
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, require_positive_number
from services.paginationService import get_pagination_params, paginated_response

@auth_required
def get_cortes():
    try:
        page, limit, offset = get_pagination_params()
        periodo = request.args.get('periodo')
        cortes = CortesCaja.get_all(periodo=periodo, limit=limit, offset=offset)
        total = CortesCaja.count_all(periodo=periodo)
        return jsonify(paginated_response(cortes, total, page, limit)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_corte_abierto():
    try:
        corte = CortesCaja.get_abierto()
        return jsonify(corte), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def abrir_corte():
    try:
        abierto = CortesCaja.get_abierto()
        if abierto:
            return jsonify({'error': 'Ya existe un corte abierto', 'cor_id': abierto['cor_id']}), 400
        
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['cor_base_inicial'])
        if err: return err, code
        err = require_positive_number(data, 'cor_base_inicial')
        if err: return err
        
        periodo = data.get('cor_periodo', 'diario')
        if periodo not in ['diario', 'semanal', 'mensual']:
            return jsonify({'error': 'Periodo invalido. Use: diario, semanal o mensual'}), 400
        
        importe = data.get('cor_base_inicial', 0)
        corte_id = CortesCaja.abrir(importe, periodo)
        return jsonify({'message': 'Corte de caja abierto exitosamente', 'cor_id': corte_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_actividad_corte(id):
    """Devuelve facturas y compras dentro del rango de fechas del corte."""
    try:
        facturas = CortesCaja.get_actividad_facturas(id)
        compras = CortesCaja.get_actividad_compras(id)
        return jsonify({
            'facturas': facturas,
            'compras': compras,
            'total_ingresos': sum(float(f.get('fac_total', 0) or 0) for f in facturas if f.get('fac_estado') == 'pagado'),
            'total_egresos': sum(float(c.get('com_total', 0) or 0) for c in compras)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def cerrar_corte(id):
    try:
        corte = CortesCaja.get_by_id(id)
        if not corte:
            return jsonify({'error': 'Corte no encontrado'}), 404
        if corte['cor_estado'] == 'Cerrado':
            return jsonify({'error': 'Este corte ya fue cerrado'}), 400
        
        # Fecha de apertura del corte para filtros
        desde = corte['cor_fecha_apertura']
        if isinstance(desde, str):
            desde = datetime.fromisoformat(desde)

        # Calcular ingresos según facturas asociadas a este corte vía fac_corte_id
        # Se pasa `desde` como red de seguridad: solo facturas con fac_fecha >= apertura
        ingresos = Facturas.get_total_by_corte(id, desde) or 0
        
        # Egresos: se mantiene por rango de fechas (la tabla compras no tiene corte_id)
        egresos = Compras.get_total_by_date_range(desde, datetime.now()) or 0
        
        ingresos = float(ingresos)
        egresos = float(egresos)
        ganancia_neta = ingresos - egresos
        
        CortesCaja.cerrar(id, ingresos, egresos, ganancia_neta)
        return jsonify({
            'message': 'Corte de caja cerrado exitosamente',
            'ingresos': ingresos,
            'egresos': egresos,
            'ganancia_neta': ganancia_neta
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
