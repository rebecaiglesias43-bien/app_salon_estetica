from flask import request, jsonify
from models.Pagos import Pagos
from services.authService import auth_required
from services.validationService import get_json_data, require_fields, require_positive_number

@auth_required
def get_pagos_by_factura(factura_id):
    try:
        pagos = Pagos.get_by_factura(factura_id)
        return jsonify(pagos), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def create_pago():
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['pag_factura_id', 'pag_metodo', 'pag_monto'])
        if err: return err, code
        err = require_positive_number(data, 'pag_monto')
        if err: return err
        
        pago_id = Pagos.create(
            data.get('pag_factura_id'),
            data.get('pag_metodo'),
            data.get('pag_monto')
        )
        return jsonify({'message': 'Pago registrado', 'pag_id': pago_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500