from flask import request, jsonify
from models.Servicios import Servicios
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, require_positive_number, validate_int
from services.paginationService import get_pagination_params, paginated_response

def get_servicios_public():
    """Endpoint publico sin autenticacion para la landing page"""
    try:
        servicios = Servicios.get_all(limit=100, offset=0)
        # Incluir solo datos que necesita la landing page
        result = [{
            'ser_id': s['ser_id'],
            'ser_nombre': s['ser_nombre'],
            'ser_descripcion': s['ser_descripcion'],
            'ser_precio': float(s['ser_precio']) if s.get('ser_precio') else 0,
            'ser_duracion': s['ser_duracion'],
            'ser_categoria': s.get('ser_categoria') or ''
        } for s in servicios]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_servicios():
    try:
        page, limit, offset = get_pagination_params()
        search = request.args.get('search', '').strip() or None
        categoria = request.args.get('categoria', '').strip() or None
        servicios = Servicios.get_all(limit=limit, offset=offset, search=search, categoria=categoria)
        total = Servicios.count_all(search=search, categoria=categoria)
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
        err, code, _ = require_fields(data, ['ser_nombre', 'ser_precio'])
        if err: return err, code
        err = require_positive_number(data, 'ser_precio')
        if err: return err
        err = validate_int(data, 'ser_duracion')
        if err: return err

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
