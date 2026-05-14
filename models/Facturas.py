from . import Model
from datetime import date

class Facturas(Model):
    
    @classmethod
    def get_all(cls, limit=None, offset=None):
        sql = """
            SELECT f.*, c.cit_fecha, cl.cli_nombre, cl.cli_apellido
            FROM facturas f
            JOIN citas c ON f.fac_cita_id = c.cit_id
            JOIN clientes cl ON c.cit_cliente_id = cl.cli_id
            ORDER BY f.fac_fecha DESC
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
        sql = "SELECT COUNT(*) as total FROM facturas"
        result = cls.query_one(sql)
        return result['total'] if result else 0
    
    @classmethod
    def get_by_id(cls, id):
        sql = """
            SELECT f.*, c.cit_fecha, c.cit_hora, cl.cli_nombre, cl.cli_apellido
            FROM facturas f
            JOIN citas c ON f.fac_cita_id = c.cit_id
            JOIN clientes cl ON c.cit_cliente_id = cl.cli_id
            WHERE f.fac_id = %s
        """
        return cls.query_one(sql, (id,))
    
    @classmethod
    def create(cls, cita_id, total):
        sql = """INSERT INTO facturas (fac_cita_id, fac_fecha, fac_total, fac_estado) 
                 VALUES (%s, %s, %s, 'pendiente')"""
        return cls.execute(sql, (cita_id, date.today(), total))
    
    @classmethod
    def update_estado(cls, id, estado):
        sql = "UPDATE facturas SET fac_estado = %s WHERE fac_id = %s"
        return cls.execute(sql, (estado, id))
    
    @classmethod
    def get_by_cita(cls, cita_id):
        sql = "SELECT * FROM facturas WHERE fac_cita_id = %s"
        return cls.query_one(sql, (cita_id,))