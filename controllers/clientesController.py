from flask import request, jsonify
from models.Clientes import Clientes
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, validate_telefono, validate_telefono_unico, validate_nombre
from services.paginationService import get_pagination_params, paginated_response

@auth_required
def get_clientes():
    try:
        page, limit, offset = get_pagination_params()
        search = request.args.get('search', '').strip()
        
        if search:
            clientes = Clientes.search(search, limit=limit, offset=offset)
            total = Clientes.count_search(search)
        else:
            clientes = Clientes.get_all(limit=limit, offset=offset)
            total = Clientes.count_all()
        
        return jsonify(paginated_response(clientes, total, page, limit)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_cliente(id):
    try:
        cliente = Clientes.get_by_id(id)
        if not cliente:
            return jsonify({'error': 'Cliente no encontrado'}), 404
        return jsonify(cliente), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_historial(id):
    try:
        historial = Clientes.get_historial(id)
        return jsonify(historial), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_cliente():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['cli_nombre', 'cli_telefono'])
        if err: return err, code

        # Validar nombre y teléfono
        err = validate_nombre(data, 'cli_nombre')
        if err: return err
        err = validate_telefono(data, 'cli_telefono')
        if err: return err
        err = validate_telefono_unico(data, 'cli_telefono')
        if err: return err

        # Validar que no exista otro cliente con el mismo nombre + apellido
        nombre = (data.get('cli_nombre') or '').strip().lower()
        apellido = (data.get('cli_apellido') or '').strip().lower()
        existente = Clientes.query_one(
            """SELECT * FROM clientes 
               WHERE LOWER(TRIM(cli_nombre)) = %s 
                 AND LOWER(TRIM(COALESCE(cli_apellido, ''))) = %s
               LIMIT 1""",
            (nombre, apellido)
        )
        if existente:
            return jsonify({
                'error': f"Ya existe un cliente con el nombre {data.get('cli_nombre', '')} {data.get('cli_apellido', '')} (tel. {existente.get('cli_telefono', '')})"
            }), 400

        # Normalizar teléfono antes de guardar (sin espacios, guiones, paréntesis)
        import re
        data['cli_telefono'] = re.sub(r'[\s\-\(\)\+]', '', data['cli_telefono'])

        cliente_id = Clientes.create(data)
        return jsonify({
            'message': 'Cliente creado exitosamente',
            'cli_id': cliente_id
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def update_cliente(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['cli_nombre', 'cli_telefono'])
        if err: return err, code
        err = validate_nombre(data, 'cli_nombre')
        if err: return err
        err = validate_telefono(data, 'cli_telefono')
        if err: return err
        err = validate_telefono_unico(data, 'cli_telefono', exclude_id=int(id))
        if err: return err

        # Normalizar teléfono antes de guardar
        import re
        data['cli_telefono'] = re.sub(r'[\s\-\(\)\+]', '', data['cli_telefono'])

        Clientes.update(id, data)
        return jsonify({'message': 'Cliente actualizado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def search_clientes_public():
    """Buscar clientes por nombre (endpoint público para la landing)"""
    try:
        q = request.args.get('q', '').strip()
        if len(q) < 2:
            return jsonify([]), 200
        clientes = Clientes.search(q, limit=10)
        # Solo devolver campos necesarios
        result = [{'cli_id': c['cli_id'], 'cli_nombre': c['cli_nombre'], 'cli_apellido': c.get('cli_apellido', ''), 'cli_telefono': c['cli_telefono']} for c in clientes]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e), 'type': type(e).__name__}), 500


@auth_required
def delete_cliente(id):
    try:
        # Solo bloquea si tiene citas activas (pendiente, aprobada, confirmada, completada)
        citas = Clientes.query_one(
            "SELECT COUNT(*) as total FROM citas WHERE cit_cliente_id = %s AND cit_estado NOT IN ('cancelada')",
            (id,)
        )
        if citas and citas['total'] > 0:
            return jsonify({'error': 'No se puede eliminar el cliente porque tiene citas activas'}), 400

        # También verificar facturas asociadas
        facturas = Clientes.query_one(
            "SELECT COUNT(*) as total FROM facturas WHERE fac_cliente_id = %s",
            (id,)
        )
        if facturas and facturas['total'] > 0:
            return jsonify({'error': 'No se puede eliminar el cliente porque tiene facturas asociadas'}), 400
        
        Clientes.delete(id)
        return jsonify({'message': 'Cliente eliminado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500