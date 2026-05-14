from flask import jsonify
from models.Facturas import Facturas
from models.Compras import Compras
from models.Pagos import Pagos
from services.authService import auth_required
from services.databaseService import get_db

@auth_required
def resumen():
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Total ingresos (facturas pagadas)
        cursor.execute("SELECT COALESCE(SUM(fac_total), 0) as total FROM facturas WHERE fac_estado = 'pagado'")
        ingresos = cursor.fetchone()['total']
        
        # Cantidad de facturas pagadas
        cursor.execute("SELECT COUNT(*) as total FROM facturas WHERE fac_estado = 'pagado'")
        total_facturas = cursor.fetchone()['total']
        
        # Total egresos (compras)
        cursor.execute("SELECT COALESCE(SUM(com_total), 0) as total FROM compras")
        egresos = cursor.fetchone()['total']
        
        # Cantidad de compras
        cursor.execute("SELECT COUNT(*) as total FROM compras")
        total_compras = cursor.fetchone()['total']
        
        # Total cobrado por pagos registrados
        cursor.execute("SELECT COALESCE(SUM(pag_monto), 0) as total FROM pagos")
        total_pagado = cursor.fetchone()['total']
        
        # Citas completadas
        cursor.execute("SELECT COUNT(*) as total FROM citas WHERE cit_estado = 'completada'")
        citas_completadas = cursor.fetchone()['total']
        
        # Productos con bajo stock
        cursor.execute("SELECT COUNT(*) as total FROM productos WHERE pro_stock <= 5 AND pro_estado = 'activo'")
        bajo_stock = cursor.fetchone()['total']
        
        # Corte de caja abierto
        cursor.execute("SELECT * FROM cortes_caja WHERE cor_estado = 'Abierto' ORDER BY cor_fecha_apertura DESC LIMIT 1")
        corte_abierto = cursor.fetchone()
        
        ganancia = float(ingresos) - float(egresos)
        
        return jsonify({
            'ingresos': float(ingresos),
            'egresos': float(egresos),
            'ganancia': ganancia,
            'total_facturas': total_facturas,
            'total_compras': total_compras,
            'total_pagado': float(total_pagado),
            'citas_completadas': citas_completadas,
            'bajo_stock': bajo_stock,
            'corte_abierto': {
                'cor_id': corte_abierto['cor_id'],
                'fecha_apertura': corte_abierto['cor_fecha_apertura'],
                'base_inicial': float(corte_abierto['cor_base_inicial']),
                'ingresos': float(corte_abierto['cor_ingresos']),
                'egresos': float(corte_abierto['cor_egresos']),
                'ganancia_neta': float(corte_abierto['cor_ganancia_neta'])
            } if corte_abierto else None
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
