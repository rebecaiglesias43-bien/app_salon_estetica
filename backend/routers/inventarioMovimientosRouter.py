from flask import Blueprint
from controllers import inventarioMovimientosController
from services.authService import auth_required

inventarioMovimientos_bp = Blueprint('inventarioMovimientos', __name__, url_prefix='/api/inventario-movimientos')

inventarioMovimientos_bp.route('/', methods=['GET'])(auth_required(inventarioMovimientosController.get_movimientos))
inventarioMovimientos_bp.route('/agrupados', methods=['GET'])(auth_required(inventarioMovimientosController.get_movimientos_agrupados))
inventarioMovimientos_bp.route('/<int:id>', methods=['GET'])(auth_required(inventarioMovimientosController.get_movimiento))
inventarioMovimientos_bp.route('/', methods=['POST'])(auth_required(inventarioMovimientosController.create_movimiento))
