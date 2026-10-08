import { api } from './api.js'

// POST /orders/create-payment-order — only the shipping address is sent.
// Items, prices and the total are worked out by the backend from the cart.
export const createPaymentOrder = async (shippingAddress) => {
  const res = await api.post('/orders/create-payment-order', { shippingAddress })
  return res.data // { shopKartOrderId, razorpayOrderId, amount, currency, key }
}

// POST /orders/verify-payment — hands Razorpay's response to the backend to check
export const verifyPayment = async (payload) => {
  const res = await api.post('/orders/verify-payment', payload)
  return res.data.order
}

// GET /orders
export const getOrders = async () => {
  const res = await api.get('/orders')
  return res.data.orders
}

// GET /orders/:id
export const getOrderById = async (id) => {
  const res = await api.get(`/orders/${id}`)
  return res.data.order
}

// Bonus (development only): PATCH /orders/:id/advance-status
export const advanceOrderStatus = async (id) => {
  const res = await api.patch(`/orders/${id}/advance-status`)
  return res.data.order
}
