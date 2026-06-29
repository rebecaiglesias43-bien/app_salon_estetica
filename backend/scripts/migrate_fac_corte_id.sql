-- Migración: Agrega fac_corte_id a facturas para vinculación con cortes de caja
-- Ejecutar:
--   mysql -u root -p sistema_estetica < backend/scripts/migrate_fac_corte_id.sql

ALTER TABLE facturas
  ADD COLUMN fac_corte_id int(11) DEFAULT NULL AFTER fac_estado,
  ADD KEY fac_corte_id (fac_corte_id),
  ADD CONSTRAINT facturas_ibfk_3 FOREIGN KEY (fac_corte_id) REFERENCES cortes_caja (cor_id);
