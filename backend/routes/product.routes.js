import express from 'express'
import {
  createProduct,
  getProducts,
  getProductById
} from '../controllers/product.controller.js'
import { isAuthenticated } from '../middlewares/auth.middleware.js'

const productRoutes = express.Router()

productRoutes.post('/', isAuthenticated, createProduct)

productRoutes.get('/', getProducts)

productRoutes.get('/:id', getProductById)

export default productRoutes
