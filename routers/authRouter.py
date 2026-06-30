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
    
    access_token, refresh_token, error = login_user(username, password)
    
    if error:
        _record_failed(ip)
        return jsonify({'error': error}), 401
    
    _record_success(ip)
    return jsonify({
        'token': access_token,
        'refresh_token': refresh_token,
        'username': username
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """Renueva el access token usando un refresh token valido."""
    from flask_jwt_extended import create_access_token
    from services.authService import validate_refresh_token, revoke_all_user_tokens, create_refresh_token
    from datetime import timedelta
    from models.Usuarios import Usuarios

    data = request.get_json()
    raw_refresh = (data.get('refresh_token') or '').strip() if data else ''

    if not raw_refresh:
        return jsonify({'error': 'Refresh token requerido'}), 400

    user_id, rft_id = validate_refresh_token(raw_refresh)
    if user_id is None:
        return jsonify({'error': 'Refresh token invalido o expirado'}), 401

    # Obtener datos del usuario
    user = Usuarios.get_by_id(user_id)
    if not user or user['usu_estado'] != 'activo':
        return jsonify({'error': 'Usuario inactivo o eliminado'}), 401

    # Rotar refresh token (revocar el actual, emitir uno nuevo)
    revoke_all_user_tokens(user_id)
    new_refresh_token = create_refresh_token(user_id)

    new_access_token = create_access_token(
        identity=user['usu_username'],
        additional_claims={
            'usu_id': user['usu_id'],
            'email': user['usu_email'] or ''
        },
        expires_delta=timedelta(minutes=15)
    )

    return jsonify({
        'token': new_access_token,
        'refresh_token': new_refresh_token
    }), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Revoca el refresh token para cerrar la sesion."""
    from services.authService import revoke_refresh_token

    data = request.get_json()
    raw_refresh = (data.get('refresh_token') or '').strip() if data else ''

    if raw_refresh:
        revoke_refresh_token(raw_refresh)

    return jsonify({'message': 'Sesion cerrada exitosamente'}), 200


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


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Genera un token de recuperación y devuelve el enlace para restablecer la contraseña."""
    import secrets
    data = request.get_json()
    username_or_email = (data.get('username') or data.get('email') or '').strip() if data else ''
    
    if not username_or_email:
        return jsonify({'error': 'Ingrese su nombre de usuario o email'}), 400
    
    # Buscar por username primero, luego por email
    user = Usuarios.get_by_username(username_or_email)
    if not user:
        user = Usuarios.query_one(
            "SELECT * FROM usuarios WHERE usu_email = %s",
            (username_or_email,)
        )
    
    if not user:
        return jsonify({'error': 'No se encontró un usuario con esos datos'}), 404
    
    # Generar token de recuperación (32 bytes = 43 chars en base64 url-safe)
    reset_token = secrets.token_urlsafe(32)
    expires = datetime.now() + timedelta(minutes=15)
    
    # Guardar token y expiración en la BD
    Usuarios.set_reset_token(user['usu_id'], reset_token, expires)
    
    # Construir enlace de recuperación
    origin = request.headers.get('Origin', 'http://localhost:5173')
    reset_url = f"{origin}/reset-password?token={reset_token}"
    
    return jsonify({
        'message': 'Enlace de recuperación generado. Válido por 15 minutos.',
        'reset_url': reset_url,
        'username': user['usu_username'],
        'expires_in_minutes': 15
    }), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Restablece la contraseña usando un token de recuperación."""
    from services.databaseService import get_db
    import bcrypt
    
    data = request.get_json()
    token = (data.get('token') or '').strip() if data else ''
    new_password = (data.get('new_password') or '') if data else ''
    
    if not token or not new_password:
        return jsonify({'error': 'Token y nueva contraseña son requeridos'}), 400
    
    if len(new_password) < 4:
        return jsonify({'error': 'La nueva contraseña debe tener al menos 4 caracteres'}), 400
    
    # Buscar usuario por token no expirado
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "SELECT * FROM usuarios WHERE usu_reset_token = %s AND usu_reset_expires > NOW()",
        (token,)
    )
    user = cursor.fetchone()
    
    if not user:
        return jsonify({'error': 'El enlace de recuperación no es válido o ha expirado'}), 400
    
    # Cambiar contraseña y limpiar token
    hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    Usuarios.change_password(user['usu_id'], hashed)
    Usuarios.clear_reset_token(user['usu_id'])
    
    return jsonify({
        'message': 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.'
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
    
    access_token, refresh_token, error = login_user(username, current_password)
    if error:
        return jsonify({'error': 'Contraseña actual incorrecta'}), 401
    # Al cambiar contraseña, revocar tokens anteriores (ya se hace en login_user)
    
    user = Usuarios.get_by_username(username)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    Usuarios.change_password(user['usu_id'], hash_password(new_password))
    
    return jsonify({'message': 'Contraseña actualizada exitosamente'}), 200