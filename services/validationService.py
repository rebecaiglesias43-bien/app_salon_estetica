"""
Servicio de validación centralizado para todos los controladores.
Las funciones retornan (dict, status_code) o None.
"""


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


def validate_string(data, field, max_length=255):
    """Verifica que un campo string no exceda el largo máximo. Retorna (dict, status_code) o None."""
    value = data.get(field)
    if value is not None and isinstance(value, str) and len(value) > max_length:
        return {'error': f'{field} excede el máximo de {max_length} caracteres'}, 400
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
