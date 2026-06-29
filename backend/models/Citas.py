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
        
        sql += " ORDER BY c.cit_fecha DESC, c.cit_hora DESC"
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
    
    @classmethod
    def get_ocupados(cls, fecha):
        """Retorna las horas ocupadas (no canceladas/rechazadas) para una fecha dada
        Debe coincidir con la lógica de is_horario_ocupado para evitar falsos disponibles.
        """
        sql = """
            SELECT cit_hora
            FROM citas
            WHERE cit_fecha = %s
              AND cit_estado NOT IN ('cancelada', 'rechazada')
            ORDER BY cit_hora
        """
        return cls.query_all(sql, (fecha,))
    
    @classmethod
    def is_horario_ocupado(cls, fecha, hora, exclude_id=None):
        """Verifica si ya existe una cita en esa fecha+hora (excluyendo un id opcional)"""
        sql = """
            SELECT COUNT(*) as total FROM citas 
            WHERE cit_fecha = %s AND cit_hora = %s 
              AND cit_estado NOT IN ('cancelada', 'rechazada')
        """
        params = [fecha, hora]
        if exclude_id:
            sql += " AND cit_id != %s"
            params.append(exclude_id)
        result = cls.query_one(sql, tuple(params))
        return result['total'] > 0 if result else False

    @staticmethod
    def _formatear_hora(valor):
        """Convierte un valor TIME (timedelta, str, time) a string HH:MM"""
        if valor is None:
            return None
        if hasattr(valor, 'total_seconds'):  # timedelta
            total_secs = int(valor.total_seconds())
            hh, mm = divmod(total_secs // 60, 60)
            return f'{hh:02d}:{mm:02d}'
        s = str(valor).strip().split(':')
        if len(s) >= 2:
            return f'{s[0].zfill(2)}:{s[1].zfill(2)}'
        return None

    @classmethod
    def get_ocupados_con_duracion(cls, fecha):
        """Retorna rangos ocupados (inicio, fin) para una fecha.
        Calcula hora_fin = cit_hora + SUM(ser_duracion) minutos.
        Retorna [{cit_id, cit_hora (HH:MM), cit_hora_fin (HH:MM), duracion_total}]
        """
        sql = """
            SELECT
                c.cit_id,
                c.cit_hora,
                COALESCE(SUM(s.ser_duracion), 60) AS duracion_total
            FROM citas c
            LEFT JOIN detalle_citas d ON c.cit_id = d.dci_cita_id
            LEFT JOIN servicios s ON d.dci_servicio_id = s.ser_id
            WHERE c.cit_fecha = %s
              AND c.cit_estado NOT IN ('cancelada', 'rechazada')
            GROUP BY c.cit_id, c.cit_hora
            ORDER BY c.cit_hora
        """
        rows = cls.query_all(sql, (fecha,))
        result = []
        for r in rows:
            hora_inicio = cls._formatear_hora(r['cit_hora'])
            if hora_inicio is None:
                continue
            duracion = int(r['duracion_total'] or 60)
            hh, mm = hora_inicio.split(':')
            minutos_inicio = int(hh) * 60 + int(mm)
            minutos_fin = minutos_inicio + duracion
            hora_fin = f'{minutos_fin // 60:02d}:{minutos_fin % 60:02d}'
            result.append({
                'cit_id': r['cit_id'],
                'cit_hora': hora_inicio,
                'cit_hora_fin': hora_fin,
                'duracion_total': duracion
            })
        return result

    @classmethod
    def _rangos_se_superponen(cls, inicio_a, fin_a, inicio_b, fin_b):
        """Dos rangos [inicio, fin) se superponen si A_start < B_end y B_start < A_end"""
        def a_minutos(hhmm):
            hh, mm = hhmm.split(':')
            return int(hh) * 60 + int(mm)
        return a_minutos(inicio_a) < a_minutos(fin_b) and a_minutos(inicio_b) < a_minutos(fin_a)

    @classmethod
    def is_bloque_disponible(cls, fecha, hora_inicio, duracion_minutos, exclude_id=None):
        """Verifica si un bloque de N minutos cabe en la fecha sin superponerse
        con otras citas activas. exclude_id excluye una cita (útil para reprogramar).
        """
        rangos_ocupados = cls.get_ocupados_con_duracion(fecha)

        # Calcular hora_fin del bloque propuesto
        hh, mm = hora_inicio.split(':')
        minutos_inicio = int(hh) * 60 + int(mm)
        minutos_fin = minutos_inicio + duracion_minutos
        hora_fin_propuesta = f'{minutos_fin // 60:02d}:{minutos_fin % 60:02d}'

        for rango in rangos_ocupados:
            if exclude_id and rango['cit_id'] == exclude_id:
                continue
            if cls._rangos_se_superponen(
                hora_inicio, hora_fin_propuesta,
                rango['cit_hora'], rango['cit_hora_fin']
            ):
                return False
        return True