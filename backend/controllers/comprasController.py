from flask import request, jsonify
from models.Compras import Compras
from models.DetalleCompras import DetalleCompras
from models.Productos import Productos
from models.CortesCaja import CortesCaja
from models.InventarioMovimientos import InventarioMovimientos
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, require_positive_number, validate_int, validate_estado
from services.paginationService import get_pagination_params, paginated_response
from services.cacheService import clear_cache

@auth_required
def get_compras():
    try:
        page, limit, offset = get_pagination_params()
        compras = Compras.get_all(limit=limit, offset=offset)
        total = Compras.count_all()
        return jsonify(paginated_response(compras, total, page, limit)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_compra(id):
    try:
        compra = Compras.get_by_id(id)
        if not compra:
            return jsonify({'error': 'Compra no encontrada'}), 404
        compra['detalle'] = DetalleCompras.get_by_compra(id)
        return jsonify(compra), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_compra():
    try:
        # Verificar que hay corte de caja abierto
        corte_abierto = CortesCaja.get_abierto()
        if not corte_abierto:
            return jsonify({'error': 'No hay corte de caja abierto. Abra un corte antes de registrar compras.'}), 400
        
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['com_proveedor_id', 'detalle'])
        if err: return err, code

        if not isinstance(data.get('detalle'), list) or len(data['detalle']) == 0:
            return jsonify({'error': 'detalle debe ser una lista con al menos un item'}), 400

        # ── Validar ítems del detalle ──
        for idx, d in enumerate(data.get('detalle', [])):
            if not d.get('dco_producto_id'):
                return jsonify({'error': f'Item #{idx + 1}: debe seleccionar un producto'}), 400
            try:
                cantidad = int(d.get('dco_cantidad', 0))
                precio = float(d.get('dco_precio_unitario', 0))
            except (TypeError, ValueError):
                return jsonify({'error': f'Item #{idx + 1}: cantidad y precio deben ser valores numéricos'}), 400
            if cantidad <= 0:
                return jsonify({'error': f'Item #{idx + 1}: la cantidad debe ser mayor a 0'}), 400
            if cantidad > 9999:
                return jsonify({'error': f'Item #{idx + 1}: la cantidad no puede exceder 9,999 unidades'}), 400
            if precio <= 0:
                return jsonify({'error': f'Item #{idx + 1}: el precio unitario debe ser mayor a 0'}), 400

        # Calcular total ANTES de insertar la compra
        detalle_items = data.get('detalle', [])
        total = 0
        items_procesados = []
        for d in detalle_items:
            cantidad = int(d.get('dco_cantidad'))
            precio_unitario = float(d.get('dco_precio_unitario'))
            subtotal = cantidad * precio_unitario
            total += subtotal
            items_procesados.append({
                'dco_producto_id': d.get('dco_producto_id'),
                'dco_cantidad': cantidad,
                'dco_precio_unitario': precio_unitario,
                'dco_subtotal': subtotal,
                'producto_id': d.get('dco_producto_id')
            })

        # Crear la compra YA con el total correcto
        data['com_total'] = total
        compra_id = Compras.create(data)

        # Insertar el detalle y actualizar stock
        for item in items_procesados:
            DetalleCompras.create({
                'dco_compra_id': compra_id,
                'dco_producto_id': item['dco_producto_id'],
                'dco_cantidad': item['dco_cantidad'],
                'dco_precio_unitario': item['dco_precio_unitario'],
                'dco_subtotal': item['dco_subtotal']
            })

            # Actualizar stock del producto
            Productos.update_stock(item['producto_id'], item['dco_cantidad'])
            # Registrar movimiento de inventario
            InventarioMovimientos.create({
                'inm_producto_id': item['producto_id'],
                'inm_tipo': 'Entrada',
                'inm_cantidad': item['dco_cantidad'],
                'inm_motivo': 'Compra'
            })

        clear_cache('/api/productos')
        return jsonify({'message': 'Compra registrada exitosamente', 'com_id': compra_id, 'com_total': total}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def update_estado_compra(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['estado'])
        if err: return err, code
        err = validate_estado(data, 'estado', ['Pendiente', 'Completada', 'Cancelada'])
        if err: return err

        corte = CortesCaja.get_abierto()
        if not corte:
            return jsonify({'error': 'No hay un corte de caja abierto. Debe abrir caja antes de modificar compras.'}), 400

        Compras.update_estado(id, data.get('estado'))
        return jsonify({'message': 'Estado de compra actualizado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_compra(id):
    try:
        corte = CortesCaja.get_abierto()
        if not corte:
            return jsonify({'error': 'No hay un corte de caja abierto. Debe abrir caja antes de eliminar compras.'}), 400

        # Revertir stock antes de borrar: restar las cantidades que se sumaron
        detalle = DetalleCompras.get_by_compra(id)
        for d in detalle:
            # Verificar stock suficiente antes de revertir
            producto = Productos.get_by_id(d['dco_producto_id'])
            cantidad = int(d.get('dco_cantidad', 0))
            if producto and (producto.get('pro_stock') or 0) < cantidad:
                return jsonify({
                    'error': f"No se puede eliminar la compra. Stock insuficiente de \"{producto['pro_nombre']}\" (disponible: {producto['pro_stock'] or 0}, a revertir: {cantidad}). Los productos ya fueron utilizados en servicios."
                }), 400
            Productos.update_stock(d['dco_producto_id'], -cantidad)
            # Registrar movimiento de inventario (reversión)
            InventarioMovimientos.create({
                'inm_producto_id': d['dco_producto_id'],
                'inm_tipo': 'Salida',
                'inm_cantidad': cantidad,
                'inm_motivo': 'Reversión de compra'
            })

        DetalleCompras.delete_by_compra(id)
        Compras.delete(id)
        return jsonify({'message': 'Compra eliminada exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
