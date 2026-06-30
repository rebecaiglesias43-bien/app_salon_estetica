"""
Script de datos de prueba — pobla la BD con datos realistas para todos los módulos.
Ejecutar: python scripts/seed_test_data.py
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

from services.databaseService import get_db, init_app
from flask import Flask
import bcrypt
from datetime import date, datetime, timedelta

# Flask app mínimo para init_app
app = Flask(__name__)
init_app(app)

def seed():
    db = get_db()
    cur = db.cursor()
    hoy = date.today()

    print("🧹 Limpiando datos existentes...")
    # Respetar FK order
    cur.execute("DELETE FROM detalle_facturas")
    cur.execute("DELETE FROM pagos")
    cur.execute("DELETE FROM facturas")
    cur.execute("DELETE FROM detalle_compras")
    cur.execute("DELETE FROM compras")
    cur.execute("DELETE FROM detalle_citas")
    cur.execute("DELETE FROM historial_productos_usados")
    cur.execute("DELETE FROM inventario_movimientos")
    cur.execute("DELETE FROM citas")
    cur.execute("DELETE FROM proveedores_productos")
    cur.execute("DELETE FROM servicios_productos")
    cur.execute("DELETE FROM productos")
    cur.execute("DELETE FROM proveedores")
    cur.execute("DELETE FROM servicios")
    cur.execute("DELETE FROM cortes_caja")
    cur.execute("DELETE FROM clientes")
    cur.execute("DELETE FROM usuarios")
    db.commit()

    # ═══════════════════════════════════════════════════
    # 1. USUARIOS
    # ═══════════════════════════════════════════════════
    print("\n👤 Insertando usuarios...")
    pwd = bcrypt.hashpw("123456".encode(), bcrypt.gensalt()).decode()
    usuarios = [
        ("admin", pwd, "admin@elizastyles.com", "activo"),
        ("cliente1", pwd, "cliente1@email.com", "activo"),
        ("estilista1", pwd, "estilista1@elizastyles.com", "activo"),
        ("cajera1", pwd, "cajera1@elizastyles.com", "activo"),
    ]
    for u in usuarios:
        cur.execute(
            "INSERT INTO usuarios (usu_username, usu_password, usu_email, usu_estado) VALUES (%s,%s,%s,%s)",
            u
        )
    db.commit()
    print(f"   ✅ {len(usuarios)} usuarios creados (password: 123456)")

    # ═══════════════════════════════════════════════════
    # 2. CLIENTES
    # ═══════════════════════════════════════════════════
    print("\n👥 Insertando clientes...")
    clientes = [
        ("María", "González", "3001112233", "Cra 45 #22-10, Medellín"),
        ("Carlos", "Ramírez", "3002223344", "Calle 80 #30-15, Bogotá"),
        ("Ana", "Martínez", "3003334455", "Av. 68 #45-20, Bogotá"),
        ("Pedro", "López", "3004445566", "Cra 50 #10-05, Medellín"),
        ("Laura", "Hernández", "3005556677", "Calle 10 #20-30, Cali"),
        ("Diego", "Torres", "3006667788", "Cra 7 #72-41, Bogotá"),
        ("Sofía", "Díaz", "3007778899", "Calle 93 #15-20, Bogotá"),
        ("Andrés", "Morales", "3008889900", "Cra 43A #1-50, Medellín"),
        ("Valentina", "Ríos", "3009990011", "Av. Roosevelt #30-10, Cali"),
        ("Jorge", "Castro", "3001113344", "Calle 26 #50-40, Bogotá"),
    ]
    cliente_ids = []
    for c in clientes:
        cur.execute(
            "INSERT INTO clientes (cli_nombre, cli_apellido, cli_telefono, cli_direccion) VALUES (%s,%s,%s,%s)",
            c
        )
        cliente_ids.append(cur.lastrowid)
    db.commit()
    print(f"   ✅ {len(clientes)} clientes creados")

    # ═══════════════════════════════════════════════════
    # 3. SERVICIOS
    # ═══════════════════════════════════════════════════
    print("\n💇 Insertando servicios...")
    servicios = [
        # Cortes
        ("Corte Pixie", "Corto y moderno, ideal para resaltar facciones y pómulos", 25000, 30, 'cortes'),
        ("Corte Bob", "Clásico a la altura de la mandíbula, elegante y versátil", 28000, 30, 'cortes'),
        ("Corte en V", "Caída en pico con capas laterales que aportan volumen", 30000, 45, 'cortes'),
        ("Corte Degradado", "Transición progresiva de largo con acabado texturizado", 32000, 45, 'cortes'),
        ("Corte en Capas", "Capas escalonadas que dan movimiento y cuerpo", 28000, 30, 'cortes'),
        ("Corte Recto", "Línea pareja y pulida, sofisticado y atemporal", 22000, 30, 'cortes'),
        # Cejas y pestañas
        ("Cejas Curvas", "Arco natural que realza la mirada con acabado suave", 18000, 20, 'cejas'),
        ("Cejas Arqueadas", "Elevación marcada que estiliza el rostro", 20000, 20, 'cejas'),
        ("Cejas Rectas", "Línea recta y moderna, ideal para rostros alargados", 18000, 20, 'cejas'),
        ("Pestañas Clásicas", "Aplicación pestaña por pestaña, look natural", 35000, 45, 'cejas'),
        ("Pestañas Volumen", "Volumen ruso con extensiones múltiples", 45000, 60, 'cejas'),
        ("Pestañas Efecto Rímel", "Look maquillado sin maquillaje", 40000, 45, 'cejas'),
        # Uñas / Manicure
        ("Manicure Clásico", "Esmaltado tradicional con cuidado de cutículas", 15000, 30, 'uñas'),
        ("Uñas Acrílicas", "Esculpidas con acrílico de alta duración", 50000, 60, 'uñas'),
        ("Uñas en Gel", "Esmaltado semipermanente brillante y duradero", 45000, 45, 'uñas'),
        ("Uñas Polygel", "Ligeras, resistentes y naturales", 55000, 60, 'uñas'),
        ("Uñas Press On", "Personalizadas listas para colocar", 35000, 30, 'uñas'),
        # Packs
        ("Pack Completo", "Corte + Coloración + Peinado profesional", 65000, 120, 'packs'),
        ("Pack Novia", "Maquillaje + Peinado + Manicure gel + Pedicure spa", 95000, 180, 'packs'),
        ("Pack Relax", "Masaje + Manicure spa + Pedicure spa + Mascarilla", 72000, 150, 'packs'),
        ("Pack Express", "Corte + Blower + Cejas + Café incluido", 38000, 60, 'packs'),
        # Masajes
        ("Masajes Relajantes", "Técnicas suaves para liberar tensiones y promover relax profundo", 40000, 60, 'masajes'),
        ("Masajes Terapéuticos", "Focalizado en puntos de tensión muscular con presión controlada", 50000, 60, 'masajes'),
        ("Masajes Piedra Caliente", "Piedras volcánicas calientes que relajan músculos y mejoran circulación", 55000, 75, 'masajes'),
        # Coloración
        ("Coloración Permanente", "Coloración duradera con resultados de larga duración. Cubre canas y cambia tu look por completo.", 35000, 45, 'coloracion'),
        ("Coloración Semipermanente", "Tono intenso que dura varias semanas sin dañar el cabello. Desvanece gradualmente.", 30000, 40, 'coloracion'),
        ("Coloración Temporal", "Cambio de look sin compromiso. Lavado suave y color que dura pocos días.", 25000, 30, 'coloracion'),
        ("Balayage", "Técnica francesa de mechas a mano alzada para un efecto degradado natural y soleado.", 45000, 90, 'coloracion'),
        ("Ombré", "Degradado de color desde la raíz hasta las puntas, creando un efecto moderno y elegante.", 40000, 75, 'coloracion'),
        ("Fantasía", "Colores vibrantes y atrevidos: rosa, azul, violeta y más. Expresá tu estilo único.", 55000, 120, 'coloracion'),
    ]
    servicio_ids = []
    for s in servicios:
        cur.execute(
            "INSERT INTO servicios (ser_nombre, ser_descripcion, ser_precio, ser_duracion, ser_categoria) VALUES (%s,%s,%s,%s,%s)",
            s
        )
        servicio_ids.append(cur.lastrowid)
    db.commit()
    print(f"   ✅ {len(servicios)} servicios creados")

    # ═══════════════════════════════════════════════════
    # 4. PRODUCTOS
    # ═══════════════════════════════════════════════════
    print("\n📦 Insertando productos...")
    productos = [
        # Nombre, Precio, Stock, Estado
        ("Shampoo Profesional Keratina 500ml", 35000, 15, "activo"),
        ("Acondicionador Hidratante 500ml", 32000, 12, "activo"),
        ("Tinte Cabello Castaño Oscuro #3", 18000, 8, "activo"),
        ("Tinte Cabello Rubio Ceniza #7.1", 18000, 6, "activo"),
        ("Tinte Cabello Rojo Cobrizo #6.4", 18000, 10, "activo"),
        ("Decolorante en Polvo 500g", 25000, 5, "activo"),
        ("Agua Oxigenada 20 Vol. 1L", 15000, 4, "activo"),
        ("Agua Oxigenada 30 Vol. 1L", 15000, 7, "activo"),
        ("Esmalte Semiperm. Rojo Pasión", 12000, 20, "activo"),
        ("Esmalte Semiperm. Nude Rose", 12000, 18, "activo"),
        ("Base Coat Acrílico 15ml", 22000, 10, "activo"),
        ("Top Coat Gel Brillante 15ml", 22000, 10, "activo"),
        ("Aceite para Cutículas 50ml", 15000, 25, "activo"),
        ("Mascarilla Capilar Reparadora 250g", 28000, 3, "activo"),  # bajo stock
        ("Sérum Capilar Puntas Abiertas 100ml", 35000, 2, "activo"),  # bajo stock
        ("Cera Depilatoria Tibia 400g", 20000, 4, "activo"),          # bajo stock
        ("Guantes de Látex Caja x100", 18000, 30, "activo"),
        ("Lima de Uñas Profesional x10", 8000, 50, "activo"),
        ("Brocha Maquillaje Base x1", 25000, 15, "activo"),
        ("Paleta de Sombras 35 Colores", 45000, 8, "activo"),
    ]
    producto_ids = []
    for p in productos:
        cur.execute(
            "INSERT INTO productos (pro_nombre, pro_precio, pro_stock, pro_estado) VALUES (%s,%s,%s,%s)",
            p
        )
        producto_ids.append(cur.lastrowid)
    db.commit()
    print(f"   ✅ {len(productos)} productos creados (3 con bajo stock ≤5)")

    # ═══════════════════════════════════════════════════
    # 5. PROVEEDORES
    # ═══════════════════════════════════════════════════
    print("\n🚚 Insertando proveedores...")
    proveedores = [
        ("Distribuidora Belleza Total S.A.", "6015550101", "ventas@bellezatotal.com", "Cra 68 #80-45, Bogotá"),
        ("Cosméticos Profesionales Ltda.", "6045550202", "info@cosmeticospro.com", "Calle 30 #45-60, Medellín"),
        ("Importadora Hair & Nails", "6025550303", "pedidos@hairnails.com", "Av. 5N #20-30, Cali"),
        ("Proveedora Estética Integral", "6015550404", "contacto@esteticaintegral.com", "Cra 15 #72-18, Bogotá"),
        ("Suministros Salón Express", "6045550505", "ventas@salonexpress.com", "Calle 10 #43A-20, Medellín"),
    ]
    proveedor_ids = []
    for p in proveedores:
        cur.execute(
            "INSERT INTO proveedores (prv_nombre, prv_telefono, prv_email, prv_direccion) VALUES (%s,%s,%s,%s)",
            p
        )
        proveedor_ids.append(cur.lastrowid)
    db.commit()
    print(f"   ✅ {len(proveedores)} proveedores creados")

    # ═══════════════════════════════════════════════════
    # 6. PROVEEDORES_PRODUCTOS
    # ═══════════════════════════════════════════════════
    print("\n🔗 Vinculando productos a proveedores...")
    vinculos = [
        (proveedor_ids[0], producto_ids[0], 32000),   # Shampoo → Belleza Total
        (proveedor_ids[0], producto_ids[1], 30000),   # Acondicionador → Belleza Total
        (proveedor_ids[1], producto_ids[2], 16000),   # Tinte → Cosméticos Pro
        (proveedor_ids[1], producto_ids[3], 16000),
        (proveedor_ids[1], producto_ids[4], 16000),
        (proveedor_ids[1], producto_ids[5], 22000),   # Decolorante
        (proveedor_ids[2], producto_ids[8], 10000),   # Esmalte → Hair & Nails
        (proveedor_ids[2], producto_ids[9], 10000),
        (proveedor_ids[2], producto_ids[10], 20000),  # Base Coat
        (proveedor_ids[2], producto_ids[11], 20000),  # Top Coat
        (proveedor_ids[3], producto_ids[13], 24000),  # Mascarilla → Estética Integral
        (proveedor_ids[3], producto_ids[14], 32000),  # Sérum
        (proveedor_ids[4], producto_ids[16], 15000),  # Guantes → Salón Express
        (proveedor_ids[4], producto_ids[17], 6000),   # Limas
        (proveedor_ids[0], producto_ids[19], 40000),  # Paleta sombras → Belleza Total
    ]
    for v in vinculos:
        cur.execute(
            "INSERT INTO proveedores_productos (ppr_proveedor_id, ppr_producto_id, ppr_precio) VALUES (%s,%s,%s)",
            v
        )
    db.commit()
    print(f"   ✅ {len(vinculos)} vínculos creados")

    # ═══════════════════════════════════════════════════
    # 7. CITAS (última semana, distintos estados)
    # ═══════════════════════════════════════════════════
    print("\n📅 Insertando citas...")
    estados_cita = ["completada", "completada", "completada", "pendiente", "confirmada",
                    "completada", "pendiente", "cancelada", "completada", "pendiente"]
    horas = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "09:30", "10:30", "11:30", "14:30"]
    dias_offset = [6, 5, 5, 3, 3, 2, 1, 1, 0, 0]  # días atrás desde hoy
    cita_ids = []

    for i in range(10):
        c_date = hoy - timedelta(days=dias_offset[i])
        c_cliente = cliente_ids[i]
        c_estado = estados_cita[i]
        c_hora = horas[i]
        cur.execute(
            "INSERT INTO citas (cit_cliente_id, cit_fecha, cit_hora, cit_estado) VALUES (%s,%s,%s,%s)",
            (c_cliente, c_date, c_hora, c_estado)
        )
        cita_ids.append(cur.lastrowid)
    db.commit()
    print(f"   ✅ {len(cita_ids)} citas creadas (6 completadas, 3 pendientes, 1 cancelada)")

    # ═══════════════════════════════════════════════════
    # 8. DETALLE CITAS
    # ═══════════════════════════════════════════════════
    print("\n📋 Insertando detalle de citas...")
    detalle_citas = [
        (cita_ids[0], servicio_ids[0], 25000),   # Corte Pixie
        (cita_ids[1], servicio_ids[1], 28000),   # Corte Bob
        (cita_ids[2], servicio_ids[4], 28000),   # Corte en Capas
        (cita_ids[3], servicio_ids[6], 18000),   # Cejas Curvas
        (cita_ids[4], servicio_ids[9], 35000),   # Pestañas Clásicas
        (cita_ids[5], servicio_ids[12], 15000),  # Manicure Clásico
        (cita_ids[5], servicio_ids[10], 45000),  # + Pestañas Volumen (misma cita)
        (cita_ids[6], servicio_ids[18], 95000),  # Pack Novia
        (cita_ids[8], servicio_ids[17], 65000),  # Pack Completo
        (cita_ids[9], servicio_ids[20], 38000),  # Pack Express
    ]
    for d in detalle_citas:
        cur.execute(
            "INSERT INTO detalle_citas (dci_cita_id, dci_servicio_id, dci_precio) VALUES (%s,%s,%s)",
            d
        )
    db.commit()
    print(f"   ✅ {len(detalle_citas)} detalles creados")

    # ═══════════════════════════════════════════════════
    # 9. FACTURAS
    # ═══════════════════════════════════════════════════
    print("\n🧾 Insertando facturas...")
    facturas_data = [
        # (cita_id, cliente_id, fecha, total, estado)
        (cita_ids[0], cliente_ids[0], hoy - timedelta(days=6), 25000, "pagado"),
        (cita_ids[1], cliente_ids[1], hoy - timedelta(days=5), 28000, "pagado"),
        (cita_ids[2], cliente_ids[2], hoy - timedelta(days=5), 28000, "pagado"),
        (cita_ids[5], cliente_ids[5], hoy - timedelta(days=2), 60000, "pagado"),  # 2 servicios
        (cita_ids[8], cliente_ids[8], hoy, 65000, "pagado"),
        (None, cliente_ids[3], hoy - timedelta(days=1), 15000, "pendiente"),  # venta directa
        (None, cliente_ids[6], hoy - timedelta(days=3), 95000, "pagado"),
    ]
    factura_ids = []
    for f in facturas_data:
        cur.execute(
            "INSERT INTO facturas (fac_cita_id, fac_cliente_id, fac_fecha, fac_total, fac_estado) VALUES (%s,%s,%s,%s,%s)",
            f
        )
        factura_ids.append(cur.lastrowid)
    db.commit()
    print(f"   ✅ {len(factura_ids)} facturas creadas (5 pagadas, 1 pendiente)")

    # ═══════════════════════════════════════════════════
    # 10. DETALLE FACTURAS
    # ═══════════════════════════════════════════════════
    print("\n📄 Insertando detalle de facturas...")
    det_fact = [
        (factura_ids[0], servicio_ids[0], None, 1, 25000),
        (factura_ids[1], servicio_ids[1], None, 1, 28000),
        (factura_ids[2], servicio_ids[4], None, 1, 28000),
        (factura_ids[3], servicio_ids[12], None, 1, 15000),
        (factura_ids[3], servicio_ids[10], None, 1, 45000),
        (factura_ids[4], servicio_ids[17], None, 1, 65000),
        (factura_ids[5], None, producto_ids[0], 1, 15000),  # venta de producto
        (factura_ids[6], servicio_ids[18], None, 1, 95000),
    ]
    for d in det_fact:
        cur.execute(
            "INSERT INTO detalle_facturas (dfa_factura_id, dfa_servicio_id, dfa_producto_id, dfa_cantidad, dfa_subtotal) VALUES (%s,%s,%s,%s,%s)",
            d
        )
    db.commit()
    print(f"   ✅ {len(det_fact)} detalles de factura creados")

    # ═══════════════════════════════════════════════════
    # 11. PAGOS
    # ═══════════════════════════════════════════════════
    print("\n💳 Insertando pagos...")
    pagos_data = [
        (factura_ids[0], "Efectivo", hoy - timedelta(days=6), 25000),
        (factura_ids[1], "Tarjeta Débito", hoy - timedelta(days=5), 28000),
        (factura_ids[2], "Transferencia", hoy - timedelta(days=5), 28000),
        (factura_ids[3], "Efectivo", hoy - timedelta(days=2), 60000),
        (factura_ids[4], "Tarjeta Crédito", hoy, 65000),
        (factura_ids[6], "Efectivo", hoy - timedelta(days=3), 95000),
    ]
    for p in pagos_data:
        cur.execute(
            "INSERT INTO pagos (pag_factura_id, pag_metodo, pag_fecha, pag_monto) VALUES (%s,%s,%s,%s)",
            p
        )
    db.commit()
    print(f"   ✅ {len(pagos_data)} pagos creados")

    # ═══════════════════════════════════════════════════
    # 12. COMPRAS
    # ═══════════════════════════════════════════════════
    print("\n🛒 Insertando compras...")
    compras_data = [
        (proveedor_ids[0], hoy - timedelta(days=10), 134000, "Completada"),
        (proveedor_ids[1], hoy - timedelta(days=7), 108000, "Completada"),
        (proveedor_ids[2], hoy - timedelta(days=4), 80000, "Completada"),
        (proveedor_ids[3], hoy - timedelta(days=2), 56000, "Completada"),
    ]
    compra_ids = []
    for c in compras_data:
        cur.execute(
            "INSERT INTO compras (com_proveedor_id, com_fecha, com_total, com_estado) VALUES (%s,%s,%s,%s)",
            c
        )
        compra_ids.append(cur.lastrowid)
    db.commit()
    print(f"   ✅ {len(compra_ids)} compras creadas")

    # ═══════════════════════════════════════════════════
    # 13. DETALLE COMPRAS
    # ═══════════════════════════════════════════════════
    print("\n📦 Insertando detalle de compras...")
    det_compras = [
        (compra_ids[0], producto_ids[0], 2, 32000, 64000),
        (compra_ids[0], producto_ids[1], 2, 30000, 60000),
        (compra_ids[0], producto_ids[19], 1, 40000, 40000),
        (compra_ids[1], producto_ids[2], 3, 16000, 48000),
        (compra_ids[1], producto_ids[3], 2, 16000, 32000),
        (compra_ids[1], producto_ids[4], 2, 14000, 28000),
        (compra_ids[2], producto_ids[8], 2, 10000, 20000),
        (compra_ids[2], producto_ids[10], 3, 20000, 60000),
        (compra_ids[3], producto_ids[13], 1, 24000, 24000),
        (compra_ids[3], producto_ids[14], 1, 32000, 32000),
    ]
    for d in det_compras:
        cur.execute(
            "INSERT INTO detalle_compras (dco_compra_id, dco_producto_id, dco_cantidad, dco_precio_unitario, dco_subtotal) VALUES (%s,%s,%s,%s,%s)",
            d
        )
    db.commit()
    print(f"   ✅ {len(det_compras)} detalles de compra creados")

    # ═══════════════════════════════════════════════════
    # 14. CORTE DE CAJA
    # ═══════════════════════════════════════════════════
    print("\n💰 Insertando cortes de caja...")
    # Corte cerrado de días anteriores
    cur.execute(
        "INSERT INTO cortes_caja (cor_fecha_apertura, cor_fecha_cierre, cor_periodo, cor_base_inicial, cor_ingresos, cor_egresos, cor_ganancia_neta, cor_estado) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        (hoy - timedelta(days=1), hoy - timedelta(days=1), "diario", 100000, 153000, 0, 153000, "Cerrado")
    )
    # Corte abierto de HOY
    cur.execute(
        "INSERT INTO cortes_caja (cor_fecha_apertura, cor_fecha_cierre, cor_periodo, cor_base_inicial, cor_ingresos, cor_egresos, cor_ganancia_neta, cor_estado) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        (hoy, None, "diario", 100000, 65000, 0, 65000, "Abierto")
    )
    db.commit()
    print(f"   ✅ 2 cortes de caja creados (1 abierto HOY, 1 cerrado ayer)")

    # ═══════════════════════════════════════════════════
    # 15. MOVIMIENTOS DE INVENTARIO
    # ═══════════════════════════════════════════════════
    print("\n📊 Insertando movimientos de inventario...")
    movs = [
        (producto_ids[0], "Salida", 1, hoy - timedelta(days=3), "Uso en servicio — Corte Pixie"),
        (producto_ids[8], "Salida", 2, hoy - timedelta(days=2), "Uso en servicio — Manicure"),
        (producto_ids[0], "Entrada", 5, hoy - timedelta(days=10), "Compra a proveedor"),
        (producto_ids[2], "Salida", 1, hoy - timedelta(days=1), "Uso en servicio — Coloración"),
        (producto_ids[1], "Salida", 1, hoy, "Uso en servicio — Pack Completo"),
    ]
    for m in movs:
        cur.execute(
            "INSERT INTO inventario_movimientos (inm_producto_id, inm_tipo, inm_cantidad, inm_fecha, inm_motivo) VALUES (%s,%s,%s,%s,%s)",
            m
        )
    db.commit()
    print(f"   ✅ {len(movs)} movimientos de inventario creados")

    # ═══════════════════════════════════════════════════
    # 16. HISTORIAL PRODUCTOS USADOS
    # ═══════════════════════════════════════════════════
    print("\n📝 Insertando historial de productos usados...")
    hist = [
        (cita_ids[0], producto_ids[0], "Shampoo usado en lavado pre-corte"),
        (cita_ids[5], producto_ids[8], "Esmalte semipermanente aplicado"),
        (cita_ids[5], producto_ids[12], "Aceite para cutículas post-manicure"),
        (cita_ids[8], producto_ids[0], "Shampoo + Acondicionador en Pack Completo"),
    ]
    for h in hist:
        cur.execute(
            "INSERT INTO historial_productos_usados (hpu_cita_id, hpu_producto_id, hpu_notas) VALUES (%s,%s,%s)",
            h
        )
    db.commit()
    print(f"   ✅ {len(hist)} registros de historial creados")

    # ═══════════════════════════════════════════════════
    # 17. SERVICIOS_PRODUCTOS
    # ═══════════════════════════════════════════════════
    print("\n🔗 Vinculando servicios con productos...")
    serv_prod = [
        # Cortes → Shampoo + Acondicionador
        *[(servicio_ids[i], producto_ids[0], 1) for i in range(6)],   # 0-5: Cortes
        *[(servicio_ids[i], producto_ids[1], 1) for i in range(6)],
        # Cejas → Cera Depilatoria (prod 15)
        *[(servicio_ids[i], producto_ids[15], 1) for i in range(6, 9)],  # 6-8: Cejas
        # Pestañas → Aceite + Limas (prod 12, 17)
        *[(servicio_ids[i], producto_ids[12], 1) for i in range(9, 12)], # 9-11: Pestañas
        *[(servicio_ids[i], producto_ids[17], 1) for i in range(9, 12)],
        # Manicure Clásico (12) → Esmalte Rojo + Aceite + Limas
        (servicio_ids[12], producto_ids[8], 1),
        (servicio_ids[12], producto_ids[12], 1),
        (servicio_ids[12], producto_ids[17], 1),
        # Uñas Acrílicas, en Gel, Polygel (13-15) → Base Coat + Top Coat + Aceite + Limas
        *[(servicio_ids[i], producto_ids[10], 1) for i in range(13, 16)],
        *[(servicio_ids[i], producto_ids[11], 1) for i in range(13, 16)],
        *[(servicio_ids[i], producto_ids[12], 1) for i in range(13, 16)],
        *[(servicio_ids[i], producto_ids[17], 1) for i in range(13, 16)],
        # Uñas Press On (16) → Base Coat + Aceite
        (servicio_ids[16], producto_ids[10], 1),
        (servicio_ids[16], producto_ids[12], 1),
        # Pack Completo (17) → Shampoo + Acondicionador + Mascarilla
        (servicio_ids[17], producto_ids[0], 1),
        (servicio_ids[17], producto_ids[1], 1),
        (servicio_ids[17], producto_ids[13], 1),
        # Pack Novia (18) → Shampoo + Acondicionador + Mascarilla + Esmalte + Aceite + Brocha + Paleta
        (servicio_ids[18], producto_ids[0], 1),
        (servicio_ids[18], producto_ids[1], 1),
        (servicio_ids[18], producto_ids[13], 1),
        (servicio_ids[18], producto_ids[8], 1),
        (servicio_ids[18], producto_ids[12], 1),
        (servicio_ids[18], producto_ids[18], 1),
        (servicio_ids[18], producto_ids[19], 1),
        # Pack Relax (19) → Aceite + Guantes + Esmalte + Sérum
        (servicio_ids[19], producto_ids[12], 2),
        (servicio_ids[19], producto_ids[16], 1),
        (servicio_ids[19], producto_ids[8], 1),
        (servicio_ids[19], producto_ids[14], 1),
        # Pack Express (20) → Shampoo + Acondicionador + Cera
        (servicio_ids[20], producto_ids[0], 1),
        (servicio_ids[20], producto_ids[1], 1),
        (servicio_ids[20], producto_ids[15], 1),
        # Masajes (21-23) → Aceite + Guantes
        *[(servicio_ids[i], producto_ids[12], 2) for i in range(21, 24)],
        *[(servicio_ids[i], producto_ids[16], 1) for i in range(21, 24)],
        # Coloración Permanente (24) → Tinte Castaño + Decolorante + Agua 20Vol + Guantes
        (servicio_ids[24], producto_ids[2], 1),
        (servicio_ids[24], producto_ids[5], 1),
        (servicio_ids[24], producto_ids[6], 1),
        (servicio_ids[24], producto_ids[16], 1),
        # Coloración Semipermanente (25) → Tinte Rubio + Decolorante + Agua 20Vol + Guantes
        (servicio_ids[25], producto_ids[3], 1),
        (servicio_ids[25], producto_ids[5], 1),
        (servicio_ids[25], producto_ids[6], 1),
        (servicio_ids[25], producto_ids[16], 1),
        # Coloración Temporal (26) → Tinte Rojo + Decolorante + Agua 20Vol + Guantes
        (servicio_ids[26], producto_ids[4], 1),
        (servicio_ids[26], producto_ids[5], 1),
        (servicio_ids[26], producto_ids[6], 1),
        (servicio_ids[26], producto_ids[16], 1),
        # Balayage (27) → Decolorante + Agua 30Vol + Guantes
        (servicio_ids[27], producto_ids[5], 1),
        (servicio_ids[27], producto_ids[7], 1),
        (servicio_ids[27], producto_ids[16], 1),
        # Ombré (28) → Decolorante + Agua 30Vol + Guantes
        (servicio_ids[28], producto_ids[5], 1),
        (servicio_ids[28], producto_ids[7], 1),
        (servicio_ids[28], producto_ids[16], 1),
        # Fantasía (29) → Tinte Castaño + Decolorante + Agua 30Vol + Guantes
        (servicio_ids[29], producto_ids[2], 1),
        (servicio_ids[29], producto_ids[5], 1),
        (servicio_ids[29], producto_ids[7], 1),
        (servicio_ids[29], producto_ids[16], 1),
    ]
    for sp in serv_prod:
        cur.execute(
            "INSERT INTO servicios_productos (sep_servicio_id, sep_producto_id, sep_cantidad) VALUES (%s,%s,%s)",
            sp
        )
    db.commit()
    print(f"   ✅ {len(serv_prod)} vínculos servicio-producto creados")

    db.close()
    print("\n" + "=" * 60)
    print("🎉 DATOS DE PRUEBA INSERTADOS EXITOSAMENTE")
    print("=" * 60)
    print(f"""
    Resumen:
      👤 4 usuarios          (password: 123456)
      👥 10 clientes
      💇 30 servicios          (6 coloración, 3 masajes nuevos)
      📦 20 productos        (3 con bajo stock)
      🚚 5 proveedores       (15 vínculos con productos)
      📅 10 citas            (varios estados y fechas)
      🧾 7 facturas          (5 pagadas, 1 pendiente)
      💳 6 pagos             (efectivo, tarjeta, transferencia)
      🛒 4 compras           (a distintos proveedores)
      💰 2 cortes de caja    (1 abierto HOY)
      📊 5 movimientos inv.
      📝 4 historiales prod.
      🔗 83 servicios-prod.

    Usuario admin: admin / 123456
    """)

if __name__ == "__main__":
    with app.app_context():
        seed()
