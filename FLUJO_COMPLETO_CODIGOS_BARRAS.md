# Flujo Completo: Códigos de Barras en KARDEX

## 🎯 Respuesta Directa a Tu Pregunta

**SÍ, exactamente así funciona:**

1. **Registras el producto UNA VEZ** con su código de barras (ej: Coca Cola 500ml = código 7891000100103)
2. **Cuando vendes**, escaneas el código de barras
3. **El sistema identifica automáticamente** el producto
4. **Ingresas la cantidad vendida** (o escaneas múltiples veces)
5. **El stock se reduce automáticamente** al confirmar la venta

**NO necesitas escanear cada unidad individual.** El código de barras identifica el PRODUCTO, no cada unidad.

## 📦 Ejemplo Práctico Completo

### Paso 1: Registrar Producto (UNA SOLA VEZ)

```
Producto: "Coca Cola 500ml"
Código de barras: 7891000100103
Stock inicial: 100 unidades
```

### Paso 2: Hacer una Venta

**Opción A: Escaneo + Cantidad Manual**
```
1. Cliente quiere comprar 5 botellas de Coca Cola
2. Escaneas código: 7891000100103
3. Sistema encuentra: "Coca Cola 500ml"
4. Ingresas cantidad: 5
5. Confirmas venta
6. Stock se reduce automáticamente: 100 → 95
```

**Opción B: Escaneo Múltiple (Modo Incremental)**
```
1. Cliente quiere comprar 5 botellas de Coca Cola
2. Escaneas código: 7891000100103 (1ra vez) → Cantidad: 1
3. Escaneas código: 7891000100103 (2da vez) → Cantidad: 2
4. Escaneas código: 7891000100103 (3ra vez) → Cantidad: 3
5. Escaneas código: 7891000100103 (4ta vez) → Cantidad: 4
6. Escaneas código: 7891000100103 (5ta vez) → Cantidad: 5
7. Confirmas venta
8. Stock se reduce automáticamente: 100 → 95
```

## 🔄 Flujo Completo del Sistema

### COMPRAS (Entrada de Stock)

```
1. Recibes pedido de proveedor
2. Escaneas códigos de barras de productos recibidos
   - Coca Cola: escaneas 20 veces → Cantidad: 20
   - Sprite: escaneas 15 veces → Cantidad: 15
3. Creas compra como PENDIENTE
   → Stock NO aumenta todavía
4. Cuando llega la mercancía física:
   - Verificas con escáner lo que realmente llegó
   - Ajustas cantidades si hay diferencias
5. Marcas compra como PROCESADA
   → Stock aumenta automáticamente
```

### VENTAS (Salida de Stock)

```
1. Cliente quiere comprar productos
2. Escaneas código de barras de cada producto
   - Opción A: Escaneas 1 vez + ingresas cantidad
   - Opción B: Escaneas múltiples veces (cada escaneo suma 1)
3. Confirmas la venta
   → Stock se reduce AUTOMÁTICAMENTE
   → Se registra en KARDEX como SALIDA_VENTA
```

## ✅ Ventajas del Sistema

1. **Identificación Automática**: El código de barras identifica el producto automáticamente
2. **No necesitas buscar**: No tienes que escribir nombres o buscar en listas
3. **Stock Automático**: El stock se actualiza solo al confirmar
4. **Trazabilidad**: Todo queda registrado en KARDEX
5. **Flexible**: Puedes escanear múltiples veces O ingresar cantidad manualmente

## 🎯 Resumen

**Tu pregunta:** "¿Necesito escanear cada unidad o solo el código identifica el producto?"

**Respuesta:** 
- El código de barras identifica el PRODUCTO (tipo)
- NO necesitas escanear cada unidad individual
- Puedes:
  - Escanear 1 vez + ingresar cantidad manualmente
  - Escanear múltiples veces (cada escaneo suma 1)
- El stock se reduce automáticamente al confirmar la venta

## 💡 Recomendación de Uso

**Para VENTAS (salida rápida):**
- Escanea 1 vez → Ingresa cantidad → Más rápido

**Para COMPRAS (verificación):**
- Escanea múltiples veces → Cuenta automática → Más preciso

