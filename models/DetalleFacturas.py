from . import Model

class DetalleFacturas(Model):
    
    @classmethod
    def get_by_factura(cls, factura_id):
        sql = """
            SELECT d.*, s.ser_nombre, s.ser_precio
            FROM detalle_facturas d
            JOIN servicios s ON d.dfa_servicio_id = s.ser_id
            WHERE d.dfa_factura_id = %s
        """
        return cls.query_all(sql, (factura_id,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO detalle_facturas (dfa_factura_id, dfa_servicio_id, dfa_subtotal) 
                 VALUES (%s, %s, %s)"""
        return cls.execute(sql, (
            data.get('dfa_factura_id'),
            data.get('dfa_servicio_id'),
            data.get('dfa_subtotal')
        ))
    
    @classmethod
    def delete_by_factura(cls, factura_id):
        sql = "DELETE FROM detalle_facturas WHERE dfa_factura_id = %s"
        return cls.execute(sql, (factura_id,))
    
    @classmethod
    def get_total_by_factura(cls, factura_id):
        sql = "SELECT SUM(dfa_subtotal) as total FROM detalle_facturas WHERE dfa_factura_id = %s"
        result = cls.query_one(sql, (factura_id,))
        return result['total'] if result and result['total'] else 0