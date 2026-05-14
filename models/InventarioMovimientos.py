from . import Model
from datetime import date

class InventarioMovimientos(Model):
    
    @classmethod
    def get_all(cls, limit=None, offset=None):
        sql = """
            SELECT im.*, p.pro_nombre
            FROM inventario_movimientos im
            JOIN productos p ON im.inm_producto_id = p.pro_id
            ORDER BY im.inm_fecha DESC, im.inm_id DESC
        """
        if limit is not None:
            sql += " LIMIT %s"
            if offset is not None:
                sql += " OFFSET %s"
                return cls.query_all(sql, (limit, offset))
            else:
                return cls.query_all(sql, (limit,))
        return cls.query_all(sql)
    
    @classmethod
    def count_all(cls):
        sql = "SELECT COUNT(*) as total FROM inventario_movimientos"
        result = cls.query_one(sql)
        return result['total'] if result else 0
    
    @classmethod
    def get_by_producto(cls, producto_id):
        sql = """
            SELECT im.*, p.pro_nombre
            FROM inventario_movimientos im
            JOIN productos p ON im.inm_producto_id = p.pro_id
            WHERE im.inm_producto_id = %s
            ORDER BY im.inm_fecha DESC, im.inm_id DESC
        """
        return cls.query_all(sql, (producto_id,))
    
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
        sql = """INSERT INTO inventario_movimientos (inm_producto_id, inm_tipo, inm_cantidad, inm_fecha, inm_motivo) 
                 VALUES (%s, %s, %s, %s, %s)"""
        return cls.execute(sql, (
            data.get('inm_producto_id'),
            data.get('inm_tipo'),
            data.get('inm_cantidad'),
            data.get('inm_fecha', date.today()),
            data.get('inm_motivo')
        ))
    
    @classmethod
    def get_por_tipo(cls, tipo):
        sql = """
            SELECT im.*, p.pro_nombre
            FROM inventario_movimientos im
            JOIN productos p ON im.inm_producto_id = p.pro_id
            WHERE im.inm_tipo = %s
            ORDER BY im.inm_fecha DESC
        """
        return cls.query_all(sql, (tipo,))
