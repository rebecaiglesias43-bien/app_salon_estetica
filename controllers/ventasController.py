from flask import request, jsonify
from datetime import date
from models.Facturas import Facturas
from models.Clientes import Clientes
from models.Productos import Productos
from models.InventarioMovimientos import InventarioMovimientos
from services.authService import auth_required

@auth_required
def registrar_venta():
    try:
        data = request.get_json()
        items = data.get('items', [])  # lista de {tipo: 'servicio'|'producto', id, precio, cantidad}
        
        if not items:
            return jsonify({'error': 'Debe incluir al menos un item'}), 400
        
        cliente_nombre = data.get('cli_nombre', '')
        cliente_telefono = data.get('cli_telefono', '')
        
        # Buscar o crear cliente
        cliente = None
        if cliente_telefono:
            cliente = Clientes.get_by_telefono(cliente_telefono)
        
        if not cliente and cliente_nombre:
            cliente_id = Clientes.create({
                'cli_nombre': cliente_nombre,
                'cli_apellido': data.get('cli_apellido', ''),
                'cli_telefono': cliente_telefono,
                'cli_direccion': data.get('cli_direccion', '')
            })
            cliente = {'cli_id': cliente_id}
        
        # Calcular total y procesar items
        total = 0.0
        for item in items:
            cantidad = int(item.get('cantidad', 1))
            precio = float(item.get('precio', 0))
            total += precio * cantidad
            
            if item.get('tipo') == 'producto':
                producto_id = item.get('id')
                producto = Productos.get_by_id(producto_id)
                if not producto:
                    return jsonify({'error': f'Producto ID {producto_id} no encontrado'}), 404
                stock_actual = producto['pro_stock'] or 0
                if stock_actual < cantidad:
                    return jsonify({'error': f'Stock insuficiente para {producto["pro_nombre"]}'}), 400
                
                # Descontar stock
                Productos.update_stock(producto_id, -cantidad)
                
                # Registrar movimiento de inventario
                InventarioMovimientos.create({
                    'inm_producto_id': producto_id,
                    'inm_tipo': 'Salida',
                    'inm_cantidad': cantidad,
                    'inm_fecha': date.today(),
                    'inm_motivo': 'Venta directa'
                })
        
        # Crear factura (sin cita asociada)
        factura_id = Facturas.create(None, total)
        Facturas.update_estado(factura_id, 'pagado')
        
        return jsonify({
            'message': 'Venta registrada exitosamente',
            'fac_id': factura_id,
            'total': total
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
