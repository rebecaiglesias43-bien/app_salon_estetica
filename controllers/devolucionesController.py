from flask import request, jsonify
from models.InventarioMovimientos import InventarioMovimientos
from models.Productos import Productos
from models.Compras import Compras
from models.DetalleCompras import DetalleCompras
from models.CortesCaja import CortesCaja
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, validate_int

@auth_required
def create_devolucion():
    """Registra una devolución de productos al proveedor.
    Crea movimientos de inventario (Salida), descuenta stock,
    y actualiza el estado de la compra según corresponda.
    """
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['compra_id', 'items'])
        if err: return err, code

        items = data.get('items', [])
        if not isinstance(items, list) or len(items) == 0:
            return jsonify({'error': 'Debe seleccionar al menos un producto para devolver'}), 400

        # Verificar corte de caja abierto
        corte = CortesCaja.get_abierto()
        if not corte:
            return jsonify({'error': 'No hay un corte de caja abierto. Debe abrir caja primero.'}), 400

        compra_id = data.get('compra_id')
        compra = Compras.get_by_id(compra_id)
        if not compra:
            return jsonify({'error': 'Compra no encontrada'}), 404

        resultados = []
        for item in items:
            producto_id = item.get('producto_id')
            cantidad = item.get('cantidad', 0)
            motivo = item.get('motivo', 'Producto defectuoso')

            err = validate_int(item, 'cantidad')
            if err:
                return jsonify({'error': f'Cantidad inválida para producto #{producto_id}'}), 400

            if cantidad <= 0:
                return jsonify({'error': 'La cantidad debe ser mayor a 0'}), 400

            producto = Productos.get_by_id(producto_id)
            if not producto:
                return jsonify({'error': f'Producto ID {producto_id} no encontrado'}), 404

            if producto['pro_stock'] < cantidad:
                return jsonify({
                    'error': f'Stock insuficiente para {producto["pro_nombre"]}. Disponible: {producto["pro_stock"]}, solicitado: {cantidad}'
                }), 400

            # Crear movimiento de inventario (con compra_id embebido en motivo)
            movimiento_id = InventarioMovimientos.create({
                'inm_producto_id': producto_id,
                'inm_tipo': 'Salida',
                'inm_cantidad': cantidad,
                'inm_motivo': f'Devolución|compra_id={compra_id}|{motivo}'
            })

            # Descontar stock
            Productos.update_stock(producto_id, -cantidad)

            resultados.append({
                'producto_id': producto_id,
                'producto_nombre': producto['pro_nombre'],
                'cantidad': cantidad,
                'movimiento_id': movimiento_id
            })

        # ── Actualizar estado de la compra ──
        detalle = DetalleCompras.get_by_compra(compra_id)
        # Calcular cuántos items se devolvieron en total PARA ESTA COMPRA (incluyendo devoluciones anteriores)
        total_devuelto_por_producto = {}
        for d in detalle:
            pid = d['dco_producto_id']
            total_devuelto_por_producto[pid] = 0

        # Sumar devoluciones anteriores SOLO de esta misma compra
        # El motivo tiene formato: "Devolución|compra_id=X|motivo"
        import re
        movimientos = InventarioMovimientos.search(tipo='Salida', limit=10000)
        for m in (movimientos or []):
            motivo_raw = m.get('inm_motivo', '')
            # Nuevo formato: Devolución|compra_id=X|...
            match = re.search(r'compra_id=(\d+)', motivo_raw)
            mov_compra_id = int(match.group(1)) if match else None
            
            # Solo contar si es de esta misma compra (compatibilidad: movimientos viejos sin compra_id también se cuentan)
            if mov_compra_id is None or mov_compra_id == compra_id:
                pid = m['inm_producto_id']
                if pid in total_devuelto_por_producto:
                    total_devuelto_por_producto[pid] += m['inm_cantidad']

        # Agregar las devoluciones que acabamos de hacer
        current_dev = {}
        for r in resultados:
            pid = r['producto_id']
            current_dev[pid] = current_dev.get(pid, 0) + r['cantidad']

        todos_devueltos = True
        for d in detalle:
            pid = d['dco_producto_id']
            cantidad_original = d['dco_cantidad']
            devuelto = total_devuelto_por_producto.get(pid, 0) + current_dev.get(pid, 0)
            if devuelto < cantidad_original:
                todos_devueltos = False
                break

        if todos_devueltos:
            Compras.update_estado(compra_id, 'Devuelta')
            nuevo_estado = 'Devuelta'
        else:
            Compras.update_estado(compra_id, 'Parcialmente devuelta')
            nuevo_estado = 'Parcialmente devuelta'

        return jsonify({
            'message': 'Devolución registrada exitosamente',
            'compra_id': compra_id,
            'nuevo_estado': nuevo_estado,
            'items_devueltos': resultados
        }), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error al registrar devolución: {str(e)}'}), 500
