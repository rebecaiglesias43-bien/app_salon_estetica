from flask import Blueprint
from controllers import proveedoresController
from services.authService import auth_required

proveedores_bp = Blueprint('proveedores', __name__, url_prefix='/api/proveedores')

proveedores_bp.route('/', methods=['GET'])(auth_required(proveedoresController.get_proveedores))
proveedores_bp.route('/<int:id>', methods=['GET'])(auth_required(proveedoresController.get_proveedor))
proveedores_bp.route('/', methods=['POST'])(auth_required(proveedoresController.create_proveedor))
proveedores_bp.route('/<int:id>', methods=['PUT'])(auth_required(proveedoresController.update_proveedor))
proveedores_bp.route('/<int:id>', methods=['DELETE'])(auth_required(proveedoresController.delete_proveedor))
