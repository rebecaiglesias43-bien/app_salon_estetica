-- Migración: Ventas fix — agrega fac_cliente_id a facturas y extiende detalle_facturas
-- Ejecutar contra la base de datos existente:
--   mysql -u root -p sistema_estetica < backend/scripts/migrate_ventas_fix.sql

ALTER TABLE facturas 
  ADD COLUMN fac_cliente_id int(11) DEFAULT NULL AFTER fac_cita_id,
  ADD KEY fac_cliente_id (fac_cliente_id),
  ADD CONSTRAINT facturas_ibfk_2 FOREIGN KEY (fac_cliente_id) REFERENCES clientes (cli_id);

ALTER TABLE detalle_facturas
  ADD COLUMN dfa_producto_id int(11) DEFAULT NULL AFTER dfa_servicio_id,
  ADD COLUMN dfa_cantidad int(11) DEFAULT 1 AFTER dfa_producto_id,
  ADD KEY dfa_producto_id (dfa_producto_id),
  ADD CONSTRAINT detalle_facturas_ibfk_3 FOREIGN KEY (dfa_producto_id) REFERENCES productos (pro_id);

ALTER TABLE facturas
  ADD COLUMN fac_corte_id int(11) DEFAULT NULL AFTER fac_estado,
  ADD KEY fac_corte_id (fac_corte_id),
  ADD CONSTRAINT facturas_ibfk_3 FOREIGN KEY (fac_corte_id) REFERENCES cortes_caja (cor_id);
