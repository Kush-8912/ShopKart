import express from 'express'
import {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  advanceOrderStatus
} from '../controllers/order.controller.js'
import { isAuthenticated } from '../middlewares/auth.middleware.js'

const orderRoutes = express.Router()

// Every order route is protected; the user always comes from the JWT (req.user)
orderRoutes.use(isAuthenticated)

orderRoutes.post('/create-payment-order', createPaymentOrder)

// Alias used by the lab's Postman plan (Test 1: POST /orders with an empty cart)
orderRoutes.post('/', createPaymentOrder)

orderRoutes.post('/verify-payment', verifyPayment)

orderRoutes.get('/', getOrders)

orderRoutes.get('/:id', getOrderById)

// Bonus: a development-only shortcut for moving an order through its statuses
if (process.env.NODE_ENV !== 'production') {
  orderRoutes.patch('/:id/advance-status', advanceOrderStatus)
}

export default orderRoutes
