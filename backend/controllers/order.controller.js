import crypto from 'crypto'
import mongoose from 'mongoose'
import Customer from '../models/customer.model.js'
import Product from '../models/product.model.js'
import Order, { ORDER_STATUSES } from '../models/order.model.js'
import { getRazorpay } from '../config/razorpay.js'
import validateShippingAddress from '../utils/validateShippingAddress.js'

const serverError = (res, error) =>
  res.status(500).json({ success: false, message: 'Server error', error: error.message })

// Compares two hex signatures in constant time (plain === leaks timing information)
const signaturesMatch = (expected, received) => {
  if (typeof received !== 'string' || received.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))
}

// POST /orders/create-payment-order   body: { shippingAddress }
// Everything except the address comes from the database, never from the client.
export const createPaymentOrder = async (req, res) => {
  try {
    const { address, errors } = validateShippingAddress(req.body?.shippingAddress)

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid shipping details', errors })
    }

    const razorpay = getRazorpay()

    if (!razorpay) {
      return res.status(503).json({ success: false, message: 'Payments are not configured on the server' })
    }

    // 1) The authenticated user's cart, with the LATEST product data
    const customer = await Customer.findById(req.user._id)
      .select('cart')
      .populate({ path: 'cart.product', select: 'name price image stock' })

    const cart = customer?.cart || []

    if (cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' })
    }

    // 2) Final validation + server-side total + snapshot, item by item
    const items = []
    let totalAmount = 0

    for (const cartItem of cart) {
      const product = cartItem.product

      // populate() gives null if the product was deleted after being added
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'A product in your cart is no longer available. Please remove it and try again.'
        })
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: product.stock === 0
            ? `${product.name} is out of stock.`
            : `Insufficient stock for ${product.name}. Only ${product.stock} left.`
        })
      }

      totalAmount += product.price * cartItem.quantity

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image
      })
    }

    // 3) Our own order first, PENDING_PAYMENT. The cart is NOT touched here.
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: address,
      totalAmount
    })

    // 4) Razorpay order for the server-calculated amount, in paise (₹1 = 100 paise)
    let razorpayOrder
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: order._id.toString()
      })
    } catch (err) {
      order.paymentStatus = 'FAILED'
      await order.save()
      return res.status(502).json({
        success: false,
        message: 'Could not start the payment. Please try again.',
        error: err.error?.description || err.message
      })
    }

    order.razorpayOrderId = razorpayOrder.id
    await order.save()

    // Only safe values go back: the Key ID is public, the Key Secret never leaves the server
    return res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    })

  } catch (error) {
    return serverError(res, error)
  }
}

// POST /orders/verify-payment
// body: { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature
    } = req.body || {}

    if (!mongoose.isValidObjectId(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' })
    }

    if (!razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment details are missing' })
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ success: false, message: 'Payments are not configured on the server' })
    }

    // Ownership is part of the query: another user's order simply isn't found
    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    // Already verified (e.g. a retried request): nothing more to do
    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({ success: true, message: 'Payment already verified', order })
    }

    if (!order.razorpayOrderId || (razorpayOrderId && razorpayOrderId !== order.razorpayOrderId)) {
      return res.status(400).json({ success: false, message: 'Payment does not match this order' })
    }

    // The HMAC uses the Razorpay order id WE stored, not whatever the browser sent.
    // Only Razorpay and this server know the secret, so a valid signature proves
    // Razorpay really captured this payment for this order.
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    if (!signaturesMatch(expectedSignature, razorpaySignature)) {
      // Order stays PENDING and the cart stays as it is
      return res.status(400).json({ success: false, message: 'Invalid payment signature' })
    }

    // Atomic PENDING -> PAID transition, so two simultaneous verify calls
    // can't both decrement stock and clear the cart
    const paidOrder = await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: { $ne: 'PAID' } },
      {
        $set: {
          paymentStatus: 'PAID',
          status: 'PLACED',
          razorpayPaymentId,
          paidAt: new Date()
        }
      },
      { new: true }
    )

    if (!paidOrder) {
      const existing = await Order.findById(order._id)
      return res.status(200).json({ success: true, message: 'Payment already verified', order: existing })
    }

    // The purchased units leave the shelf (guarded so stock never goes negative)
    await Product.bulkWrite(paidOrder.items.map((item) => ({
      updateOne: {
        filter: { _id: item.product, stock: { $gte: item.quantity } },
        update: { $inc: { stock: -item.quantity } }
      }
    })))

    // Only now, after verified payment, is the cart cleared
    await Customer.updateOne({ _id: req.user._id }, { $set: { cart: [] } })

    return res.status(200).json({ success: true, message: 'Payment verified, order placed', order: paidOrder })

  } catch (error) {
    return serverError(res, error)
  }
}

// GET /orders — order history: the user's placed orders, newest first.
// Abandoned PENDING_PAYMENT attempts are kept in the DB but not listed.
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, status: { $ne: 'PENDING_PAYMENT' } })
      .sort({ createdAt: -1 })

    return res.status(200).json({ success: true, count: orders.length, orders })
  } catch (error) {
    return serverError(res, error)
  }
}

// GET /orders/:id
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' })
    }

    // Filtering by user means someone else's order gives the same 404 as a
    // non-existent one, so IDs can't be probed
    const order = await Order.findOne({ _id: id, user: req.user._id })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    return res.status(200).json({ success: true, order })
  } catch (error) {
    return serverError(res, error)
  }
}

// Bonus — PATCH /orders/:id/advance-status (development only)
// Moves a paid order one step: PLACED -> CONFIRMED -> SHIPPED -> DELIVERED
export const advanceOrderStatus = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' })
    }

    const order = await Order.findOne({ _id: id, user: req.user._id })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    if (order.paymentStatus !== 'PAID') {
      return res.status(400).json({ success: false, message: 'Only paid orders can progress' })
    }

    const next = ORDER_STATUSES[ORDER_STATUSES.indexOf(order.status) + 1]

    if (!next) {
      return res.status(400).json({ success: false, message: 'Order is already delivered' })
    }

    order.status = next
    await order.save()

    return res.status(200).json({ success: true, message: `Order ${next.toLowerCase()}`, order })
  } catch (error) {
    return serverError(res, error)
  }
}
