from flask import request, jsonify
from models.InventarioMovimientos import InventarioMovimientos
from models.Productos import Productos
from models.CortesCaja import CortesCaja
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, validate_int
from services.paginationService import get_pagination_params, paginated_response
from services.cacheService import clear_cache

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
        clear_cache('/api/productos')
        clear_cache('/api/servicios-productos')
        clear_cache('/api/proveedores-productos')
        
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

@auth_required
def limpiar_transaccional():
    """Elimina todos los datos transaccionales (compras, facturas, citas, movimientos)
    preservando productos, proveedores, clientes, servicios y stock actual.
    ATENCION: Operacion destructiva e irreversible."""
    from models.Productos import Productos
    from models.InventarioMovimientos import InventarioMovimientos as IM
    from datetime import date
    
    try:
        resultados = {}
        
        # ── 1. Guardar stock actual de todos los productos ──
        productos = Productos.query_all("SELECT pro_id, pro_stock, pro_nombre FROM productos")
        stock_actual = {p['pro_id']: (p['pro_stock'] or 0) for p in productos}
        resultados['productos_con_stock'] = len(stock_actual)
        
        # ── 2. Eliminar en orden (hijos → padres) ──
        orden = [
            'detalle_facturas',
            'detalle_compras',
            'pagos',
            'historial_productos_usados',
            'detalle_citas',
            'facturas',
            'compras',
            'citas',
            'inventario_movimientos',
        ]
        
        for tabla in orden:
            IM.execute(f"DELETE FROM {tabla}")
            resultados[tabla] = 'ok'
        
        # ── 3. Resetear AUTO_INCREMENTs ──
        for tabla in orden:
            try:
                IM.execute(f"ALTER TABLE {tabla} AUTO_INCREMENT = 1")
            except Exception:
                pass
        
        # ── 4. Restaurar stock ──
        restaurados = 0
        for pro_id, stock in stock_actual.items():
            if stock > 0:
                IM.execute("UPDATE productos SET pro_stock = %s WHERE pro_id = %s", (stock, pro_id))
                restaurados += 1
        resultados['stock_restaurado'] = restaurados
        
        # ── 5. Crear movimiento "Ajuste inicial" por cada producto con stock ──
        ajustes = 0
        for pro_id, stock in stock_actual.items():
            if stock > 0:
                IM.create({
                    'inm_producto_id': pro_id,
                    'inm_cita_id': None,
                    'inm_tipo': 'Entrada',
                    'inm_cantidad': stock,
                    'inm_fecha': date.today(),
                    'inm_motivo': 'Ajuste inicial'
                })
                ajustes += 1
        resultados['ajustes_iniciales'] = ajustes
        
        return jsonify({
            'message': 'Limpieza transaccional completada',
            'detalle': resultados
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
