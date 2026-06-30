from . import Model

class Productos(Model):
    
    @classmethod
    def get_all(cls, limit=None, offset=None):
        sql = "SELECT * FROM productos ORDER BY pro_nombre ASC"
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
        sql = "SELECT COUNT(*) as total FROM productos"
        result = cls.query_one(sql)
        return result['total'] if result else 0
    
    @classmethod
    def get_by_id(cls, id):
        sql = "SELECT * FROM productos WHERE pro_id = %s"
        return cls.query_one(sql, (id,))
    
    @classmethod
    def get_activos(cls):
        sql = "SELECT * FROM productos WHERE pro_estado = 'activo' ORDER BY pro_nombre ASC"
        return cls.query_all(sql)
    
    @classmethod
    def get_by_nombre(cls, nombre):
        sql = "SELECT * FROM productos WHERE pro_nombre = %s"
        return cls.query_one(sql, (nombre,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO productos (pro_nombre, pro_precio, pro_stock, pro_estado) 
                 VALUES (%s, %s, %s, %s)"""
        return cls.execute(sql, (
            data.get('pro_nombre'),
            data.get('pro_precio'),
            data.get('pro_stock', 0),
            data.get('pro_estado', 'activo')
        ))
    
    @classmethod
    def update(cls, id, data):
        sql = """UPDATE productos 
                 SET pro_nombre=%s, pro_precio=%s, pro_stock=%s, pro_estado=%s 
                 WHERE pro_id=%s"""
        return cls.execute(sql, (
            data.get('pro_nombre'),
            data.get('pro_precio'),
            data.get('pro_stock'),
            data.get('pro_estado'),
            id
        ))
    
    @classmethod
    def update_stock(cls, id, cantidad):
        # Manejar stock NULL (tratarlo como 0)
        sql = "UPDATE productos SET pro_stock = COALESCE(pro_stock, 0) + %s WHERE pro_id = %s"
        return cls.execute(sql, (cantidad, id))
    
    @classmethod
    def delete(cls, id):
        sql = "DELETE FROM productos WHERE pro_id = %s"
        return cls.execute(sql, (id,))
    
    @classmethod
    def get_bajo_stock(cls, limite=5):
        sql = "SELECT * FROM productos WHERE pro_stock <= %s AND pro_estado = 'activo' ORDER BY pro_stock ASC"
        return cls.query_all(sql, (limite,))
