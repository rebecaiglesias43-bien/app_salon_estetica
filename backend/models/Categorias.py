from . import Model

class Categorias(Model):
    
    @classmethod
    def ensure_table(cls):
        """Crea la tabla categorias si no existe."""
        sql = """
            CREATE TABLE IF NOT EXISTS categorias (
                cat_id int(11) NOT NULL AUTO_INCREMENT,
                cat_nombre varchar(100) NOT NULL,
                cat_slug varchar(50) NOT NULL,
                PRIMARY KEY (cat_id),
                UNIQUE KEY cat_slug (cat_slug)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        """
        cls.execute(sql)
    
    @classmethod
    def seed_defaults(cls):
        """Inserta las categorías por defecto si la tabla está vacía."""
        existing = cls.query_one("SELECT COUNT(*) as total FROM categorias")
        if existing and existing['total'] > 0:
            return
        defaults = [
            ('Cortes', 'cortes'),
            ('Cejas y Pestañas', 'cejas'),
            ('Coloración', 'coloracion'),
            ('Uñas / Manicure', 'uñas'),
            ('Masajes', 'masajes'),
            ('Paquetes', 'paquetes'),
        ]
        for nombre, slug in defaults:
            cls.execute(
                "INSERT IGNORE INTO categorias (cat_nombre, cat_slug) VALUES (%s, %s)",
                (nombre, slug)
            )
    
    @classmethod
    def get_all(cls):
        """Retorna todas las categorías ordenadas."""
        cls.ensure_table()
        cls.seed_defaults()
        return cls.query_all("SELECT * FROM categorias ORDER BY cat_nombre ASC")
    
    @classmethod
    def create(cls, nombre: str, slug: str = None):
        """Crea una nueva categoría. Si no se provee slug, se genera desde el nombre."""
        cls.ensure_table()
        if not slug:
            slug = nombre.lower().replace(' ', '_').replace('/', '_').replace('ñ', 'n').replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
        cls.execute(
            "INSERT INTO categorias (cat_nombre, cat_slug) VALUES (%s, %s)",
            (nombre, slug)
        )
        return cls.query_one("SELECT * FROM categorias WHERE cat_slug = %s", (slug,))
    
    @classmethod
    def get_by_slug(cls, slug: str):
        """Busca una categoría por su slug."""
        return cls.query_one("SELECT * FROM categorias WHERE cat_slug = %s", (slug,))
