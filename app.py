from flask import Flask, jsonify
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from datetime import timedelta, date, datetime
from decimal import Decimal

from services.databaseService import init_app
from routers.authRouter import auth_bp
from routers.citasRouter import citas_bp
from routers.clientesRouter import clientes_bp
from routers.comprasRouter import compras_bp
from routers.cortesCajaRouter import cortesCaja_bp
from routers.detalleCitasRouter import detalleCitas_bp
from routers.detalleComprasRouter import detalleCompras_bp
from routers.detalleFacturasRouter import detalleFacturas_bp
from routers.facturasRouter import facturas_bp
from routers.historialProductosUsadosRouter import historialProductosUsados_bp
from routers.inventarioMovimientosRouter import inventarioMovimientos_bp
from routers.pagosRouter import pagos_bp
from routers.productosRouter import productos_bp
from routers.proveedoresProductosRouter import proveedoresProductos_bp
from routers.proveedoresRouter import proveedores_bp
from routers.serviciosProductosRouter import serviciosProductos_bp
from routers.serviciosRouter import servicios_bp
from routers.usuariosRouter import usuarios_bp
from routers.finanzasRouter import finanzas_bp
from routers.categoriasRouter import categorias_bp
from routers.devolucionesRouter import devoluciones_bp

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)

# ── Seguridad: JWT ──
jwt_secret = os.getenv('JWT_SECRET_KEY')
if not jwt_secret or jwt_secret == 'mi_clave_secreta':
    import secrets
    jwt_secret = secrets.token_hex(32)
    print('ATENCION: Usando JWT_SECRET_KEY generado automaticamente. Configuralo en .env para produccion.')
app.config['JWT_SECRET_KEY'] = jwt_secret
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# ── Seguridad: CORS restringido ──
allowed_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5000')
origins_list = [o.strip() for o in allowed_origins.split(',')]
CORS(app, origins=origins_list, supports_credentials=True)

jwt = JWTManager(app)
init_app(app)

# ── Migraciones automáticas al iniciar ──
def _run_migrations():
    """Aplica migraciones pendientes de forma segura (idempotentes)."""
    from services.databaseService import get_db
    try:
        db = get_db()
        cur = db.cursor()
        # Ampliar com_estado para 'Parcialmente devuelta' (22 chars, antes varchar(20))
        cur.execute("ALTER TABLE compras MODIFY com_estado varchar(30) DEFAULT 'Completada'")
        db.commit()
    except Exception:
        pass  # Ya aplicada o error no crítico

with app.app_context():
    _run_migrations()

# ── JSON encoder para tipos no serializables ──
class CustomJSONProvider(DefaultJSONProvider):
    @staticmethod
    def default(obj):
        if isinstance(obj, timedelta):
            total_seconds = int(obj.total_seconds())
            hours, remainder = divmod(total_seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            return f'{hours:02d}:{minutes:02d}:{seconds:02d}'
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        raise TypeError(f'Object of type {type(obj).__name__} is not JSON serializable')

app.json_provider_class = CustomJSONProvider
app.json = CustomJSONProvider(app)

# ── Seguridad: headers ──
@app.after_request
def security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Cache-Control'] = 'no-store'
    return response

app.register_blueprint(auth_bp)
app.register_blueprint(citas_bp)
app.register_blueprint(clientes_bp)
app.register_blueprint(compras_bp)
app.register_blueprint(cortesCaja_bp)
app.register_blueprint(detalleCitas_bp)
app.register_blueprint(detalleCompras_bp)
app.register_blueprint(detalleFacturas_bp)
app.register_blueprint(facturas_bp)
app.register_blueprint(historialProductosUsados_bp)
app.register_blueprint(inventarioMovimientos_bp)
app.register_blueprint(pagos_bp)
app.register_blueprint(productos_bp)
app.register_blueprint(proveedores_bp)
app.register_blueprint(proveedoresProductos_bp)
app.register_blueprint(servicios_bp)
app.register_blueprint(serviciosProductos_bp)
app.register_blueprint(usuarios_bp)
app.register_blueprint(finanzas_bp)
app.register_blueprint(categorias_bp)
app.register_blueprint(devoluciones_bp)

@app.route('/')
def index():
    return jsonify({'message': 'API Salon de Belleza', 'status': 'OK'})

@app.route('/api/health')
def health():
    # Ping MySQL para mantener despierto Aiven (cron-job.org)
    try:
        from services.databaseService import get_db
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT 1")
    except Exception:
        pass
    return jsonify({'status': 'OK', 'message': 'API funcionando'})

# ── Manejadores de errores globales ──
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Ruta no encontrada'}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({'error': 'Metodo no permitido'}), 405

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Error interno del servidor'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True, use_reloader=False)