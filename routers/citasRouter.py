from flask import Blueprint
from controllers import citasController
from services.authService import auth_required

citas_bp = Blueprint('citas', __name__, url_prefix='/api/citas')

# ── Rutas públicas (sin auth) ──
citas_bp.route('/public', methods=['POST'])(citasController.create_cita_public)
citas_bp.route('/ocupados', methods=['GET'])(citasController.get_ocupados)
citas_bp.route('/bloques-disponibles', methods=['GET'])(citasController.get_bloques_disponibles)
citas_bp.route('/bloques-ocupados', methods=['GET'])(citasController.get_bloques_ocupados)

# ── Endpoint dedicado para próximas citas (dashboard) ──
# Usa la versión del controller que incluye GROUP_CONCAT de servicios y SUM de precios
citas_bp.route('/proximas', methods=['GET'])(auth_required(citasController.proximas_citas))

# ── Rutas admin (auth required) ──
citas_bp.route('/admin', methods=['POST'])(auth_required(citasController.create_cita_admin))
citas_bp.route('/', methods=['GET'])(auth_required(citasController.get_citas))
citas_bp.route('/<int:id>', methods=['GET'])(auth_required(citasController.get_cita))
citas_bp.route('/<int:id>/estado', methods=['PUT'])(auth_required(citasController.update_cita_estado))
citas_bp.route('/<int:id>/reprogramar', methods=['PUT'])(auth_required(citasController.reprogramar_cita))
