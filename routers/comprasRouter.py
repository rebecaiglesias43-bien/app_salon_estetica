from flask import Blueprint
from controllers import comprasController
from services.authService import auth_required

compras_bp = Blueprint('compras', __name__, url_prefix='/api/compras')

compras_bp.route('/', methods=['GET'])(auth_required(comprasController.get_compras))
compras_bp.route('/<int:id>', methods=['GET'])(auth_required(comprasController.get_compra))
compras_bp.route('/', methods=['POST'])(auth_required(comprasController.create_compra))
compras_bp.route('/<int:id>/estado', methods=['PUT'])(auth_required(comprasController.update_estado_compra))
compras_bp.route('/<int:id>', methods=['DELETE'])(auth_required(comprasController.delete_compra))
