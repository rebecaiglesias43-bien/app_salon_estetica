from flask import request, jsonify
from models.DetalleCitas import DetalleCitas
from services.authService import auth_required
from services.validationService import get_json_data, require_fields

@auth_required
def get_detalle_by_cita(cita_id):
    try:
        detalle = DetalleCitas.get_by_cita(cita_id)
        return jsonify(detalle), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_detalle():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['dci_cita_id', 'dci_servicio_id', 'dci_precio'])
        if err: return err, code
        
        detalle_id = DetalleCitas.create(data)
        return jsonify({'message': 'Detalle creado', 'dci_id': detalle_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def delete_detalle_by_cita(cita_id):
    try:
        DetalleCitas.delete_by_cita(cita_id)
        return jsonify({'message': 'Detalles eliminados'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500