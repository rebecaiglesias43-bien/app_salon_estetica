from flask import request, jsonify
from models.DetalleFacturas import DetalleFacturas
from models.CortesCaja import CortesCaja
from services.authService import auth_required
from services.validationService import get_json_data, require_fields

@auth_required
def get_detalle_by_factura(factura_id):
    try:
        detalle = DetalleFacturas.get_by_factura(factura_id)
        return jsonify(detalle), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_detalle():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['dfa_factura_id', 'dfa_servicio_id', 'dfa_subtotal'])
        if err: return err, code

        corte = CortesCaja.get_abierto()
        if not corte:
            return jsonify({'error': 'No hay un corte de caja abierto. Debe abrir caja antes de modificar facturas.'}), 400

        detalle_id = DetalleFacturas.create(data)
        return jsonify({'message': 'Detalle creado', 'dfa_id': detalle_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500