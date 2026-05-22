"use client"

import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Cart() {
  const cart = useStore(state => state.cart)
  const getCartTotal = useStore(state => state.getCartTotal)
  const clearCart = useStore(state => state.clearCart)
  const removeFromCart = useStore(state => state.removeFromCart)
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleCheckout = () => {
    router.push('/checkout')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50 flex items-center">
        <button onClick={() => router.back()} className="mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </button>
        <h1 className="text-xl font-bold">Carrito de Compras</h1>
      </header>

      <div className="p-4 max-w-2xl mx-auto mt-4">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Tu carrito está vacío</p>
            <Link href="/">
              <button className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">
                Ver Productos
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {cart.map((item) => (
                <li key={item.id} className="p-4 flex gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.nombre}</h3>
                    <p className="text-sm text-gray-500">Ref: {item.codigo}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-blue-600 font-bold">${item.precio.toFixed(2)} x {item.cantidad}</p>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 text-sm font-medium hover:bg-red-50 px-2 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 font-medium">Total:</span>
                <span className="text-2xl font-black text-gray-900">${getCartTotal().toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg flex justify-center items-center transition-colors"
              >
                Proceder al Pago
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
