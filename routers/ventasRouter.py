from flask import Blueprint
from controllers import ventasController
from services.authService import auth_required

ventas_bp = Blueprint('ventas', __name__, url_prefix='/api/ventas')

ventas_bp.route('/', methods=['POST'])(auth_required(ventasController.registrar_venta))
