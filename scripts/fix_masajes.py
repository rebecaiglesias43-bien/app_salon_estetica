"""Insert masajes services into DB."""
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

    masajes = [
        ('Masajes Relajantes', 'Técnicas suaves para liberar tensiones y promover relax profundo', 40000, 60, 'masajes'),
        ('Masajes Terapéuticos', 'Focalizado en puntos de tensión muscular con presión controlada', 50000, 60, 'masajes'),
        ('Masajes Piedra Caliente', 'Piedras volcánicas calientes que relajan músculos y mejoran circulación', 55000, 75, 'masajes'),
    ]

    creados = 0
    for nombre, desc, precio, duracion, categoria in masajes:
        cur.execute("SELECT ser_id FROM servicios WHERE ser_nombre = %s", (nombre,))
        if not cur.fetchone():
            cur.execute(
                "INSERT INTO servicios (ser_nombre, ser_descripcion, ser_precio, ser_duracion, ser_categoria) VALUES (%s,%s,%s,%s,%s)",
                (nombre, desc, precio, duracion, categoria)
            )
            creados += 1
            print(f'  ✅ Creado: {nombre}')
        else:
            print(f'  ⏭️  Ya existe: {nombre}')
    
    db.commit()
    print(f'\n📊 {creados} servicios de masajes creados')
    db.close()
