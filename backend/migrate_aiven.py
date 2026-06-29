"""
Script para migrar la BD en Aiven: 
1. Borra las tablas existentes 
2. Carga el SQL original (que tiene los nombres de columna correctos)

Uso: python migrate_aiven.py
"""
import pymysql
pymysql.install_as_MySQLdb()
import MySQLdb
import os

DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'passwd': os.getenv('DB_PASSWORD'),
    'db': os.getenv('DB_NAME', 'sistema_estetica'),
    'port': int(os.getenv('DB_PORT', 3306)),
}

SQL_FILE = os.path.join(os.path.dirname(__file__), 'sistema_estetica.sql')


def clean_sql(content):
    """Limpia comentarios condicionales /*!...*/ y variables @OLD_... del SQL."""
    import re
    # Eliminar líneas con @OLD_
    lines = []
    for line in content.split('\n'):
        # Saltar líneas con variables @OLD_
        if '@OLD_' in line or '@old_' in line.lower():
            continue
        # Saltar líneas de comentarios condicionales /*!...*/
        if line.strip().startswith('/*!') and line.strip().endswith('*/;'):
            continue
        if line.strip() == '':
            lines.append(line)
            continue
        # Limpiar comentarios /*!...*/ inline
        line = re.sub(r'/\*!\d+\s', '', line)
        line = re.sub(r'\s\*\/', '', line)
        lines.append(line)
    return '\n'.join(lines)


def main():
    print('Conectando a Aiven...')
    conn = MySQLdb.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    print('Leyendo SQL original...')
    with open(SQL_FILE, 'r', encoding='utf-8') as f:
        raw_sql = f.read()
    
    print('Limpiando SQL...')
    clean = clean_sql(raw_sql)
    
    # Guardar versión limpia para depuración
    clean_path = os.path.join(os.path.dirname(__file__), 'sistema_estetica_migrate.sql')
    with open(clean_path, 'w', encoding='utf-8') as f:
        f.write(clean)
    print(f'SQL limpio guardado en: {clean_path}')
    
    print('Ejecutando SQL...')
    # Ejecutar cada sentencia por separado
    statements = clean.split(';')
    total = len(statements)
    ok = 0
    errors = 0
    
    for i, stmt in enumerate(statements):
        stmt = stmt.strip()
        if not stmt or stmt.startswith('--'):
            ok += 1
            continue
        try:
            cursor.execute(stmt)
            ok += 1
            if i % 20 == 0:
                print(f'  Progreso: {i}/{total}', end='\r')
        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f'\n  Error en sentencia {i}: {e}')
    
    conn.commit()
    cursor.close()
    conn.close()
    print(f'\n✅ Completado: {ok} sentencias OK, {errors} errores')


if __name__ == '__main__':
    main()
