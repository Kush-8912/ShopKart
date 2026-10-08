import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice, getStockStatus } from '../utils/format.js'

function WishlistCard({ product, onRemove }) {
  const stockStatus = getStockStatus(product.stock)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState('')

  const handleRemove = async () => {
    if (removing) return
    setRemoving(true)
    setError('')
    try {
      await onRemove(product._id)
      // On success the parent drops this card, so no state reset is needed
    } catch {
      setError('Unable to remove product. Please try again.')
      setRemoving(false)
    }
  }

  return (
    <div className="flex flex-col bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors">
      <div className="aspect-[4/3] bg-zinc-900">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col flex-1 p-4 gap-1">
        <h2 className="font-medium text-zinc-100 leading-snug">{product.name}</h2>
        <p className="text-xs text-zinc-400">{product.category}</p>
        <p className="text-lg font-semibold text-zinc-100 mt-1">{formatPrice(product.price)}</p>
        <p className={`text-xs ${stockStatus.className}`}>{stockStatus.label}</p>

        <div className="mt-auto pt-4 space-y-2">
          <Link
            to={`/products/${product._id}`}
            className="block w-full py-2 text-center bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm transition-colors"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="w-full py-2 rounded-xl text-sm font-medium border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 disabled:opacity-60 disabled:cursor-wait transition-colors"
          >
            {removing ? '⏳ Removing...' : 'Remove ♥'}
          </button>
          {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default WishlistCard
