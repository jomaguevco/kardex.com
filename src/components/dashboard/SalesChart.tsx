'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Ene', ventas: 4000, compras: 2400 },
  { name: 'Feb', ventas: 3000, compras: 1398 },
  { name: 'Mar', ventas: 2000, compras: 9800 },
  { name: 'Abr', ventas: 2780, compras: 3908 },
  { name: 'May', ventas: 1890, compras: 4800 },
  { name: 'Jun', ventas: 2390, compras: 3800 },
]

export default function SalesChart() {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas vs Compras</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="ventas" fill="#0066CC" name="Ventas" />
            <Bar dataKey="compras" fill="#FF9900" name="Compras" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

