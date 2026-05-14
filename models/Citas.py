from . import Model

class Citas(Model):
    
    @classmethod
    def get_all(cls, estado=None, fecha_inicio=None, fecha_fin=None, limit=None, offset=None):
        sql = """
            SELECT c.*, cl.cli_nombre, cl.cli_apellido, cl.cli_telefono
            FROM citas c
            JOIN clientes cl ON c.cit_cliente_id = cl.cli_id
            WHERE 1=1
        """
        params = []
        
        if estado:
            sql += " AND c.cit_estado = %s"
            params.append(estado)
        
        if fecha_inicio and fecha_fin:
            sql += " AND c.cit_fecha BETWEEN %s AND %s"
            params.extend([fecha_inicio, fecha_fin])
        
        sql += " ORDER BY c.cit_fecha ASC, c.cit_hora ASC"
        if limit is not None:
            sql += " LIMIT %s"
            params.append(limit)
            if offset is not None:
                sql += " OFFSET %s"
                params.append(offset)
        return cls.query_all(sql, tuple(params))
    
    @classmethod
    def count_all(cls, estado=None):
        sql = """
            SELECT COUNT(*) as total
            FROM citas c
            JOIN clientes cl ON c.cit_cliente_id = cl.cli_id
            WHERE 1=1
        """
        params = []
        if estado:
            sql += " AND c.cit_estado = %s"
            params.append(estado)
        result = cls.query_one(sql, tuple(params))
        return result['total'] if result else 0
    
    @classmethod
    def get_by_id(cls, id):
        sql = """
            SELECT c.*, cl.cli_nombre, cl.cli_apellido, cl.cli_telefono, cl.cli_direccion
            FROM citas c
            JOIN clientes cl ON c.cit_cliente_id = cl.cli_id
            WHERE c.cit_id = %s
        """
        return cls.query_one(sql, (id,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO citas (cit_cliente_id, cit_fecha, cit_hora, cit_estado) 
                 VALUES (%s, %s, %s, %s)"""
        return cls.execute(sql, (
            data.get('cit_cliente_id'),
            data.get('cit_fecha'),
            data.get('cit_hora'),
            data.get('cit_estado', 'pendiente')
        ))
    
    @classmethod
    def update_estado(cls, id, estado):
        sql = "UPDATE citas SET cit_estado = %s WHERE cit_id = %s"
        return cls.execute(sql, (estado, id))
    
    @classmethod
    def reprogramar(cls, id, fecha, hora):
        sql = "UPDATE citas SET cit_fecha = %s, cit_hora = %s, cit_estado = 'pendiente' WHERE cit_id = %s"
        return cls.execute(sql, (fecha, hora, id))