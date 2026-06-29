from flask import Blueprint
from controllers.devolucionesController import create_devolucion

devoluciones_bp = Blueprint('devoluciones', __name__)

devoluciones_bp.route('/api/devoluciones/', methods=['POST'])(create_devolucion)
