from flask import request, jsonify
from models.Usuarios import Usuarios
from services.authService import auth_required, hash_password
from services.validationService import get_json_data, require_fields, validate_estado
from services.paginationService import get_pagination_params, paginated_response

@auth_required
def get_usuarios():
    try:
        page, limit, offset = get_pagination_params()
        usuarios = Usuarios.get_all(limit=limit, offset=offset)
        total = Usuarios.count_all()
        return jsonify(paginated_response(usuarios, total, page, limit)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_usuario(id):
    try:
        usuario = Usuarios.get_by_id(id)
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        return jsonify(usuario), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_usuario():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['usu_username', 'usu_password'])
        if err: return err, code
        
        if len(data.get('usu_password', '')) < 6:
            return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
        if len(data.get('usu_username', '')) < 3:
            return jsonify({'error': 'El usuario debe tener al menos 3 caracteres'}), 400
        
        existente = Usuarios.get_by_username(data.get('usu_username'))
        if existente:
            return jsonify({'error': 'El nombre de usuario ya existe'}), 400
        
        data['usu_password'] = hash_password(data['usu_password'])
        usuario_id = Usuarios.create(data)
        return jsonify({'message': 'Usuario creado exitosamente', 'usu_id': usuario_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def update_usuario(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['usu_username'])
        if err: return err, code
        
        if data.get('usu_password'):
            if len(data['usu_password']) < 6:
                return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
            data['usu_password'] = hash_password(data['usu_password'])
        Usuarios.update(id, data)
        return jsonify({'message': 'Usuario actualizado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_usuario(id):
    try:
        Usuarios.delete(id)
        return jsonify({'message': 'Usuario eliminado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
