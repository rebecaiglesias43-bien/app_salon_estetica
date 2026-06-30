from flask import Blueprint
from controllers import clientesController
from services.authService import auth_required

clientes_bp = Blueprint('clientes', __name__, url_prefix='/api/clientes')

clientes_bp.route('/', methods=['GET'])(auth_required(clientesController.get_clientes))
clientes_bp.route('/<int:id>', methods=['GET'])(auth_required(clientesController.get_cliente))
clientes_bp.route('/<int:id>/historial', methods=['GET'])(auth_required(clientesController.get_historial))
clientes_bp.route('/', methods=['POST'])(auth_required(clientesController.create_cliente))
clientes_bp.route('/<int:id>', methods=['PUT'])(auth_required(clientesController.update_cliente))
clientes_bp.route('/<int:id>', methods=['DELETE'])(auth_required(clientesController.delete_cliente))
clientes_bp.route('/public/search', methods=['GET'])(clientesController.search_clientes_public)