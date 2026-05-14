from . import Model

class Servicios(Model):
    
    @classmethod
    def get_all(cls, limit=None, offset=None):
        sql = "SELECT SQL_CALC_FOUND_ROWS * FROM servicios ORDER BY ser_nombre ASC"
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
        sql = "SELECT COUNT(*) as total FROM servicios"
        result = cls.query_one(sql)
        return result['total'] if result else 0
    
    @classmethod
    def get_by_id(cls, id):
        sql = "SELECT * FROM servicios WHERE ser_id = %s"
        return cls.query_one(sql, (id,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO servicios (ser_nombre, ser_descripcion, ser_precio, ser_duracion) 
                 VALUES (%s, %s, %s, %s)"""
        return cls.execute(sql, (
            data.get('ser_nombre'),
            data.get('ser_descripcion'),
            data.get('ser_precio'),
            data.get('ser_duracion')
        ))
    
    @classmethod
    def update(cls, id, data):
        sql = """UPDATE servicios 
                 SET ser_nombre=%s, ser_descripcion=%s, ser_precio=%s, ser_duracion=%s 
                 WHERE ser_id=%s"""
        return cls.execute(sql, (
            data.get('ser_nombre'),
            data.get('ser_descripcion'),
            data.get('ser_precio'),
            data.get('ser_duracion'),
            id
        ))
    
    @classmethod
    def delete(cls, id):
        sql = "DELETE FROM servicios WHERE ser_id = %s"
        return cls.execute(sql, (id,))
