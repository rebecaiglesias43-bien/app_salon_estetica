from . import Model

class Clientes(Model):
    
    @classmethod
    def get_all(cls, limit=None, offset=None):
        sql = "SELECT * FROM clientes ORDER BY cli_nombre ASC"
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
        sql = "SELECT COUNT(*) as total FROM clientes"
        result = cls.query_one(sql)
        return result['total'] if result else 0
    
    @classmethod
    def get_by_id(cls, id):
        sql = "SELECT * FROM clientes WHERE cli_id = %s"
        return cls.query_one(sql, (id,))
    
    @classmethod
    def get_by_telefono(cls, telefono):
        # Normalizar: eliminar espacios, guiones, paréntesis, signo +
        import re
        cleaned = re.sub(r'[\s\-\(\)\+]', '', telefono) if telefono else telefono
        # Comparación normalizada para ignorar diferencias de formato
        sql = """SELECT * FROM clientes 
                 WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(cli_telefono, ' ', ''), '-', ''), '(', ''), ')', ''), '+', '') = %s"""
        return cls.query_one(sql, (cleaned,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO clientes (cli_nombre, cli_apellido, cli_telefono, cli_direccion) 
                 VALUES (%s, %s, %s, %s)"""
        return cls.execute(sql, (
            data.get('cli_nombre'),
            data.get('cli_apellido'),
            data.get('cli_telefono'),
            data.get('cli_direccion')
        ))
    
    @classmethod
    def update(cls, id, data):
        sql = """UPDATE clientes 
                 SET cli_nombre=%s, cli_apellido=%s, cli_telefono=%s, cli_direccion=%s 
                 WHERE cli_id=%s"""
        return cls.execute(sql, (
            data.get('cli_nombre'),
            data.get('cli_apellido'),
            data.get('cli_telefono'),
            data.get('cli_direccion'),
            id
        ))
    
    @classmethod
    def delete(cls, id):
        sql = "DELETE FROM clientes WHERE cli_id = %s"
        return cls.execute(sql, (id,))
    
    @classmethod
    def search(cls, term, limit=None, offset=None):
        like = f'%{term}%'
        sql = """SELECT * FROM clientes 
                 WHERE cli_nombre LIKE %s OR cli_telefono LIKE %s 
                 ORDER BY cli_nombre ASC"""
        if limit is not None:
            sql += " LIMIT %s"
            if offset is not None:
                sql += " OFFSET %s"
                return cls.query_all(sql, (like, like, limit, offset))
            else:
                return cls.query_all(sql, (like, like, limit))
        return cls.query_all(sql, (like, like))
    
    @classmethod
    def count_search(cls, term):
        like = f'%{term}%'
        sql = """SELECT COUNT(*) as total FROM clientes 
                 WHERE cli_nombre LIKE %s OR cli_telefono LIKE %s"""
        result = cls.query_one(sql, (like, like))
        return result['total'] if result else 0
    
    @classmethod
    def get_historial(cls, id):
        sql = """
            SELECT c.cit_id, c.cit_fecha, c.cit_hora, c.cit_estado,
                   s.ser_nombre, d.dci_precio
            FROM clientes cl
            JOIN citas c ON cl.cli_id = c.cit_cliente_id
            LEFT JOIN detalle_citas d ON c.cit_id = d.dci_cita_id
            LEFT JOIN servicios s ON d.dci_servicio_id = s.ser_id
            WHERE cl.cli_id = %s
            ORDER BY c.cit_fecha DESC, c.cit_hora DESC
        """
        return cls.query_all(sql, (id,))