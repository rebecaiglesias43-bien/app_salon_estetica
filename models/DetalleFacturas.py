from . import Model

class DetalleFacturas(Model):
    
    @classmethod
    def get_by_factura(cls, factura_id):
        sql = """
            SELECT d.*, 
                   s.ser_nombre, s.ser_precio,
                   p.pro_nombre, p.pro_precio
            FROM detalle_facturas d
            LEFT JOIN servicios s ON d.dfa_servicio_id = s.ser_id
            LEFT JOIN productos p ON d.dfa_producto_id = p.pro_id
            WHERE d.dfa_factura_id = %s
        """
        return cls.query_all(sql, (factura_id,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO detalle_facturas (dfa_factura_id, dfa_servicio_id, dfa_producto_id, dfa_cantidad, dfa_subtotal) 
                 VALUES (%s, %s, %s, %s, %s)"""
        return cls.execute(sql, (
            data.get('dfa_factura_id'),
            data.get('dfa_servicio_id'),
            data.get('dfa_producto_id'),
            data.get('dfa_cantidad', 1),
            data.get('dfa_subtotal')
        ))
    
