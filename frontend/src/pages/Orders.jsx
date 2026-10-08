import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOrders } from '../services/order.service.js'
import Navbar from '../components/Navbar.jsx'
import OrderCard from '../components/OrderCard.jsx'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchOrders = useCallback(async (isIgnored = () => false) => {
    setLoading(true)
    setError(false)
    try {
      const data = await getOrders()
      if (!isIgnored()) setOrders(data)
    } catch {
      if (!isIgnored()) setError(true)
    } finally {
      if (!isIgnored()) setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    fetchOrders(() => ignore)
    return () => {
      ignore = true
    }
  }, [fetchOrders])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="py-16 flex flex-col items-center gap-3 text-sm text-zinc-400">
          <span className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-200 rounded-full animate-spin" />
          Loading your orders...
        </div>
      )
    }

    if (error) {
      return (
        <div className="py-16 flex flex-col items-center gap-2 text-center">
          <p className="text-lg font-medium">Unable to load your orders.</p>
          <p className="text-sm text-zinc-400">Please check your connection and try again.</p>
          <button
            type="button"
            onClick={() => fetchOrders()}
            className="mt-4 px-6 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      )
    }

    if (orders.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center gap-2 text-center">
          <span className="text-4xl" aria-hidden="true">📦</span>
          <p className="mt-2 text-lg font-medium">You have not placed any orders yet.</p>
          <p className="text-sm text-zinc-400">Your order history will appear here.</p>
          <Link
            to="/products"
            className="mt-4 px-6 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">My Orders</h1>
          {!loading && !error && orders.length > 0 && (
            <p className="text-sm text-zinc-400">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}, newest first
            </p>
          )}
        </div>

        {renderContent()}
      </div>
    </div>
  )
}

export default Orders
