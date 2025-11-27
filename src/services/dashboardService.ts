import apiService from './api';

export interface DashboardStats {
  totalVentas: number;
  totalCompras: number;
  totalProductos: number;
  productosStockBajo: number;
  ventasDelDia: number;
  transaccionesDelDia: number;
  ventasDelMes: number;
  crecimiento: number;
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // apiService.get() ya devuelve response.data de axios
      // Obtener estadísticas de ventas
      const ventasResponse = await apiService.get('/ventas/estadisticas');
      const ventasStats = ventasResponse?.data || ventasResponse || {};

      // Obtener estadísticas de compras
      const comprasResponse = await apiService.get('/compras/estadisticas');
      const comprasStats = comprasResponse?.data || comprasResponse || {};

      // Obtener productos con stock bajo
      const stockBajoResponse = await apiService.get('/productos/stock-bajo');
      const stockBajoData = stockBajoResponse?.data || stockBajoResponse || [];
      const productosStockBajo = Array.isArray(stockBajoData) ? stockBajoData.length : 0;

      // Obtener total de productos
      const productosResponse = await apiService.get('/productos?limit=1');
      const totalProductos = productosResponse?.data?.pagination?.total || 0;

      // Calcular ventas del día
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const hoyStr = hoy.toISOString().split('T')[0];
      
      const ventasHoyResponse = await apiService.get(`/ventas/estadisticas?fecha_inicio=${hoyStr}&fecha_fin=${hoyStr}`);
      const ventasHoyData = ventasHoyResponse?.data || ventasHoyResponse || {};
      const ventasDelDia = ventasHoyData?.total_monto || 0;
      const transaccionesDelDia = ventasHoyData?.total_ventas || 0;

      // Calcular ventas del mes
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const inicioMesStr = inicioMes.toISOString().split('T')[0];
      const finMesStr = hoy.toISOString().split('T')[0];
      
      const ventasMesResponse = await apiService.get(`/ventas/estadisticas?fecha_inicio=${inicioMesStr}&fecha_fin=${finMesStr}`);
      const ventasMesData = ventasMesResponse?.data || ventasMesResponse || {};
      const ventasDelMes = ventasMesData?.total_ventas || 0;

      // Calcular crecimiento (simplificado - comparar con mes anterior)
      const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      const inicioMesAnteriorStr = inicioMesAnterior.toISOString().split('T')[0];
      const finMesAnteriorStr = finMesAnterior.toISOString().split('T')[0];
      
      const ventasMesAnteriorResponse = await apiService.get(`/ventas/estadisticas?fecha_inicio=${inicioMesAnteriorStr}&fecha_fin=${finMesAnteriorStr}`);
      const ventasMesAnteriorData = ventasMesAnteriorResponse?.data || ventasMesAnteriorResponse || {};
      const ventasMesAnterior = ventasMesAnteriorData?.total_ventas || 0;
      
      const crecimiento = ventasMesAnterior > 0 
        ? ((ventasDelMes - ventasMesAnterior) / ventasMesAnterior) * 100 
        : 0;

      return {
        totalVentas: ventasStats.total_monto || 0,
        totalCompras: comprasStats.total_monto || 0,
        totalProductos,
        productosStockBajo,
        ventasDelDia,
        transaccionesDelDia,
        ventasDelMes,
        ventasMesAnterior,
        crecimiento
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      // Retornar valores por defecto en caso de error
      return {
        totalVentas: 0,
        totalCompras: 0,
        totalProductos: 0,
        productosStockBajo: 0,
        ventasDelDia: 0,
        transaccionesDelDia: 0,
        ventasDelMes: 0,
        ventasMesAnterior: 0,
        crecimiento: 0
      };
    }
  }
}

export const dashboardService = new DashboardService();

