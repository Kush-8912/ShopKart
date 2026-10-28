import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { getCartErrorMessage } from '../services/cart.service.js'
import { MinusIcon, PlusIcon, TrashIcon } from './Icons.jsx'

const stepClass =
  'grid place-items-center h-full aspect-square rounded-lg text-zinc-200 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors'

// "Add to Cart" until the product is in the cart, then a [− qty +] stepper like
// other shops. Everything goes through the shared cart state, so the Navbar and
// Cart page update at the same time.
function AddToCartButton({ product, size = 'md' }) {
  const { addToCart, updateQuantity, removeFromCart, getQuantity, isPending } = useCart()
  const [error, setError] = useState('')

  const inCart = getQuantity(product._id)
  const pending = isPending(product._id)
  const outOfStock = product.stock === 0
  const atLimit = inCart >= product.stock
  const height = size === 'lg' ? 'h-12' : 'h-9'

  const run = async (action, fallback) => {
    setError('')
    try {
      await action()
    } catch (err) {
      if (err.response?.status === 401) setError('Please log in again to use your cart.')
      else setError(getCartErrorMessage(err, fallback))
    }
  }

  const add = () => run(() => addToCart(product._id), 'Unable to add to cart. Please try again.')
  const increase = () => run(() => updateQuantity(product._id, inCart + 1), 'Unable to update quantity.')
  // Quantity never goes below 1: at 1 the minus becomes an explicit Remove (bin) button
  const decrease = () =>
    inCart > 1
      ? run(() => updateQuantity(product._id, inCart - 1), 'Unable to update quantity.')
      : run(() => removeFromCart(product._id), 'Unable to remove product.')

  return (
    <div className="space-y-1.5">
      {inCart === 0 ? (
        <button
          type="button"
          onClick={add}
          disabled={pending || outOfStock}
          className={`w-full ${height} bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {pending ? 'Adding...' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      ) : (
        <div className={`flex items-center justify-between gap-2 ${height} p-1 bg-zinc-900 border border-zinc-700 rounded-xl`}>
          <button
            type="button"
            onClick={decrease}
            disabled={pending}
            aria-label={inCart > 1 ? 'Decrease quantity' : 'Remove from cart'}
            className={`${stepClass} ${inCart > 1 ? '' : 'text-rose-300'}`}
          >
            {inCart > 1 ? <MinusIcon className="w-4 h-4" /> : <TrashIcon className="w-4 h-4" />}
          </button>

          <span
            className="flex items-center justify-center text-sm font-semibold tabular-nums"
            aria-live="polite"
            aria-label={pending ? 'Updating' : `${inCart} in cart`}
          >
            {pending ? (
              <span className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin" />
            ) : (
              inCart
            )}
          </span>

          <button
            type="button"
            onClick={increase}
            disabled={pending || atLimit}
            aria-label="Increase quantity"
            title={atLimit ? `Only ${product.stock} available` : undefined}
            className={stepClass}
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {inCart > 0 && atLimit && !error && (
        <p className="text-xs text-amber-400">Max available ({product.stock}) is in your cart.</p>
      )}
      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default AddToCartButton
