from flask import request, jsonify
from models.Clientes import Clientes
from services.authService import auth_required
from services.validationService import get_json_data, require_fields
from services.paginationService import get_pagination_params, paginated_response

@auth_required
def get_clientes():
    try:
        page, limit, offset = get_pagination_params()
        clientes = Clientes.get_all(limit=limit, offset=offset)
        total = Clientes.count_all()
        return jsonify(paginated_response(clientes, total, page, limit)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_cliente(id):
    try:
        cliente = Clientes.get_by_id(id)
        if not cliente:
            return jsonify({'error': 'Cliente no encontrado'}), 404
        return jsonify(cliente), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_historial(id):
    try:
        historial = Clientes.get_historial(id)
        return jsonify(historial), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_cliente():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['cli_nombre', 'cli_telefono'])
        if err: return err, code
        
        cliente_id = Clientes.create(data)
        return jsonify({
            'message': 'Cliente creado exitosamente',
            'cli_id': cliente_id
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def update_cliente(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        
        Clientes.update(id, data)
        return jsonify({'message': 'Cliente actualizado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_cliente(id):
    try:
        citas = Clientes.query_one("SELECT COUNT(*) as total FROM citas WHERE cit_cliente_id = %s", (id,))
        if citas and citas['total'] > 0:
            return jsonify({'error': 'No se puede eliminar el cliente porque tiene citas'}), 400
        
        Clientes.delete(id)
        return jsonify({'message': 'Cliente eliminado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500