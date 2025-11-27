-- Script SQL para fusionar clientes duplicados
-- Ejecutar en Railway MySQL Database > Query
-- 
-- Este script fusiona clientes duplicados por DNI, manteniendo el cliente con más información
-- y moviendo todas las relaciones (ventas, pedidos) al cliente principal

-- PASO 1: Identificar clientes duplicados por DNI
-- Buscar clientes con DNI 72114106 y 72114108 (o cualquier otro DNI duplicado)
SELECT 
    id, 
    codigo, 
    nombre, 
    numero_documento, 
    activo,
    email,
    telefono,
    direccion,
    (SELECT COUNT(*) FROM ventas WHERE ventas.cliente_id = clientes.id) as ventas_count,
    (SELECT COUNT(*) FROM pedidos WHERE pedidos.cliente_id = clientes.id) as pedidos_count
FROM clientes 
WHERE numero_documento IN ('72114106', '72114108')
ORDER BY id;

-- PASO 2: Decidir cuál cliente mantener (generalmente el que tiene más información o más relaciones)
-- En este caso, vamos a mantener el cliente con ID más bajo y mover todo al principal

-- PASO 3: Fusionar clientes - MANTENER el cliente con ID más bajo, FUSIONAR el otro
-- IMPORTANTE: Ajusta los IDs según los resultados del PASO 1

-- Ejemplo: Si tenemos cliente ID 1 (mariano el humano) e ID 2 (Jose Mariano), 
-- mantener ID 1 y mover todo de ID 2 a ID 1

SET @cliente_principal_id = 1;  -- ID del cliente a mantener (ajustar según resultados)
SET @cliente_duplicado_id = 2;  -- ID del cliente a fusionar (ajustar según resultados)

-- Verificar que existen
SELECT 
    (SELECT nombre FROM clientes WHERE id = @cliente_principal_id) as cliente_principal,
    (SELECT nombre FROM clientes WHERE id = @cliente_duplicado_id) as cliente_duplicado;

-- PASO 4: Mover ventas del cliente duplicado al principal
UPDATE ventas 
SET cliente_id = @cliente_principal_id 
WHERE cliente_id = @cliente_duplicado_id;

-- PASO 5: Mover pedidos del cliente duplicado al principal
UPDATE pedidos 
SET cliente_id = @cliente_principal_id 
WHERE cliente_id = @cliente_duplicado_id;

-- PASO 6: Mover relación ClienteUsuario si existe
UPDATE cliente_usuario 
SET cliente_id = @cliente_principal_id 
WHERE cliente_id = @cliente_duplicado_id;

-- PASO 7: Actualizar el cliente principal con la mejor información del duplicado
-- (opcional: si el duplicado tiene mejor información, actualizar el principal)
UPDATE clientes 
SET 
    nombre = COALESCE((SELECT nombre FROM clientes WHERE id = @cliente_duplicado_id AND nombre IS NOT NULL AND nombre != ''), nombre),
    email = COALESCE((SELECT email FROM clientes WHERE id = @cliente_duplicado_id AND email IS NOT NULL AND email != ''), email),
    telefono = COALESCE((SELECT telefono FROM clientes WHERE id = @cliente_duplicado_id AND telefono IS NOT NULL AND telefono != ''), telefono),
    direccion = COALESCE((SELECT direccion FROM clientes WHERE id = @cliente_duplicado_id AND direccion IS NOT NULL AND direccion != ''), direccion),
    activo = GREATEST(activo, (SELECT activo FROM clientes WHERE id = @cliente_duplicado_id))
WHERE id = @cliente_principal_id;

-- PASO 8: Eliminar el cliente duplicado (soft delete - marcarlo como inactivo)
-- O eliminar completamente si no tiene más relaciones
UPDATE clientes 
SET activo = false 
WHERE id = @cliente_duplicado_id;

-- O eliminar completamente (solo si estás seguro):
-- DELETE FROM clientes WHERE id = @cliente_duplicado_id;

-- PASO 9: Verificar que la fusión fue exitosa
SELECT 
    id, 
    codigo, 
    nombre, 
    numero_documento, 
    activo,
    (SELECT COUNT(*) FROM ventas WHERE ventas.cliente_id = clientes.id) as ventas_count,
    (SELECT COUNT(*) FROM pedidos WHERE pedidos.cliente_id = clientes.id) as pedidos_count
FROM clientes 
WHERE id = @cliente_principal_id;

-- PASO 10: Verificar que el duplicado ya no tiene relaciones
SELECT 
    id, 
    codigo, 
    nombre, 
    numero_documento, 
    activo,
    (SELECT COUNT(*) FROM ventas WHERE ventas.cliente_id = clientes.id) as ventas_count,
    (SELECT COUNT(*) FROM pedidos WHERE pedidos.cliente_id = clientes.id) as pedidos_count
FROM clientes 
WHERE id = @cliente_duplicado_id;

