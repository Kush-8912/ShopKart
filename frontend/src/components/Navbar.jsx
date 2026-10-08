import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { getWishlist, WISHLIST_CHANGED } from '../services/wishlist.service.js'
import { useCart } from '../context/CartContext.jsx'

const linkClass = ({ isActive }) =>
  isActive ? 'text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-100 transition-colors'

function Navbar() {
  const navigate = useNavigate()
  const [wishlistCount, setWishlistCount] = useState(null)
  // Cart count is derived from the shared cart state: no separate fetch here
  const { totalUnits, loading: cartLoading, error: cartError } = useCart()

  // Count always comes from the backend; re-fetch whenever the wishlist changes
  useEffect(() => {
    let ignore = false

    const fetchCount = () => {
      getWishlist()
        .then((items) => { if (!ignore) setWishlistCount(items.length) })
        .catch(() => { if (!ignore) setWishlistCount(null) })
    }

    fetchCount()
    window.addEventListener(WISHLIST_CHANGED, fetchCount)

    return () => {
      ignore = true
      window.removeEventListener(WISHLIST_CHANGED, fetchCount)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout')
    } catch {
      // proceed to login regardless of API failure
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <nav className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="text-lg font-semibold tracking-tight">ShopKart</span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <NavLink to="/home" className={linkClass}>Home</NavLink>
          <NavLink to="/products" className={linkClass}>Products</NavLink>
          <NavLink to="/wishlist" className={linkClass}>
            Wishlist{wishlistCount !== null && ` (${wishlistCount})`}
          </NavLink>
          <NavLink to="/cart" className={linkClass}>
            Cart{!cartLoading && !cartError && ` (${totalUnits})`}
          </NavLink>
          <NavLink to="/orders" className={linkClass}>Orders</NavLink>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-lg text-sm transition-colors"
      >
        Logout
      </button>
    </nav>
  )
}

export default Navbar
