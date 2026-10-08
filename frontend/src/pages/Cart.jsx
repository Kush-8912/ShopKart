import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { formatPrice } from '../utils/format.js'
import Navbar from '../components/Navbar.jsx'
import CartItem from '../components/CartItem.jsx'

function Cart() {
  // Same shared state the Navbar reads, so the count and this page always agree
  const { cartItems, loading, error, totalUnits, subtotal, refreshCart } = useCart()
  const navigate = useNavigate()

  const hasStockIssue = cartItems.some((item) => item.quantity > item.product.stock)

  const renderContent = () => {
    if (loading) {
      return (
        <div className="py-16 flex flex-col items-center gap-3 text-sm text-zinc-400">
          <span className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-200 rounded-full animate-spin" />
          Loading your cart...
        </div>
      )
    }

    if (error) {
      return (
        <div className="py-16 flex flex-col items-center gap-2 text-center">
          <p className="text-lg font-medium text-zinc-100">Unable to load your cart.</p>
          <p className="text-sm text-zinc-400">Please check your connection and try again.</p>
          <button
            type="button"
            onClick={refreshCart}
            className="mt-4 px-6 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      )
    }

    if (cartItems.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center gap-2 text-center">
          <span className="text-4xl" aria-hidden="true">🛒</span>
          <p className="mt-2 text-lg font-medium text-zinc-100">Your cart is empty</p>
          <p className="text-sm text-zinc-400">Looks like you haven't added anything yet.</p>
          <Link
            to="/products"
            className="mt-4 px-6 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>

        <aside className="p-5 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl space-y-4 lg:sticky lg:top-6">
          <h2 className="text-lg font-semibold">Order Summary</h2>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-400">Items</dt>
              <dd className="tabular-nums">{totalUnits}</dd>
            </div>
            <div className="flex justify-between border-t border-zinc-800 pt-3 text-base font-semibold">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
          </dl>

          {hasStockIssue && (
            <p className="text-xs text-amber-400">Fix the stock issues above before checking out.</p>
          )}

          <button
            type="button"
            disabled={hasStockIssue}
            onClick={() => navigate('/checkout')}
            className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Proceed to Checkout
          </button>

          <Link to="/products" className="block text-center text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            Continue shopping →
          </Link>
        </aside>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">My Cart</h1>
          {!loading && !error && cartItems.length > 0 && (
            <p className="text-sm text-zinc-400">
              {totalUnits} {totalUnits === 1 ? 'item' : 'items'} in your cart
            </p>
          )}
        </div>

        {renderContent()}
      </div>
    </div>
  )
}

export default Cart
