from flask import request, jsonify
from models.DetalleCompras import DetalleCompras
from services.authService import auth_required
from services.validationService import get_json_data, require_fields

@auth_required
def get_detalle_by_compra(compra_id):
    try:
        detalle = DetalleCompras.get_by_compra(compra_id)
        return jsonify(detalle), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_detalle():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['dco_compra_id', 'dco_producto_id', 'dco_cantidad', 'dco_precio_unitario', 'dco_subtotal'])
        if err: return err, code
        
        detalle_id = DetalleCompras.create(data)
        return jsonify({'message': 'Detalle agregado', 'dco_id': detalle_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_detalle_by_compra(compra_id):
    try:
        DetalleCompras.delete_by_compra(compra_id)
        return jsonify({'message': 'Detalle eliminado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
