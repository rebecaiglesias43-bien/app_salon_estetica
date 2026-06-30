/*
SQLyog Ultimate
MySQL - 10.4.32-MariaDB : Database - sistema_estetica
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
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `citas` */

insert  into `citas`(`cit_id`,`cit_cliente_id`,`cit_fecha`,`cit_hora`,`cit_estado`) values 
(21,23,'2026-05-31','09:00:00','completada'),
(22,24,'2026-06-01','10:00:00','completada'),
(23,25,'2026-06-01','11:00:00','completada'),
(24,26,'2026-06-03','14:00:00','pendiente'),
(25,27,'2026-06-03','15:00:00','confirmada'),
(26,28,'2026-06-04','16:00:00','completada'),
(27,29,'2026-06-05','09:30:00','pendiente'),
(28,30,'2026-06-05','10:30:00','cancelada'),
(29,31,'2026-06-06','11:30:00','completada'),
(30,32,'2026-06-06','14:30:00','pendiente'),
(31,34,'2026-06-10','15:00:00','completada'),
(32,36,'2026-06-16','17:00:00','completada'),
(33,37,'2026-06-10','17:34:00','aprobada'),
(34,38,'2026-06-10','17:06:00','aprobada'),
(35,39,'2026-06-09','01:21:00','aprobada'),
(36,23,'2026-06-08','09:30:00','aprobada'),
(37,24,'2026-06-08','11:00:00','pendiente'),
(38,40,'2026-06-08','14:30:00','aprobada');

/*Table structure for table `clientes` */

DROP TABLE IF EXISTS `clientes`;

CREATE TABLE `clientes` (
  `cli_nombre` varchar(50) DEFAULT NULL,
  `cli_id` int(11) NOT NULL AUTO_INCREMENT,
  `cli_apellido` varchar(50) DEFAULT NULL,
  `cli_telefono` varchar(20) DEFAULT NULL,
  `cli_direccion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`cli_id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `clientes` */

insert  into `clientes`(`cli_nombre`,`cli_id`,`cli_apellido`,`cli_telefono`,`cli_direccion`) values 
('María',23,'González','3001112233','Cra 45 #22-10, Medellín'),
('Carlos',24,'Ramírez','3002223344','Calle 80 #30-15, Bogotá'),
('Ana',25,'Martínez','3003334455','Av. 68 #45-20, Bogotá'),
('Pedro',26,'López','3004445566','Cra 50 #10-05, Medellín'),
('Laura',27,'Hernández','3005556677','Calle 10 #20-30, Cali'),
('Diego',28,'Torres','3006667788','Cra 7 #72-41, Bogotá'),
('Sofía',29,'Díaz','3007778899','Calle 93 #15-20, Bogotá'),
('Andrés',30,'Morales','3008889900','Cra 43A #1-50, Medellín'),
('Valentina',31,'Ríos','3009990011','Av. Roosevelt #30-10, Cali'),
('Jorge',32,'Castro','3001113344','Calle 26 #50-40, Bogotá'),
('Rebeca Iglesias',33,'','3244415798',''),
('yaneth iglesias',34,NULL,'32123569854',''),
('mercedez',35,'','3156487844',''),
('zaira perez',36,NULL,'3265478945',''),
('paula ',37,'soto','3569875455',''),
('isabella',38,'castro','3124658797',''),
('raquel ',39,'reyes','3142569874',''),
('Ana Laura',40,'','3005558899','');

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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `compras` */

insert  into `compras`(`com_id`,`com_proveedor_id`,`com_fecha`,`com_total`,`com_estado`) values 
(14,29,'2026-06-06 20:59:22',8400.00,'Completada'),
(15,27,'2026-06-08 14:47:36',5600.00,'Completada'),
(16,27,'2026-06-08 15:52:27',56000.00,'Completada'),
(17,29,'2026-06-08 17:26:30',17500.00,'Completada');

/*Table structure for table `cortes_caja` */

DROP TABLE IF EXISTS `cortes_caja`;

CREATE TABLE `cortes_caja` (
  `cor_id` int(11) NOT NULL AUTO_INCREMENT,
  `cor_fecha_apertura` datetime NOT NULL,
  `cor_fecha_cierre` datetime DEFAULT NULL,
  `cor_periodo` varchar(20) DEFAULT 'diario',
  `cor_base_inicial` decimal(10,2) NOT NULL,
  `cor_ingresos` decimal(10,2) DEFAULT 0.00,
  `cor_egresos` decimal(10,2) DEFAULT 0.00,
  `cor_ganancia_neta` decimal(10,2) DEFAULT 0.00,
  `cor_estado` varchar(20) DEFAULT 'Abierto',
  PRIMARY KEY (`cor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `cortes_caja` */

insert  into `cortes_caja`(`cor_id`,`cor_fecha_apertura`,`cor_fecha_cierre`,`cor_periodo`,`cor_base_inicial`,`cor_ingresos`,`cor_egresos`,`cor_ganancia_neta`,`cor_estado`) values 
(8,'2026-06-05 00:00:00','2026-06-05 00:00:00','diario',100000.00,153000.00,0.00,153000.00,'Cerrado'),
(9,'2026-06-06 00:00:00','2026-06-06 20:59:37','diario',100000.00,30000.00,8400.00,21600.00,'Cerrado'),
(10,'2026-06-08 14:37:58','2026-06-08 14:48:58','diario',50000.00,150000.00,5600.00,144400.00,'Cerrado'),
(11,'2026-06-08 15:13:41','2026-06-08 16:24:40','diario',50000.00,150000.00,56000.00,94000.00,'Cerrado'),
(12,'2026-06-08 16:40:31','2026-06-08 17:26:36','diario',50000.00,150000.00,17500.00,132500.00,'Cerrado'),
(13,'2026-06-08 17:27:47',NULL,'diario',50000.00,0.00,0.00,0.00,'Abierto');

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
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `detalle_citas` */

insert  into `detalle_citas`(`dci_id`,`dci_cita_id`,`dci_servicio_id`,`dci_precio`) values 
(21,21,106,25000.00),
(22,22,107,28000.00),
(23,23,110,28000.00),
(24,24,112,18000.00),
(25,25,115,35000.00),
(26,26,118,15000.00),
(27,26,116,45000.00),
(28,27,124,95000.00),
(29,29,123,65000.00),
(30,30,126,38000.00),
(31,31,119,50000.00),
(32,32,117,40000.00),
(33,33,111,22000.00),
(34,34,124,95000.00),
(35,35,123,65000.00),
(36,36,106,25000.00),
(37,37,107,28000.00),
(38,37,110,28000.00),
(39,38,119,50000.00);

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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `detalle_compras` */

insert  into `detalle_compras`(`dco_id`,`dco_compra_id`,`dco_producto_id`,`dco_cantidad`,`dco_precio_unitario`,`dco_subtotal`) values 
(32,14,101,1,8400.00,8400.00),
(33,15,110,1,5600.00,5600.00),
(34,16,110,10,5600.00,56000.00),
(35,17,98,1,17500.00,17500.00);

/*Table structure for table `detalle_facturas` */

DROP TABLE IF EXISTS `detalle_facturas`;

CREATE TABLE `detalle_facturas` (
  `dfa_id` int(11) NOT NULL AUTO_INCREMENT,
  `dfa_factura_id` int(11) DEFAULT NULL,
  `dfa_servicio_id` int(11) DEFAULT NULL,
  `dfa_producto_id` int(11) DEFAULT NULL,
  `dfa_cantidad` int(11) DEFAULT 1,
  `dfa_subtotal` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`dfa_id`),
  KEY `dfa_factura_id` (`dfa_factura_id`),
  KEY `dfa_servicio_id` (`dfa_servicio_id`),
  KEY `dfa_producto_id` (`dfa_producto_id`),
  CONSTRAINT `detalle_facturas_ibfk_1` FOREIGN KEY (`dfa_factura_id`) REFERENCES `facturas` (`fac_id`),
  CONSTRAINT `detalle_facturas_ibfk_2` FOREIGN KEY (`dfa_servicio_id`) REFERENCES `servicios` (`ser_id`),
  CONSTRAINT `detalle_facturas_ibfk_3` FOREIGN KEY (`dfa_producto_id`) REFERENCES `productos` (`pro_id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `detalle_facturas` */

insert  into `detalle_facturas`(`dfa_id`,`dfa_factura_id`,`dfa_servicio_id`,`dfa_producto_id`,`dfa_cantidad`,`dfa_subtotal`) values 
(28,25,118,NULL,1,15000.00),
(29,26,118,NULL,1,15000.00),
(30,27,119,NULL,1,50000.00),
(31,28,124,NULL,1,95000.00),
(32,29,121,NULL,1,55000.00),
(33,30,117,NULL,1,40000.00);

/*Table structure for table `facturas` */

DROP TABLE IF EXISTS `facturas`;

CREATE TABLE `facturas` (
  `fac_id` int(11) NOT NULL AUTO_INCREMENT,
  `fac_cita_id` int(11) DEFAULT NULL,
  `fac_cliente_id` int(11) DEFAULT NULL,
  `fac_fecha` date DEFAULT NULL,
  `fac_total` decimal(10,2) DEFAULT NULL,
  `fac_estado` varchar(20) DEFAULT NULL,
  `fac_corte_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`fac_id`),
  KEY `fac_cita_id` (`fac_cita_id`),
  KEY `fac_cliente_id` (`fac_cliente_id`),
  KEY `fac_corte_id` (`fac_corte_id`),
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`fac_cita_id`) REFERENCES `citas` (`cit_id`),
  CONSTRAINT `facturas_ibfk_2` FOREIGN KEY (`fac_cliente_id`) REFERENCES `clientes` (`cli_id`),
  CONSTRAINT `facturas_ibfk_3` FOREIGN KEY (`fac_corte_id`) REFERENCES `cortes_caja` (`cor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `facturas` */

insert  into `facturas`(`fac_id`,`fac_cita_id`,`fac_cliente_id`,`fac_fecha`,`fac_total`,`fac_estado`) values 
(25,NULL,33,'2026-06-06',15000.00,'pagado'),
(26,NULL,33,'2026-06-06',15000.00,'pagado'),
(27,31,NULL,'2026-06-08',50000.00,'pendiente'),
(28,NULL,35,'2026-06-08',95000.00,'pagado'),
(29,NULL,27,'2026-06-08',55000.00,'pagado'),
(30,32,NULL,'2026-06-08',40000.00,'pendiente');

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `historial_productos_usados` */

insert  into `historial_productos_usados`(`hpu_id`,`hpu_cita_id`,`hpu_producto_id`,`hpu_notas`) values 
(9,21,93,'Shampoo usado en lavado pre-corte'),
(10,26,101,'Esmalte semipermanente aplicado'),
(11,26,105,'Aceite para cutículas post-manicure'),
(12,29,93,'Shampoo + Acondicionador en Pack Completo');

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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `inventario_movimientos` */

insert  into `inventario_movimientos`(`inm_id`,`inm_producto_id`,`inm_tipo`,`inm_cantidad`,`inm_fecha`,`inm_motivo`) values 
(11,93,'Salida',1,'2026-06-03','Uso en servicio — Corte Pixie'),
(12,101,'Salida',2,'2026-06-04','Uso en servicio — Manicure'),
(13,93,'Entrada',5,'2026-05-27','Compra a proveedor'),
(14,95,'Salida',1,'2026-06-05','Uso en servicio — Coloración'),
(15,94,'Salida',1,'2026-06-06','Uso en servicio — Pack Completo');

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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `productos` */

insert  into `productos`(`pro_id`,`pro_nombre`,`pro_precio`,`pro_stock`,`pro_estado`) values 
(93,'Shampoo Reparador 500ml',32000.00,2,'activo'),
(94,'Acondicionador Hidratante 500ml',28000.00,2,'activo'),
(95,'Tinte Castaño Oscuro #3',15000.00,3,'activo'),
(96,'Tinte Rubio Claro #8',15000.00,2,'activo'),
(97,'Tinte Rojo Cobrizo #6.4',15000.00,1,'activo'),
(98,'Decolorante en Polvo 200g',18000.00,1,'activo'),
(99,'Agua Oxigenada 20 Vol. 500ml',10000.00,2,'activo'),
(100,'Agua Oxigenada 30 Vol. 500ml',10000.00,1,'activo'),
(101,'Esmalte Rojo Clásico',10000.00,3,'activo'),
(102,'Esmalte Nude Natural',10000.00,2,'activo'),
(103,'Base Coat para Uñas 10ml',18000.00,1,'activo'),
(104,'Top Coat Brillante 10ml',18000.00,1,'activo'),
(105,'Aceite para Cutículas 30ml',12000.00,2,'activo'),
(106,'Mascarilla Capilar Hidratante 200g',22000.00,1,'activo'),
(107,'Sérum Reparador de Puntas 50ml',28000.00,1,'activo'),
(108,'Cera Depilatoria Tibia 200g',15000.00,1,'activo'),
(109,'Caja de Guantes Desechables x50',12000.00,2,'activo'),
(110,'Paquete de Limas para Uñas x10',6000.00,3,'activo'),
(111,'Alcohol Antiséptico 500ml',8000.00,2,'activo'),
(112,'Algodón en Rollo 500g',10000.00,2,'activo');

/*Table structure for table `proveedores` */

DROP TABLE IF EXISTS `proveedores`;

CREATE TABLE `proveedores` (
  `prv_id` int(11) NOT NULL AUTO_INCREMENT,
  `prv_nombre` varchar(100) DEFAULT NULL,
  `prv_telefono` varchar(20) DEFAULT NULL,
  `prv_email` varchar(100) DEFAULT NULL,
  `prv_direccion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`prv_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `proveedores` */

insert  into `proveedores`(`prv_id`,`prv_nombre`,`prv_telefono`,`prv_email`,`prv_direccion`) values 
(27,'Belleza y Más — Tienda de Barrio','3001112233','bellezaymas@gmail.com','Cra 7 #45-20, Local 3, Centro'),
(28,'Distribuidora La Económica','3102223344','laeconomica@hotmail.com','Calle 12 #8-45, Barrio Sur'),
(29,'Mundo Uñas y Cabello','3153334455','mundounas@gmail.com','Av. Principal #15-30, Local 1'),
(30,'Catálogo de Ana Bel','3204445566','anabelcatalogo@gmail.com','Cra 5 #22-15, Barrio Centro'),
(31,'Variedades El Toque','3185556677','eltoque@outlook.com','Calle 8 #10-20, Local 2');

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
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `proveedores_productos` */

insert  into `proveedores_productos`(`ppr_id`,`ppr_proveedor_id`,`ppr_producto_id`,`ppr_precio`) values 
(115,27,93,28000.00),
(116,27,94,24000.00),
(117,27,112,8000.00),
(118,28,95,12000.00),
(119,28,96,12000.00),
(120,28,97,12000.00),
(121,28,98,14000.00),
(122,29,101,7000.00),
(123,29,102,7000.00),
(124,29,103,14000.00),
(125,29,104,14000.00),
(126,29,106,18000.00),
(127,29,107,22000.00),
(128,30,99,7000.00),
(129,30,100,7000.00),
(130,30,105,9000.00),
(131,30,108,11000.00),
(132,31,109,8000.00),
(133,31,110,4000.00),
(134,31,111,5000.00);

/*Table structure for table `servicios` */

DROP TABLE IF EXISTS `servicios`;

CREATE TABLE `servicios` (
  `ser_id` int(11) NOT NULL AUTO_INCREMENT,
  `ser_nombre` varchar(100) DEFAULT NULL,
  `ser_descripcion` text DEFAULT NULL,
  `ser_precio` decimal(10,2) DEFAULT NULL,
  `ser_duracion` int(11) DEFAULT NULL,
  PRIMARY KEY (`ser_id`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `servicios` */

insert  into `servicios`(`ser_id`,`ser_nombre`,`ser_descripcion`,`ser_precio`,`ser_duracion`) values 
(106,'Corte Pixie','Corto y moderno, ideal para resaltar facciones y pómulos',25000.00,30),
(107,'Corte Bob','Clásico a la altura de la mandíbula, elegante y versátil',28000.00,30),
(108,'Corte en V','Caída en pico con capas laterales que aportan volumen',30000.00,45),
(109,'Corte Degradado','Transición progresiva de largo con acabado texturizado',32000.00,45),
(110,'Corte en Capas','Capas escalonadas que dan movimiento y cuerpo',28000.00,30),
(111,'Corte Recto','Línea pareja y pulida, sofisticado y atemporal',22000.00,30),
(112,'Cejas Curvas','Arco natural que realza la mirada con acabado suave',18000.00,20),
(113,'Cejas Arqueadas','Elevación marcada que estiliza el rostro',20000.00,20),
(114,'Cejas Rectas','Línea recta y moderna, ideal para rostros alargados',18000.00,20),
(115,'Pestañas Clásicas','Aplicación pestaña por pestaña, look natural',35000.00,45),
(116,'Pestañas Volumen','Volumen ruso con extensiones múltiples',45000.00,60),
(117,'Pestañas Efecto Rímel','Look maquillado sin maquillaje',40000.00,45),
(118,'Manicure Clásico','Esmaltado tradicional con cuidado de cutículas',15000.00,30),
(119,'Uñas Acrílicas','Esculpidas con acrílico de alta duración',50000.00,60),
(120,'Uñas en Gel','Esmaltado semipermanente brillante y duradero',45000.00,45),
(121,'Uñas Polygel','Ligeras, resistentes y naturales',55000.00,60),
(122,'Uñas Press On','Personalizadas listas para colocar',35000.00,30),
(123,'Pack Completo','Corte + Coloración + Peinado profesional',65000.00,120),
(124,'Pack Novia','Maquillaje + Peinado + Manicure gel + Pedicure spa',95000.00,180),
(125,'Pack Relax','Masaje + Manicure spa + Pedicure spa + Mascarilla',72000.00,150),
(126,'Pack Express','Corte + Blower + Cejas + Café incluido',38000.00,60);

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
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `servicios_productos` */

insert  into `servicios_productos`(`sep_id`,`sep_servicio_id`,`sep_producto_id`,`sep_cantidad`) values 
(37,106,93,1),
(38,106,94,1),
(39,118,101,1),
(40,118,105,1),
(41,123,93,1),
(42,123,94,1),
(43,123,106,1);

/*Table structure for table `usuarios` */

DROP TABLE IF EXISTS `usuarios`;

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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `usuarios` */

insert  into `usuarios`(`usu_id`,`usu_username`,`usu_password`,`usu_email`,`usu_estado`) values 
(20,'admin','$2b$12$7NN.1BgroBx.p9Ji3EPEyuJGTMwZ5ealWRCL0hF609CbZLJKk.1dq','admin@elizastyles.com','activo'),
(21,'cliente1','$2b$12$7NN.1BgroBx.p9Ji3EPEyuJGTMwZ5ealWRCL0hF609CbZLJKk.1dq','cliente1@email.com','activo'),
(22,'estilista1','$2b$12$7NN.1BgroBx.p9Ji3EPEyuJGTMwZ5ealWRCL0hF609CbZLJKk.1dq','estilista1@elizastyles.com','activo'),
(23,'cajera1','$2b$12$7NN.1BgroBx.p9Ji3EPEyuJGTMwZ5ealWRCL0hF609CbZLJKk.1dq','cajera1@elizastyles.com','activo');

/*Table structure for table `refresh_tokens` */

DROP TABLE IF EXISTS `refresh_tokens`;

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

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
