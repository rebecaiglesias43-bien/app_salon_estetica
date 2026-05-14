/*
SQLyog Ultimate v13.1.1 (64 bit)
MySQL - 12.1.2-MariaDB : Database - sistema_estetica
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`sistema_estetica` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `sistema_estetica`;

/*Table structure for table `citas` */

DROP TABLE IF EXISTS `citas`;

CREATE TABLE `citas` (
  `cit_id` int(11) NOT NULL AUTO_INCREMENT,
  `cit_cliente_id` int(11) DEFAULT NULL,
  `cit_fecha` date DEFAULT NULL,
  `cit_hora` time DEFAULT NULL,
  `cit_estado` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`cit_id`),
  KEY `cit_cliente_id` (`cit_cliente_id`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`cit_cliente_id`) REFERENCES `clientes` (`cli_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `citas` */

insert  into `citas`(`cit_id`,`cit_cliente_id`,`cit_fecha`,`cit_hora`,`cit_estado`) values 
(1,1,'2026-04-01','10:00:00','pendiente');

/*Table structure for table `clientes` */

DROP TABLE IF EXISTS `clientes`;

CREATE TABLE `clientes` (
  `cli_nombre` varchar(50) DEFAULT NULL,
  `cli_id` int(11) NOT NULL AUTO_INCREMENT,
  `cli_apellido` varchar(50) DEFAULT NULL,
  `cli_telefono` varchar(20) DEFAULT NULL,
  `cli_direccion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`cli_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `clientes` */

insert  into `clientes`(`cli_nombre`,`cli_id`,`cli_apellido`,`cli_telefono`,`cli_direccion`) values 
('Juan',1,'Perez','3009876543','Calle 123');

/*Table structure for table `compras` */

DROP TABLE IF EXISTS `compras`;

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

/*Data for the table `compras` */

/*Table structure for table `cortes_caja` */

DROP TABLE IF EXISTS `cortes_caja`;

CREATE TABLE `cortes_caja` (
  `cor_id` int(11) NOT NULL AUTO_INCREMENT,
  `cor_fecha_apertura` datetime NOT NULL,
  `cor_fecha_cierre` datetime DEFAULT NULL,
  `cor_base_inicial` decimal(10,2) NOT NULL,
  `cor_ingresos` decimal(10,2) DEFAULT 0.00,
  `cor_egresos` decimal(10,2) DEFAULT 0.00,
  `cor_ganancia_neta` decimal(10,2) DEFAULT 0.00,
  `cor_estado` varchar(20) DEFAULT 'Abierto',
  PRIMARY KEY (`cor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `cortes_caja` */

/*Table structure for table `detalle_citas` */

DROP TABLE IF EXISTS `detalle_citas`;

CREATE TABLE `detalle_citas` (
  `dci_id` int(11) NOT NULL AUTO_INCREMENT,
  `dci_cita_id` int(11) DEFAULT NULL,
  `dci_servicio_id` int(11) DEFAULT NULL,
  `dci_precio` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`dci_id`),
  KEY `dci_cita_id` (`dci_cita_id`),
  KEY `dci_servicio_id` (`dci_servicio_id`),
  CONSTRAINT `detalle_citas_ibfk_1` FOREIGN KEY (`dci_cita_id`) REFERENCES `citas` (`cit_id`),
  CONSTRAINT `detalle_citas_ibfk_2` FOREIGN KEY (`dci_servicio_id`) REFERENCES `servicios` (`ser_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `detalle_citas` */

/*Table structure for table `detalle_compras` */

DROP TABLE IF EXISTS `detalle_compras`;

CREATE TABLE `detalle_compras` (
  `dco_id` int(11) NOT NULL AUTO_INCREMENT,
  `dco_compra_id` int(11) DEFAULT NULL,
  `dco_producto_id` int(11) DEFAULT NULL,
  `dco_cantidad` int(11) NOT NULL,
  `dco_precio_unitario` decimal(10,2) NOT NULL,
  `dco_subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`dco_id`),
  KEY `dco_compra_id` (`dco_compra_id`),
  KEY `dco_producto_id` (`dco_producto_id`),
  CONSTRAINT `detalle_compras_ibfk_1` FOREIGN KEY (`dco_compra_id`) REFERENCES `compras` (`com_id`),
  CONSTRAINT `detalle_compras_ibfk_2` FOREIGN KEY (`dco_producto_id`) REFERENCES `productos` (`pro_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `detalle_compras` */

/*Table structure for table `detalle_facturas` */

DROP TABLE IF EXISTS `detalle_facturas`;

CREATE TABLE `detalle_facturas` (
  `dfa_id` int(11) NOT NULL AUTO_INCREMENT,
  `dfa_factura_id` int(11) DEFAULT NULL,
  `dfa_servicio_id` int(11) DEFAULT NULL,
  `dfa_subtotal` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`dfa_id`),
  KEY `dfa_factura_id` (`dfa_factura_id`),
  KEY `dfa_servicio_id` (`dfa_servicio_id`),
  CONSTRAINT `detalle_facturas_ibfk_1` FOREIGN KEY (`dfa_factura_id`) REFERENCES `facturas` (`fac_id`),
  CONSTRAINT `detalle_facturas_ibfk_2` FOREIGN KEY (`dfa_servicio_id`) REFERENCES `servicios` (`ser_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `detalle_facturas` */

/*Table structure for table `facturas` */

DROP TABLE IF EXISTS `facturas`;

CREATE TABLE `facturas` (
  `fac_id` int(11) NOT NULL AUTO_INCREMENT,
  `fac_cita_id` int(11) DEFAULT NULL,
  `fac_fecha` date DEFAULT NULL,
  `fac_total` decimal(10,2) DEFAULT NULL,
  `fac_estado` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`fac_id`),
  KEY `fac_cita_id` (`fac_cita_id`),
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`fac_cita_id`) REFERENCES `citas` (`cit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `facturas` */

insert  into `facturas`(`fac_id`,`fac_cita_id`,`fac_fecha`,`fac_total`,`fac_estado`) values 
(1,1,'2026-04-01',20000.00,'pagado');

/*Table structure for table `historial_productos_usados` */

DROP TABLE IF EXISTS `historial_productos_usados`;

CREATE TABLE `historial_productos_usados` (
  `hpu_id` int(11) NOT NULL AUTO_INCREMENT,
  `hpu_cita_id` int(11) NOT NULL,
  `hpu_producto_id` int(11) NOT NULL,
  `hpu_notas` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`hpu_id`),
  KEY `hpu_cita_id` (`hpu_cita_id`),
  KEY `hpu_producto_id` (`hpu_producto_id`),
  CONSTRAINT `1` FOREIGN KEY (`hpu_cita_id`) REFERENCES `citas` (`cit_id`),
  CONSTRAINT `2` FOREIGN KEY (`hpu_producto_id`) REFERENCES `productos` (`pro_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `historial_productos_usados` */

/*Table structure for table `inventario_movimientos` */

DROP TABLE IF EXISTS `inventario_movimientos`;

CREATE TABLE `inventario_movimientos` (
  `inm_id` int(11) NOT NULL AUTO_INCREMENT,
  `inm_producto_id` int(11) DEFAULT NULL,
  `inm_tipo` varchar(20) DEFAULT NULL,
  `inm_cantidad` int(11) DEFAULT NULL,
  `inm_fecha` date DEFAULT NULL,
  `inm_motivo` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`inm_id`),
  KEY `inm_producto_id` (`inm_producto_id`),
  CONSTRAINT `inventario_movimientos_ibfk_1` FOREIGN KEY (`inm_producto_id`) REFERENCES `productos` (`pro_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `inventario_movimientos` */

insert  into `inventario_movimientos`(`inm_id`,`inm_producto_id`,`inm_tipo`,`inm_cantidad`,`inm_fecha`,`inm_motivo`) values 
(1,1,'Salida',1,'2026-05-13','Uso en sala / Producto terminado');

/*Table structure for table `pagos` */

DROP TABLE IF EXISTS `pagos`;

CREATE TABLE `pagos` (
  `pag_id` int(11) NOT NULL AUTO_INCREMENT,
  `pag_factura_id` int(11) DEFAULT NULL,
  `pag_metodo` varchar(50) DEFAULT NULL,
  `pag_fecha` date DEFAULT NULL,
  `pag_monto` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`pag_id`),
  KEY `pag_factura_id` (`pag_factura_id`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`pag_factura_id`) REFERENCES `facturas` (`fac_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `pagos` */

/*Table structure for table `productos` */

DROP TABLE IF EXISTS `productos`;

CREATE TABLE `productos` (
  `pro_id` int(11) NOT NULL AUTO_INCREMENT,
  `pro_nombre` varchar(100) DEFAULT NULL,
  `pro_precio` decimal(10,2) DEFAULT NULL,
  `pro_stock` int(11) DEFAULT NULL,
  `pro_estado` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`pro_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `productos` */

insert  into `productos`(`pro_id`,`pro_nombre`,`pro_precio`,`pro_stock`,`pro_estado`) values 
(1,'Shampoo',10000.00,49,'activo'),
(2,'Esmalte',5000.00,100,'activo');

/*Table structure for table `proveedores` */

DROP TABLE IF EXISTS `proveedores`;

CREATE TABLE `proveedores` (
  `prv_id` int(11) NOT NULL AUTO_INCREMENT,
  `prv_nombre` varchar(100) DEFAULT NULL,
  `prv_telefono` varchar(20) DEFAULT NULL,
  `prv_email` varchar(100) DEFAULT NULL,
  `prv_direccion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`prv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `proveedores` */

/*Table structure for table `proveedores_productos` */

DROP TABLE IF EXISTS `proveedores_productos`;

CREATE TABLE `proveedores_productos` (
  `ppr_id` int(11) NOT NULL AUTO_INCREMENT,
  `ppr_proveedor_id` int(11) DEFAULT NULL,
  `ppr_producto_id` int(11) DEFAULT NULL,
  `ppr_precio` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`ppr_id`),
  KEY `ppr_proveedor_id` (`ppr_proveedor_id`),
  KEY `ppr_producto_id` (`ppr_producto_id`),
  CONSTRAINT `proveedores_productos_ibfk_1` FOREIGN KEY (`ppr_proveedor_id`) REFERENCES `proveedores` (`prv_id`),
  CONSTRAINT `proveedores_productos_ibfk_2` FOREIGN KEY (`ppr_producto_id`) REFERENCES `productos` (`pro_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `proveedores_productos` */

/*Table structure for table `servicios` */

DROP TABLE IF EXISTS `servicios`;

CREATE TABLE `servicios` (
  `ser_id` int(11) NOT NULL AUTO_INCREMENT,
  `ser_nombre` varchar(100) DEFAULT NULL,
  `ser_descripcion` text DEFAULT NULL,
  `ser_precio` decimal(10,2) DEFAULT NULL,
  `ser_duracion` int(11) DEFAULT NULL,
  PRIMARY KEY (`ser_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `servicios` */

insert  into `servicios`(`ser_id`,`ser_nombre`,`ser_descripcion`,`ser_precio`,`ser_duracion`) values 
(1,'Corte de cabello','Corte basico',20000.00,30),
(2,'Manicure','Servicio de unas',15000.00,45);

/*Table structure for table `servicios_productos` */

DROP TABLE IF EXISTS `servicios_productos`;

CREATE TABLE `servicios_productos` (
  `sep_id` int(11) NOT NULL AUTO_INCREMENT,
  `sep_servicio_id` int(11) DEFAULT NULL,
  `sep_producto_id` int(11) DEFAULT NULL,
  `sep_cantidad` int(11) DEFAULT NULL,
  PRIMARY KEY (`sep_id`),
  KEY `sep_servicio_id` (`sep_servicio_id`),
  KEY `sep_producto_id` (`sep_producto_id`),
  CONSTRAINT `servicios_productos_ibfk_1` FOREIGN KEY (`sep_servicio_id`) REFERENCES `servicios` (`ser_id`),
  CONSTRAINT `servicios_productos_ibfk_2` FOREIGN KEY (`sep_producto_id`) REFERENCES `productos` (`pro_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `servicios_productos` */

/*Table structure for table `usuarios` */

DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE `usuarios` (
  `usu_id` int(11) NOT NULL AUTO_INCREMENT,
  `usu_username` varchar(50) NOT NULL,
  `usu_password` varchar(255) NOT NULL,
  `usu_email` varchar(100) DEFAULT NULL,
  `usu_estado` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`usu_id`),
  UNIQUE KEY `usu_username` (`usu_username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `usuarios` */

insert  into `usuarios`(`usu_id`,`usu_username`,`usu_password`,`usu_email`,`usu_estado`) values 
(1,'admin','123456','admin@test.com','activo'),
(2,'cliente1','123456','cliente@test.com','activo');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
