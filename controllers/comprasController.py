from flask import request, jsonify
from models.Compras import Compras
from models.DetalleCompras import DetalleCompras
from models.Productos import Productos
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, require_positive_number, validate_int
from services.paginationService import get_pagination_params, paginated_response

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
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['com_proveedor_id', 'detalle'])
        if err: return err, code
        if not isinstance(data.get('detalle'), list) or len(data['detalle']) == 0:
            return jsonify({'error': 'detalle debe ser una lista con al menos un item'}), 400
        
        # Crear la compra
        compra_id = Compras.create(data)
        
        # Insertar el detalle
        total = 0
        for d in data.get('detalle', []):
            if not d.get('dco_producto_id') or not d.get('dco_cantidad') or not d.get('dco_precio_unitario'):
                return jsonify({'error': 'Cada detalle requiere producto_id, cantidad y precio_unitario'}), 400
            subtotal = float(d.get('dco_cantidad')) * float(d.get('dco_precio_unitario'))
            DetalleCompras.create({
                'dco_compra_id': compra_id,
                'dco_producto_id': d.get('dco_producto_id'),
                'dco_cantidad': d.get('dco_cantidad'),
                'dco_precio_unitario': d.get('dco_precio_unitario'),
                'dco_subtotal': subtotal
            })
            total += subtotal
            
            # Actualizar stock del producto
            Productos.update_stock(d.get('dco_producto_id'), int(d.get('dco_cantidad')))
        
        # Actualizar total de la compra
        Compras.update_total(compra_id, total)
        
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
        
        Compras.update_estado(id, data.get('estado'))
        return jsonify({'message': 'Estado de compra actualizado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_compra(id):
    try:
        DetalleCompras.delete_by_compra(id)
        Compras.delete(id)
        return jsonify({'message': 'Compra eliminada exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
