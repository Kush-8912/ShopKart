import { api } from './api.js'

// The Navbar listens for this so its "Wishlist (n)" count re-fetches from the backend
// whenever the wishlist changes. Plain browser event — no global state library.
export const WISHLIST_CHANGED = 'wishlist:changed'
const notifyChanged = () => window.dispatchEvent(new Event(WISHLIST_CHANGED))

// GET /wishlist — the backend knows who we are from the JWT cookie
export const getWishlist = async () => {
  const res = await api.get('/wishlist')
  return res.data.wishlist
}

// PATCH /wishlist/:productId/toggle — adds if missing, removes if present.
// Returns { inWishlist } so the UI always ends up matching the server.
export const toggleWishlist = async (productId) => {
  const res = await api.patch(`/wishlist/${productId}/toggle`)
  notifyChanged()
  return res.data
}

// DELETE /wishlist/:productId
export const removeFromWishlist = async (productId) => {
  const res = await api.delete(`/wishlist/${productId}`)
  notifyChanged()
  return res.data
}
