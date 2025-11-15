import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ReportePDFOptions {
  titulo: string
  fechaInicio?: string
  fechaFin?: string
  datos: any
  tipo: 'ventas' | 'compras' | 'inventario' | 'rentabilidad' | 'movimientos'
}

export function generarPDFReporte(options: ReportePDFOptions) {
  const doc = new jsPDF()
  const { titulo, fechaInicio, fechaFin, datos, tipo } = options

  // Encabezado
  doc.setFontSize(18)
  doc.text('Sistema de Ventas KARDEX', 14, 20)
  doc.setFontSize(14)
  doc.text(titulo, 14, 30)
  
  // Fecha de generación
  doc.setFontSize(10)
  doc.text(`Generado el: ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}`, 14, 40)
  
  if (fechaInicio || fechaFin) {
    let rangoFecha = 'Período: '
    if (fechaInicio) rangoFecha += `Desde ${new Date(fechaInicio).toLocaleDateString('es-PE')} `
    if (fechaFin) rangoFecha += `Hasta ${new Date(fechaFin).toLocaleDateString('es-PE')}`
    doc.text(rangoFecha, 14, 46)
  }

  let yPos = 55

  // Estadísticas
  if (datos.estadisticas || datos.estadisticas_generales) {
    const stats = datos.estadisticas || datos.estadisticas_generales || {}
    doc.setFontSize(12)
    doc.text('Resumen', 14, yPos)
    yPos += 8

    const statsData: string[][] = []
    if (stats.total_ventas !== undefined) statsData.push(['Total Ventas', `$${Number(stats.total_ventas).toFixed(2)}`])
    if (stats.total_compras !== undefined) statsData.push(['Total Compras', `$${Number(stats.total_compras).toFixed(2)}`])
    if (stats.cantidad_ventas !== undefined) statsData.push(['Cantidad de Ventas', `${stats.cantidad_ventas}`])
    if (stats.cantidad_compras !== undefined) statsData.push(['Cantidad de Compras', `${stats.cantidad_compras}`])
    if (stats.promedio_venta !== undefined) statsData.push(['Ticket Promedio', `$${Number(stats.promedio_venta).toFixed(2)}`])
    if (stats.total_productos !== undefined) statsData.push(['Total Productos', `${stats.total_productos}`])
    if (stats.valor_total_inventario !== undefined) statsData.push(['Valor Inventario', `$${Number(stats.valor_total_inventario).toFixed(2)}`])
    if (stats.total_ingresos !== undefined) statsData.push(['Total Ingresos', `$${Number(stats.total_ingresos).toFixed(2)}`])
    if (stats.total_costos !== undefined) statsData.push(['Total Costos', `$${Number(stats.total_costos).toFixed(2)}`])
    if (stats.ganancia_total !== undefined) statsData.push(['Ganancia Total', `$${Number(stats.ganancia_total).toFixed(2)}`])
    if (stats.margen_general !== undefined) statsData.push(['Margen General', `${Number(stats.margen_general).toFixed(2)}%`])

    if (statsData.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Concepto', 'Valor']],
        body: statsData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 10 }
      })
      yPos = (doc as any).lastAutoTable.finalY + 10
    }
  }

  // Tablas de datos
  if (tipo === 'ventas' && datos.ventas) {
    doc.setFontSize(12)
    doc.text('Detalle de Ventas', 14, yPos)
    yPos += 8

    const ventasData = datos.ventas.slice(0, 50).map((v: any) => [
      v.numero_factura || '',
      v.cliente?.nombre || 'Cliente no registrado',
      new Date(v.fecha_venta).toLocaleDateString('es-PE'),
      `$${Number(v.total).toFixed(2)}`
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Factura', 'Cliente', 'Fecha', 'Total']],
      body: ventasData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 9 }
    })
    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  if (tipo === 'compras' && datos.compras) {
    doc.setFontSize(12)
    doc.text('Detalle de Compras', 14, yPos)
    yPos += 8

    const comprasData = datos.compras.slice(0, 50).map((c: any) => [
      c.numero_factura || '',
      c.proveedor?.nombre || 'Proveedor no registrado',
      new Date(c.fecha_compra).toLocaleDateString('es-PE'),
      `$${Number(c.total).toFixed(2)}`
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Factura', 'Proveedor', 'Fecha', 'Total']],
      body: comprasData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 9 }
    })
    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  if (tipo === 'inventario' && datos.productos) {
    doc.setFontSize(12)
    doc.text('Detalle de Inventario', 14, yPos)
    yPos += 8

    const productosData = datos.productos.slice(0, 50).map((p: any) => [
      p.nombre || '',
      p.stock_actual?.toString() || '0',
      p.stock_minimo?.toString() || '0',
      `$${Number(p.precio_compra || 0).toFixed(2)}`,
      `$${Number((p.stock_actual || 0) * (p.precio_compra || 0)).toFixed(2)}`
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Producto', 'Stock Actual', 'Stock Mínimo', 'Precio Compra', 'Valor Total']],
      body: productosData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 }
    })
    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  if (tipo === 'rentabilidad' && datos.rentabilidad_por_producto) {
    doc.setFontSize(12)
    doc.text('Rentabilidad por Producto', 14, yPos)
    yPos += 8

    const rentabilidadData = datos.rentabilidad_por_producto.slice(0, 50).map((r: any) => [
      r.producto?.nombre || 'Producto no registrado',
      Number(r.cantidad_vendida || 0).toFixed(2),
      `$${Number(r.ingreso_total || 0).toFixed(2)}`,
      `$${Number(r.costo_total || 0).toFixed(2)}`,
      `$${Number(r.ganancia_total || 0).toFixed(2)}`,
      `${Number(r.margen_promedio || 0).toFixed(2)}%`
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Producto', 'Cant. Vendida', 'Ingresos', 'Costos', 'Ganancia', 'Margen']],
      body: rentabilidadData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 }
    })
    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  if (tipo === 'movimientos' && datos.movimientos) {
    doc.setFontSize(12)
    doc.text('Movimientos KARDEX', 14, yPos)
    yPos += 8

    const movimientosData = datos.movimientos.slice(0, 50).map((m: any) => [
      new Date(m.fecha_movimiento).toLocaleDateString('es-PE'),
      m.producto?.nombre || 'Producto no registrado',
      m.tipo_movimiento || '',
      m.cantidad?.toString() || '0',
      m.stock_anterior?.toString() || '0',
      m.stock_nuevo?.toString() || '0',
      `$${Number(m.costo_total || 0).toFixed(2)}`
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Fecha', 'Producto', 'Movimiento', 'Cantidad', 'Stock Ant.', 'Stock Nuevo', 'Costo Total']],
      body: movimientosData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 7 }
    })
  }

  // Pie de página
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // Descargar PDF
  const nombreArchivo = `reporte-${tipo}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(nombreArchivo)
}

