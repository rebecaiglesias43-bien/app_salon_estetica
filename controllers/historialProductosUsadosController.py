from flask import request, jsonify
from models.HistorialProductosUsados import HistorialProductosUsados
from services.authService import auth_required
from services.validationService import get_json_data, require_fields

@auth_required
def get_by_cita(cita_id):
    try:
        historial = HistorialProductosUsados.get_by_cita(cita_id)
        return jsonify(historial), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_by_producto(producto_id):
    try:
        historial = HistorialProductosUsados.get_by_producto(producto_id)
        return jsonify(historial), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_historial():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['hpu_cita_id', 'hpu_producto_id'])
        if err: return err, code
        
        historial_id = HistorialProductosUsados.create(data)
        return jsonify({'message': 'Historial registrado exitosamente', 'hpu_id': historial_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_by_cita(cita_id):
    try:
        HistorialProductosUsados.delete_by_cita(cita_id)
        return jsonify({'message': 'Historial eliminado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
