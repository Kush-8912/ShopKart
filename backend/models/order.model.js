import mongoose from 'mongoose'

// Unlike the cart, an order item is a SNAPSHOT: name, price and image are copied
// at purchase time so the order still shows what was paid even if the Product
// is edited or deleted later. The product ref is kept for linking back to it.
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  name: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  quantity: {
    type: Number,
    required: true,
    min: 1
  },

  image: {
    type: String
  }
}, { _id: false })

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  addressLine1: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true }
}, { _id: false })

export const ORDER_STATUSES = ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },

  items: {
    type: [orderItemSchema],
    validate: {
      validator: (items) => items.length > 0,
      message: 'An order needs at least one item'
    }
  },

  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },

  // Always calculated on the server from the latest Product prices
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING'
  },

  status: {
    type: String,
    enum: ORDER_STATUSES,
    default: 'PENDING_PAYMENT'
  },

  // Payment identifiers only; card details never touch our server
  razorpayOrderId: String,
  razorpayPaymentId: String,
  paidAt: Date
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema)

export default Order
