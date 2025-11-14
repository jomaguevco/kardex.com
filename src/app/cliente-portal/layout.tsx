import ClienteNavbar from '@/components/layout/ClienteNavbar'

export default function ClientePortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ClienteNavbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </>
  )
}

