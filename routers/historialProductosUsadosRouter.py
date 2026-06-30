from flask import Blueprint
from controllers import historialProductosUsadosController
from services.authService import auth_required

historialProductosUsados_bp = Blueprint('historialProductosUsados', __name__, url_prefix='/api/historial-productos-usados')

historialProductosUsados_bp.route('/cita/<int:cita_id>', methods=['GET'])(auth_required(historialProductosUsadosController.get_by_cita))
historialProductosUsados_bp.route('/producto/<int:producto_id>', methods=['GET'])(auth_required(historialProductosUsadosController.get_by_producto))
historialProductosUsados_bp.route('/', methods=['POST'])(auth_required(historialProductosUsadosController.create_historial))
historialProductosUsados_bp.route('/cita/<int:cita_id>', methods=['DELETE'])(auth_required(historialProductosUsadosController.delete_by_cita))
