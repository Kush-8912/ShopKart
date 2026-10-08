import mongoose from 'mongoose'
import Customer from '../models/customer.model.js'
import Product from '../models/product.model.js'

// Fields the wishlist UI needs from each referenced product
const wishlistFields = 'name price category image stock'

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' })
    }

    const productExists = await Product.exists({ _id: productId })

    if (!productExists) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    // Only matches if the product is NOT already in the wishlist, so the check and
    // the insert happen in one atomic operation (no duplicates even on double clicks)
    const updated = await Customer.findOneAndUpdate(
      { _id: req.user._id, wishlist: { $ne: productId } },
      { $addToSet: { wishlist: productId } }
    )

    if (!updated) {
      return res.status(409).json({ success: false, message: 'Product already in wishlist' })
    }

    return res.status(201).json({ success: true, message: 'Product added to wishlist' })

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id)
      .select('wishlist')
      .populate({ path: 'wishlist', select: wishlistFields })

    // populate() returns null for products that were deleted after being saved
    const wishlist = (customer?.wishlist || []).filter(Boolean)

    return res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist
    })

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' })
    }

    // Only matches if the product IS in the wishlist
    const updated = await Customer.findOneAndUpdate(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } }
    )

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not in wishlist' })
    }

    return res.status(200).json({ success: true, message: 'Product removed from wishlist' })

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// Bonus: PATCH /wishlist/:productId/toggle — adds if missing, removes if present
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' })
    }

    const removed = await Customer.findOneAndUpdate(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } }
    )

    if (removed) {
      return res.status(200).json({ success: true, inWishlist: false, message: 'Product removed from wishlist' })
    }

    const productExists = await Product.exists({ _id: productId })

    if (!productExists) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    await Customer.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: productId } })

    return res.status(200).json({ success: true, inWishlist: true, message: 'Product added to wishlist' })

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}
