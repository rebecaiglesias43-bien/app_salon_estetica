from flask import request, jsonify
from models.Categorias import Categorias
from services.authService import auth_required
from services.validationService import get_json_data, require_fields

def get_categorias():
    """Retorna todas las categorías disponibles."""
    try:
        categorias = Categorias.get_all()
        result = [{
            'cat_id': c['cat_id'],
            'cat_nombre': c['cat_nombre'],
            'cat_slug': c['cat_slug']
        } for c in categorias]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_categoria():
    """Crea una nueva categoría."""
    try:
        err, code, data = get_json_data(request)
        if err:
            return err, code
        err, code, _ = require_fields(data, ['cat_nombre'])
        if err:
            return err, code

        nombre = data['cat_nombre'].strip()
        if not nombre:
            return jsonify({'error': 'El nombre de la categoría no puede estar vacío'}), 400

        # Generar slug automático desde el nombre
        slug = data.get('cat_slug', '').strip() or None

        # Verificar si ya existe
        if slug:
            existente = Categorias.get_by_slug(slug)
            if existente:
                return jsonify({'error': f'Ya existe la categoría "{existente["cat_nombre"]}"'}), 409

        categoria = Categorias.create(nombre, slug)
        return jsonify({
            'message': 'Categoría creada exitosamente',
            'categoria': {
                'cat_id': categoria['cat_id'],
                'cat_nombre': categoria['cat_nombre'],
                'cat_slug': categoria['cat_slug']
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
