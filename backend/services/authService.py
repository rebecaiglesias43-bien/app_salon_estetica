import bcrypt
import secrets
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token, verify_jwt_in_request, get_jwt_identity
from functools import wraps
from flask import jsonify
from services.databaseService import get_db


REFRESH_TOKEN_DAYS = 7
ACCESS_TOKEN_MINUTES = 120


def hash_password(password):
    """Hashea una contrasena con bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def _hash_token(raw_token):
    """Hashea un token crudo para almacenarlo en BD (nunca guardamos el raw)."""
    return bcrypt.hashpw(raw_token.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def create_refresh_token(user_id):
    """Genera un refresh token, lo guarda hasheado en BD y devuelve el raw."""
    raw_token = secrets.token_urlsafe(48)
    token_hash = _hash_token(raw_token)
    expires_at = datetime.now() + timedelta(days=REFRESH_TOKEN_DAYS)

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO refresh_tokens (rft_usuario_id, rft_token_hash, rft_expires_at) VALUES (%s, %s, %s)",
        (user_id, token_hash, expires_at)
    )
    db.commit()

    return raw_token


def validate_refresh_token(raw_token):
    """Busca un refresh token no expirado y no revocado que coincida con el hash.
    Retorna (user_id, rft_id) o (None, None)."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "SELECT rft_id, rft_usuario_id, rft_token_hash, rft_expires_at, rft_revoked FROM refresh_tokens WHERE rft_revoked = 0"
    )
    candidates = cursor.fetchall()

    for row in candidates:
        if bcrypt.checkpw(raw_token.encode('utf-8'), row['rft_token_hash'].encode('utf-8')):
            if row['rft_expires_at'] < datetime.now():
                return None, None
            return row['rft_usuario_id'], row['rft_id']

    return None, None


def revoke_refresh_token(raw_token):
    """Revoca un refresh token específico."""
    user_id, rft_id = validate_refresh_token(raw_token)
    if rft_id is None:
        return False
    db = get_db()
    cursor = db.cursor()
    cursor.execute("UPDATE refresh_tokens SET rft_revoked = 1 WHERE rft_id = %s", (rft_id,))
    db.commit()
    return True


def revoke_all_user_tokens(user_id):
    """Revoca todos los refresh tokens de un usuario (útil al cambiar contraseña)."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute("UPDATE refresh_tokens SET rft_revoked = 1 WHERE rft_usuario_id = %s AND rft_revoked = 0", (user_id,))
    db.commit()


def login_user(username, password):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM usuarios WHERE usu_username = %s", (username,))
    user = cursor.fetchone()
    
    if not user:
        return None, None, "Usuario no encontrado"
    
    if not bcrypt.checkpw(password.encode('utf-8'), user['usu_password'].encode('utf-8')):
        return None, None, "Contraseña incorrecta"
    
    if user['usu_estado'] != 'activo':
        return None, None, "Usuario inactivo"
    
    # Revocar tokens anteriores del usuario (rotación de refresh tokens)
    revoke_all_user_tokens(user['usu_id'])
    
    access_token = create_access_token(
        identity=user['usu_username'],
        additional_claims={
            'usu_id': user['usu_id'],
            'email': user['usu_email'] or ''
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_MINUTES)
    )
    
    refresh_token = create_refresh_token(user['usu_id'])
    
    return access_token, refresh_token, None


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            # Verificar que el usuario siga activo
            username = get_jwt_identity()
            db = get_db()
            cursor = db.cursor()
            cursor.execute("SELECT usu_estado FROM usuarios WHERE usu_username = %s", (username,))
            user = cursor.fetchone()
            if not user or user['usu_estado'] != 'activo':
                return jsonify({'error': 'Usuario inactivo o eliminado'}), 401
            return fn(*args, **kwargs)
        except Exception:
            return jsonify({'error': 'Token invalido o expirado'}), 401
    return wrapper


def get_current_user():
    current_user = get_jwt_identity()
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT usu_id, usu_username, usu_email, usu_estado FROM usuarios WHERE usu_username = %s", (current_user,))
    return cursor.fetchone()
