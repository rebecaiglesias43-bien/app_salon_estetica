from flask import request, jsonify
from models.DetalleCompras import DetalleCompras
from models.Productos import Productos
from models.CortesCaja import CortesCaja
from models.InventarioMovimientos import InventarioMovimientos
from services.authService import auth_required
from services.validationService import get_json_data, require_fields

@auth_required
def get_detalle_by_compra(compra_id):
    try:
        detalle = DetalleCompras.get_by_compra(compra_id)
        return jsonify(detalle), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_detalle():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['dco_compra_id', 'dco_producto_id', 'dco_cantidad', 'dco_precio_unitario', 'dco_subtotal'])
        if err: return err, code

        corte = CortesCaja.get_abierto()
        if not corte:
            return jsonify({'error': 'No hay un corte de caja abierto. Debe abrir caja antes de modificar compras.'}), 400

        detalle_id = DetalleCompras.create(data)
        # Actualizar stock: entrada por compra
        Productos.update_stock(data['dco_producto_id'], int(data['dco_cantidad']))
        # Registrar movimiento de inventario
        InventarioMovimientos.create({
            'inm_producto_id': data['dco_producto_id'],
            'inm_tipo': 'Entrada',
            'inm_cantidad': int(data['dco_cantidad']),
            'inm_motivo': 'Compra'
        })
        return jsonify({'message': 'Detalle agregado', 'dco_id': detalle_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_detalle_by_compra(compra_id):
    try:
        corte = CortesCaja.get_abierto()
        if not corte:
            return jsonify({'error': 'No hay un corte de caja abierto. Debe abrir caja antes de modificar compras.'}), 400

        # Obtener detalle ANTES de borrar para revertir stock
        detalle = DetalleCompras.get_by_compra(compra_id)
        # Revertir stock: restar lo que se había sumado
        for d in detalle:
            cantidad = int(d['dco_cantidad'])
            Productos.update_stock(d['dco_producto_id'], -cantidad)
            # Registrar movimiento de inventario (reversión)
            InventarioMovimientos.create({
                'inm_producto_id': d['dco_producto_id'],
                'inm_tipo': 'Salida',
                'inm_cantidad': cantidad,
                'inm_motivo': 'Reversión de compra'
            })

        DetalleCompras.delete_by_compra(compra_id)
        return jsonify({'message': 'Detalle eliminado y stock revertido'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
