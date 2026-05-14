from . import Model

class ServiciosProductos(Model):
    
    @classmethod
    def get_by_servicio(cls, servicio_id):
        sql = """
            SELECT sp.*, p.pro_nombre, p.pro_stock
            FROM servicios_productos sp
            JOIN productos p ON sp.sep_producto_id = p.pro_id
            WHERE sp.sep_servicio_id = %s
        """
        return cls.query_all(sql, (servicio_id,))
    
    @classmethod
    def get_by_producto(cls, producto_id):
        sql = """
            SELECT sp.*, s.ser_nombre
            FROM servicios_productos sp
            JOIN servicios s ON sp.sep_servicio_id = s.ser_id
            WHERE sp.sep_producto_id = %s
        """
        return cls.query_all(sql, (producto_id,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO servicios_productos (sep_servicio_id, sep_producto_id, sep_cantidad) 
                 VALUES (%s, %s, %s)"""
        return cls.execute(sql, (
            data.get('sep_servicio_id'),
            data.get('sep_producto_id'),
            data.get('sep_cantidad', 1)
        ))
    
    @classmethod
    def update(cls, id, data):
        sql = """UPDATE servicios_productos 
                 SET sep_cantidad=%s 
                 WHERE sep_id=%s"""
        return cls.execute(sql, (data.get('sep_cantidad'), id))
    
    @classmethod
    def delete(cls, id):
        sql = "DELETE FROM servicios_productos WHERE sep_id = %s"
        return cls.execute(sql, (id,))
    
    @classmethod
    def delete_by_servicio(cls, servicio_id):
        sql = "DELETE FROM servicios_productos WHERE sep_servicio_id = %s"
        return cls.execute(sql, (servicio_id,))
