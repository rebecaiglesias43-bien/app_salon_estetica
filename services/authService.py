import bcrypt
from flask_jwt_extended import create_access_token, verify_jwt_in_request, get_jwt_identity
from functools import wraps
from flask import jsonify
from services.databaseService import get_db


def hash_password(password):
    """Hashea una contrasena con bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def login_user(username, password):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM usuarios WHERE usu_username = %s", (username,))
    user = cursor.fetchone()
    
    if not user:
        return None, "Usuario no encontrado"
    
    if not bcrypt.checkpw(password.encode('utf-8'), user['usu_password'].encode('utf-8')):
        return None, "Contraseña incorrecta"
    
    if user['usu_estado'] != 'activo':
        return None, "Usuario inactivo"
    
    access_token = create_access_token(
        identity=user['usu_username'],
        additional_claims={
            'usu_id': user['usu_id'],
            'email': user['usu_email'] or ''
        }
    )
    
    return access_token, None


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return fn(*args, **kwargs)
        except Exception:
            return jsonify({'error': 'Token invalido o expirado'}), 401
    return wrapper


def get_current_user():
    current_user = get_jwt_identity()
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM usuarios WHERE usu_username = %s", (current_user,))
    return cursor.fetchone()
