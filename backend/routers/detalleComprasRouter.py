from flask import Blueprint
from controllers import detalleComprasController
from services.authService import auth_required

detalleCompras_bp = Blueprint('detalleCompras', __name__, url_prefix='/api/detalle-compras')

detalleCompras_bp.route('/compra/<int:compra_id>', methods=['GET'])(auth_required(detalleComprasController.get_detalle_by_compra))
detalleCompras_bp.route('/', methods=['POST'])(auth_required(detalleComprasController.create_detalle))
detalleCompras_bp.route('/compra/<int:compra_id>', methods=['DELETE'])(auth_required(detalleComprasController.delete_detalle_by_compra))
