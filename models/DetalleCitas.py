from . import Model

class DetalleCitas(Model):
    
    @classmethod
    def get_by_cita(cls, cita_id):
        sql = """
            SELECT d.*
            FROM detalle_citas d
            WHERE d.dci_cita_id = %s
        """
        return cls.query_all(sql, (cita_id,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO detalle_citas (dci_cita_id, dci_servicio_id, dci_precio) 
                 VALUES (%s, %s, %s)"""
        return cls.execute(sql, (
            data.get('dci_cita_id'),
            data.get('dci_servicio_id'),
            data.get('dci_precio')
        ))
    
    @classmethod
    def delete_by_cita(cls, cita_id):
        sql = "DELETE FROM detalle_citas WHERE dci_cita_id = %s"
        return cls.execute(sql, (cita_id,))
    
    @classmethod
    def get_total_by_cita(cls, cita_id):
        sql = "SELECT SUM(dci_precio) as total FROM detalle_citas WHERE dci_cita_id = %s"
        result = cls.query_one(sql, (cita_id,))
        return result['total'] if result and result['total'] else 0