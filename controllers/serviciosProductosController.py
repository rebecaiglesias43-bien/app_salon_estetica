from flask import request, jsonify
from models.ServiciosProductos import ServiciosProductos
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, validate_int

@auth_required
def get_by_servicio(servicio_id):
    try:
        productos = ServiciosProductos.get_by_servicio(servicio_id)
        return jsonify(productos), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_by_producto(producto_id):
    try:
        servicios = ServiciosProductos.get_by_producto(producto_id)
        return jsonify(servicios), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_asociacion():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['sep_servicio_id', 'sep_producto_id', 'sep_cantidad'])
        if err: return err, code
        err = validate_int(data, 'sep_cantidad')
        if err: return err
        
        asociacion_id = ServiciosProductos.create(data)
        return jsonify({'message': 'Producto asociado al servicio exitosamente', 'sep_id': asociacion_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def update_asociacion(id):
    try:
        data = request.get_json()
        ServiciosProductos.update(id, data)
        return jsonify({'message': 'Asociación actualizada exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_asociacion(id):
    try:
        ServiciosProductos.delete(id)
        return jsonify({'message': 'Asociación eliminada exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
