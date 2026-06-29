import pymysql
pymysql.install_as_MySQLdb()
import MySQLdb
import MySQLdb.cursors
from flask import g
import os
import queue
import threading
import tempfile


def _write_ssl_ca():
    """Escribe el certificado CA (Aiven u otro) desde variable de entorno a un archivo temporal.
    
    La variable DB_SSL_CA debe contener el PEM del certificado CA incluyendo
    las lineas -----BEGIN CERTIFICATE----- y -----END CERTIFICATE-----.
    Retorna la ruta al archivo temporal, o None si no está configurado.
    """
    ca_cert = os.getenv('DB_SSL_CA', '').strip()
    if not ca_cert:
        return None
    ca_path = os.path.join(tempfile.gettempdir(), 'aiven-ca.pem')
    with open(ca_path, 'w') as f:
        f.write(ca_cert)
    return ca_path


def _db_config():
    """Helper para construir config de conexión desde variables de entorno."""
    config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'passwd': os.getenv('DB_PASSWORD', ''),
        'db': os.getenv('DB_NAME', 'sistema_estetica'),
        'port': int(os.getenv('DB_PORT', 3306)),
        'cursorclass': MySQLdb.cursors.DictCursor,
    }

    # ── SSL: requerido por Aiven y otros MySQL administrados ──
    ca_path = _write_ssl_ca()
    if ca_path:
        config['ssl'] = {'ca': ca_path}

    return config

# Pool simple de conexiones MySQL reutilizables (sin dependencias externas).
# Mantiene conexiones vivas entre requests, evitando el SSL handshake (~3s) en cada uno.
class _ConnectionPool:
    def __init__(self, mincached=1, maxcached=5):
        self._maxcached = maxcached
        self._config = _db_config()
        self._pool = queue.Queue(maxcached)
        self._lock = threading.Lock()
        self._conn_count = 0
        
        # Crear conexiones iniciales
        for _ in range(mincached):
            conn = MySQLdb.connect(**self._config)
            self._pool.put(conn)
            self._conn_count += 1

    def get_connection(self):
        try:
            return self._pool.get_nowait()
        except queue.Empty:
            with self._lock:
                if self._conn_count < self._maxcached:
                    conn = MySQLdb.connect(**self._config)
                    self._conn_count += 1
                    return conn
            # Todas ocupadas, esperar a que una se libere
            return self._pool.get()

    def return_connection(self, conn):
        try:
            self._pool.put_nowait(conn)
        except queue.Full:
            conn.close()
            self._conn_count -= 1

_pool = None

def _get_pool():
    global _pool
    if _pool is None:
        _pool = _ConnectionPool(mincached=1, maxcached=5)
    return _pool

def get_db():
    if 'db' not in g:
        pool = _get_pool()
        g.db = pool.get_connection()
        g._pool_ref = pool  # guardar referencia para devolverla al cerrar
    else:
        try:
            g.db.ping(True)
        except MySQLdb.OperationalError:
            pool = _get_pool()
            g.db = pool.get_connection()
            g._pool_ref = pool
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    pool_ref = g.pop('_pool_ref', None)
    if db is not None and pool_ref is not None:
        pool_ref.return_connection(db)
    elif db is not None:
        db.close()

def init_app(app):
    app.teardown_appcontext(close_db)
