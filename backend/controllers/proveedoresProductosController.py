from flask import request, jsonify
from models.ProveedoresProductos import ProveedoresProductos
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, require_positive_number
from services.cacheService import clear_cache

CACHE_KEY = '/api/proveedores-productos'

@auth_required
def get_by_proveedor(proveedor_id):
    try:
        productos = ProveedoresProductos.get_by_proveedor(proveedor_id)
        return jsonify(productos), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_by_producto(producto_id):
    try:
        proveedores = ProveedoresProductos.get_by_producto(producto_id)
        return jsonify(proveedores), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_asociacion():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['ppr_proveedor_id', 'ppr_producto_id', 'ppr_precio'])
        if err: return err, code
        err = require_positive_number(data, 'ppr_precio')
        if err: return err
        
        # Validar precio máximo
        precio = float(data.get('ppr_precio', 0))
        if precio > 10000000:
            return jsonify({'error': 'El precio no puede exceder $10,000,000'}), 400
        
        # Validar duplicado: mismo producto+proveedor ya existe
        if ProveedoresProductos.exists_duplicate(data['ppr_proveedor_id'], data['ppr_producto_id']):
            return jsonify({'error': 'Este producto ya está vinculado a este proveedor'}), 400
        
        asociacion_id = ProveedoresProductos.create(data)
        clear_cache(CACHE_KEY)
        return jsonify({'message': 'Asociación creada exitosamente', 'ppr_id': asociacion_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def update_precio(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['ppr_precio'])
        if err: return err, code
        err = require_positive_number(data, 'ppr_precio')
        if err: return err
        
        # Validar precio máximo
        precio = float(data.get('ppr_precio', 0))
        if precio > 10000000:
            return jsonify({'error': 'El precio no puede exceder $10,000,000'}), 400
        
        ProveedoresProductos.update_precio(id, data.get('ppr_precio'))
        clear_cache(CACHE_KEY)
        return jsonify({'message': 'Precio actualizado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_asociacion(id):
    try:
        ProveedoresProductos.delete(id)
        clear_cache(CACHE_KEY)
        return jsonify({'message': 'Asociación eliminada exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
