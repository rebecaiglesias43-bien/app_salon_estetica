from flask import request, jsonify
from models.Facturas import Facturas
from models.Pagos import Pagos
from models.DetalleFacturas import DetalleFacturas
from services.authService import auth_required
from services.validationService import get_json_data, require_fields
from services.paginationService import get_pagination_params, paginated_response

@auth_required
def get_facturas():
    try:
        page, limit, offset = get_pagination_params()
        facturas = Facturas.get_all(limit=limit, offset=offset)
        total = Facturas.count_all()
        return jsonify(paginated_response(facturas, total, page, limit)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_factura(id):
    try:
        factura = Facturas.get_by_id(id)
        if not factura:
            return jsonify({'error': 'Factura no encontrada'}), 404
        factura['detalle'] = DetalleFacturas.get_by_factura(id)
        factura['pagos'] = Pagos.get_by_factura(id)
        return jsonify(factura), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def update_estado(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['estado'])
        if err: return err, code
        
        Facturas.update_estado(id, data.get('estado'))
        return jsonify({'message': 'Estado actualizado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500