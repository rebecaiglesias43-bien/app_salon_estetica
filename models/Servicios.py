from . import Model

class Servicios(Model):
    
    @classmethod
    def get_all(cls, limit=None, offset=None, search=None, categoria=None):
        conditions = []
        params = []
        if search:
            conditions.append("ser_nombre LIKE %s")
            params.append(f'%{search}%')
        if categoria:
            conditions.append("ser_categoria = %s")
            params.append(categoria)
        where = " WHERE " + " AND ".join(conditions) if conditions else ""
        sql = f"SELECT * FROM servicios{where} ORDER BY ser_nombre ASC"
        if limit is not None:
            sql += " LIMIT %s"
            params.append(limit)
            if offset is not None:
                sql += " OFFSET %s"
                params.append(offset)
        return cls.query_all(sql, tuple(params)) if params else cls.query_all(sql)
    
    @classmethod
    def count_all(cls, search=None, categoria=None):
        conditions = []
        params = []
        if search:
            conditions.append("ser_nombre LIKE %s")
            params.append(f'%{search}%')
        if categoria:
            conditions.append("ser_categoria = %s")
            params.append(categoria)
        where = " WHERE " + " AND ".join(conditions) if conditions else ""
        sql = f"SELECT COUNT(*) as total FROM servicios{where}"
        result = cls.query_one(sql, tuple(params)) if params else cls.query_one(sql)
        return result['total'] if result else 0
    
    @classmethod
    def get_by_id(cls, id):
        sql = "SELECT * FROM servicios WHERE ser_id = %s"
        return cls.query_one(sql, (id,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO servicios (ser_nombre, ser_descripcion, ser_precio, ser_duracion, ser_categoria) 
                 VALUES (%s, %s, %s, %s, %s)"""
        return cls.execute(sql, (
            data.get('ser_nombre'),
            data.get('ser_descripcion'),
            data.get('ser_precio'),
            data.get('ser_duracion'),
            data.get('ser_categoria')
        ))
    
    @classmethod
    def update(cls, id, data):
        sql = """UPDATE servicios 
                 SET ser_nombre=%s, ser_descripcion=%s, ser_precio=%s, ser_duracion=%s, ser_categoria=%s 
                 WHERE ser_id=%s"""
        return cls.execute(sql, (
            data.get('ser_nombre'),
            data.get('ser_descripcion'),
            data.get('ser_precio'),
            data.get('ser_duracion'),
            data.get('ser_categoria'),
            id
        ))
    
    @classmethod
    def delete(cls, id):
        sql = "DELETE FROM servicios WHERE ser_id = %s"
        return cls.execute(sql, (id,))
