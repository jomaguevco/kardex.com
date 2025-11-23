# Guía Completa: Integración de Códigos de Barras en KARDEX

## 📋 Resumen del Sistema

El sistema KARDEX ahora está completamente integrado con códigos de barras. Puedes usar escáneres de códigos de barras para registrar productos en **compras**, **ventas**, **ajustes de inventario** y **pedidos**.

## 🔄 Flujo Completo del Sistema

### 1. COMPRAS (Entrada de Mercancía)

**Proceso con código de barras:**
1. Abres el formulario de nueva compra
2. Escaneas el código de barras del producto recibido
3. El sistema busca automáticamente el producto
4. El producto se agrega a la compra con cantidad 1
5. Ajustas la cantidad recibida manualmente
6. Creas la compra con estado **PENDIENTE**
7. Cuando llega la mercancía física, marcas la compra como **PROCESADA**
8. **El stock aumenta automáticamente** y se registra en KARDEX

**Ventajas:**
- No aumenta stock hasta que marques como PROCESADA
- Puedes crear compras antes de recibir la mercancía
- Trazabilidad completa en KARDEX

### 2. VENTAS (Salida de Mercancía)

**Proceso con código de barras:**
1. Abres el formulario de nueva venta
2. Seleccionas el cliente
3. Escaneas el código de barras del producto vendido
4. El sistema busca y agrega automáticamente el producto
5. Ajustas cantidad y precio si es necesario
6. Confirmas la venta
7. **El stock disminuye automáticamente** (estado PROCESADA)
8. Se registra en KARDEX como SALIDA_VENTA

**Ventajas:**
- Stock se actualiza inmediatamente
- Validación automática de stock disponible
- Registro automático en KARDEX

### 3. AJUSTES DE INVENTARIO

**Proceso con código de barras:**
1. Abres el formulario de nuevo ajuste
2. Escaneas el código de barras del producto
3. El sistema busca y selecciona el producto
4. Seleccionas el tipo de movimiento (ENTRADA/SALIDA)
5. Ingresas la cantidad de ajuste
6. Confirmas el ajuste
7. **El stock se actualiza** según el tipo de movimiento
8. Se registra en KARDEX como AJUSTE_POSITIVO o AJUSTE_NEGATIVO

**Ventajas:**
- Ajustes rápidos con escáner
- Validación de stock para salidas
- Trazabilidad completa

### 4. PEDIDOS (Cliente)

**Proceso:**
- Los clientes pueden buscar productos por código de barras en el portal
- El sistema valida stock disponible
- Al procesar el envío, el stock disminuye

## 🛠️ Componentes Técnicos Implementados

### Backend

1. **Endpoint de búsqueda por código de barras:**
   - `GET /api/productos/by-barcode/:codigo_barras`
   - Busca producto exacto por código de barras
   - Retorna producto completo con stock

2. **Búsqueda general mejorada:**
   - `GET /api/productos?search=...` ya incluye búsqueda por código de barras

### Frontend

1. **Componente BarcodeScanner:**
   - Ubicación: `src/components/ui/BarcodeScanner.tsx`
   - Funcionalidades:
     - Input para escanear o escribir código
     - Búsqueda automática después de 500ms sin escribir
     - Búsqueda inmediata al presionar Enter
     - Feedback visual cuando encuentra producto
     - Manejo de errores

2. **Integración en formularios:**
   - ✅ Ventas: `NuevaVentaForm.tsx`
   - ✅ Compras: `NuevaCompraForm.tsx`
   - ✅ Ajustes: `AjusteInventarioForm.tsx`

## 📊 Gestión de Stock Automática

### Compras
- **PENDIENTE**: No afecta stock
- **PROCESADA**: Aumenta stock + registra en KARDEX
- **ANULADA** (si estaba PROCESADA): Revierte stock

### Ventas
- **PROCESADA**: Disminuye stock + registra en KARDEX
- **ANULADA**: Revierte stock (si estaba PROCESADA)

### Ajustes
- **ENTRADA_AJUSTE_POSITIVO**: Aumenta stock
- **SALIDA_AJUSTE_NEGATIVO**: Disminuye stock (valida disponibilidad)

## 🎯 Cómo Usar el Escáner

### Opción 1: Escáner USB/Bluetooth
1. Conecta tu escáner de códigos de barras
2. Abre cualquier formulario (venta, compra, ajuste)
3. Haz clic en el campo de escáner
4. Escanea el código de barras
5. El producto se agrega automáticamente

### Opción 2: Escribir Manualmente
1. Haz clic en el campo de escáner
2. Escribe o pega el código de barras
3. Presiona Enter o espera 500ms
4. El producto se busca automáticamente

### Opción 3: Búsqueda por Nombre
1. Usa el campo de búsqueda manual
2. Escribe nombre o código interno
3. Selecciona de la lista
4. Agrega manualmente

## ⚠️ Validaciones Importantes

1. **Stock disponible**: El sistema valida stock antes de permitir ventas
2. **Producto único**: No permite agregar el mismo producto dos veces
3. **Código de barras único**: Cada código solo puede estar en un producto
4. **Productos activos**: Solo busca productos activos

## 🔍 Troubleshooting

### El escáner no encuentra el producto
- Verifica que el producto tenga código de barras asignado
- Verifica que el código de barras sea exacto (sin espacios)
- Verifica que el producto esté activo

### El stock no se actualiza
- **Compras**: Debes marcar como PROCESADA para aumentar stock
- **Ventas**: Se actualiza automáticamente al crear (estado PROCESADA)
- **Ajustes**: Se actualiza al confirmar el ajuste

### El producto no se agrega automáticamente
- Verifica que el producto tenga stock disponible (para ventas)
- Verifica que no esté duplicado en la lista
- Revisa la consola del navegador para errores

## 📝 Próximas Mejoras Posibles

1. **Escáner de cámara**: Integración con API de cámara del navegador
2. **Lectura de códigos QR**: Soporte para códigos QR además de barras
3. **Modo escáner continuo**: Agregar múltiples productos sin cerrar el escáner
4. **Sonido de confirmación**: Feedback auditivo al encontrar producto
5. **Historial de escaneos**: Registro de productos escaneados recientemente

