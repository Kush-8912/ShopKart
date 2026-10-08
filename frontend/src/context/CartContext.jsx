import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as cartService from '../services/cart.service.js'

const CartContext = createContext(null)

// The ONE frontend copy of the cart. Navbar, product cards and the Cart page all
// read from here, so they can never disagree. MongoDB is still the real source of
// truth: after every mutation we replace cartItems with the cart the server returns.
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // productIds with a request in flight, so only that item shows a loading state.
  // The ref blocks duplicate clicks synchronously; the state drives re-renders.
  const pendingRef = useRef(new Set())
  const [pendingIds, setPendingIds] = useState(() => new Set())

  const setPending = (productId, isPending) => {
    if (isPending) pendingRef.current.add(productId)
    else pendingRef.current.delete(productId)
    setPendingIds(new Set(pendingRef.current))
  }

  const refreshCart = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      setCartItems(await cartService.getCart())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load the cart once when the logged-in part of the app mounts
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  // Runs one cart mutation for one product. On success the server's cart becomes
  // our state; on failure state is untouched and the error is re-thrown so the
  // component that triggered it can show a message.
  const mutate = async (productId, request) => {
    if (pendingRef.current.has(productId)) return // ignore duplicate clicks

    setPending(productId, true)
    try {
      setCartItems(await request())
    } catch (err) {
      // Stock or cart contents may have changed on the server; resync quietly
      if (err.response?.status === 400 || err.response?.status === 404) {
        cartService.getCart().then(setCartItems).catch(() => {})
      }
      throw err
    } finally {
      setPending(productId, false)
    }
  }

  const addToCart = (productId) =>
    mutate(productId, () => cartService.addToCart(productId))

  const updateQuantity = (productId, quantity) =>
    mutate(productId, () => cartService.updateCartQuantity(productId, quantity))

  const removeFromCart = (productId) =>
    mutate(productId, () => cartService.removeFromCart(productId))

  // Called after the backend has verified a payment and emptied the cart in MongoDB,
  // so the Navbar shows Cart (0) straight away without a page refresh
  const clearCart = useCallback(() => setCartItems([]), [])

  // Derived values: calculated from cartItems on every change, never stored
  const totalUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const quantityById = useMemo(
    () => new Map(cartItems.map((item) => [item.product._id, item.quantity])),
    [cartItems]
  )

  const value = {
    cartItems,
    loading,
    error,
    totalUnits,
    subtotal,
    getQuantity: (productId) => quantityById.get(productId) || 0,
    isPending: (productId) => pendingIds.has(productId),
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside <CartProvider>')
  return context
}
