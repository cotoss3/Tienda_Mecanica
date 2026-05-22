"use client"

import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Phone, MapPin, Mail, CheckCircle } from 'lucide-react'

export default function Checkout() {
  const cart = useStore(state => state.cart)
  const getCartTotal = useStore(state => state.getCartTotal)
  const clearCart = useStore(state => state.clearCart)
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [numeroPedido, setNumeroPedido] = useState('')
  const router = useRouter()

  // Form states
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [correo, setCorreo] = useState('')

  useEffect(() => {
    if (cart.length === 0 && !success) {
      router.push('/')
    }
  }, [cart, success, router])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Create order with customer data
    const { data: order, error } = await supabase
      .from('pedidos')
      .insert([
        { 
          total: getCartTotal(), 
          estado: 'pendiente',
          cliente_nombre: nombre,
          cliente_telefono: telefono,
          cliente_direccion: direccion,
          cliente_correo: correo,
          metodo_pago: 'contra_entrega'
        }
      ])
      .select('id, numero_pedido')
      .single()

    if (error || !order) {
      alert('Hubo un error procesando tu pedido. Asegúrate de haber ejecutado el código SQL en Supabase.')
      console.error(error)
      setLoading(false)
      return
    }

    // Insert order items
    const items = cart.map(item => ({
      pedido_id: order.id,
      producto_id: item.id,
      cantidad: item.cantidad,
      precio_unitario: item.precio
    }))

    await supabase.from('detalles_pedido').insert(items)
    
    setNumeroPedido(order.numero_pedido || 'N/A')
    setSuccess(true)
    clearCart()
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">¡Pedido Exitoso!</h2>
          <p className="text-gray-500 mb-6">Tu orden ha sido enviada al taller.</p>
          
          <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Número de Pedido</p>
            <p className="text-4xl font-black text-blue-600">#{numeroPedido}</p>
          </div>

          <Link href="/">
            <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-4 rounded-xl transition-colors shadow-md">
              Volver al Catálogo
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50 flex items-center">
        <button onClick={() => router.back()} className="mr-4 hover:bg-blue-700 p-1 rounded transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </button>
        <h1 className="text-xl font-bold">Checkout</h1>
      </header>

      <div className="p-4 max-w-4xl mx-auto mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Datos de Entrega</h2>
          
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ej. Juan Pérez" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono / WhatsApp</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input required type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ej. 6123-4567" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input required type="email" value={correo} onChange={e => setCorreo(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="ejemplo@correo.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de Entrega</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <textarea required rows={3} value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" placeholder="Calle, número de casa, referencias..."></textarea>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6">
              <p className="text-sm font-bold text-blue-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                Método de Pago: Contra Entrega
              </p>
              <p className="text-xs text-blue-600 mt-1 ml-4">Pagarás el total en efectivo o Yappy al recibir los repuestos.</p>
            </div>
          </form>
        </div>

        {/* Resumen */}
        <div className="bg-gray-900 rounded-2xl shadow-lg p-6 text-white h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6">Resumen del Pedido</h2>
          
          <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-800 pb-3">
                <div className="flex-1 pr-4">
                  <p className="font-medium text-gray-200 truncate">{item.nombre}</p>
                  <p className="text-gray-500 text-xs mt-0.5">Cant: {item.cantidad}</p>
                </div>
                <p className="font-bold text-white">${(item.precio * item.cantidad).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400">Total a Pagar</span>
              <span className="text-3xl font-black text-green-400">${getCartTotal().toFixed(2)}</span>
            </div>
            
            <button 
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-bold py-4 rounded-xl text-lg flex justify-center items-center transition-colors shadow-lg shadow-green-500/20"
            >
              {loading ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
