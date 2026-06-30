from flask import request, jsonify
from models.Pagos import Pagos
from models.Facturas import Facturas
from models.CortesCaja import CortesCaja
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

        # Verificar que la factura no esté ya pagada (valor fijo)
        factura_id = data.get('pag_factura_id')
        factura_obj = Facturas.get_by_id(factura_id)
        if not factura_obj:
            return jsonify({'error': 'Factura no encontrada'}), 404
        if factura_obj['fac_estado'] == 'pagado':
            return jsonify({'error': 'Esta factura ya está pagada. Su valor es fijo y no admite nuevos pagos.'}), 400

        # Verificar que haya un corte de caja abierto
        corte = CortesCaja.get_abierto()
        if not corte:
            return jsonify({'error': 'No hay un corte de caja abierto. Debe abrir caja antes de registrar pagos.'}), 400

        factura_id = data.get('pag_factura_id')
        pago_id = Pagos.create(
            factura_id,
            data.get('pag_metodo'),
            data.get('pag_monto')
        )

        # Si los pagos acumulados cubren el total, auto-marcar como pagado
        factura = Facturas.get_by_id(factura_id)
        pagos = Pagos.get_by_factura(factura_id)
        total_pagado = sum(float(p['pag_monto']) for p in pagos)
        if factura and total_pagado >= float(factura['fac_total']) and factura['fac_estado'] != 'pagado':
            Facturas.update_estado(factura_id, 'pagado')

        return jsonify({'message': 'Pago registrado', 'pag_id': pago_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500