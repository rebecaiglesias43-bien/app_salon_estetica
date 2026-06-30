"""
Servicio de validación centralizado para todos los controladores.
Las funciones retornan (dict, status_code) o None.
"""
import re


def get_json_data(request):
    """Verifica que el body sea JSON válido."""
    data = request.get_json(silent=True)
    if data is None:
        return {'error': 'El body debe ser JSON válido'}, 400, None
    return None, None, data


def require_fields(data, required_fields):
    """
    Verifica que los campos requeridos estén presentes y no vacíos.
    Retorna (error_dict, status_code, None) o (None, None, data).
    """
    missing = []
    for field in required_fields:
        value = data.get(field)
        if value is None or (isinstance(value, str) and value.strip() == ''):
            missing.append(field)

    if missing:
        return {'error': f'Campos requeridos: {", ".join(missing)}'}, 400, None

    return None, None, data


def require_positive_number(data, field):
    """Verifica que un campo sea un número positivo. Retorna (dict, status_code) o None."""
    value = data.get(field)
    if value is not None and value != '':
        try:
            num = float(value)
            if num < 0:
                return {'error': f'{field} no puede ser negativo'}, 400
        except (TypeError, ValueError):
            return {'error': f'{field} debe ser un número válido'}, 400
    return None


def _extraer_string_args(args, kwargs):
    """Interpreta argumentos posicionales o keyword para validate_string.
    Soporta: validate_string(data, field, min_length=X, max_length=Y)
    Y también: validate_string(data, field, 'label', min_len, max_len)"""
    data = kwargs.get('data')
    field = kwargs.get('field')
    max_length = kwargs.get('max_length', 255)
    min_length = kwargs.get('min_length', 0)
    
    if args:
        data = args[0] if len(args) > 0 else data
        field = args[1] if len(args) > 1 else field
        if len(args) >= 5:
            # Modo legacy: (data, field, label, min, max) — ignoramos label
            min_length = args[3] if len(args) > 3 else min_length
            max_length = args[4] if len(args) > 4 else max_length
        elif len(args) >= 4:
            max_length = args[2]
            min_length = args[3]
        elif len(args) >= 3:
            max_length = args[2]
    
    return data, field, max_length, min_length

def validate_string_decorator(func):
    """Decorador para validate_string: maneja llamadas con args posicionales (legacy) o keyword."""
    from functools import wraps
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except TypeError:
            # Fallback: re-interpretar argumentos posicionales
            data, field, max_length, min_length = _extraer_string_args(args, kwargs)
            if data is None or field is None:
                return {'error': 'Error interno: validate_string requiere data y field'}, 500
            return func(data, field, max_length=max_length, min_length=min_length)
    return wrapper

@validate_string_decorator
def validate_string(data, field, max_length=255, min_length=0):
    """Verifica que un campo string no exceda el largo máximo y cumpla mínimo.
    Retorna (dict, status_code) o None."""
    value = data.get(field)
    if value is not None and isinstance(value, str):
        stripped = value.strip()
        if max_length and len(stripped) > max_length:
            return {'error': f'{field} excede el máximo de {max_length} caracteres'}, 400
        if min_length and len(stripped) < min_length:
            return {'error': f'{field} debe tener al menos {min_length} caracteres'}, 400
    return None


def validate_int(data, field):
    """Verifica que un campo sea un entero válido. Retorna (dict, status_code) o None."""
    value = data.get(field)
    if value is not None and value != '':
        try:
            int(value)
        except (TypeError, ValueError):
            return {'error': f'{field} debe ser un número entero'}, 400
    return None


def validate_estado(data, field, valid_states):
    """Verifica que el estado esté en la lista de válidos. Retorna (dict, status_code) o None."""
    value = data.get(field)
    if value is not None and value not in valid_states:
        return {'error': f'{field} inválido. Valores permitidos: {", ".join(valid_states)}'}, 400
    return None


def validate_telefono(data, field='cli_telefono'):
    """Valida formato de teléfono colombiano (10 dígitos, opcionalmente con indicativo).
    Retorna (dict, status_code) o None."""
    value = data.get(field)
    if value and isinstance(value, str):
        cleaned = re.sub(r'[\s\-\(\)]', '', value)
        if not cleaned.isdigit() or len(cleaned) < 7 or len(cleaned) > 15:
            return {'error': f'{field} debe ser un número telefónico válido (7-15 dígitos)'}, 400
    return None


def validate_telefono_unico(data, field='cli_telefono', exclude_id=None):
    """Verifica que el teléfono no esté registrado por otro cliente.
    Retorna (dict, status_code) o None."""
    from models.Clientes import Clientes

    value = data.get(field)
    if value and isinstance(value, str):
        existing = Clientes.get_by_telefono(value.strip())
        if existing:
            # Si estamos actualizando, permitir el mismo teléfono si es del mismo cliente
            if exclude_id is not None and existing['cli_id'] == exclude_id:
                return None
            return {'error': f'El teléfono "{value}" ya está registrado por otro cliente'}, 400
    return None


def validate_nombre(data, field='cli_nombre', min_length=2, max_length=80):
    """Valida que un campo nombre/txt contenga solo caracteres válidos (letras, espacios, tildes).
    Retorna (dict, status_code) o None."""
    value = data.get(field)
    if value and isinstance(value, str):
        stripped = value.strip()
        if len(stripped) < min_length:
            return {'error': f'{field} debe tener al menos {min_length} caracteres'}, 400
        if len(stripped) > max_length:
            return {'error': f'{field} excede el máximo de {max_length} caracteres'}, 400
        # Permitir letras (incl. acentuadas), espacios, guiones, apóstrofes
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-\'\.]+$', stripped):
            return {'error': f'{field} solo debe contener letras y espacios'}, 400
    return None

