// Tipos de Usuario
export interface Usuario {
  id: number;
  nombre_usuario: string;
  nombre_completo: string;
  email?: string;
  telefono?: string;
  rol: 'ADMINISTRADOR' | 'VENDEDOR' | 'ALMACENERO' | 'CONTADOR';
  activo: boolean;
  fecha_ultimo_acceso?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Tipos de Producto
export interface Producto {
  id: number;
  codigo_barras?: string;
  codigo_interno: string;
  nombre: string;
  descripcion?: string;
  categoria_id?: number;
  marca_id?: number;
  unidad_medida_id?: number;
  precio_venta: number;
  costo_promedio: number;
  precio_compra: number;
  stock_minimo: number;
  stock_maximo: number;
  punto_reorden: number;
  stock_actual: number;
  peso?: number;
  volumen?: number;
  dimensiones?: string;
  tiene_caducidad: boolean;
  dias_caducidad: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  categoria?: Categoria;
  marca?: Marca;
  unidadMedida?: UnidadMedida;
}

// Tipos de Categoría
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Tipos de Marca
export interface Marca {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Tipos de Unidad de Medida
export interface UnidadMedida {
  id: number;
  nombre: string;
  abreviatura: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Tipos de Cliente
export interface Cliente {
  id: number;
  codigo: string;
  nombre: string;
  tipo_documento: 'RUC' | 'DNI' | 'CE' | 'PASAPORTE';
  numero_documento: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  tipo_cliente: 'NATURAL' | 'JURIDICA';
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Tipos de Proveedor
export interface Proveedor {
  id: number;
  codigo: string;
  nombre: string;
  tipo_documento: 'RUC' | 'DNI' | 'CE' | 'PASAPORTE';
  numero_documento: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  tipo_proveedor: 'NACIONAL' | 'INTERNACIONAL';
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Tipos de Venta
export interface Venta {
  id: number;
  numero_factura: string;
  cliente_id: number;
  fecha_venta: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  estado: 'PENDIENTE' | 'PROCESADA' | 'ANULADA';
  observaciones?: string;
  usuario_id: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  cliente?: Cliente;
  usuario?: Usuario;
  detalles?: DetalleVenta[];
}

// Tipos de Detalle de Venta
export interface DetalleVenta {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  fecha_creacion: string;
  producto?: Producto;
}

// Tipos de Compra
export interface Compra {
  id: number;
  numero_factura: string;
  proveedor_id: number;
  fecha_compra: string;
  fecha_vencimiento?: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  estado: 'PENDIENTE' | 'PROCESADA' | 'ANULADA';
  observaciones?: string;
  usuario_id: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  proveedor?: Proveedor;
  usuario?: Usuario;
  detalles?: DetalleCompra[];
}

// Tipos de Detalle de Compra
export interface DetalleCompra {
  id: number;
  compra_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  fecha_creacion: string;
  producto?: Producto;
}

// Tipos de Almacén
export interface Almacen {
  id: number;
  codigo: string;
  nombre: string;
  direccion?: string;
  responsable?: string;
  telefono?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Tipos de Movimiento KARDEX
export interface MovimientoKardex {
  id: number;
  producto_id: number;
  almacen_id: number;
  tipo_movimiento: 'ENTRADA_COMPRA' | 'ENTRADA_DEVOLUCION_CLIENTE' | 'ENTRADA_AJUSTE_POSITIVO' | 'ENTRADA_TRANSFERENCIA' | 'SALIDA_VENTA' | 'SALIDA_DEVOLUCION_PROVEEDOR' | 'SALIDA_AJUSTE_NEGATIVO' | 'SALIDA_TRANSFERENCIA' | 'SALIDA_MERMA';
  tipo_movimiento_id?: number;
  almacen_destino_id?: number;
  cantidad: number;
  precio_unitario: number;
  costo_total: number;
  stock_anterior: number;
  stock_nuevo: number;
  documento_referencia: string;
  numero_documento?: string;
  fecha_movimiento: string;
  usuario_id: number;
  autorizado_por?: number;
  fecha_autorizacion?: string;
  observaciones?: string;
  motivo_movimiento?: string;
  estado_movimiento: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fecha_creacion: string;
  producto?: Producto;
  almacen?: Almacen;
  almacenDestino?: Almacen;
  usuario?: Usuario;
  autorizadoPor?: Usuario;
  tipoMovimiento?: TipoMovimientoKardex;
}

// Tipos de Tipo de Movimiento KARDEX
export interface TipoMovimientoKardex {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo_operacion: 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA';
  afecta_stock: boolean;
  requiere_documento: boolean;
  requiere_autorizacion: boolean;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Tipos de Filtros
export interface ProductoFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoria_id?: number;
  marca_id?: number;
}

export interface VentaFilters {
  page?: number;
  limit?: number;
  search?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
}

export interface CompraFilters {
  page?: number;
  limit?: number;
  search?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
}

export interface KardexFilters {
  page?: number;
  limit?: number;
  producto_id?: number;
  almacen_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo_movimiento?: string;
}

// Tipos de Respuesta de API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[] | {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// Tipos de Formularios
export interface LoginForm {
  nombre_usuario: string;
  contrasena: string;
}

export interface VentaForm {
  numero_factura: string;
  cliente_id: number;
  fecha_venta: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  observaciones?: string;
  detalles: DetalleVentaForm[];
}

export interface DetalleVentaForm {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
}

export interface CompraForm {
  numero_factura: string;
  proveedor_id: number;
  fecha_compra: string;
  fecha_vencimiento?: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  observaciones?: string;
  detalles: DetalleCompraForm[];
}

export interface DetalleCompraForm {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
}

export interface MovimientoKardexForm {
  producto_id: number;
  almacen_id: number;
  tipo_movimiento_id: number;
  cantidad: number;
  precio_unitario: number;
  documento_referencia: string;
  numero_documento?: string;
  almacen_destino_id?: number;
  observaciones?: string;
  motivo_movimiento?: string;
}

// Tipos de Dashboard
export interface DashboardStats {
  totalVentas: number;
  totalCompras: number;
  totalProductos: number;
  productosStockBajo: number;
}

export interface VentaStats {
  total_ventas: number;
  cantidad_ventas: number;
  promedio_venta: number;
}

export interface CompraStats {
  total_compras: number;
  cantidad_compras: number;
  promedio_compra: number;
}

export interface InventarioStats {
  total_productos: number;
  valor_total_inventario: number;
  productos_stock_bajo: number;
}

export interface RentabilidadStats {
  total_ingresos: number;
  total_costos: number;
  ganancia_total: number;
  margen_general: number;
}