CREATE DATABASE IF NOT EXISTS db_lab10
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE db_lab10;

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos de ejemplo para probar el endpoint GET
INSERT INTO productos (nombre, descripcion, precio, stock) VALUES
('Teclado', 'Teclado USB de uso general', 45.90, 15),
('Mouse', 'Mouse óptico USB', 25.50, 20),
('Monitor', 'Monitor LED de 24 pulgadas', 520.00, 8);