import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { getWishlist, WISHLIST_CHANGED } from '../services/wishlist.service.js'
import { useCart } from '../context/CartContext.jsx'
import Logo from './Logo.jsx'
import { CartIcon, GridIcon, HeartIcon, HomeIcon, LogoutIcon, PackageIcon } from './Icons.jsx'

const LINKS = [
  { to: '/home', label: 'Home', icon: HomeIcon },
  { to: '/products', label: 'Products', icon: GridIcon },
  { to: '/wishlist', label: 'Wishlist', icon: HeartIcon },
  { to: '/cart', label: 'Cart', icon: CartIcon },
  { to: '/orders', label: 'Orders', icon: PackageIcon }
]

// Always shown once known (including 0), e.g. "Cart (0)" right after an order is placed
function CountBadge({ count }) {
  if (count === null || count === undefined) return null
  return (
    <span
      aria-label={`(${count})`}
      className={`min-w-5 h-5 px-1.5 grid place-items-center rounded-full text-[11px] font-semibold tabular-nums transition-colors ${
        count > 0 ? 'bg-brand-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
      }`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

// Rendered once by ProtectedRoute, so it stays mounted while the user moves between pages
function Navbar({ customer }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [wishlistCount, setWishlistCount] = useState(null)
  // Cart count is derived from the shared cart state: no separate fetch here
  const { totalUnits, loading: cartLoading, error: cartError } = useCart()

  // /products/123 still counts as "Products"; /order-success/… highlights nothing
  const activeTo = LINKS.find(({ to }) => pathname === to || pathname.startsWith(`${to}/`))?.to

  // The highlight is one element that moves to the active link, so it slides between them
  const linksRef = useRef(null)
  const linkRefs = useRef({})
  const [pill, setPill] = useState(null) // { left, top, width, height } of the active link

  useLayoutEffect(() => {
    const measure = () => {
      const el = activeTo && linkRefs.current[activeTo]
      setPill((prev) => {
        if (!el) return prev && { ...prev, hidden: true }
        return { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight, animate: Boolean(prev) }
      })
    }

    measure()
    // Link widths change when a count badge appears or the window resizes
    const observer = new ResizeObserver(measure)
    if (linksRef.current) observer.observe(linksRef.current)
    Object.values(linkRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [activeTo])

  // On phones the links scroll sideways: keep the active one in view
  useEffect(() => {
    linkRefs.current[activeTo]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [activeTo])

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

  const counts = {
    '/wishlist': wishlistCount,
    '/cart': !cartLoading && !cartError ? totalUnits : null
  }
  const firstName = customer?.fullName?.split(' ')[0]

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md text-zinc-100">
      <nav className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3">
        <Link to="/home" aria-label="ShopKart home">
          <Logo />
        </Link>

        {/* On phones the links drop to their own row and scroll sideways */}
        <div ref={linksRef} className="relative order-last w-full md:order-none md:w-auto flex items-center gap-1 overflow-x-auto -mx-1 px-1">
          {pill && (
            <span
              aria-hidden="true"
              className={`absolute rounded-lg bg-zinc-800 ease-out motion-reduce:transition-none ${
                pill.animate ? 'transition-all duration-300' : ''
              } ${pill.hidden ? 'opacity-0' : 'opacity-100'}`}
              style={{ left: pill.left, top: pill.top, width: pill.width, height: pill.height }}
            />
          )}
          {LINKS.map(({ to, label, icon: LinkIcon }) => (
            <Link
              key={to}
              to={to}
              ref={(el) => { linkRefs.current[to] = el }}
              aria-current={to === activeTo ? 'page' : undefined}
              className={`relative shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors duration-300 ${
                to === activeTo ? 'text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <LinkIcon className="w-4 h-4" /> {label} <CountBadge count={counts[to]} />
            </Link>
          ))}
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
