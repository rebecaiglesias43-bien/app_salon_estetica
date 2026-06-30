-- Schema CORRECTO con nombres de columna del SQL original
-- (los que el código Python espera: ser_, com_, prv_, pro_, etc.)

CREATE TABLE `categorias` (
  `cat_id` int(11) NOT NULL AUTO_INCREMENT,
  `cat_nombre` varchar(100) NOT NULL,
  `cat_descripcion` text DEFAULT NULL,
  `cat_estado` varchar(20) DEFAULT 'activo',
  PRIMARY KEY (`cat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `clientes` (
  `cli_id` int(11) NOT NULL AUTO_INCREMENT,
  `cli_nombre` varchar(50) DEFAULT NULL,
  `cli_apellido` varchar(50) DEFAULT NULL,
  `cli_telefono` varchar(20) DEFAULT NULL,
  `cli_direccion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`cli_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `citas` (
  `cit_id` int(11) NOT NULL AUTO_INCREMENT,
  `cit_cliente_id` int(11) DEFAULT NULL,
  `cit_fecha` date DEFAULT NULL,
  `cit_hora` time DEFAULT NULL,
  `cit_estado` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`cit_id`),
  KEY `cit_cliente_id` (`cit_cliente_id`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`cit_cliente_id`) REFERENCES `clientes` (`cli_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `servicios` (
  `ser_id` int(11) NOT NULL AUTO_INCREMENT,
  `ser_nombre` varchar(100) DEFAULT NULL,
  `ser_descripcion` text DEFAULT NULL,
  `ser_precio` decimal(10,2) DEFAULT NULL,
  `ser_duracion` int(11) DEFAULT NULL,
  `ser_categoria` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ser_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `detalle_citas` (
  `dci_id` int(11) NOT NULL AUTO_INCREMENT,
  `dci_cita_id` int(11) DEFAULT NULL,
  `dci_servicio_id` int(11) DEFAULT NULL,
  `dci_precio` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`dci_id`),
  KEY `dci_cita_id` (`dci_cita_id`),
  KEY `dci_servicio_id` (`dci_servicio_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pagos` (
  `pag_id` int(11) NOT NULL AUTO_INCREMENT,
  `pag_factura_id` int(11) DEFAULT NULL,
  `pag_monto` decimal(10,2) DEFAULT NULL,
  `pag_metodo` varchar(50) DEFAULT NULL,
  `pag_fecha` datetime DEFAULT NULL,
  PRIMARY KEY (`pag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `cortes_caja` (
  `cor_id` int(11) NOT NULL AUTO_INCREMENT,
  `cor_fecha_apertura` datetime DEFAULT NULL,
  `cor_base_inicial` decimal(10,2) DEFAULT 0.00,
  `cor_ingresos` decimal(10,2) DEFAULT 0.00,
  `cor_egresos` decimal(10,2) DEFAULT 0.00,
  `cor_ganancia_neta` decimal(10,2) DEFAULT 0.00,
  `cor_estado` varchar(20) DEFAULT 'Abierto',
  `cor_periodo` varchar(50) DEFAULT NULL,
  `cor_fecha_cierre` datetime DEFAULT NULL,
  PRIMARY KEY (`cor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `proveedores` (
  `prv_id` int(11) NOT NULL AUTO_INCREMENT,
  `prv_nombre` varchar(100) DEFAULT NULL,
  `prv_telefono` varchar(20) DEFAULT NULL,
  `prv_email` varchar(100) DEFAULT NULL,
  `prv_direccion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`prv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `productos` (
  `pro_id` int(11) NOT NULL AUTO_INCREMENT,
  `pro_nombre` varchar(100) DEFAULT NULL,
  `pro_precio` decimal(10,2) DEFAULT NULL,
  `pro_stock` int(11) DEFAULT NULL,
  `pro_estado` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`pro_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `proveedores_productos` (
  `ppr_id` int(11) NOT NULL AUTO_INCREMENT,
  `ppr_proveedor_id` int(11) DEFAULT NULL,
  `ppr_producto_id` int(11) DEFAULT NULL,
  `ppr_precio` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`ppr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `compras` (
  `com_id` int(11) NOT NULL AUTO_INCREMENT,
  `com_proveedor_id` int(11) DEFAULT NULL,
  `com_fecha` datetime NOT NULL,
  `com_total` decimal(10,2) NOT NULL,
  `com_estado` varchar(20) DEFAULT 'Completada',
  PRIMARY KEY (`com_id`),
  KEY `com_proveedor_id` (`com_proveedor_id`),
  CONSTRAINT `compras_ibfk_1` FOREIGN KEY (`com_proveedor_id`) REFERENCES `proveedores` (`prv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `detalle_compras` (
  `dco_id` int(11) NOT NULL AUTO_INCREMENT,
  `dco_compra_id` int(11) DEFAULT NULL,
  `dco_producto_id` int(11) DEFAULT NULL,
  `dco_cantidad` int(11) DEFAULT NULL,
  `dco_precio_unitario` decimal(10,2) DEFAULT NULL,
  `dco_subtotal` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`dco_id`),
  KEY `dco_compra_id` (`dco_compra_id`),
  KEY `dco_producto_id` (`dco_producto_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `facturas` (
  `fac_id` int(11) NOT NULL AUTO_INCREMENT,
  `fac_cita_id` int(11) DEFAULT NULL,
  `fac_cliente_id` int(11) DEFAULT NULL,
  `fac_fecha` datetime DEFAULT NULL,
  `fac_total` decimal(10,2) DEFAULT NULL,
  `fac_estado` varchar(20) DEFAULT 'Pendiente',
  `fac_corte_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`fac_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `detalle_facturas` (
  `dfa_id` int(11) NOT NULL AUTO_INCREMENT,
  `dfa_factura_id` int(11) DEFAULT NULL,
  `dfa_servicio_id` int(11) DEFAULT NULL,
  `dfa_producto_id` int(11) DEFAULT NULL,
  `dfa_cantidad` int(11) DEFAULT NULL,
  `dfa_subtotal` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`dfa_id`),
  KEY `dfa_factura_id` (`dfa_factura_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `servicios_productos` (
  `sep_id` int(11) NOT NULL AUTO_INCREMENT,
  `sep_servicio_id` int(11) DEFAULT NULL,
  `sep_producto_id` int(11) DEFAULT NULL,
  `sep_cantidad` int(11) DEFAULT NULL,
  PRIMARY KEY (`sep_id`),
  KEY `sep_servicio_id` (`sep_servicio_id`),
  KEY `sep_producto_id` (`sep_producto_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `inventario_movimientos` (
  `inm_id` int(11) NOT NULL AUTO_INCREMENT,
  `inm_producto_id` int(11) DEFAULT NULL,
  `inm_tipo` varchar(20) DEFAULT NULL,
  `inm_cantidad` int(11) DEFAULT NULL,
  `inm_fecha` datetime DEFAULT NULL,
  `inm_motivo` varchar(255) DEFAULT NULL,
  `inm_cita_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`inm_id`),
  KEY `inm_producto_id` (`inm_producto_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `historial_productos_usados` (
  `hpu_id` int(11) NOT NULL AUTO_INCREMENT,
  `hpu_cita_id` int(11) DEFAULT NULL,
  `hpu_producto_id` int(11) DEFAULT NULL,
  `hpu_notas` text DEFAULT NULL,
  `hpu_fecha` datetime DEFAULT NULL,
  PRIMARY KEY (`hpu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `usuarios` (
  `usu_id` int(11) NOT NULL AUTO_INCREMENT,
  `usu_username` varchar(50) NOT NULL,
  `usu_password` varchar(255) NOT NULL,
  `usu_email` varchar(100) DEFAULT NULL,
  `usu_estado` varchar(20) DEFAULT NULL,
  `usu_reset_token` varchar(255) DEFAULT NULL,
  `usu_reset_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`usu_id`),
  UNIQUE KEY `usu_username` (`usu_username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `refresh_tokens` (
  `rft_id` int(11) NOT NULL AUTO_INCREMENT,
  `rft_usuario_id` int(11) NOT NULL,
  `rft_token_hash` varchar(255) NOT NULL,
  `rft_expires_at` datetime NOT NULL,
  `rft_revoked` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`rft_id`),
  KEY `rft_usuario_id` (`rft_usuario_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`rft_usuario_id`) REFERENCES `usuarios` (`usu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Usuario admin con contraseña '123456'
INSERT INTO `usuarios` (`usu_username`, `usu_password`, `usu_email`, `usu_estado`) VALUES
('admin', '$2b$12$Vv8RalHUFwxGYmxYLg6jwutiUBtt3cCrIrUw1X8pZoc.dGPWvDDfC', 'admin@elizastyles.com', 'activo');
