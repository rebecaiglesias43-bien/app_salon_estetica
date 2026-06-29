"""Directly test the dias_semana fix by calling the module."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Import the module fresh - this should use the source file
from datetime import date, timedelta

hoy = date.today()
print(f"Today: {hoy}")

# Simulate the EXACT code from finanzasController.py
dias_semana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
for i in range(6, -1, -1):
    dia = hoy - timedelta(days=i)
    nombre = dias_semana[dia.weekday()]
    print(f"  {nombre:4s} | {dia} | weekday={dia.weekday()}")

print("\nModule source file location:")
import controllers.finanzasController as fc
print(f"  {fc.__file__}")
