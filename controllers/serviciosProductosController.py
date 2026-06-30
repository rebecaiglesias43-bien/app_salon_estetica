from flask import request, jsonify
from models.ServiciosProductos import ServiciosProductos
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, validate_int
from services.cacheService import clear_cache

CACHE_KEY = '/api/servicios-productos'

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
        
        cantidad = int(data.get('sep_cantidad', 1))
        if cantidad <= 0:
            return jsonify({'error': 'La cantidad debe ser mayor a 0'}), 400
        
        # Validar duplicado: mismo producto+servicio ya existe
        if ServiciosProductos.exists_duplicate(data['sep_servicio_id'], data['sep_producto_id']):
            return jsonify({'error': 'Este producto ya está vinculado a este servicio'}), 400
        
        asociacion_id = ServiciosProductos.create(data)
        clear_cache(CACHE_KEY)
        return jsonify({'message': 'Producto asociado al servicio exitosamente', 'sep_id': asociacion_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def update_asociacion(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['sep_cantidad'])
        if err: return err, code
        err = validate_int(data, 'sep_cantidad')
        if err: return err
        
        cantidad = int(data.get('sep_cantidad', 1))
        if cantidad <= 0:
            return jsonify({'error': 'La cantidad debe ser mayor a 0'}), 400
        
        ServiciosProductos.update(id, data)
        clear_cache(CACHE_KEY)
        return jsonify({'message': 'Asociación actualizada exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_asociacion(id):
    try:
        ServiciosProductos.delete(id)
        clear_cache(CACHE_KEY)
        return jsonify({'message': 'Asociación eliminada exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
