"use client"

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Package, CheckCircle, XCircle, Clock, Search, MapPin, Phone, User, Mail } from 'lucide-react'

type Pedido = {
  id: string
  numero_pedido: number
  created_at: string
  total: number
  estado: string
  cliente_nombre: string
  cliente_telefono: string
  cliente_direccion: string
  cliente_correo: string
  metodo_pago: string
  detalles: {
    cantidad: number
    precio_unitario: number
    producto_id: string
    productos: {
      nombre: string
      codigo: string
    }
  }[]
}

type TabType = 'pendiente' | 'completado' | 'cancelado'

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('pendiente')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    if (profile?.rol !== 'empleado') {
      await supabase.auth.signOut()
      router.push('/login')
      return
    }

    fetchPedidos()
  }

  const fetchPedidos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        id,
        numero_pedido,
        created_at,
        total,
        estado,
        cliente_nombre,
        cliente_telefono,
        cliente_direccion,
        cliente_correo,
        metodo_pago,
        detalles:detalles_pedido(
          cantidad,
          precio_unitario,
          producto_id,
          productos:producto_id(nombre, codigo)
        )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const formatted = data.map((p: any) => ({
        ...p,
        detalles: p.detalles.map((d: any) => ({
          ...d,
          productos: Array.isArray(d.productos) ? d.productos[0] : d.productos
        }))
      }))
      setPedidos(formatted)
    }
    setLoading(false)
  }

  const updateEstado = async (id: string, nuevoEstado: string) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', id)

    if (!error) {
      fetchPedidos()
    } else {
      alert('Error actualizando estado')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Filtrado y Búsqueda
  const filteredPedidos = useMemo(() => {
    let result = pedidos.filter(p => p.estado === activeTab)

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      result = result.filter(p => 
        (p.numero_pedido && p.numero_pedido.toString().includes(term)) ||
        (p.cliente_nombre && p.cliente_nombre.toLowerCase().includes(term))
      )
    }

    return result
  }, [pedidos, activeTab, searchTerm])

  const getStatusBadge = (estado: string) => {
    switch(estado) {
      case 'pendiente': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Pendiente</span>
      case 'completado': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Facturado</span>
      case 'cancelado': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3"/> Cancelado</span>
      default: return <span>{estado}</span>
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando panel...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-gray-900 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Panel de Empleados</h1>
          <p className="text-xs text-gray-400">Gestión de Facturación y Pedidos</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm transition-colors border border-gray-700">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Tienda</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm transition-colors font-medium">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="p-4 max-w-6xl mx-auto mt-4">
        
        {/* Controles: Tabs y Buscador */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('pendiente')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pendiente' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Pendientes ({pedidos.filter(p=>p.estado === 'pendiente').length})
            </button>
            <button 
              onClick={() => setActiveTab('completado')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'completado' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Facturados
            </button>
            <button 
              onClick={() => setActiveTab('cancelado')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'cancelado' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Cancelados
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por cliente o # pedido..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Lista de Pedidos */}
        {filteredPedidos.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-200">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No hay pedidos en esta sección.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredPedidos.map(pedido => (
              <div key={pedido.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                
                <div className="bg-gray-50 p-5 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-black text-xl">
                      #{pedido.numero_pedido || '---'}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-mono mb-1">{pedido.id}</p>
                      <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(pedido.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-200">
                    {getStatusBadge(pedido.estado)}
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total</p>
                      <p className="text-2xl font-black text-green-500">${pedido.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Datos del Cliente */}
                  <div className="lg:col-span-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Datos de Entrega</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Cliente</p>
                          <p className="text-sm font-bold text-gray-800">{pedido.cliente_nombre || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Teléfono</p>
                          <p className="text-sm font-bold text-gray-800">{pedido.cliente_telefono || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Correo</p>
                          <p className="text-sm font-bold text-gray-800 break-all">{pedido.cliente_correo || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Dirección</p>
                          <p className="text-sm font-bold text-gray-800">{pedido.cliente_direccion || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Artículos */}
                  <div className="lg:col-span-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Artículos Solicitados ({pedido.detalles.length})</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                          <tr>
                            <th className="px-3 py-2 rounded-l-lg">Ref.</th>
                            <th className="px-3 py-2">Producto</th>
                            <th className="px-3 py-2 text-center">Cant.</th>
                            <th className="px-3 py-2 text-right">P. Unit</th>
                            <th className="px-3 py-2 text-right rounded-r-lg">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pedido.detalles.map((d, i) => (
                            <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                              <td className="px-3 py-3 font-mono text-xs text-gray-500">{d.productos?.codigo || 'N/A'}</td>
                              <td className="px-3 py-3 font-medium text-gray-900">{d.productos?.nombre || 'Producto eliminado'}</td>
                              <td className="px-3 py-3 text-center font-bold text-blue-600">{d.cantidad}</td>
                              <td className="px-3 py-3 text-right text-gray-600">${d.precio_unitario.toFixed(2)}</td>
                              <td className="px-3 py-3 text-right font-black text-gray-900">${(d.cantidad * d.precio_unitario).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {pedido.estado === 'pendiente' && (
                  <div className="p-4 bg-gray-100 border-t border-gray-200 flex gap-3 justify-end items-center">
                    <button 
                      onClick={() => updateEstado(pedido.id, 'cancelado')}
                      className="px-6 py-2.5 text-red-600 hover:bg-white hover:shadow-sm rounded-xl font-bold text-sm transition-all border border-transparent hover:border-red-200"
                    >
                      Cancelar Pedido
                    </button>
                    <button 
                      onClick={() => updateEstado(pedido.id, 'completado')}
                      className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black shadow-md shadow-green-500/20 transition-all flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Marcar como Facturado y Despachado
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
