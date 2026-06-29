from . import Model

class DetalleCompras(Model):
    
    @classmethod
    def get_by_compra(cls, compra_id):
        sql = """
            SELECT d.*, COALESCE(p.pro_nombre, 'Producto eliminado') as pro_nombre
            FROM detalle_compras d
            LEFT JOIN productos p ON d.dco_producto_id = p.pro_id
            WHERE d.dco_compra_id = %s
        """
        return cls.query_all(sql, (compra_id,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO detalle_compras (dco_compra_id, dco_producto_id, dco_cantidad, dco_precio_unitario, dco_subtotal) 
                 VALUES (%s, %s, %s, %s, %s)"""
        return cls.execute(sql, (
            data.get('dco_compra_id'),
            data.get('dco_producto_id'),
            data.get('dco_cantidad'),
            data.get('dco_precio_unitario'),
            data.get('dco_subtotal')
        ))
    
    @classmethod
    def delete_by_compra(cls, compra_id):
        sql = "DELETE FROM detalle_compras WHERE dco_compra_id = %s"
        return cls.execute(sql, (compra_id,))
    

