"""Limpia TODOS los registros de cortes_caja y desvincula facturas.
   
   Uso:
     python scripts/clean_cortes_caja.py

   O desde Render shell:
     python scripts/clean_cortes_caja.py

   Qué hace:
     1. Anula fac_corte_id en TODAS las facturas (rompe FK)
     2. Elimina TODOS los registros de cortes_caja
     3. Resetea AUTO_INCREMENT a 1
     4. Muestra resumen de lo eliminado
"""
import sys
import os

# Asegurar que el directorio raíz está en el path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv

# Cargar .env si existe (entorno local); en Render las variables ya están en el entorno
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)

from services.databaseService import get_db, init_app
from flask import Flask

app = Flask(__name__)
init_app(app)

with app.app_context():
    db = get_db()
    cur = db.cursor()

    # ── 1. Contar y mostrar lo que hay antes ──
    cur.execute("SELECT COUNT(*) AS cnt FROM cortes_caja")
    total_cortes = cur.fetchone()['cnt']
    print(f"Cortes de caja actuales: {total_cortes}")

    cur.execute("SELECT COUNT(*) AS cnt FROM facturas WHERE fac_corte_id IS NOT NULL")
    facturas_vinculadas = cur.fetchone()['cnt']
    print(f"Facturas vinculadas a cortes: {facturas_vinculadas}")

    if total_cortes == 0:
        print("No hay cortes de caja para limpiar. Nada que hacer.")
        db.close()
        sys.exit(0)

    # ── 2. Confirmación ──
    print(f"\nSe eliminaran TODOS los {total_cortes} cortes de caja")
    print(f"Se desvincularan {facturas_vinculadas} facturas (fac_corte_id -> NULL)")
    respuesta = input("\nContinuar? (s/n): ").strip().lower()
    if respuesta != 's':
        print("Cancelado.")
        db.close()
        sys.exit(0)

    # ── 3. Desvincular facturas ──
    print("\nDesvinculando facturas...")
    cur.execute("UPDATE facturas SET fac_corte_id = NULL WHERE fac_corte_id IS NOT NULL")
    afectadas = cur.rowcount
    print(f"   {afectadas} facturas desvinculadas")

    # ── 4. Eliminar cortes ──
    print("Eliminando cortes de caja...")
    cur.execute("DELETE FROM cortes_caja")
    eliminados = cur.rowcount
    print(f"   {eliminados} cortes eliminados")

    # ── 5. Resetear AUTO_INCREMENT ──
    print("Reseteando AUTO_INCREMENT...")
    cur.execute("ALTER TABLE cortes_caja AUTO_INCREMENT = 1")
    print("   AUTO_INCREMENT = 1")

    db.commit()

    # ── 6. Verificar ──
    cur.execute("SELECT COUNT(*) AS cnt FROM cortes_caja")
    restantes = cur.fetchone()['cnt']
    cur.execute("SELECT COUNT(*) AS cnt FROM facturas WHERE fac_corte_id IS NOT NULL")
    vinculadas_restantes = cur.fetchone()['cnt']

    print(f"\nLimpieza completada!")
    print(f"   Cortes restantes: {restantes}")
    print(f"   Facturas aun vinculadas: {vinculadas_restantes}")

    db.close()
