# Integración de Códigos de Barras en Sistema KARDEX

## Resumen del Sistema Actual

El sistema KARDEX ya tiene la infraestructura básica para códigos de barras:

### ✅ Lo que ya existe:
1. **Modelo Producto** tiene campo `codigo_barras` (único, opcional)
2. **Búsqueda** ya incluye código de barras en `getProductos`
3. **Flujo de stock** funciona correctamente:
   - **Compras**: Aumentan stock cuando se marcan como PROCESADA
   - **Ventas**: Disminuyen stock automáticamente (estado PROCESADA)
   - **Ajustes**: Permiten ajustes positivos/negativos
   - **KARDEX**: Registra todos los movimientos

## Flujo de Trabajo con Códigos de Barras

### 1. COMPRAS (Entrada de Mercancía)
```
Escáner → Buscar producto por código → Agregar cantidad → Procesar compra → Stock aumenta
```

**Proceso:**
- Escaneas código de barras del producto recibido
- Sistema busca y muestra el producto
- Ingresas cantidad recibida
- Creas compra como PENDIENTE
- Cuando llega la mercancía, marcas como PROCESADA → Stock aumenta automáticamente

### 2. VENTAS (Salida de Mercancía)
```
Escáner → Buscar producto → Agregar a venta → Confirmar venta → Stock disminuye
```

**Proceso:**
- Escaneas código de barras del producto vendido
- Sistema busca y agrega a la venta
- Ingresas cantidad vendida
- Confirmas venta → Stock disminuye automáticamente (estado PROCESADA)

### 3. AJUSTES DE INVENTARIO
```
Escáner → Buscar producto → Ingresar ajuste (positivo/negativo) → Stock se actualiza
```

**Proceso:**
- Escaneas código de barras
- Sistema busca el producto
- Ingresas cantidad de ajuste (positivo o negativo)
- Confirmas → Stock se actualiza y se registra en KARDEX

### 4. PEDIDOS (Cliente)
```
Cliente escanea → Busca producto → Agrega a pedido → Pedido pendiente
```

**Proceso:**
- Cliente escanea código de barras
- Sistema busca producto disponible
- Cliente agrega a pedido
- Administrador aprueba → Cliente paga → Se procesa envío → Stock disminuye

## Implementación Técnica

### Backend - Endpoint para Búsqueda por Código de Barras

**Ruta:** `GET /api/productos/by-barcode/:codigo_barras`

**Funcionalidad:**
- Busca producto por código de barras exacto
- Retorna producto completo con stock actual
- Útil para escáneres que leen código exacto

### Frontend - Componente Escáner

**Componente:** `BarcodeScanner.tsx`

**Funcionalidades:**
1. **Modo Manual**: Input donde puedes escribir/pegar código
2. **Modo Cámara**: Usa API de cámara del navegador (opcional)
3. **Auto-búsqueda**: Busca automáticamente al detectar código
4. **Feedback visual**: Muestra producto encontrado o error

### Integración en Formularios

**Ventas:**
- Input de búsqueda acepta código de barras
- Al escanear, busca y agrega producto automáticamente
- Permite ingresar cantidad manualmente

**Compras:**
- Escáner para productos recibidos
- Agrega productos con cantidad recibida
- Estado PENDIENTE hasta que llegue mercancía

**Ajustes:**
- Escáner para producto a ajustar
- Input para cantidad de ajuste
- Registra en KARDEX automáticamente

## Ventajas del Sistema Actual

1. **Trazabilidad Completa**: Todos los movimientos se registran en KARDEX
2. **Control de Stock**: Stock se actualiza automáticamente según operación
3. **Estados Claros**: 
   - Compras: PENDIENTE → PROCESADA (aumenta stock)
   - Ventas: PROCESADA (disminuye stock inmediatamente)
4. **Flexibilidad**: Puedes trabajar con o sin códigos de barras

## Próximos Pasos de Implementación

1. ✅ Crear endpoint específico para búsqueda por código de barras
2. ✅ Crear componente BarcodeScanner reutilizable
3. ✅ Integrar escáner en formulario de ventas
4. ✅ Integrar escáner en formulario de compras
5. ✅ Integrar escáner en ajustes de inventario
6. ✅ Mejorar búsqueda para aceptar código de barras en todos los formularios

