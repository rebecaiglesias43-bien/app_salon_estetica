from flask import Blueprint
from controllers import serviciosController
from services.authService import auth_required

servicios_bp = Blueprint('servicios', __name__, url_prefix='/api/servicios')

servicios_bp.route('/public', methods=['GET'])(serviciosController.get_servicios_public)
servicios_bp.route('/', methods=['GET'])(auth_required(serviciosController.get_servicios))
servicios_bp.route('/<int:id>', methods=['GET'])(auth_required(serviciosController.get_servicio))
servicios_bp.route('/', methods=['POST'])(auth_required(serviciosController.create_servicio))
servicios_bp.route('/<int:id>', methods=['PUT'])(auth_required(serviciosController.update_servicio))
servicios_bp.route('/<int:id>', methods=['DELETE'])(auth_required(serviciosController.delete_servicio))
