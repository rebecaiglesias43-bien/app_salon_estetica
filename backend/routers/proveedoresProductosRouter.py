from flask import Blueprint
from controllers import proveedoresProductosController
from services.authService import auth_required

proveedoresProductos_bp = Blueprint('proveedoresProductos', __name__, url_prefix='/api/proveedores-productos')

proveedoresProductos_bp.route('/proveedor/<int:proveedor_id>', methods=['GET'])(auth_required(proveedoresProductosController.get_by_proveedor))
proveedoresProductos_bp.route('/producto/<int:producto_id>', methods=['GET'])(auth_required(proveedoresProductosController.get_by_producto))
proveedoresProductos_bp.route('/', methods=['POST'])(auth_required(proveedoresProductosController.create_asociacion))
proveedoresProductos_bp.route('/<int:id>/precio', methods=['PUT'])(auth_required(proveedoresProductosController.update_precio))
proveedoresProductos_bp.route('/<int:id>', methods=['DELETE'])(auth_required(proveedoresProductosController.delete_asociacion))
