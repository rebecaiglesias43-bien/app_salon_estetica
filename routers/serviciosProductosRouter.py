from flask import Blueprint
from controllers import serviciosProductosController
from services.authService import auth_required

serviciosProductos_bp = Blueprint('serviciosProductos', __name__, url_prefix='/api/servicios-productos')

serviciosProductos_bp.route('/servicio/<int:servicio_id>', methods=['GET'])(auth_required(serviciosProductosController.get_by_servicio))
serviciosProductos_bp.route('/producto/<int:producto_id>', methods=['GET'])(auth_required(serviciosProductosController.get_by_producto))
serviciosProductos_bp.route('/', methods=['POST'])(auth_required(serviciosProductosController.create_asociacion))
serviciosProductos_bp.route('/<int:id>', methods=['PUT'])(auth_required(serviciosProductosController.update_asociacion))
serviciosProductos_bp.route('/<int:id>', methods=['DELETE'])(auth_required(serviciosProductosController.delete_asociacion))
