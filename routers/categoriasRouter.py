from flask import Blueprint
from controllers import categoriasController
from services.authService import auth_required

categorias_bp = Blueprint('categorias', __name__, url_prefix='/api/categorias')

categorias_bp.route('/', methods=['GET'])(categoriasController.get_categorias)
categorias_bp.route('/', methods=['POST'])(auth_required(categoriasController.create_categoria))
