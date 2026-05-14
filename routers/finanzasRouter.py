from flask import Blueprint
from controllers import finanzasController
from services.authService import auth_required

finanzas_bp = Blueprint('finanzas', __name__, url_prefix='/api/finanzas')

finanzas_bp.route('/resumen', methods=['GET'])(auth_required(finanzasController.resumen))
