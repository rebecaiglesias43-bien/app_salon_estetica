from . import Model

class Usuarios(Model):
    
    @classmethod
    def get_all(cls, limit=None, offset=None):
        sql = "SELECT SQL_CALC_FOUND_ROWS usu_id, usu_username, usu_email, usu_estado FROM usuarios ORDER BY usu_username ASC"
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
        sql = "SELECT COUNT(*) as total FROM usuarios"
        result = cls.query_one(sql)
        return result['total'] if result else 0
    
    @classmethod
    def get_by_id(cls, id):
        sql = "SELECT usu_id, usu_username, usu_email, usu_estado FROM usuarios WHERE usu_id = %s"
        return cls.query_one(sql, (id,))
    
    @classmethod
    def get_by_username(cls, username):
        sql = "SELECT * FROM usuarios WHERE usu_username = %s"
        return cls.query_one(sql, (username,))
    
    @classmethod
    def create(cls, data):
        sql = """INSERT INTO usuarios (usu_username, usu_password, usu_email, usu_estado) 
                 VALUES (%s, %s, %s, %s)"""
        return cls.execute(sql, (
            data.get('usu_username'),
            data.get('usu_password'),
            data.get('usu_email'),
            data.get('usu_estado', 'activo')
        ))
    
    @classmethod
    def update(cls, id, data):
        if data.get('usu_password'):
            sql = """UPDATE usuarios 
                     SET usu_username=%s, usu_password=%s, usu_email=%s, usu_estado=%s 
                     WHERE usu_id=%s"""
            return cls.execute(sql, (
                data.get('usu_username'),
                data.get('usu_password'),
                data.get('usu_email'),
                data.get('usu_estado'),
                id
            ))
        else:
            sql = """UPDATE usuarios 
                     SET usu_username=%s, usu_email=%s, usu_estado=%s 
                     WHERE usu_id=%s"""
            return cls.execute(sql, (
                data.get('usu_username'),
                data.get('usu_email'),
                data.get('usu_estado'),
                id
            ))
    
    @classmethod
    def delete(cls, id):
        sql = "DELETE FROM usuarios WHERE usu_id = %s"
        return cls.execute(sql, (id,))
    
    @classmethod
    def update_estado(cls, id, estado):
        sql = "UPDATE usuarios SET usu_estado = %s WHERE usu_id = %s"
        return cls.execute(sql, (estado, id))
    
    @classmethod
    def change_password(cls, id, new_password):
        sql = "UPDATE usuarios SET usu_password = %s WHERE usu_id = %s"
        return cls.execute(sql, (new_password, id))
