import mongoose from 'mongoose'
import Customer from '../models/customer.model.js'
import Product from '../models/product.model.js'

// Fields the cart UI needs from each referenced product
const cartProductFields = 'name price category image stock'

// Every cart endpoint responds with the full, populated cart so the frontend
// can replace its state with exactly what the database holds.
const getPopulatedCart = async (customerId) => {
  const customer = await Customer.findById(customerId)
    .select('cart')
    .populate({ path: 'cart.product', select: cartProductFields })

  // populate() returns null for products that were deleted after being added
  return (customer?.cart || []).filter((item) => item.product)
}

const sendCart = async (res, status, message, customerId) => {
  const cart = await getPopulatedCart(customerId)
  return res.status(status).json({ success: true, message, cart })
}

export const getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id)
    return res.status(200).json({ success: true, cart })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' })
    }

    const product = await Product.findById(productId).select('stock')

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    if (product.stock < 1) {
      return res.status(400).json({ success: false, message: 'Product is out of stock' })
    }

    // 1) Already in cart: +1, but only if the current quantity is still below stock.
    //    The stock check is part of the filter, so check + increment are one atomic step.
    const incremented = await Customer.findOneAndUpdate(
      { _id: req.user._id, cart: { $elemMatch: { product: productId, quantity: { $lt: product.stock } } } },
      { $inc: { 'cart.$.quantity': 1 } }
    )

    if (incremented) {
      return sendCart(res, 200, 'Cart updated', req.user._id)
    }

    // 2) Not in cart yet: push a new row with quantity 1 (filter prevents duplicate rows)
    const added = await Customer.findOneAndUpdate(
      { _id: req.user._id, 'cart.product': { $ne: productId } },
      { $push: { cart: { product: productId, quantity: 1 } } }
    )

    if (added) {
      return sendCart(res, 201, 'Product added to cart', req.user._id)
    }

    // 3) Neither matched: it's in the cart and already at the stock limit
    return res.status(400).json({
      success: false,
      message: `Only ${product.stock} units in stock`
    })

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params
    const quantity = req.body?.quantity

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' })
    }

    if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
      return res.status(400).json({ success: false, message: 'Quantity must be a whole number' })
    }

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' })
    }

    const product = await Product.findById(productId).select('stock')

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    // Always checked against the latest stock, not what it was when the item was added
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units in stock`
      })
    }

    const updated = await Customer.findOneAndUpdate(
      { _id: req.user._id, 'cart.product': productId },
      { $set: { 'cart.$.quantity': quantity } }
    )

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not in cart' })
    }

    return sendCart(res, 200, 'Cart updated', req.user._id)

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' })
    }

    // Only matches if the product IS in the cart
    const updated = await Customer.findOneAndUpdate(
      { _id: req.user._id, 'cart.product': productId },
      { $pull: { cart: { product: productId } } }
    )

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not in cart' })
    }

    return sendCart(res, 200, 'Product removed from cart', req.user._id)

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}
