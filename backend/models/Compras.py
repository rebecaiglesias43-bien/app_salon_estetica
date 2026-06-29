from . import Model
from datetime import datetime

class Compras(Model):
    
    @classmethod
    def get_all(cls, limit=None, offset=None):
        sql = """
            SELECT c.*, prv.prv_nombre
            FROM compras c
            LEFT JOIN proveedores prv ON c.com_proveedor_id = prv.prv_id
            ORDER BY c.com_fecha DESC
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
        sql = "SELECT COUNT(*) as total FROM compras"
        result = cls.query_one(sql)
        return result['total'] if result else 0
    
    @classmethod
    def get_by_id(cls, id):
        sql = """
            SELECT c.*, prv.prv_nombre, prv.prv_telefono
            FROM compras c
            LEFT JOIN proveedores prv ON c.com_proveedor_id = prv.prv_id
            WHERE c.com_id = %s
        """
        return cls.query_one(sql, (id,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO compras (com_proveedor_id, com_fecha, com_total, com_estado) 
                 VALUES (%s, %s, %s, %s)"""
        return cls.execute(sql, (
            data.get('com_proveedor_id'),
            data.get('com_fecha', datetime.now()),
            data.get('com_total', 0),
            data.get('com_estado', 'Completada')
        ))
    
    @classmethod
    def update_total(cls, id, total):
        sql = "UPDATE compras SET com_total = %s WHERE com_id = %s"
        return cls.execute(sql, (total, id))
    
    @classmethod
    def update_estado(cls, id, estado):
        sql = "UPDATE compras SET com_estado = %s WHERE com_id = %s"
        return cls.execute(sql, (estado, id))
    
    @classmethod
    def delete(cls, id):
        sql = "DELETE FROM compras WHERE com_id = %s"
        return cls.execute(sql, (id,))
    
    @classmethod
    def get_total_by_date_range(cls, desde, hasta):
        sql = """SELECT COALESCE(SUM(com_total), 0) as total 
                 FROM compras 
                 WHERE com_fecha BETWEEN %s AND %s AND com_estado = 'Completada'"""
        result = cls.query_one(sql, (desde, hasta))
        return result['total'] if result else 0
