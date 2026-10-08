import mongoose from 'mongoose'
import Product from '../models/product.model.js'

// Fields the product listing UI actually needs
const listFields = 'name price category image stock'

// Escape special regex characters so user search text is matched literally
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Bonus: allowed ?sort= values mapped to MongoDB sort objects.
// _id is a tie-breaker so products with the same price keep a stable order.
const SORT_OPTIONS = {
  newest: { createdAt: -1, _id: -1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: -1 }
}

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body

    if (!name || !description || !category || !image || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'All fields are mandatory' })
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a number greater than 0' })
    }

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ success: false, message: 'Stock must be a number and cannot be negative' })
    }

    const product = await Product.create({ name, description, price, category, image, stock })

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    })

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message })
    }
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const getProducts = async (req, res) => {
  try {
    const { search, category, sort = 'newest' } = req.query

    if (!Object.hasOwn(SORT_OPTIONS, sort)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sort value. Use one of: ${Object.keys(SORT_OPTIONS).join(', ')}`
      })
    }

    // Build the MongoDB filter dynamically from whichever query params are present
    const filter = {}

    if (search && search.trim()) {
      filter.name = { $regex: escapeRegex(search.trim()), $options: 'i' }
    }

    if (category && category.trim()) {
      filter.category = category.trim()
    }

    const products = await Product.find(filter).select(listFields).sort(SORT_OPTIONS[sort])

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    })

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' })
    }

    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    return res.status(200).json({ success: true, product })

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}
