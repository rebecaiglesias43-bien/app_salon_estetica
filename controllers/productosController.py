from flask import request, jsonify
from models.Productos import Productos
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, require_positive_number, validate_int, validate_estado
from services.paginationService import get_pagination_params, paginated_response

@auth_required
def get_productos():
    try:
        page, limit, offset = get_pagination_params()
        productos = Productos.get_all(limit=limit, offset=offset)
        total = Productos.count_all()
        return jsonify(paginated_response(productos, total, page, limit)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_productos_activos():
    try:
        productos = Productos.get_activos()
        return jsonify(productos), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_producto(id):
    try:
        producto = Productos.get_by_id(id)
        if not producto:
            return jsonify({'error': 'Producto no encontrado'}), 404
        return jsonify(producto), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_bajo_stock():
    try:
        limite = request.args.get('limite', 5, type=int)
        productos = Productos.get_bajo_stock(limite)
        return jsonify(productos), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_producto():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['pro_nombre', 'pro_precio'])
        if err: return err, code
        err = require_positive_number(data, 'pro_precio')
        if err: return err
        err = validate_int(data, 'pro_stock')
        if err: return err
        
        producto_id = Productos.create(data)
        return jsonify({'message': 'Producto creado exitosamente', 'pro_id': producto_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def update_producto(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        
        Productos.update(id, data)
        return jsonify({'message': 'Producto actualizado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_producto(id):
    try:
        Productos.delete(id)
        return jsonify({'message': 'Producto eliminado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
