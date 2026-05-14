from flask import Blueprint
from controllers import citasController

citas_bp = Blueprint('citas', __name__, url_prefix='/api/citas')

citas_bp.route('/public', methods=['POST'])(citasController.create_cita_public)
citas_bp.route('/', methods=['GET'])(citasController.get_citas)
citas_bp.route('/<int:id>', methods=['GET'])(citasController.get_cita)
citas_bp.route('/<int:id>/estado', methods=['PUT'])(citasController.update_cita_estado)
citas_bp.route('/<int:id>/reprogramar', methods=['PUT'])(citasController.reprogramar_cita)