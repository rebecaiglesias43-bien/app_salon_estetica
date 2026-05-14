from . import Model
from datetime import datetime

class CortesCaja(Model):
    
    @classmethod
    def get_all(cls, limit=None, offset=None):
        sql = "SELECT * FROM cortes_caja ORDER BY cor_fecha_apertura DESC"
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
        sql = "SELECT COUNT(*) as total FROM cortes_caja"
        result = cls.query_one(sql)
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
    def abrir(cls, base_inicial):
        sql = """INSERT INTO cortes_caja (cor_fecha_apertura, cor_base_inicial, cor_estado) 
                 VALUES (%s, %s, 'Abierto')"""
        return cls.execute(sql, (datetime.now(), base_inicial))
    
    @classmethod
    def cerrar(cls, id, ingresos, egresos, ganancia_neta):
        sql = """UPDATE cortes_caja 
                 SET cor_fecha_cierre = %s, cor_ingresos = %s, cor_egresos = %s, cor_ganancia_neta = %s, cor_estado = 'Cerrado'
                 WHERE cor_id = %s"""
        return cls.execute(sql, (datetime.now(), ingresos, egresos, ganancia_neta, id))
