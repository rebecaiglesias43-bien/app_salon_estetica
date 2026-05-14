from flask import request, jsonify
from models.InventarioMovimientos import InventarioMovimientos
from models.Productos import Productos
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, validate_int
from services.paginationService import get_pagination_params, paginated_response

@auth_required
def get_movimientos():
    try:
        page, limit, offset = get_pagination_params()
        producto_id = request.args.get('producto_id', type=int)
        tipo = request.args.get('tipo')
        
        if producto_id:
            movimientos = InventarioMovimientos.get_by_producto(producto_id)
        elif tipo:
            movimientos = InventarioMovimientos.get_por_tipo(tipo)
        else:
            movimientos = InventarioMovimientos.get_all(limit=limit, offset=offset)
        
        total = InventarioMovimientos.count_all()
        return jsonify(paginated_response(movimientos, total, page, limit)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_movimiento(id):
    try:
        movimiento = InventarioMovimientos.get_by_id(id)
        if not movimiento:
            return jsonify({'error': 'Movimiento no encontrado'}), 404
        return jsonify(movimiento), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_movimiento():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['inm_producto_id', 'inm_tipo', 'inm_cantidad'])
        if err: return err, code
        err = validate_int(data, 'inm_cantidad')
        if err: return err
        if data.get('inm_tipo') not in ('Entrada', 'Salida'):
            return jsonify({'error': 'inm_tipo debe ser Entrada o Salida'}), 400
        
        tipo = data.get('inm_tipo')
        cantidad = int(data.get('inm_cantidad'))
        producto_id = data.get('inm_producto_id')
        
        # Validar que haya stock suficiente para salidas
        if tipo == 'Salida':
            producto = Productos.get_by_id(producto_id)
            if not producto:
                return jsonify({'error': 'Producto no encontrado'}), 404
            if producto['pro_stock'] < cantidad:
                return jsonify({'error': 'Stock insuficiente'}), 400
        
        movimiento_id = InventarioMovimientos.create(data)
        
        # Actualizar stock
        ajuste = cantidad if tipo == 'Entrada' else -cantidad
        Productos.update_stock(producto_id, ajuste)
        
        return jsonify({'message': 'Movimiento registrado exitosamente', 'inm_id': movimiento_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
