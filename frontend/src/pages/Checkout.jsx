import { useRef, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { createPaymentOrder, verifyPayment } from '../services/order.service.js'
import { loadRazorpayScript } from '../utils/razorpay.js'
import { validateShipping, SHIPPING_FIELDS } from '../utils/validateShipping.js'
import { formatPrice } from '../utils/format.js'
import Navbar from '../components/Navbar.jsx'
import CheckoutForm from '../components/CheckoutForm.jsx'
import OrderSummary from '../components/OrderSummary.jsx'

const emptyForm = Object.fromEntries(SHIPPING_FIELDS.map(({ name }) => [name, '']))

const BUTTON_LABELS = {
  creating: 'Creating order...',
  paying: 'Waiting for payment...',
  verifying: 'Verifying payment...'
}

function Checkout() {
  const navigate = useNavigate()
  const { customer } = useOutletContext()
  const { cartItems, loading, error: cartError, subtotal, refreshCart, clearCart } = useCart()

  // Checkout form state is local: only this page needs it
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    fullName: customer?.fullName || '',
    phone: customer?.phone || ''
  }))
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  // idle -> creating (our API) -> paying (Razorpay popup) -> verifying (our API)
  const [phase, setPhase] = useState('idle')
  const busyRef = useRef(false) // blocks a double submit before React re-renders

  const busy = phase !== 'idle'
  const hasStockIssue = cartItems.some((item) => item.quantity > item.product.stock)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear a field's error as soon as the user edits it
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const finish = (message = '') => {
    busyRef.current = false
    setPhase('idle')
    setFormError(message)
  }

  const openRazorpay = (paymentData, shippingAddress) => {
    let failureMessage = ''

    const razorpay = new window.Razorpay({
      key: paymentData.key,
      amount: paymentData.amount, // set by the backend, in paise
      currency: paymentData.currency,
      name: 'ShopKart',
      description: 'ShopKart Order',
      order_id: paymentData.razorpayOrderId,
      prefill: {
        name: shippingAddress.fullName,
        contact: shippingAddress.phone,
        email: customer?.email
      },
      theme: { color: '#18181b' },

      // Razorpay says the payment went through. That's NOT proof: the backend
      // must verify the signature before anything is marked paid.
      handler: async (response) => {
        failureMessage = ''
        setFormError('')
        setPhase('verifying')
        try {
          const order = await verifyPayment({
            shopKartOrderId: paymentData.shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
          // Backend emptied the cart in MongoDB; mirror it in global state now
          clearCart()
          busyRef.current = false
          navigate(`/order-success/${order._id}`, { replace: true })
        } catch (err) {
          finish(
            err.response?.data?.message === 'Invalid payment signature'
              ? 'We could not verify your payment, so the order was not placed. Your cart has not been cleared.'
              : 'We could not confirm your payment. Your cart has not been cleared. If money was deducted, it will be refunded by Razorpay.'
          )
        }
      },

      modal: {
        // Popup closed without a successful payment
        ondismiss: () => {
          finish(failureMessage || 'Payment cancelled. Your cart is unchanged.')
        }
      }
    })

    // A failed attempt keeps the popup open so the user can retry there;
    // remember the reason in case they close it instead
    razorpay.on('payment.failed', (response) => {
      const reason = response.error?.description
      failureMessage = `Payment failed${reason ? `: ${reason}` : ''}. Your cart has not been cleared. Please try again.`
      setFormError(failureMessage)
    })

    setPhase('paying')
    razorpay.open()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (busyRef.current) return

    setFormError('')
    const errors = validateShipping(form)
    setFieldErrors(errors)
    // Basic client validation failed: don't call the backend at all
    if (Object.keys(errors).length > 0) return

    busyRef.current = true
    setPhase('creating')

    const shippingAddress = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()])
    )

    try {
      const [paymentData, scriptLoaded] = await Promise.all([
        createPaymentOrder(shippingAddress),
        loadRazorpayScript()
      ])

      if (!scriptLoaded) {
        finish('Could not load Razorpay Checkout. Check your connection or disable ad blockers, then try again.')
        return
      }

      openRazorpay(paymentData, shippingAddress)
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setFieldErrors(data.errors)
      finish(data?.message || 'Could not start checkout. Please try again.')
      // Stock or availability changed on the server: show the latest cart
      if (err.response?.status === 400 && !data?.errors) refreshCart()
    }
  }

  const renderContent = () => {
    if (loading) {
      return <p className="py-16 text-center text-sm text-zinc-400">Loading checkout...</p>
    }

    if (cartError) {
      return (
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <p className="text-lg font-medium">Unable to load your cart.</p>
          <button type="button" onClick={refreshCart} className="px-6 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm transition-colors">
            Try Again
          </button>
        </div>
      )
    }

    // Opening /checkout directly with nothing in the cart
    if (cartItems.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center gap-2 text-center">
          <span className="text-4xl" aria-hidden="true">🛒</span>
          <p className="mt-2 text-lg font-medium">Your cart is empty</p>
          <p className="text-sm text-zinc-400">Add something to your cart before checking out.</p>
          <Link to="/products" className="mt-4 px-6 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm transition-colors">
            Browse Products
          </Link>
        </div>
      )
    }

    const summaryItems = cartItems.map(({ product, quantity }) => ({
      name: product.name,
      price: product.price,
      image: product.image,
      quantity
    }))

    return (
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <section className="lg:col-span-3 p-5 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Shipping Details</h2>
            <p className="text-sm text-zinc-400">Where should we deliver your order?</p>
          </div>
          <CheckoutForm form={form} errors={fieldErrors} disabled={busy} onChange={handleChange} />
        </section>

        <div className="lg:col-span-2 lg:sticky lg:top-6">
          <OrderSummary
            items={summaryItems}
            total={subtotal}
            footer={
              <div className="space-y-3">
                {hasStockIssue && (
                  <p className="text-xs text-amber-400">
                    Some items exceed the available stock. <Link to="/cart" className="underline">Update your cart</Link> first.
                  </p>
                )}

                {formError && (
                  <p role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy || hasStockIssue}
                  className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {BUTTON_LABELS[phase] || `Place Order · Pay ${formatPrice(subtotal)}`}
                </button>

                <p className="text-xs text-zinc-500 text-center">
                  Payments are processed by Razorpay (Test Mode). The final amount is calculated by the server.
                </p>
                <Link to="/cart" className="block text-center text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                  ← Back to cart
                </Link>
              </div>
            }
          />
        </div>
      </form>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        {renderContent()}
      </div>
    </div>
  )
}

export default Checkout
