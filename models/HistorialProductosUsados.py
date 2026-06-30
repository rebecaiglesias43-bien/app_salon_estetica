from . import Model

class HistorialProductosUsados(Model):
    
    @classmethod
    def get_by_cita(cls, cita_id):
        sql = """
            SELECT h.*, p.pro_nombre
            FROM historial_productos_usados h
            JOIN productos p ON h.hpu_producto_id = p.pro_id
            WHERE h.hpu_cita_id = %s
        """
        return cls.query_all(sql, (cita_id,))
    
    @classmethod
    def get_by_producto(cls, producto_id):
        sql = """
            SELECT h.*, c.cit_fecha, cl.cli_nombre, cl.cli_apellido
            FROM historial_productos_usados h
            JOIN citas c ON h.hpu_cita_id = c.cit_id
            JOIN clientes cl ON c.cit_cliente_id = cl.cli_id
            WHERE h.hpu_producto_id = %s
            ORDER BY c.cit_fecha DESC
        """
        return cls.query_all(sql, (producto_id,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO historial_productos_usados (hpu_cita_id, hpu_producto_id, hpu_notas) 
                 VALUES (%s, %s, %s)"""
        return cls.execute(sql, (
            data.get('hpu_cita_id'),
            data.get('hpu_producto_id'),
            data.get('hpu_notas')
        ))
    
    @classmethod
    def delete_by_cita(cls, cita_id):
        sql = "DELETE FROM historial_productos_usados WHERE hpu_cita_id = %s"
        return cls.execute(sql, (cita_id,))
