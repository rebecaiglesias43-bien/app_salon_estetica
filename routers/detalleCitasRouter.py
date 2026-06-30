from flask import Blueprint
from controllers import detalleCitasController
from services.authService import auth_required

detalleCitas_bp = Blueprint('detalleCitas', __name__, url_prefix='/api/detalle-citas')

detalleCitas_bp.route('/cita/<int:cita_id>', methods=['GET'])(auth_required(detalleCitasController.get_detalle_by_cita))
detalleCitas_bp.route('/', methods=['POST'])(auth_required(detalleCitasController.create_detalle))
detalleCitas_bp.route('/cita/<int:cita_id>', methods=['DELETE'])(auth_required(detalleCitasController.delete_detalle_by_cita))