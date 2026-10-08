import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrderById, advanceOrderStatus } from '../services/order.service.js'
import { formatDateTime, formatPrice, shortOrderId } from '../utils/format.js'
import Navbar from '../components/Navbar.jsx'
import OrderSummary from '../components/OrderSummary.jsx'
import { StatusBadge, StatusTracker } from '../components/OrderStatus.jsx'

const primaryButton =
  'px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm text-center transition-colors'
const secondaryButton =
  'px-6 py-2.5 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/60 text-zinc-200 font-medium rounded-xl text-sm text-center transition-colors'

// Used for both /orders/:id and /order-success/:id (success adds the confirmation banner)
function OrderDetails({ success = false }) {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [advancing, setAdvancing] = useState(false)

  useEffect(() => {
    let ignore = false

    const fetchOrder = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getOrderById(id)
        if (!ignore) setOrder(data)
      } catch (err) {
        if (ignore) return
        const status = err.response?.status
        // 404 covers both "doesn't exist" and "belongs to someone else"
        setError(status === 404 || status === 400 ? 'Order not found.' : 'Unable to load this order.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchOrder()

    return () => {
      ignore = true
    }
  }, [id])

  // Bonus (dev only): move the order to its next status
  const handleAdvance = async () => {
    setAdvancing(true)
    try {
      setOrder(await advanceOrderStatus(id))
    } catch {
      // the button simply stays as it was
    } finally {
      setAdvancing(false)
    }
  }

  const renderContent = () => {
    if (loading) {
      return <p className="py-16 text-center text-sm text-zinc-400">Loading order...</p>
    }

    if (error) {
      return (
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <p className="text-lg font-medium">{error}</p>
          <Link to="/orders" className={primaryButton}>View My Orders</Link>
        </div>
      )
    }

    const paid = order.paymentStatus === 'PAID'
    const { shippingAddress: address } = order
    const canAdvance = import.meta.env.DEV && paid && order.status !== 'DELIVERED'

    return (
      <div className="space-y-6">
        {success && paid && (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
            <p className="text-4xl" aria-hidden="true">✅</p>
            <h1 className="text-2xl font-semibold tracking-tight">Order Placed Successfully</h1>
            <p className="text-sm text-zinc-300">Your payment was verified and your order has been saved.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <div className="lg:col-span-3 space-y-6">
            <section className="p-5 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">Order {shortOrderId(order._id)}</h2>
                  <p className="text-xs text-zinc-400">Placed {formatDateTime(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <StatusTracker status={order.status} />

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm border-t border-zinc-800 pt-4">
                <div>
                  <dt className="text-xs text-zinc-400">Order ID</dt>
                  <dd className="font-mono text-xs break-all">{order._id}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-400">Total</dt>
                  <dd className="font-semibold">{formatPrice(order.totalAmount)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-400">Payment</dt>
                  <dd className={paid ? 'text-emerald-400' : 'text-amber-400'}>{order.paymentStatus}</dd>
                </div>
                {order.razorpayPaymentId && (
                  <div>
                    <dt className="text-xs text-zinc-400">Payment ID</dt>
                    <dd className="font-mono text-xs break-all">{order.razorpayPaymentId}</dd>
                  </div>
                )}
              </dl>

              {canAdvance && (
                <button type="button" onClick={handleAdvance} disabled={advancing} className={`${secondaryButton} w-full disabled:opacity-50`}>
                  {advancing ? 'Updating...' : 'Advance status (dev only)'}
                </button>
              )}
            </section>

            <section className="p-5 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl space-y-2">
              <h2 className="text-lg font-semibold">Shipping To</h2>
              <address className="not-italic text-sm text-zinc-300 leading-relaxed">
                {address.fullName}<br />
                {address.addressLine1}<br />
                {address.city}, {address.state} {address.pincode}<br />
                Phone: {address.phone}
              </address>
            </section>
          </div>

          <div className="lg:col-span-2 lg:sticky lg:top-6">
            {/* Snapshot prices: what was paid, even if the product price changes later */}
            <OrderSummary title="Items" items={order.items} total={order.totalAmount} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/orders" className={primaryButton}>View My Orders</Link>
          <Link to="/products" className={secondaryButton}>Continue Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {!success && (
          <Link to="/orders" className="inline-block text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            ← Back to orders
          </Link>
        )}
        {renderContent()}
      </div>
    </div>
  )
}

export default OrderDetails
