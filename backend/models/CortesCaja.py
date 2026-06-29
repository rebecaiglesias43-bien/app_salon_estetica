from . import Model
from datetime import datetime, date

class CortesCaja(Model):
    
    @classmethod
    def get_all(cls, periodo=None, limit=None, offset=None):
        sql = "SELECT * FROM cortes_caja WHERE 1=1"
        params = []
        if periodo:
            sql += " AND cor_periodo = %s"
            params.append(periodo)
        sql += " ORDER BY cor_fecha_apertura DESC"
        if limit is not None:
            sql += " LIMIT %s"
            params.append(limit)
            if offset is not None:
                sql += " OFFSET %s"
                params.append(offset)
        return cls.query_all(sql, tuple(params))
    
    @classmethod
    def count_all(cls, periodo=None):
        sql = "SELECT COUNT(*) as total FROM cortes_caja WHERE 1=1"
        params = []
        if periodo:
            sql += " AND cor_periodo = %s"
            params.append(periodo)
        result = cls.query_one(sql, tuple(params))
        return result['total'] if result else 0
    
    @classmethod
    def get_by_id(cls, id):
        sql = "SELECT * FROM cortes_caja WHERE cor_id = %s"
        return cls.query_one(sql, (id,))
    
    @classmethod
    def get_abierto(cls):
        sql = "SELECT * FROM cortes_caja WHERE cor_estado = 'Abierto' ORDER BY cor_fecha_apertura DESC LIMIT 1"
        return cls.query_one(sql)
    
    @classmethod
    def abrir(cls, base_inicial, periodo='diario'):
        sql = """INSERT INTO cortes_caja (cor_fecha_apertura, cor_base_inicial, cor_periodo, cor_estado) 
                 VALUES (%s, %s, %s, 'Abierto')"""
        return cls.execute(sql, (datetime.now(), base_inicial, periodo))
    
    @classmethod
    def cerrar(cls, id, ingresos, egresos, ganancia_neta):
        sql = """UPDATE cortes_caja 
                 SET cor_fecha_cierre = %s, cor_ingresos = %s, cor_egresos = %s, cor_ganancia_neta = %s, cor_estado = 'Cerrado'
                 WHERE cor_id = %s"""
        return cls.execute(sql, (datetime.now(), ingresos, egresos, ganancia_neta, id))

    @classmethod
    def _get_desde_corte(cls, id):
        """Calcula el 'desde' correcto considerando el cierre del último corte cerrado.
        Evita que facturas/compras ya contabilizadas en cortes anteriores se solapen."""
        corte = cls.get_by_id(id)
        if not corte:
            return None, None
        
        desde = corte['cor_fecha_apertura']
        hasta = corte.get('cor_fecha_cierre') or datetime.now()
        
        # Si es un corte que ya se está viendo (no el actual abierto), respetar su rango
        if corte['cor_estado'] == 'Cerrado':
            return desde, hasta
        
        # Para el corte abierto: buscar el último corte cerrado para evitar solapamiento
        ultimo_cerrado = cls.query_one(
            "SELECT cor_fecha_cierre FROM cortes_caja WHERE cor_estado = 'Cerrado' ORDER BY cor_fecha_cierre DESC LIMIT 1"
        )
        if ultimo_cerrado and ultimo_cerrado['cor_fecha_cierre']:
            fecha_cierre_anterior = ultimo_cerrado['cor_fecha_cierre']
            if isinstance(fecha_cierre_anterior, str):
                fecha_cierre_anterior = datetime.fromisoformat(fecha_cierre_anterior)
            desde = max(desde, fecha_cierre_anterior)
        
        return desde, hasta

    @classmethod
    def get_actividad_facturas(cls, id):
        """Retorna facturas del período del corte con detalle de servicios,
        filtradas por fac_corte_id y con red de seguridad por fecha."""
        corte = cls.get_by_id(id)
        if not corte:
            return []
        desde, hasta = cls._get_desde_corte(id)
        if desde is None:
            return []
        sql = """
            SELECT f.*,
                   COALESCE(cl_cita.cli_nombre, cl_dir.cli_nombre) as cli_nombre,
                   COALESCE(cl_cita.cli_apellido, cl_dir.cli_apellido) as cli_apellido
            FROM facturas f
            LEFT JOIN citas c ON f.fac_cita_id = c.cit_id
            LEFT JOIN clientes cl_cita ON c.cit_cliente_id = cl_cita.cli_id
            LEFT JOIN clientes cl_dir ON f.fac_cliente_id = cl_dir.cli_id
            WHERE f.fac_corte_id = %s AND DATE(f.fac_fecha) >= DATE(%s)
            ORDER BY f.fac_fecha DESC, f.fac_id DESC
            LIMIT 30
        """
        facturas = cls.query_all(sql, (id, desde))

        # Agregar detalle de servicios a cada factura
        from models.DetalleFacturas import DetalleFacturas
        for f in facturas:
            detalle = DetalleFacturas.get_by_factura(f['fac_id'])
            f['detalle'] = [
                {
                    'dfa_servicio_id': d['dfa_servicio_id'],
                    'dfa_subtotal': float(d['dfa_subtotal']) if d.get('dfa_subtotal') else 0,
                    'ser_nombre': d.get('ser_nombre', f'Servicio #{d["dfa_servicio_id"]}')
                }
                for d in detalle
            ]
        return facturas

    @classmethod
    def get_actividad_compras(cls, id):
        """Retorna compras del período del corte, excluyendo las ya contabilizadas
        en cortes cerrados anteriores."""
        corte = cls.get_by_id(id)
        if not corte:
            return []
        desde, hasta = cls._get_desde_corte(id)
        if desde is None:
            return []
        sql = """
            SELECT c.*, prv.prv_nombre
            FROM compras c
            JOIN proveedores prv ON c.com_proveedor_id = prv.prv_id
            WHERE c.com_fecha BETWEEN %s AND %s
            ORDER BY c.com_fecha DESC, c.com_id DESC
            LIMIT 30
        """
        return cls.query_all(sql, (desde, hasta))
