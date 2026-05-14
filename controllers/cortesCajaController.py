from flask import request, jsonify
from models.CortesCaja import CortesCaja
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, require_positive_number
from services.paginationService import get_pagination_params, paginated_response

@auth_required
def get_cortes():
    try:
        page, limit, offset = get_pagination_params()
        cortes = CortesCaja.get_all(limit=limit, offset=offset)
        total = CortesCaja.count_all()
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
        
        importe = data.get('cor_base_inicial', 0)
        corte_id = CortesCaja.abrir(importe)
        return jsonify({'message': 'Corte de caja abierto exitosamente', 'cor_id': corte_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def cerrar_corte(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['cor_ingresos', 'cor_egresos'])
        if err: return err, code
        
        ingresos = data.get('cor_ingresos', 0)
        egresos = data.get('cor_egresos', 0)
        ganancia_neta = ingresos - egresos
        
        CortesCaja.cerrar(id, ingresos, egresos, ganancia_neta)
        return jsonify({'message': 'Corte de caja cerrado exitosamente', 'ganancia_neta': ganancia_neta}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
