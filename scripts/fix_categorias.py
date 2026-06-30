"""
Asignar ser_categoria a servicios existentes y crear los servicios de coloración faltantes.
Ejecutar: python scripts/fix_categorias.py
"""
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

    print("🔧 Asignando categorías a servicios existentes...")

    # ── Cortes ──
    cortes = [
        'Corte Pixie', 'Corte Bob', 'Corte en V',
        'Corte Degradado', 'Corte en Capas', 'Corte Recto',
    ]
    for nombre in cortes:
        cur.execute("UPDATE servicios SET ser_categoria = 'cortes' WHERE ser_nombre = %s AND (ser_categoria IS NULL OR ser_categoria = '')", (nombre,))
    print(f"   ✅ {len(cortes)} cortes → 'cortes'")

    # ── Cejas y Pestañas ──
    cejas = [
        'Cejas Curvas', 'Cejas Arqueadas', 'Cejas Rectas',
        'Pestañas Clásicas', 'Pestañas Volumen', 'Pestañas Efecto Rímel',
    ]
    for nombre in cejas:
        cur.execute("UPDATE servicios SET ser_categoria = 'cejas' WHERE ser_nombre = %s AND (ser_categoria IS NULL OR ser_categoria = '')", (nombre,))
    print(f"   ✅ {len(cejas)} cejas/pestañas → 'cejas'")

    # ── Uñas / Manicure ──
    unas = [
        'Manicure Clásico', 'Uñas Acrílicas', 'Uñas en Gel',
        'Uñas Polygel', 'Uñas Press On',
    ]
    for nombre in unas:
        cur.execute("UPDATE servicios SET ser_categoria = 'uñas' WHERE ser_nombre = %s AND (ser_categoria IS NULL OR ser_categoria = '')", (nombre,))
    print(f"   ✅ {len(unas)} uñas → 'uñas'")

    # ── Masajes ──
    masajes = [
        'Masajes Relajantes', 'Masajes Terapéuticos', 'Masajes Piedra Caliente',
    ]
    for nombre in masajes:
        cur.execute("UPDATE servicios SET ser_categoria = 'masajes' WHERE ser_nombre = %s AND (ser_categoria IS NULL OR ser_categoria = '')", (nombre,))
    print(f"   ✅ {len(masajes)} masajes → 'masajes'")

    # ── Packs → sin categoría específica ──
    for nombre in ['Pack Completo', 'Pack Novia', 'Pack Relax', 'Pack Express']:
        cur.execute("UPDATE servicios SET ser_categoria = 'packs' WHERE ser_nombre = %s AND (ser_categoria IS NULL OR ser_categoria = '')", (nombre,))
    print("   ✅ Packs → 'packs'")

    db.commit()

    # ── Crear servicios de Coloración si no existen ──
    print("\n🎨 Creando servicios de Coloración...")
    coloracion_servicios = [
        ('Coloración Permanente', 'Coloración duradera con resultados de larga duración. Cubre canas y cambia tu look por completo.', 35000, 45, 'coloracion'),
        ('Coloración Semipermanente', 'Tono intenso que dura varias semanas sin dañar el cabello. Desvanece gradualmente.', 30000, 40, 'coloracion'),
        ('Coloración Temporal', 'Cambio de look sin compromiso. Lavado suave y color que dura pocos días.', 25000, 30, 'coloracion'),
        ('Balayage', 'Técnica francesa de mechas a mano alzada para un efecto degradado natural y soleado.', 45000, 90, 'coloracion'),
        ('Ombré', 'Degradado de color desde la raíz hasta las puntas, creando un efecto moderno y elegante.', 40000, 75, 'coloracion'),
        ('Fantasía', 'Colores vibrantes y atrevidos: rosa, azul, violeta y más. Expresá tu estilo único.', 55000, 120, 'coloracion'),
    ]

    creados = 0
    for nombre, desc, precio, duracion, categoria in coloracion_servicios:
        cur.execute("SELECT ser_id FROM servicios WHERE ser_nombre = %s", (nombre,))
        existing = cur.fetchone()
        if not existing:
            cur.execute(
                "INSERT INTO servicios (ser_nombre, ser_descripcion, ser_precio, ser_duracion, ser_categoria) VALUES (%s,%s,%s,%s,%s)",
                (nombre, desc, precio, duracion, categoria)
            )
            creados += 1
            print(f"   ✅ Creado: {nombre}")
        else:
            # Asegurar categoría si ya existe
            cur.execute("UPDATE servicios SET ser_categoria = %s WHERE ser_id = %s", (categoria, existing['ser_id']))
            print(f"   ⏭️  Ya existe: {nombre} (categoria actualizada)")

    db.commit()

    print(f"\n📊 Resumen:")
    print(f"   - Categorías asignadas a servicios existentes")
    print(f"   - {creados} servicios de coloración creados")

    # Verificar resultado
    cur.execute("SELECT ser_categoria, COUNT(*) as cnt FROM servicios GROUP BY ser_categoria ORDER BY ser_categoria")
    print(f"\n📋 Servicios por categoría:")
    for r in cur.fetchall():
        print(f"   {r['ser_categoria'] or 'sin categoría'}: {r['cnt']}")

    db.close()
    print("\n✅ ¡Todo listo!")
