'use client'

import { Sparkles, Settings2, ShieldCheck, Palette, Database, Bell } from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'

const ajustesRapidos = [
  {
    titulo: 'Identidad visual',
    descripcion: 'Colores, logotipo y tipografía coherentes con tu marca.',
    icono: <Palette className="h-4 w-4" />,
    estado: 'Listo para personalizar'
  },
  {
    titulo: 'Notificaciones',
    descripcion: 'Configura alertas de stock bajo, ventas y compras pendientes.',
    icono: <Bell className="h-4 w-4" />,
    estado: 'Próximamente'
  },
  {
    titulo: 'Seguridad y usuarios',
    descripcion: 'Roles, permisos y autenticación reforzada para tu equipo.',
    icono: <ShieldCheck className="h-4 w-4" />,
    estado: 'Integrado con auth store'
  },
  {
    titulo: 'Integraciones externas',
    descripcion: 'Sincronización con ERP, contabilidad y pasarelas de pago.',
    icono: <Database className="h-4 w-4" />,
    estado: 'En roadmap'
  }
]

export default function ConfiguracionPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-10 animate-fade-in">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 px-6 py-10 text-white shadow-xl">
            <div className="absolute -right-12 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl lg:block" />
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div className="space-y-6">
                <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Centro de configuración
                </span>
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                  Personaliza la experiencia y mantiene el sistema listo para producción
                </h1>
                <p className="max-w-xl text-sm text-white/80 sm:text-base">
                  Ajusta elementos visuales, prepara integraciones y valida la seguridad desde un único panel coherente con el resto del proyecto.
                </p>
                <div className="inline-flex items-center rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white/90">
                  <Settings2 className="mr-2 h-4 w-4" /> Cambios en tiempo real sobre la interfaz
                </div>
              </div>

              <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Recordatorio</p>
                <p className="mt-3 text-sm text-white/80">
                  Esta sección controla parámetros globales. Se recomienda registrar los ajustes finales antes del despliegue comercial para asegurar coherencia visual y funcional.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="card space-y-6 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Ajustes rápidos</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {ajustesRapidos.map((ajuste) => (
                  <div key={ajuste.titulo} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                        {ajuste.icono}
                        {ajuste.estado}
                      </div>
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-slate-900">{ajuste.titulo}</h3>
                    <p className="mt-2 text-sm text-slate-600">{ajuste.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card space-y-4 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Hoja de ruta</h2>
              <div className="space-y-3 text-sm text-slate-600">
                <p>• Panel de auditoría y bitácora de cambios.</p>
                <p>• Webhooks para integraciones contables.</p>
                <p>• Parámetros avanzados de facturación electrónica.</p>
                <p>• Preferencias de notificación por usuario.</p>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}