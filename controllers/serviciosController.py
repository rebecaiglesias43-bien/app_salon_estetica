from flask import request, jsonify
from models.Servicios import Servicios
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, require_positive_number, validate_int
from services.paginationService import get_pagination_params, paginated_response

@auth_required
def get_servicios():
    try:
        page, limit, offset = get_pagination_params()
        servicios = Servicios.get_all(limit=limit, offset=offset)
        total = Servicios.count_all()
        return jsonify(paginated_response(servicios, total, page, limit)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_servicio(id):
    try:
        servicio = Servicios.get_by_id(id)
        if not servicio:
            return jsonify({'error': 'Servicio no encontrado'}), 404
        return jsonify(servicio), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_servicio():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['ser_nombre', 'ser_precio'])
        if err: return err, code
        err = require_positive_number(data, 'ser_precio')
        if err: return err
        err = validate_int(data, 'ser_duracion')
        if err: return err
        
        servicio_id = Servicios.create(data)
        return jsonify({'message': 'Servicio creado exitosamente', 'ser_id': servicio_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def update_servicio(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        
        Servicios.update(id, data)
        return jsonify({'message': 'Servicio actualizado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_servicio(id):
    try:
        Servicios.delete(id)
        return jsonify({'message': 'Servicio eliminado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
