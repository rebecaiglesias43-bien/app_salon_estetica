from flask import Blueprint
from controllers import productosController
from services.authService import auth_required

productos_bp = Blueprint('productos', __name__, url_prefix='/api/productos')

productos_bp.route('/', methods=['GET'])(auth_required(productosController.get_productos))
productos_bp.route('/activos', methods=['GET'])(auth_required(productosController.get_productos_activos))
productos_bp.route('/bajo-stock', methods=['GET'])(auth_required(productosController.get_bajo_stock))
productos_bp.route('/<int:id>', methods=['GET'])(auth_required(productosController.get_producto))
productos_bp.route('/', methods=['POST'])(auth_required(productosController.create_producto))
productos_bp.route('/<int:id>', methods=['PUT'])(auth_required(productosController.update_producto))
productos_bp.route('/<int:id>', methods=['DELETE'])(auth_required(productosController.delete_producto))
