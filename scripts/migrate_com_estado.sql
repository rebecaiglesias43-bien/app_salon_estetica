-- Migración: Amplía com_estado para aceptar 'Parcialmente devuelta' (22 chars)
-- La columna era varchar(20) y el nuevo estado 'Parcialmente devuelta' no cabía.
-- Ejecutar:
--   python -c "
--   import sys, os; sys.path.insert(0,'.'); from dotenv import load_dotenv; load_dotenv()
--   from services.databaseService import get_db, init_app; from flask import Flask
--   app = Flask(__name__); init_app(app)
--   with app.app_context():
--       db = get_db(); cur = db.cursor()
--       cur.execute('ALTER TABLE compras MODIFY com_estado varchar(30) DEFAULT \"Completada\"')
--       db.commit(); print('OK')
--   "

ALTER TABLE compras MODIFY com_estado varchar(30) DEFAULT 'Completada';
