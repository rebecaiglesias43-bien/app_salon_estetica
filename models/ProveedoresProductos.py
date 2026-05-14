from . import Model

class ProveedoresProductos(Model):
    
    @classmethod
    def get_by_proveedor(cls, proveedor_id):
        sql = """
            SELECT pp.*, p.pro_nombre, p.pro_precio as pro_precio_venta
            FROM proveedores_productos pp
            JOIN productos p ON pp.ppr_producto_id = p.pro_id
            WHERE pp.ppr_proveedor_id = %s
        """
        return cls.query_all(sql, (proveedor_id,))
    
    @classmethod
    def get_by_producto(cls, producto_id):
        sql = """
            SELECT pp.*, prv.prv_nombre
            FROM proveedores_productos pp
            JOIN proveedores prv ON pp.ppr_proveedor_id = prv.prv_id
            WHERE pp.ppr_producto_id = %s
        """
        return cls.query_all(sql, (producto_id,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO proveedores_productos (ppr_proveedor_id, ppr_producto_id, ppr_precio) 
                 VALUES (%s, %s, %s)"""
        return cls.execute(sql, (
            data.get('ppr_proveedor_id'),
            data.get('ppr_producto_id'),
            data.get('ppr_precio')
        ))
    
    @classmethod
    def delete(cls, id):
        sql = "DELETE FROM proveedores_productos WHERE ppr_id = %s"
        return cls.execute(sql, (id,))
    
    @classmethod
    def update_precio(cls, id, precio):
        sql = "UPDATE proveedores_productos SET ppr_precio = %s WHERE ppr_id = %s"
        return cls.execute(sql, (precio, id))
