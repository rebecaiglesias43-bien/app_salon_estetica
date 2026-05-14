from flask import request, jsonify
from models.Proveedores import Proveedores
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, validate_string
from services.paginationService import get_pagination_params, paginated_response

@auth_required
def get_proveedores():
    try:
        page, limit, offset = get_pagination_params()
        proveedores = Proveedores.get_all(limit=limit, offset=offset)
        total = Proveedores.count_all()
        return jsonify(paginated_response(proveedores, total, page, limit)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_proveedores_con_productos():
    try:
        proveedores = Proveedores.get_con_productos()
        return jsonify(proveedores), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_proveedor(id):
    try:
        proveedor = Proveedores.get_by_id(id)
        if not proveedor:
            return jsonify({'error': 'Proveedor no encontrado'}), 404
        return jsonify(proveedor), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_proveedor():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['prv_nombre'])
        if err: return err, code
        
        proveedor_id = Proveedores.create(data)
        return jsonify({'message': 'Proveedor creado exitosamente', 'prv_id': proveedor_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def update_proveedor(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        
        Proveedores.update(id, data)
        return jsonify({'message': 'Proveedor actualizado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_proveedor(id):
    try:
        Proveedores.delete(id)
        return jsonify({'message': 'Proveedor eliminado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
