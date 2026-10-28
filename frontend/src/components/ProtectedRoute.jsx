import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { api } from '../services/api.js'
import { CartProvider } from '../context/CartContext.jsx'
import Logo from './Logo.jsx'
import Navbar from './Navbar.jsx'

function Loader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-100">
      <Logo />
      <span className="w-6 h-6 border-2 border-zinc-700 border-t-brand-400 rounded-full animate-spin" />
      <p className="text-sm text-zinc-400">Checking your account...</p>
    </div>
  )
}

// Asks the backend who is logged in (the JWT lives in an httpOnly cookie,
// so the browser can't read it — only the server can verify it).
function useAuthCheck() {
  const location = useLocation()
  const [state, setState] = useState({ loading: true, customer: null })

  useEffect(() => {
    let ignore = false

    api.get('/customers/me')
      .then((res) => { if (!ignore) setState({ loading: false, customer: res.data }) })
      .catch(() => { if (!ignore) setState({ loading: false, customer: null }) })

    return () => { ignore = true }
  }, [location.pathname])

  return state
}

// Wraps pages that need a logged-in customer. Logged-out users go to /login.
export function ProtectedRoute() {
  const { loading, customer } = useAuthCheck()

  if (loading) return <Loader />
  if (!customer) return <Navigate to="/login" replace />

  // The cart belongs to the logged-in customer, so its provider lives here: it loads
  // once after login, stays mounted while navigating, and is cleared on logout.
  return (
    <CartProvider>
      <AppShell customer={customer} />
    </CartProvider>
  )
}

// One Navbar for every logged-in page: it stays mounted while navigating, so its
// highlight can slide between links. Only the page below it changes (and fades in).
function AppShell({ customer }) {
  const { pathname } = useLocation()

  // A new page starts at the top, not wherever the previous one was scrolled to
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar customer={customer} />
      <div key={pathname} className="animate-fade-in">
        <Outlet context={{ customer }} />
      </div>
    </div>
  )
}

// Wraps /login and /register. Logged-in users go straight to /home.
export function PublicRoute() {
  const { loading, customer } = useAuthCheck()

  if (loading) return <Loader />
  if (customer) return <Navigate to="/home" replace />

  return <Outlet />
}
