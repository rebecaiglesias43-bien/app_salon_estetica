import time
from functools import wraps
from flask import request, jsonify

"""
Caché en memoria simple para datos semi-estáticos.
Reduce consultas repetitivas a MySQL para datos que cambian poco.

Uso:
    @cached(ttl=60)
    def get_productos():
        ...
"""

_cache = {}        # {key: (expiry, response_tuple)}
_cache_enabled = True
_generation = 0     # contador que incrementa en cada clear_cache para invalidar requests en vuelo

def _make_key():
    """Crea key única a partir de ruta + query params (sin auth)."""
    return f"{request.path}?{request.query_string.decode('utf-8') if request.query_string else ''}"

def get_from_cache(key):
    """Retorna respuesta cacheada o None si expiró/no existe."""
    global _cache
    entry = _cache.get(key)
    if entry is None:
        return None
    expiry, response = entry
    if time.time() > expiry:
        del _cache[key]
        return None
    return response

def set_in_cache(key, response, ttl):
    """Guarda respuesta en caché con tiempo de vida en segundos."""
    global _cache
    _cache[key] = (time.time() + ttl, response)

def clear_cache(pattern=None):
    """Limpia toda la caché o solo las keys que contengan un patrón."""
    global _cache, _generation
    if pattern is None:
        _cache.clear()
    else:
        keys = [k for k in _cache if pattern in k]
        for k in keys:
            del _cache[k]
    _generation += 1  # Invalida cualquier request GET en vuelo que intente cachear datos viejos

def cached(ttl=60):
    """Decorador: cachea la respuesta JSON de un endpoint por `ttl` segundos.
    
    Solo aplica a GET requests. Si el TTL expira, la siguiente llamada
    ejecuta la función original y refresca la caché.
    
    Protección anti-race: captura la generación al iniciar el request.
    Si clear_cache() fue llamado durante la ejecución (generación cambió),
    NO cachea la respuesta para evitar guardar datos viejos.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not _cache_enabled or request.method != 'GET':
                return func(*args, **kwargs)
            
            key = _make_key()
            cached_resp = get_from_cache(key)
            if cached_resp is not None:
                return cached_resp
            
            gen_at_start = _generation  # Capturar generación antes de la consulta
            response = func(*args, **kwargs)
            
            # Solo cachear si la generación no cambió durante la ejecución
            if _generation != gen_at_start:
                return response  # clear_cache fue llamado → no cachear datos potencialmente viejos
            
            # Solo cachear respuestas exitosas
            if isinstance(response, tuple) and len(response) >= 2:
                body, status = response[0], response[1]
                if status == 200:
                    set_in_cache(key, response, ttl)
            elif isinstance(response, tuple) and len(response) == 1:
                # Sin código de estado explícito
                set_in_cache(key, response, ttl)
            
            return response
        return wrapper
    return decorator
