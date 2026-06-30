from . import Model
from datetime import date

class InventarioMovimientos(Model):
    
    @classmethod
    def search(cls, tipo=None, producto_id=None, fecha_desde=None, fecha_hasta=None, limit=None, offset=None):
        conditions = []
        params = []
        if tipo:
            conditions.append("im.inm_tipo = %s")
            params.append(tipo)
        if producto_id:
            conditions.append("im.inm_producto_id = %s")
            params.append(producto_id)
        if fecha_desde:
            conditions.append("im.inm_fecha >= %s")
            params.append(fecha_desde)
        if fecha_hasta:
            conditions.append("im.inm_fecha <= %s")
            params.append(fecha_hasta)
        where = " WHERE " + " AND ".join(conditions) if conditions else ""
        sql = f"""
            SELECT im.*, p.pro_nombre
            FROM inventario_movimientos im
            JOIN productos p ON im.inm_producto_id = p.pro_id
            {where}
            ORDER BY im.inm_fecha DESC, im.inm_id DESC
        """
        if limit is not None:
            sql += " LIMIT %s"
            params.append(limit)
            if offset is not None:
                sql += " OFFSET %s"
                params.append(offset)
        return cls.query_all(sql, tuple(params)) if params else cls.query_all(sql)
    
    @classmethod
    def count_search(cls, tipo=None, producto_id=None, fecha_desde=None, fecha_hasta=None):
        conditions = []
        params = []
        if tipo:
            conditions.append("inm_tipo = %s")
            params.append(tipo)
        if producto_id:
            conditions.append("inm_producto_id = %s")
            params.append(producto_id)
        if fecha_desde:
            conditions.append("inm_fecha >= %s")
            params.append(fecha_desde)
        if fecha_hasta:
            conditions.append("inm_fecha <= %s")
            params.append(fecha_hasta)
        where = " WHERE " + " AND ".join(conditions) if conditions else ""
        sql = f"SELECT COUNT(*) as total FROM inventario_movimientos{where}"
        result = cls.query_one(sql, tuple(params)) if params else cls.query_one(sql)
        return result['total'] if result else 0
    
    @classmethod
    def get_by_id(cls, id):
        sql = """
            SELECT im.*, p.pro_nombre
            FROM inventario_movimientos im
            JOIN productos p ON im.inm_producto_id = p.pro_id
            WHERE im.inm_id = %s
        """
        return cls.query_one(sql, (id,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO inventario_movimientos (inm_producto_id, inm_cita_id, inm_tipo, inm_cantidad, inm_fecha, inm_motivo) 
                 VALUES (%s, %s, %s, %s, %s, %s)"""
        return cls.execute(sql, (
            data.get('inm_producto_id'),
            data.get('inm_cita_id'),
            data.get('inm_tipo'),
            data.get('inm_cantidad'),
            data.get('inm_fecha', date.today()),
            data.get('inm_motivo')
        ))
    
    @classmethod
    def get_grouped_by_cita(cls, limit=None, offset=None):
        """Retorna movimientos de salida agrupados por cita, con sus productos individuales anidados."""
        # Primero obtener los grupos (citas)
        sql_grupos = """
            SELECT
                im.inm_cita_id,
                c.cit_fecha,
                cl.cli_nombre,
                cl.cli_apellido,
                COUNT(*) as num_productos,
                SUM(im.inm_cantidad) as total_cantidad
            FROM inventario_movimientos im
            JOIN citas c ON im.inm_cita_id = c.cit_id
            JOIN clientes cl ON c.cit_cliente_id = cl.cli_id
            WHERE im.inm_tipo = 'Salida'
              AND im.inm_cita_id IS NOT NULL
            GROUP BY im.inm_cita_id, c.cit_fecha, cl.cli_nombre, cl.cli_apellido
            ORDER BY c.cit_fecha DESC, im.inm_cita_id DESC
        """
        params = []
        if limit is not None:
            sql_grupos += " LIMIT %s"
            params.append(limit)
            if offset is not None:
                sql_grupos += " OFFSET %s"
                params.append(offset)
        
        grupos = cls.query_all(sql_grupos, tuple(params)) if params else cls.query_all(sql_grupos)
        
        # Para cada grupo, obtener los productos individuales
        for g in grupos:
            sql_prods = """
                SELECT im.inm_id, im.inm_producto_id, im.inm_cantidad, p.pro_nombre
                FROM inventario_movimientos im
                JOIN productos p ON im.inm_producto_id = p.pro_id
                WHERE im.inm_cita_id = %s
                ORDER BY p.pro_nombre
            """
            g['productos'] = cls.query_all(sql_prods, (g['inm_cita_id'],))
        
        return grupos
    
    @classmethod
    def count_grouped_by_cita(cls):
        sql = """
            SELECT COUNT(*) as total FROM (
                SELECT inm_cita_id
                FROM inventario_movimientos
                WHERE inm_tipo = 'Salida'
                  AND inm_cita_id IS NOT NULL
                GROUP BY inm_cita_id
            ) AS sub
        """
        result = cls.query_one(sql)
        return result['total'] if result else 0
