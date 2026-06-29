from flask import Blueprint
from controllers import cortesCajaController
from services.authService import auth_required

cortesCaja_bp = Blueprint('cortesCaja', __name__, url_prefix='/api/cortes-caja')

cortesCaja_bp.route('/', methods=['GET'])(auth_required(cortesCajaController.get_cortes))
cortesCaja_bp.route('/abierto', methods=['GET'])(auth_required(cortesCajaController.get_corte_abierto))
cortesCaja_bp.route('/abrir', methods=['POST'])(auth_required(cortesCajaController.abrir_corte))
cortesCaja_bp.route('/<int:id>/actividad', methods=['GET'])(auth_required(cortesCajaController.get_actividad_corte))
cortesCaja_bp.route('/<int:id>/cerrar', methods=['PUT'])(auth_required(cortesCajaController.cerrar_corte))
