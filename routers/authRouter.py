from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from services.authService import login_user, auth_required, hash_password
from models.Usuarios import Usuarios
from datetime import datetime, timedelta

# Rate limiting simple (en memoria)
_login_attempts = {}

def _check_rate_limit(ip):
    now = datetime.now()
    if ip in _login_attempts:
        count, first = _login_attempts[ip]
        if count >= 5:
            if now - first < timedelta(minutes=15):
                remaining = int(900 - (now - first).total_seconds())
                return False, remaining
            del _login_attempts[ip]
    return True, 0

def _record_failed(ip):
    now = datetime.now()
    if ip in _login_attempts:
        count, first = _login_attempts[ip]
        _login_attempts[ip] = [count + 1, first]
    else:
        _login_attempts[ip] = [1, now]

def _record_success(ip):
    _login_attempts.pop(ip, None)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    ip = request.remote_addr or 'unknown'
    
    allowed, remaining = _check_rate_limit(ip)
    if not allowed:
        return jsonify({
            'error': f'Demasiados intentos. Intente de nuevo en {remaining} segundos.'
        }), 429
    
    data = request.get_json()
    username = data.get('username', '').strip() if data else ''
    password = data.get('password', '') if data else ''
    
    if not username or not password:
        _record_failed(ip)
        return jsonify({'error': 'Usuario y contraseña son requeridos'}), 400
    
    token, error = login_user(username, password)
    
    if error:
        _record_failed(ip)
        return jsonify({'error': error}), 401
    
    _record_success(ip)
    return jsonify({'token': token, 'username': username}), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data.get('usu_username') or not data.get('usu_password'):
        return jsonify({'error': 'Usuario y contraseña son requeridos'}), 400
    
    if len(data.get('usu_password', '')) < 6:
        return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
    
    # Verificar si ya existe
    existente = Usuarios.get_by_username(data.get('usu_username'))
    if existente:
        return jsonify({'error': 'El nombre de usuario ya existe'}), 400
    
    usuario_id = Usuarios.create({
        'usu_username': data.get('usu_username'),
        'usu_password': hash_password(data.get('usu_password')),
        'usu_email': data.get('usu_email', ''),
        'usu_estado': 'activo'
    })
    
    return jsonify({'message': 'Usuario registrado exitosamente', 'usu_id': usuario_id}), 201


@auth_bp.route('/me', methods=['GET'])
@auth_required
def me():
    from services.authService import get_current_user
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    return jsonify({
        'usu_id': user['usu_id'],
        'usu_username': user['usu_username'],
        'usu_email': user['usu_email'],
        'usu_estado': user['usu_estado']
    }), 200


@auth_bp.route('/change-password', methods=['PUT'])
@auth_required
def change_password():
    data = request.get_json()
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return jsonify({'error': 'Contraseña actual y nueva son requeridas'}), 400
    
    if len(new_password) < 4:
        return jsonify({'error': 'La nueva contraseña debe tener al menos 4 caracteres'}), 400

    username = get_jwt_identity()
    
    token, error = login_user(username, current_password)
    if error:
        return jsonify({'error': 'Contraseña actual incorrecta'}), 401
    
    user = Usuarios.get_by_username(username)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    Usuarios.change_password(user['usu_id'], hash_password(new_password))
    
    return jsonify({'message': 'Contraseña actualizada exitosamente'}), 200