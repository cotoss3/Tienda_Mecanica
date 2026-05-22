import { supabase } from '@/lib/supabase'
import Catalog from '@/components/Catalog'
import Link from 'next/link'
import { Shield } from 'lucide-react'

export const revalidate = 0 // Disable cache for real-time updates

async function fetchAllProductos() {
  let allData: any[] = []
  let from = 0
  const step = 1000
  while (true) {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre')
      .range(from, from + step - 1)
    
    if (error || !data || data.length === 0) break
    allData = [...allData, ...data]
    if (data.length < step) break
    from += step
  }
  return allData
}

export default async function Home() {
  const { data: categorias } = await supabase.from('categorias').select('*').order('nombre')
  const productos = await fetchAllProductos()

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mecánica Express</h1>
          <p className="text-sm opacity-90">Catálogo de Repuestos</p>
        </div>
        <Link href="/admin" className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 transition-colors px-3 py-2 rounded-lg text-sm font-medium border border-blue-500 shadow-sm">
          <Shield className="w-4 h-4" />
          <span className="hidden sm:inline">Panel Admin</span>
        </Link>
      </header>
      
      <Catalog categorias={categorias || []} productos={productos || []} />
    </main>
  )
}
