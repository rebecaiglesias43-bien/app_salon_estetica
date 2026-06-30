from flask import request, jsonify
from models.Proveedores import Proveedores
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, validate_string
from services.paginationService import get_pagination_params, paginated_response

@auth_required
def get_proveedores():
    try:
        page, limit, offset = get_pagination_params()
        search = request.args.get('search', '').strip() or None
        proveedores = Proveedores.get_all(limit=limit, offset=offset, search=search)
        total = Proveedores.count_all(search=search)
        return jsonify(paginated_response(proveedores, total, page, limit)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_proveedor(id):
    try:
        proveedor = Proveedores.get_by_id(id)
        if not proveedor:
            return jsonify({'error': 'Proveedor no encontrado'}), 404
        return jsonify(proveedor), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_proveedor():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['prv_nombre'])
        if err: return err, code
        if data.get('prv_telefono'):
            err = validate_string(data, 'prv_telefono', min_length=7, max_length=15)
            if err: return err
        if data.get('prv_email'):
            err = validate_string(data, 'prv_email', min_length=5, max_length=100)
            if err: return err
        
        # Validar duplicados
        if Proveedores.exists_with_same_data(
            data.get('prv_nombre'),
            data.get('prv_telefono'),
            data.get('prv_email'),
            data.get('prv_direccion')
        ):
            return jsonify({'error': 'Ya existe un proveedor registrado con los mismos datos (nombre, teléfono, email y dirección)'}), 400
        
        proveedor_id = Proveedores.create(data)
        return jsonify({'message': 'Proveedor creado exitosamente', 'prv_id': proveedor_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def update_proveedor(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['prv_nombre'])
        if err: return err, code
        if data.get('prv_telefono'):
            err = validate_string(data, 'prv_telefono', min_length=7, max_length=15)
            if err: return err
        if data.get('prv_email'):
            err = validate_string(data, 'prv_email', min_length=5, max_length=100)
            if err: return err
        
        # Validar duplicados (excluyendo este proveedor)
        if Proveedores.exists_with_same_data(
            data.get('prv_nombre'),
            data.get('prv_telefono'),
            data.get('prv_email'),
            data.get('prv_direccion'),
            exclude_id=id
        ):
            return jsonify({'error': 'Ya existe otro proveedor registrado con los mismos datos (nombre, teléfono, email y dirección)'}), 400
        
        # Verificar si realmente hubo cambios
        actual = Proveedores.get_by_id(id)
        if actual:
            sin_cambios = (
                actual['prv_nombre'] == data.get('prv_nombre') and
                (actual['prv_telefono'] or '') == (data.get('prv_telefono') or '') and
                (actual['prv_email'] or '') == (data.get('prv_email') or '') and
                (actual['prv_direccion'] or '') == (data.get('prv_direccion') or '')
            )
            if sin_cambios:
                return jsonify({'message': 'No se realizaron cambios', 'sin_cambios': True}), 200
        
        Proveedores.update(id, data)
        return jsonify({'message': 'Proveedor actualizado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_proveedor(id):
    try:
        # Limpiar asociaciones huérfanas (producto ya no existe)
        Proveedores.execute(
            """DELETE pp FROM proveedores_productos pp
               LEFT JOIN productos p ON pp.ppr_producto_id = p.pro_id
               WHERE p.pro_id IS NULL"""
        )
        
        # Verificar si tiene asociaciones
        tiene, tipo = Proveedores.has_associations(id)
        if tiene:
            if tipo == 'compras':
                return jsonify({'error': 'No se puede eliminar el proveedor porque tiene compras registradas. Elimina primero las compras asociadas o marca el proveedor como inactivo.'}), 400
            else:
                return jsonify({'error': 'No se puede eliminar el proveedor porque tiene productos vinculados. Desvincula los productos primero.'}), 400
        
        Proveedores.delete(id)
        return jsonify({'message': 'Proveedor eliminado exitosamente'}), 200
    except Exception as e:
        err_str = str(e)
        if 'foreign key constraint' in err_str.lower() or '1451' in err_str:
            return jsonify({'error': 'No se puede eliminar el proveedor porque tiene compras, productos u otros registros asociados en el sistema.'}), 400
        return jsonify({'error': err_str}), 500
