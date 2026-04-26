
-- Conectarse a la base
\c wifi_seguridad;

-- =========================================
-- TABLA USUARIOS
-- =========================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuario por defecto
INSERT INTO usuarios (username, password)
VALUES ('admin', '1234');

-- =========================================
-- TABLA REDES WIFI
-- =========================================
CREATE TABLE redes_wifi (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('Pública', 'Privada')),
    cifrado BOOLEAN NOT NULL,
    riesgo VARCHAR(50),
    usuario_id INT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =========================================
-- TABLA HISTORIAL DE ANÁLISIS (PRO)
-- =========================================
CREATE TABLE historial_analisis (
    id SERIAL PRIMARY KEY,
    red_id INT,
    resultado VARCHAR(50),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_red
        FOREIGN KEY (red_id)
        REFERENCES redes_wifi(id)
        ON DELETE CASCADE
);

-- =========================================
-- ÍNDICES (OPTIMIZACIÓN)
-- =========================================
CREATE INDEX idx_usuario ON redes_wifi(usuario_id);
CREATE INDEX idx_red ON historial_analisis(red_id);

-- =========================================
-- DATOS DE PRUEBA
-- =========================================
INSERT INTO redes_wifi (nombre, tipo, cifrado, riesgo, usuario_id)
VALUES
('WiFi_Cafeteria', 'Pública', false, 'ALTO RIESGO', 1),
('Casa_Moises', 'Privada', true, 'SEGURO', 1),
('Aeropuerto_Free', 'Pública', true, 'MEDIO RIESGO', 1);

-- =========================================
-- CONSULTAS ÚTILES (para pruebas)
-- =========================================

-- Ver redes
SELECT * FROM redes_wifi;

-- Ver usuarios
SELECT * FROM usuarios;

-- Ver historial
SELECT * FROM historial_analisis;