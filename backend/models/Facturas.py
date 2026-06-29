from . import Model
from datetime import date

class Facturas(Model):
    
    @classmethod
    def get_all(cls, limit=None, offset=None, estado=None):
        where = ""
        params = []
        if estado:
            where = " WHERE f.fac_estado = %s"
            params.append(estado)
        sql = f"""
            SELECT f.*,
                   c.cit_fecha, c.cit_hora,
                   COALESCE(cl_cita.cli_nombre, cl_dir.cli_nombre) as cli_nombre,
                   COALESCE(cl_cita.cli_apellido, cl_dir.cli_apellido) as cli_apellido,
                   COALESCE(cl_cita.cli_telefono, cl_dir.cli_telefono) as cli_telefono
            FROM facturas f
            LEFT JOIN citas c ON f.fac_cita_id = c.cit_id
            LEFT JOIN clientes cl_cita ON c.cit_cliente_id = cl_cita.cli_id
            LEFT JOIN clientes cl_dir ON f.fac_cliente_id = cl_dir.cli_id
            {where}
            ORDER BY f.fac_fecha DESC
        """
        if limit is not None:
            sql += " LIMIT %s"
            params.append(limit)
            if offset is not None:
                sql += " OFFSET %s"
                params.append(offset)
            return cls.query_all(sql, tuple(params))
        return cls.query_all(sql, tuple(params)) if params else cls.query_all(sql)
    
    @classmethod
    def count_all(cls, estado=None):
        where = ""
        params = []
        if estado:
            where = " WHERE fac_estado = %s"
            params.append(estado)
        sql = f"SELECT COUNT(*) as total FROM facturas{where}"
        result = cls.query_one(sql, tuple(params)) if params else cls.query_one(sql)
        return result['total'] if result else 0
    
    @classmethod
    def get_by_id(cls, id):
        sql = """
            SELECT f.*, c.cit_fecha, c.cit_hora,
                   COALESCE(cl_cita.cli_nombre, cl_dir.cli_nombre) as cli_nombre,
                   COALESCE(cl_cita.cli_apellido, cl_dir.cli_apellido) as cli_apellido,
                   COALESCE(cl_cita.cli_telefono, cl_dir.cli_telefono) as cli_telefono
            FROM facturas f
            LEFT JOIN citas c ON f.fac_cita_id = c.cit_id
            LEFT JOIN clientes cl_cita ON c.cit_cliente_id = cl_cita.cli_id
            LEFT JOIN clientes cl_dir ON f.fac_cliente_id = cl_dir.cli_id
            WHERE f.fac_id = %s
        """
        return cls.query_one(sql, (id,))
    
    @classmethod
    def create(cls, cita_id, total, cliente_id=None):
        # Asignar automáticamente al corte de caja abierto
        from models.CortesCaja import CortesCaja
        corte = CortesCaja.get_abierto()
        corte_id = corte['cor_id'] if corte else None
        sql = """INSERT INTO facturas (fac_cita_id, fac_cliente_id, fac_fecha, fac_total, fac_estado, fac_corte_id) 
                 VALUES (%s, %s, %s, %s, 'pendiente', %s)"""
        return cls.execute(sql, (cita_id, cliente_id, date.today(), total, corte_id))
    
    @classmethod
    def update_estado(cls, id, estado):
        sql = "UPDATE facturas SET fac_estado = %s WHERE fac_id = %s"
        return cls.execute(sql, (estado, id))
    
    @classmethod
    def get_by_cita(cls, cita_id):
        sql = "SELECT * FROM facturas WHERE fac_cita_id = %s"
        return cls.query_one(sql, (cita_id,))
    
    @classmethod
    def get_total_by_date_range(cls, desde, hasta):
        sql = """SELECT COALESCE(SUM(fac_total), 0) as total 
                 FROM facturas 
                 WHERE DATE(fac_fecha) BETWEEN DATE(%s) AND DATE(%s) AND fac_estado = 'pagado'"""
        result = cls.query_one(sql, (desde, hasta))
        return result['total'] if result else 0

    @classmethod
    def get_total_by_corte(cls, corte_id, desde=None):
        """Suma el total de facturas pagadas asociadas a un corte de caja específico.
        Si se pasa `desde`, solo cuenta facturas con fac_fecha >= desde
        (red de seguridad contra solapamiento entre cortes)."""
        if desde is not None:
            sql = """SELECT COALESCE(SUM(fac_total), 0) as total 
                     FROM facturas 
                     WHERE fac_corte_id = %s AND fac_estado = 'pagado' AND DATE(fac_fecha) >= DATE(%s)"""
            result = cls.query_one(sql, (corte_id, desde))
        else:
            sql = """SELECT COALESCE(SUM(fac_total), 0) as total 
                     FROM facturas 
                     WHERE fac_corte_id = %s AND fac_estado = 'pagado'"""
            result = cls.query_one(sql, (corte_id,))
        return result['total'] if result else 0