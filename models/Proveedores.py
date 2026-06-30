from . import Model

class Proveedores(Model):
    
    @classmethod
    def get_all(cls, limit=None, offset=None, search=None):
        conditions = []
        params = []
        if search:
            conditions.append("prv_nombre LIKE %s")
            params.append(f'%{search}%')
        where = " WHERE " + " AND ".join(conditions) if conditions else ""
        sql = f"SELECT prv.*, COUNT(pp.ppr_id) as total_productos FROM proveedores prv LEFT JOIN proveedores_productos pp ON prv.prv_id = pp.ppr_proveedor_id{where} GROUP BY prv.prv_id ORDER BY prv.prv_nombre ASC"
        if limit is not None:
            sql += " LIMIT %s"
            params.append(limit)
            if offset is not None:
                sql += " OFFSET %s"
                params.append(offset)
        return cls.query_all(sql, tuple(params)) if params else cls.query_all(sql)
    
    @classmethod
    def count_all(cls, search=None):
        conditions = []
        params = []
        if search:
            conditions.append("prv_nombre LIKE %s")
            params.append(f'%{search}%')
        where = " WHERE " + " AND ".join(conditions) if conditions else ""
        sql = f"SELECT COUNT(*) as total FROM proveedores{where}"
        result = cls.query_one(sql, tuple(params)) if params else cls.query_one(sql)
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
    def exists_with_same_data(cls, nombre, telefono=None, email=None, direccion=None, exclude_id=None):
        """Verifica si existe un proveedor con los mismos datos (nombre + teléfono + email + dirección).
        exclude_id: opcional, para excluir al propio proveedor al editar."""
        conditions = ["prv_nombre = %s"]
        params = [nombre]
        if telefono:
            conditions.append("prv_telefono = %s")
            params.append(telefono)
        if email:
            conditions.append("prv_email = %s")
            params.append(email)
        if direccion:
            conditions.append("prv_direccion = %s")
            params.append(direccion)
        if exclude_id is not None:
            conditions.append("prv_id != %s")
            params.append(exclude_id)
        sql = f"SELECT prv_id FROM proveedores WHERE {' AND '.join(conditions)} LIMIT 1"
        result = cls.query_one(sql, tuple(params))
        return result is not None
    
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
    def has_associations(cls, id):
        """Verifica si el proveedor tiene compras o productos asociados (FK)."""
        sql_compras = "SELECT COUNT(*) as total FROM compras WHERE com_proveedor_id = %s"
        compras = cls.query_one(sql_compras, (id,))
        if compras and compras['total'] > 0:
            return True, 'compras'
        sql_productos = """SELECT COUNT(*) as total FROM proveedores_productos pp
                           JOIN productos p ON pp.ppr_producto_id = p.pro_id
                           WHERE pp.ppr_proveedor_id = %s"""
        productos = cls.query_one(sql_productos, (id,))
        if productos and productos['total'] > 0:
            return True, 'productos'
        return False, None
    
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
