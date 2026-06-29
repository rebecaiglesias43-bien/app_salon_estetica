from flask import Blueprint
from controllers import usuariosController
from services.authService import auth_required

usuarios_bp = Blueprint('usuarios', __name__, url_prefix='/api/usuarios')

usuarios_bp.route('/', methods=['GET'])(auth_required(usuariosController.get_usuarios))
usuarios_bp.route('/<int:id>', methods=['GET'])(auth_required(usuariosController.get_usuario))
usuarios_bp.route('/', methods=['POST'])(auth_required(usuariosController.create_usuario))
usuarios_bp.route('/<int:id>', methods=['PUT'])(auth_required(usuariosController.update_usuario))
usuarios_bp.route('/<int:id>', methods=['DELETE'])(auth_required(usuariosController.delete_usuario))
