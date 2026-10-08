import { api } from './api.js'

// Every cart endpoint returns the full populated cart: [{ product: {...}, quantity }]
// The backend knows who we are from the JWT cookie, so no userId is ever sent.

// GET /cart
export const getCart = async () => {
  const res = await api.get('/cart')
  return res.data.cart
}

// POST /cart/:productId — adds with quantity 1, or +1 if already in the cart
export const addToCart = async (productId) => {
  const res = await api.post(`/cart/${productId}`)
  return res.data.cart
}

// PATCH /cart/:productId  { quantity }
export const updateCartQuantity = async (productId, quantity) => {
  const res = await api.patch(`/cart/${productId}`, { quantity })
  return res.data.cart
}

// DELETE /cart/:productId
export const removeFromCart = async (productId) => {
  const res = await api.delete(`/cart/${productId}`)
  return res.data.cart
}

// Turns an axios error into a message the UI can show (e.g. "Only 5 units in stock")
export const getCartErrorMessage = (err, fallback) =>
  err.response?.data?.message || fallback
