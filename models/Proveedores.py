from . import Model

class Proveedores(Model):
    
    @classmethod
    def get_all(cls, limit=None, offset=None):
        sql = "SELECT SQL_CALC_FOUND_ROWS * FROM proveedores ORDER BY prv_nombre ASC"
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
        sql = "SELECT COUNT(*) as total FROM proveedores"
        result = cls.query_one(sql)
        return result['total'] if result else 0
    
    @classmethod
    def get_by_id(cls, id):
        sql = "SELECT * FROM proveedores WHERE prv_id = %s"
        return cls.query_one(sql, (id,))
    
    @classmethod
    def get_by_nombre(cls, nombre):
        sql = "SELECT * FROM proveedores WHERE prv_nombre = %s"
        return cls.query_one(sql, (nombre,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO proveedores (prv_nombre, prv_telefono, prv_email, prv_direccion) 
                 VALUES (%s, %s, %s, %s)"""
        return cls.execute(sql, (
            data.get('prv_nombre'),
            data.get('prv_telefono'),
            data.get('prv_email'),
            data.get('prv_direccion')
        ))
    
    @classmethod
    def update(cls, id, data):
        sql = """UPDATE proveedores 
                 SET prv_nombre=%s, prv_telefono=%s, prv_email=%s, prv_direccion=%s 
                 WHERE prv_id=%s"""
        return cls.execute(sql, (
            data.get('prv_nombre'),
            data.get('prv_telefono'),
            data.get('prv_email'),
            data.get('prv_direccion'),
            id
        ))
    
    @classmethod
    def delete(cls, id):
        sql = "DELETE FROM proveedores WHERE prv_id = %s"
        return cls.execute(sql, (id,))
    
    @classmethod
    def get_con_productos(cls):
        sql = """
            SELECT prv.*, COUNT(pp.ppr_id) as total_productos
            FROM proveedores prv
            LEFT JOIN proveedores_productos pp ON prv.prv_id = pp.ppr_proveedor_id
            GROUP BY prv.prv_id
            ORDER BY prv.prv_nombre ASC
        """
        return cls.query_all(sql)
