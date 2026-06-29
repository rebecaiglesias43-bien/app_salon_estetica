#!/bin/bash
# Script de inicio para Render
# Carga las variables de entorno y arranca gunicorn

set -e

echo "→ Iniciando backend Salón de Estética..."
echo "→ DB_HOST: $DB_HOST"
echo "→ DB_NAME: $DB_NAME"

# Validar variables críticas
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
  echo "ERROR: Faltan variables de entorno de base de datos"
  exit 1
fi

if [ -z "$JWT_SECRET_KEY" ]; then
  echo "ERROR: JWT_SECRET_KEY no está configurada"
  exit 1
fi

echo "→ Todo OK. Arrancando servidor..."
exec gunicorn app:app --bind 0.0.0.0:${PORT:-5000} --workers 2 --timeout 120
