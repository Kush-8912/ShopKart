import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { getCartErrorMessage } from '../services/cart.service.js'
import { formatPrice } from '../utils/format.js'

const stepButtonClass =
  'w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'

function CartItem({ item }) {
  const { product, quantity } = item
  const { updateQuantity, removeFromCart, isPending } = useCart()
  const [error, setError] = useState('')

  // Only THIS item's controls are disabled while its request runs
  const pending = isPending(product._id)
  // Stock may have dropped since this was added; the latest stock always wins
  const overStock = quantity > product.stock

  const run = async (action, fallback) => {
    setError('')
    try {
      await action()
    } catch (err) {
      setError(getCartErrorMessage(err, fallback))
    }
  }

  const decrease = () =>
    run(() => updateQuantity(product._id, quantity - 1), 'Unable to update quantity.')
  const increase = () =>
    run(() => updateQuantity(product._id, quantity + 1), 'Unable to update quantity.')
  const fixToStock = () =>
    run(() => updateQuantity(product._id, product.stock), 'Unable to update quantity.')
  const remove = () =>
    run(() => removeFromCart(product._id), 'Unable to remove product.')

  return (
    <div className={`flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl ${pending ? 'opacity-70' : ''}`}>
      <Link to={`/products/${product._id}`} className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-zinc-900 rounded-xl overflow-hidden">
        <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
      </Link>

      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            <Link to={`/products/${product._id}`} className="font-medium text-zinc-100 hover:underline leading-snug">
              {product.name}
            </Link>
            <p className="text-xs text-zinc-400">{product.category}</p>
            <p className="text-sm text-zinc-300 mt-1">{formatPrice(product.price)} each</p>
          </div>
          <p className="text-lg font-semibold text-zinc-100">{formatPrice(product.price * quantity)}</p>
        </div>

        <div className="mt-auto pt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            {/* At quantity 1 the user removes the item explicitly instead */}
            <button type="button" onClick={decrease} disabled={pending || quantity <= 1} className={stepButtonClass} aria-label="Decrease quantity">
              −
            </button>
            <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button type="button" onClick={increase} disabled={pending || quantity >= product.stock} className={stepButtonClass} aria-label="Increase quantity">
              +
            </button>
          </div>

          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-sm text-rose-300 hover:text-rose-200 disabled:opacity-50 disabled:cursor-wait transition-colors"
          >
            Remove
          </button>

          {pending && <span className="text-xs text-zinc-400">Updating...</span>}
          {!pending && !overStock && quantity >= product.stock && (
            <span className="text-xs text-amber-400">Max available</span>
          )}
        </div>

        {overStock && (
          <p className="text-xs text-amber-400">
            {product.stock === 0 ? 'This product is now out of stock. ' : `Only ${product.stock} left in stock. `}
            {product.stock > 0 && (
              <button type="button" onClick={fixToStock} disabled={pending} className="underline hover:text-amber-300">
                Set quantity to {product.stock}
              </button>
            )}
          </p>
        )}

        {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  )
}

export default CartItem
