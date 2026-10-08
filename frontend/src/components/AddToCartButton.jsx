import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { getCartErrorMessage } from '../services/cart.service.js'

function AddToCartButton({ product, className = '' }) {
  const { addToCart, getQuantity, isPending } = useCart()
  const [error, setError] = useState('')

  const inCart = getQuantity(product._id)
  const adding = isPending(product._id)
  const outOfStock = product.stock === 0
  const atLimit = !outOfStock && inCart >= product.stock

  const handleClick = async () => {
    setError('')
    try {
      await addToCart(product._id)
    } catch (err) {
      if (err.response?.status === 401) setError('Please log in again to use your cart.')
      else setError(getCartErrorMessage(err, 'Unable to add to cart. Please try again.'))
    }
  }

  let label = inCart > 0 ? `Add Another (${inCart} in cart)` : 'Add to Cart'
  if (adding) label = 'Adding...'
  else if (outOfStock) label = 'Out of Stock'
  else if (atLimit) label = `Max in cart (${inCart})`

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={adding || outOfStock || atLimit}
        className={`w-full py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {label}
      </button>
      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default AddToCartButton
