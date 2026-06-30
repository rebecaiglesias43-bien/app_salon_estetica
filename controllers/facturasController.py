from flask import request, jsonify
from models.Facturas import Facturas
from models.Pagos import Pagos
from models.DetalleFacturas import DetalleFacturas
from models.CortesCaja import CortesCaja
from services.authService import auth_required
from services.validationService import get_json_data, require_fields
from services.paginationService import get_pagination_params, paginated_response

@auth_required
def get_facturas():
    try:
        page, limit, offset = get_pagination_params()
        estado = request.args.get('estado') or None
        facturas = Facturas.get_all(limit=limit, offset=offset, estado=estado)
        total = Facturas.count_all(estado=estado)
        return jsonify(paginated_response(facturas, total, page, limit)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def get_factura(id):
    try:
        factura = Facturas.get_by_id(id)
        if not factura:
            return jsonify({'error': 'Factura no encontrada'}), 404
        factura['detalle'] = DetalleFacturas.get_by_factura(id)
        factura['pagos'] = Pagos.get_by_factura(id)
        return jsonify(factura), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_required
def update_estado(id):
    try:
        err, code, data = get_json_data(request)
        if err: return err, code
        err, code, _ = require_fields(data, ['estado'])
        if err: return err, code

        nuevo_estado = data.get('estado')

        # ── Una vez pagada, la factura es inmutable ──
        factura_actual = Facturas.get_by_id(id)
        if not factura_actual:
            return jsonify({'error': 'Factura no encontrada'}), 404
        if factura_actual['fac_estado'] == 'pagado' and nuevo_estado != 'pagado':
            return jsonify({'error': 'No se puede cambiar el estado de una factura ya pagada. El valor registrado es fijo.'}), 400

        if nuevo_estado == 'pagado':
            pagos = Pagos.get_by_factura(id)
            if not pagos:
                return jsonify({'error': 'No se puede marcar como pagado sin registrar al menos un pago. Use "Registrar pago" primero.'}), 400

        corte = CortesCaja.get_abierto()
        if not corte:
            return jsonify({'error': 'No hay un corte de caja abierto. Debe abrir caja antes de modificar facturas.'}), 400

        Facturas.update_estado(id, nuevo_estado)
        return jsonify({'message': 'Estado actualizado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500