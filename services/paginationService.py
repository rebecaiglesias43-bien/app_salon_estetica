"""
Helper de paginación para endpoints GET de listado.
"""

from flask import request

DEFAULT_PAGE = 1
DEFAULT_LIMIT = 20
MAX_LIMIT = 100


def get_pagination_params():
    """
    Extrae page y limit de request.args con validación.
    Retorna (page, limit, offset).
    """
    try:
        page = int(request.args.get('page', DEFAULT_PAGE))
    except (TypeError, ValueError):
        page = DEFAULT_PAGE
    
    try:
        limit = int(request.args.get('limit', DEFAULT_LIMIT))
    except (TypeError, ValueError):
        limit = DEFAULT_LIMIT
    
    if page < 1:
        page = DEFAULT_PAGE
    if limit < 1:
        limit = DEFAULT_LIMIT
    if limit > MAX_LIMIT:
        limit = MAX_LIMIT
    
    offset = (page - 1) * limit
    return page, limit, offset


def paginated_response(data, total, page, limit):
    """
    Construye la respuesta paginada estándar.
    """
    pages = max(1, (total + limit - 1) // limit) if limit > 0 else 1
    
    return {
        'data': data,
        'page': page,
        'limit': limit,
        'total': total,
        'pages': pages
    }
