import apiService from './api';

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
  dias_caducidad?: number;
  activo: boolean;
  fecha_creacion: string;
  categoria?: any;
  marca?: any;
  unidadMedida?: any;
}

export interface CreateProductoData {
  codigo_barras?: string;
  codigo_interno: string;
  nombre: string;
  descripcion?: string;
  categoria_id?: number;
  marca_id?: number;
  unidad_medida_id?: number;
  precio_venta?: number;
  costo_promedio?: number;
  precio_compra?: number;
  stock_minimo?: number;
  stock_maximo?: number;
  punto_reorden?: number;
  stock_actual?: number;
  peso?: number;
  volumen?: number;
  dimensiones?: string;
  tiene_caducidad?: boolean;
  dias_caducidad?: number;
}

export interface UpdateProductoData extends Partial<CreateProductoData> {}

export interface AjustarStockData {
  cantidad: number;
  motivo?: string;
  observaciones?: string;
}

export interface ProductosResponse {
  productos: Producto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ProductoService {
  async getProductos(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoria_id?: number;
    marca_id?: number;
  }): Promise<ProductosResponse> {
    const response = await apiService.get('/productos', { params });
    return response.data as ProductosResponse;
  }

  async getProductoById(id: number): Promise<Producto> {
    const response = await apiService.get(`/productos/${id}`);
    return (response.data as any).data;
  }

  /**
   * Buscar producto por código de barras exacto
   * Útil para escáneres de códigos de barras
   */
  async getProductoByBarcode(codigoBarras: string): Promise<Producto> {
    const response = await apiService.get(`/productos/by-barcode/${encodeURIComponent(codigoBarras)}`);
    return (response.data as any).data;
  }

  async createProducto(data: CreateProductoData): Promise<Producto> {
    const response = await apiService.post('/productos', data);
    return (response.data as any).data;
  }

  async updateProducto(id: number, data: UpdateProductoData): Promise<Producto> {
    const response = await apiService.put(`/productos/${id}`, data);
    return (response.data as any).data;
  }

  async deleteProducto(id: number): Promise<void> {
    await apiService.delete(`/productos/${id}`);
  }

  async ajustarStock(id: number, data: AjustarStockData): Promise<any> {
    const response = await apiService.post(`/productos/${id}/ajustar-stock`, data);
    return (response.data as any).data;
  }

  async getProductosStockBajo(): Promise<Producto[]> {
    const response = await apiService.get('/productos/stock-bajo');
    return (response.data as any).data;
  }
}

export const productoService = new ProductoService();
export default productoService;