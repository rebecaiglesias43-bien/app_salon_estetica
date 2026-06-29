from flask import Blueprint
from controllers import facturasController
from services.authService import auth_required

facturas_bp = Blueprint('facturas', __name__, url_prefix='/api/facturas')

facturas_bp.route('/', methods=['GET'])(auth_required(facturasController.get_facturas))
facturas_bp.route('/<int:id>', methods=['GET'])(auth_required(facturasController.get_factura))
facturas_bp.route('/<int:id>/estado', methods=['PUT'])(auth_required(facturasController.update_estado))