import express from 'express'
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist
} from '../controllers/wishlist.controller.js'
import { isAuthenticated } from '../middlewares/auth.middleware.js'

const wishlistRoutes = express.Router()

// Every wishlist route is protected; the user always comes from the JWT (req.user)
wishlistRoutes.use(isAuthenticated)

wishlistRoutes.get('/', getWishlist)

wishlistRoutes.post('/:productId', addToWishlist)

wishlistRoutes.delete('/:productId', removeFromWishlist)

wishlistRoutes.patch('/:productId/toggle', toggleWishlist)

export default wishlistRoutes
