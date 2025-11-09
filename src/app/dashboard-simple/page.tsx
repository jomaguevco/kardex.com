'use client'

import LayoutSimple from '@/components/layout/LayoutSimple'
import AuthDebug from '@/components/debug/AuthDebug'
import { Sparkles, TrendingUp, Users, Package2, ShoppingBag } from 'lucide-react'

const stats = [
  {
    label: 'Ingresos diarios',
    value: '$12,450',
    tone: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
    icon: <TrendingUp className="h-5 w-5 text-emerald-500" />
  },
  {
    label: 'Ventas registradas',
    value: '156',
    tone: 'from-sky-500/20 via-sky-500/10 to-transparent',
    icon: <ShoppingBag className="h-5 w-5 text-sky-500" />
  },
  {
    label: 'Productos activos',
    value: '1,234',
    tone: 'from-indigo-500/20 via-indigo-500/10 to-transparent',
    icon: <Package2 className="h-5 w-5 text-indigo-500" />
  },
  {
    label: 'Clientes fidelizados',
    value: '89',
    tone: 'from-purple-500/20 via-purple-500/10 to-transparent',
    icon: <Users className="h-5 w-5 text-purple-500" />
  }
]

export default function DashboardPage() {
  return (
    <>
      <AuthDebug />
      <LayoutSimple>
        <div className="space-y-8">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-sky-600 to-emerald-500 px-6 py-8 text-white shadow-lg">
            <div className="absolute -right-16 top-1/2 hidden h-56 w-56 -translate-y-1/2 rounded-full bg-white/20 blur-3xl lg:block" />
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> Demo de dashboard
              </span>
              <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">
                Visualiza métricas clave en un panel ligero listo para pruebas
              </h1>
              <p className="max-w-2xl text-sm text-white/85">
                Este dashboard simplificado replica la estética y lenguaje visual del panel principal. Ideal para mostrar indicadores rápidos mientras ajustamos la experiencia completa.
              </p>
            </div>
          </section>

          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${stat.tone} px-3 py-2`}>{stat.icon}
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</span>
                </div>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-500">Sincronizado con los datos de muestra actuales.</p>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white/95 p-6 text-center shadow-md">
            <h2 className="text-xl font-semibold text-slate-900">Dashboard simplificado operativo</h2>
            <p className="mt-3 text-sm text-slate-500">
              Si puedes ver esta tarjeta y los indicadores anteriores, el modo demo está funcionando correctamente. Usa este entorno para validar autenticación, layout base y estilos.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
              ✅ Entorno de pruebas listo
            </div>
          </section>
        </div>
      </LayoutSimple>
    </>
  )
}

