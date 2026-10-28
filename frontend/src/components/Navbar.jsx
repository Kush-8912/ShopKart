import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useOutletContext } from 'react-router-dom'
import { api } from '../services/api.js'
import { getWishlist, WISHLIST_CHANGED } from '../services/wishlist.service.js'
import { useCart } from '../context/CartContext.jsx'
import Logo from './Logo.jsx'
import { CartIcon, GridIcon, HeartIcon, HomeIcon, LogoutIcon, PackageIcon } from './Icons.jsx'

const linkClass = ({ isActive }) =>
  `shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
    isActive ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
  }`

function CountBadge({ count }) {
  if (!count) return null
  return (
    <span className="min-w-5 h-5 px-1.5 grid place-items-center rounded-full bg-brand-400 text-zinc-950 text-[11px] font-semibold tabular-nums">
      {count > 99 ? '99+' : count}
    </span>
  )
}

function Navbar() {
  const navigate = useNavigate()
  // Every page with a Navbar sits under ProtectedRoute, which provides the customer
  const { customer } = useOutletContext() || {}
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

  const firstName = customer?.fullName?.split(' ')[0]

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md text-zinc-100">
      <nav className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3">
        <Link to="/home" aria-label="ShopKart home">
          <Logo />
        </Link>

        {/* On phones the links drop to their own row and scroll sideways */}
        <div className="order-last w-full md:order-none md:w-auto flex items-center gap-1 overflow-x-auto -mx-1 px-1">
          <NavLink to="/home" className={linkClass}>
            <HomeIcon className="w-4 h-4" /> Home
          </NavLink>
          <NavLink to="/products" className={linkClass}>
            <GridIcon className="w-4 h-4" /> Products
          </NavLink>
          <NavLink to="/wishlist" className={linkClass}>
            <HeartIcon className="w-4 h-4" /> Wishlist <CountBadge count={wishlistCount} />
          </NavLink>
          <NavLink to="/cart" className={linkClass}>
            <CartIcon className="w-4 h-4" /> Cart <CountBadge count={!cartLoading && !cartError ? totalUnits : 0} />
          </NavLink>
          <NavLink to="/orders" className={linkClass}>
            <PackageIcon className="w-4 h-4" /> Orders
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          {firstName && (
            <span className="hidden sm:inline text-sm text-zinc-400">
              Hi, <span className="text-zinc-100 font-medium">{firstName}</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/60 text-zinc-200 font-medium rounded-lg text-sm transition-colors"
          >
            <LogoutIcon className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
