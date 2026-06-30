"""Check dashboard endpoint."""
import sys, os, json, requests
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
    from datetime import date, timedelta
    hoy = date.today()
    dias_semana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    
    print(f"Hoy: {hoy} (weekday={hoy.weekday()})")
    print(f"Array index 0 = {dias_semana[0]}")
    print(f"Array index hoy = {dias_semana[hoy.weekday()]}")
    
    for i in range(6, -1, -1):
        dia = hoy - timedelta(days=i)
        nombre = dias_semana[dia.weekday()]
        print(f"  {dia} (weekday={dia.weekday()}) -> {nombre}")
    
    db.close()
