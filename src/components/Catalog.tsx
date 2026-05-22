"use client"

import { useStore, Producto } from '@/lib/store'
import { ShoppingCart, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'

interface CatalogProps {
  categorias: any[]
  productos: Producto[]
}

export default function Catalog({ categorias, productos }: CatalogProps) {
  const addToCart = useStore(state => state.addToCart)
  const cart = useStore(state => state.cart)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const cartItemsCount = cart.reduce((acc, item) => acc + item.cantidad, 0)

  // 1. Filtrar los datos completos (Búsqueda)
  const filteredData = useMemo(() => {
    const isSearching = searchTerm.length >= 3
    
    if (!isSearching) {
      return { categorias, productos }
    }

    const term = searchTerm.toLowerCase()
    const filteredProductos = productos.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.codigo.toLowerCase().includes(term)
    )

    const categoriasIds = new Set(filteredProductos.map(p => p.categoria_id))
    const filteredCategorias = categorias.filter(c => categoriasIds.has(c.id))

    return { categorias: filteredCategorias, productos: filteredProductos }
  }, [searchTerm, categorias, productos])

  // 2. Paginar los productos filtrados
  const totalProductos = filteredData.productos.length
  const totalPages = Math.max(1, Math.ceil(totalProductos / itemsPerPage))
  
  const paginatedProductos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredData.productos.slice(start, start + itemsPerPage)
  }, [filteredData.productos, currentPage, itemsPerPage])

  // 3. Obtener solo las categorías relevantes para la página actual
  const paginatedCategorias = useMemo(() => {
    const categoriasIds = new Set(paginatedProductos.map(p => p.categoria_id))
    return filteredData.categorias.filter(c => categoriasIds.has(c.id))
  }, [filteredData.categorias, paginatedProductos])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Volver a la página 1 al buscar
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Sticky Search Bar */}
      <div className="sticky top-[68px] z-40 bg-white/90 backdrop-blur-md shadow-sm p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-2xl flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm text-gray-900 shadow-inner"
            placeholder="Buscar por referencia o nombre (ej. 30205 o RODAMIENTO)..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        {/* Contador de Productos */}
        <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-semibold border border-blue-100 shadow-sm whitespace-nowrap">
          {totalProductos} {totalProductos === 1 ? 'producto encontrado' : 'productos encontrados'}
        </div>
      </div>

      {searchTerm.length > 0 && searchTerm.length < 3 && (
        <p className="text-xs text-center text-gray-500 mt-2">Escribe al menos 3 letras para buscar...</p>
      )}

      <div className="p-4 max-w-7xl mx-auto">
        {paginatedCategorias?.map((cat) => {
          const prodsCat = paginatedProductos.filter((p) => p.categoria_id === cat.id)
          if (prodsCat.length === 0) return null

          return (
            <div key={cat.id} className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2 inline-block">
                {cat.nombre}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {prodsCat.map((prod) => (
                  <div key={prod.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden flex flex-col transition-all duration-200 group">
                    <div className="p-5 flex-grow flex gap-4">
                      {prod.imagen_url ? (
                        <div className="w-24 h-24 relative flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={prod.imagen_url} 
                            alt={prod.nombre}
                            className="object-contain w-full h-full p-1 group-hover:scale-105 transition-transform duration-300 bg-white"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 relative flex-shrink-0 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100">
                          <span className="text-gray-400 text-xs text-center px-2">Sin imagen</span>
                        </div>
                      )}
                      <div className="flex flex-col justify-between w-full">
                        <div>
                          <h3 className="font-bold text-gray-900 leading-tight mb-1 text-sm">{prod.nombre}</h3>
                          <div className="inline-block bg-gray-100 px-2 py-0.5 rounded text-[11px] text-gray-700 font-mono mb-2">
                            Ref: {prod.codigo}
                          </div>
                          <p className="text-[11px] text-gray-500 whitespace-pre-line line-clamp-2">{prod.descripcion}</p>
                        </div>
                        <p className="text-lg font-black text-blue-600 mt-2">${prod.precio.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50/50 border-t border-gray-100">
                      <button 
                        onClick={() => addToCart(prod)}
                        className="w-full bg-white hover:bg-blue-50 border-2 border-blue-100 text-blue-600 hover:text-blue-700 active:bg-blue-100 font-bold py-2.5 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Paginación UI */}
        {totalProductos > 0 && (
          <div className="mt-12 flex flex-col items-center justify-center gap-4 border-t border-gray-200 pt-8 pb-4">
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-gray-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="px-4 font-medium text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-gray-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {totalProductos === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 mt-10">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800">No se encontraron productos</h3>
            <p className="text-gray-500 mt-2">Intenta con otra referencia o nombre.</p>
          </div>
        )}
      </div>
      
      {/* Floating Action Button for Cart */}
      {cartItemsCount > 0 && (
        <Link href="/cart" className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-full p-4 shadow-lg shadow-green-500/30 flex items-center justify-center relative transition-transform hover:scale-105">
            <ShoppingCart className="w-7 h-7" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-sm">
              {cartItemsCount}
            </span>
          </div>
        </Link>
      )}
    </>
  )
}
