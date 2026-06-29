from flask import request, jsonify
from models.InventarioMovimientos import InventarioMovimientos
from models.Productos import Productos
from models.CortesCaja import CortesCaja
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, validate_int
from services.paginationService import get_pagination_params, paginated_response

@auth_required
def get_movimientos():
    try:
        page, limit, offset = get_pagination_params()
        tipo = request.args.get('tipo') or None
        producto_id = request.args.get('producto_id', type=int) or None
        fecha_desde = request.args.get('desde') or None
        fecha_hasta = request.args.get('hasta') or None
        
        movimientos = InventarioMovimientos.search(
            tipo=tipo, producto_id=producto_id,
            fecha_desde=fecha_desde, fecha_hasta=fecha_hasta,
            limit=limit, offset=offset
        )
        total = InventarioMovimientos.count_search(
            tipo=tipo, producto_id=producto_id,
            fecha_desde=fecha_desde, fecha_hasta=fecha_hasta
        )
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

        corte = CortesCaja.get_abierto()
        if not corte:
            return jsonify({'error': 'No hay un corte de caja abierto. Debe abrir caja antes de registrar movimientos de inventario.'}), 400
        
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

@auth_required
def get_movimientos_agrupados():
    """Devuelve movimientos de salida agrupados por cita, con sus productos anidados."""
    try:
        page, limit, offset = get_pagination_params()
        grupos = InventarioMovimientos.get_grouped_by_cita(limit=limit, offset=offset)
        total = InventarioMovimientos.count_grouped_by_cita()
        return jsonify(paginated_response(grupos, total, page, limit)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
