import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  }
}, { _id: false })

const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    // Stored as "john@gmail.com" whatever the user typed, so it can't be registered twice in different cases
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  // References to Product documents (not copies), so Product stays the source of truth
  wishlist: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    default: []
  },

  // Like wishlist, but each entry also needs a quantity. Price/stock are NOT copied here;
  // they're read from the referenced Product so they're always current.
  cart: {
    type: [cartItemSchema],
    default: []
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Customer = mongoose.model('Customer', customerSchema)

export default Customer
