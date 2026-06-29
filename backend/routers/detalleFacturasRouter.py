from flask import Blueprint
from controllers import detalleFacturasController
from services.authService import auth_required

detalleFacturas_bp = Blueprint('detalleFacturas', __name__, url_prefix='/api/detalle-facturas')

detalleFacturas_bp.route('/factura/<int:factura_id>', methods=['GET'])(auth_required(detalleFacturasController.get_detalle_by_factura))
detalleFacturas_bp.route('/', methods=['POST'])(auth_required(detalleFacturasController.create_detalle))