"""Check database schema and services data."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

from services.databaseService import get_db, init_app
from flask import Flask

app = Flask(__name__)
init_app(app)

with app.app_context():
    db = get_db()
    cur = db.cursor()
    
    # Check columns
    cur.execute("SHOW COLUMNS FROM servicios")
    print("=== Columnas de servicios ===")
    for c in cur.fetchall():
        print(c)
    
    print("\n=== Servicios actuales ===")
    cur.execute("SELECT ser_id, ser_nombre, ser_categoria FROM servicios ORDER BY ser_id")
    for r in cur.fetchall():
        print(r)
    
    db.close()
