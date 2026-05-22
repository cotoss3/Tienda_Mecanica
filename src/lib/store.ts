import { create } from 'zustand'

export interface Producto {
  id: string
  nombre: string
  codigo: string
  descripcion: string
  precio: number
  imagen_url: string
  categoria_id: string
}

export interface CartItem extends Producto {
  cantidad: number
}

interface StoreState {
  cart: CartItem[]
  addToCart: (product: Producto) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  getCartTotal: () => number
}

export const useStore = create<StoreState>((set, get) => ({
  cart: [],
  addToCart: (product) => set((state) => {
    const existing = state.cart.find(item => item.id === product.id)
    if (existing) {
      return {
        cart: state.cart.map(item =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      }
    }
    return { cart: [...state.cart, { ...product, cantidad: 1 }] }
  }),
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.id !== productId)
  })),
  clearCart: () => set({ cart: [] }),
  getCartTotal: () => {
    return get().cart.reduce((total, item) => total + (item.precio * item.cantidad), 0)
  }
}))
