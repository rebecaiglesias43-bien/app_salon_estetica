"""
Vincular TODOS los servicios con sus insumos correspondientes según categoría.
Ejecutar: python scripts/fix_insumos_servicios.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

from services.databaseService import get_db, init_app
from flask import Flask

app = Flask(__name__)
init_app(app)

# ── Mapeo: nombre del servicio → lista de (producto_id, cantidad) ──
# Los IDs de productos según la BD actual:
# 114=Shampoo, 115=Acondicionador, 116/117/118=Tintes, 119=Decolorante,
# 120/121=Agua Oxigenada, 122/123=Esmaltes, 124=Base Coat, 125=Top Coat,
# 126=Aceite Cutículas, 127=Mascarilla, 128=Sérum, 129=Cera Depilatoria,
# 130=Guantes, 131=Limas, 132=Brocha, 133=Paleta Sombras, 134=Esmalte verde

SERVICIO_INSUMOS = {
    # ── Cortes ──
    'Corte Pixie':       [(114, 1), (115, 1)],
    'Corte Bob':         [(114, 1), (115, 1)],
    'Corte en V':        [(114, 1), (115, 1)],
    'Corte Degradado':   [(114, 1), (115, 1)],
    'Corte en Capas':    [(114, 1), (115, 1)],
    'Corte Recto':       [(114, 1), (115, 1)],

    # ── Cejas y Pestañas ──
    'Cejas Curvas':       [(129, 1)],  # Cera depilatoria
    'Cejas Arqueadas':    [(129, 1)],
    'Cejas Rectas':       [(129, 1)],
    'Pestañas Clásicas':  [(126, 1), (131, 1)],  # Aceite + Lima
    'Pestañas Volumen':   [(126, 1), (131, 1)],
    'Pestañas Efecto Rímel': [(126, 1), (131, 1)],

    # ── Coloración ──
    'Coloración Permanente':     [(116, 1), (119, 1), (120, 1), (130, 1)],
    'Coloración Semipermanente': [(117, 1), (119, 1), (120, 1), (130, 1)],
    'Coloración Temporal':       [(118, 1), (119, 1), (120, 1), (130, 1)],
    'Balayage':                  [(119, 1), (121, 1), (130, 1)],
    'Ombré':                     [(119, 1), (121, 1), (130, 1)],
    'Fantasía':                  [(116, 1), (119, 1), (121, 1), (130, 1)],

    # ── Uñas / Manicure ──
    'Manicure Clásico':  [(122, 1), (126, 1), (131, 1)],
    'Uñas Acrílicas':    [(124, 1), (125, 1), (126, 1), (131, 1)],
    'Uñas en Gel':       [(124, 1), (125, 1), (126, 1), (131, 1)],
    'Uñas Polygel':      [(124, 1), (125, 1), (126, 1), (131, 1)],
    'Uñas Press On':     [(124, 1), (126, 1)],

    # ── Masajes ──
    'Masajes Relajantes':    [(126, 2), (130, 1)],
    'Masajes Terapéuticos':  [(126, 2), (130, 1)],
    'Masajes Piedra Caliente': [(126, 2), (130, 1)],

    # ── Packs ──
    'Pack Completo':  [(114, 1), (115, 1), (127, 1)],
    'Pack Novia':     [(114, 1), (115, 1), (127, 1), (122, 1), (126, 1), (132, 1), (133, 1)],
    'Pack Relax':     [(126, 2), (130, 1), (122, 1), (128, 1)],
    'Pack Express':   [(114, 1), (115, 1), (129, 1)],
}

with app.app_context():
    db = get_db()
    cur = db.cursor()

    # Obtener todos los servicios
    cur.execute("SELECT ser_id, ser_nombre FROM servicios ORDER BY ser_id")
    servicios = cur.fetchall()
    print(f"📋 {len(servicios)} servicios encontrados\n")

    total_vinculos = 0
    for s in servicios:
        nombre = s['ser_nombre']
        insumos = SERVICIO_INSUMOS.get(nombre)
        if not insumos:
            print(f"  ⏭️  {nombre} — sin insumos definidos")
            continue

        for prod_id, cantidad in insumos:
            # Verificar si ya existe el vínculo
            cur.execute(
                "SELECT sep_id FROM servicios_productos WHERE sep_servicio_id = %s AND sep_producto_id = %s",
                (s['ser_id'], prod_id)
            )
            existing = cur.fetchone()
            if existing:
                # Actualizar cantidad si cambió
                cur.execute(
                    "UPDATE servicios_productos SET sep_cantidad = %s WHERE sep_id = %s",
                    (cantidad, existing['sep_id'])
                )
                print(f"  🔄 {nombre} → Prod#{prod_id} (actualizado a {cantidad} uds)")
            else:
                cur.execute(
                    "INSERT INTO servicios_productos (sep_servicio_id, sep_producto_id, sep_cantidad) VALUES (%s, %s, %s)",
                    (s['ser_id'], prod_id, cantidad)
                )
                print(f"  ✅ {nombre} → Prod#{prod_id} ({cantidad} uds)")
            total_vinculos += 1

    db.commit()

    # Resumen
    cur.execute("SELECT COUNT(*) as total FROM servicios_productos")
    total = cur.fetchone()['total']
    print(f"\n📊 Total de vínculos en BD: {total}")
    print(f"✅ {total_vinculos} vínculos procesados")

    db.close()
