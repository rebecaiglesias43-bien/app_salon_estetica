from flask import request, jsonify
from models.ProveedoresProductos import ProveedoresProductos
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, require_positive_number

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
        
        asociacion_id = ProveedoresProductos.create(data)
        return jsonify({'message': 'Asociación creada exitosamente', 'ppr_id': asociacion_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def update_precio(id):
    try:
        data = request.get_json()
        ProveedoresProductos.update_precio(id, data.get('ppr_precio'))
        return jsonify({'message': 'Precio actualizado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_asociacion(id):
    try:
        ProveedoresProductos.delete(id)
        return jsonify({'message': 'Asociación eliminada exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
