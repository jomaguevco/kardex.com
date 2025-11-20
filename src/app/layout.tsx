import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Ventas KARDEX',
  description: 'Sistema completo de gestión de inventario con KARDEX',
  keywords: ['ventas', 'inventario', 'kardex', 'gestión'],
  authors: [{ name: 'Sistema de Ventas' }]
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth" style={{ margin: 0, padding: 0, top: 0 }}>
      <body className={`${inter.className} bg-slate-950/95 antialiased`} style={{ margin: 0, padding: 0, top: 0 }}> 
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

