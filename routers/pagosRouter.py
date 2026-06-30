from flask import Blueprint
from controllers import pagosController
from services.authService import auth_required

pagos_bp = Blueprint('pagos', __name__, url_prefix='/api/pagos')

pagos_bp.route('/factura/<int:factura_id>', methods=['GET'])(auth_required(pagosController.get_pagos_by_factura))
pagos_bp.route('/', methods=['POST'])(auth_required(pagosController.create_pago))