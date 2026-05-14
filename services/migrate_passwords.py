"""
Script de migracion: convierte contrasenas de texto plano a bcrypt.
Ejecutar: python Backend/services/migrate_passwords.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import MySQLdb
import bcrypt
from services.databaseService import get_db

def migrate():
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT usu_id, usu_username, usu_password FROM usuarios")
    users = cursor.fetchall()
    
    count = 0
    for user in users:
        pwd = user['usu_password']
        if not pwd.startswith('$2'):
            hashed = bcrypt.hashpw(pwd.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cursor.execute("UPDATE usuarios SET usu_password = %s WHERE usu_id = %s", (hashed, user['usu_id']))
            count += 1
            username = user['usu_username']
            print(f'  -> {username}: password migrada a bcrypt')
    
    db.commit()
    cursor.close()
    db.close()
    print(f'\nTotal: {count} contrasenas migradas a bcrypt')

if __name__ == '__main__':
    print('Migrando contrasenas a bcrypt...')
    migrate()
