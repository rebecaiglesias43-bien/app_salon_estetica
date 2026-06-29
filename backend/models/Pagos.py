from . import Model
from datetime import date

class Pagos(Model):
    
    @classmethod
    def create(cls, factura_id, metodo, monto):
        sql = """INSERT INTO pagos (pag_factura_id, pag_metodo, pag_fecha, pag_monto) 
                 VALUES (%s, %s, %s, %s)"""
        return cls.execute(sql, (factura_id, metodo, date.today(), monto))
    
    @classmethod
    def get_by_factura(cls, factura_id):
        sql = "SELECT * FROM pagos WHERE pag_factura_id = %s ORDER BY pag_fecha DESC"
        return cls.query_all(sql, (factura_id,))
    
