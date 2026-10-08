import { useEffect, useRef, useState } from 'react'
import { toggleWishlist } from '../services/wishlist.service.js'

// Toggle button: ♡ Add to Wishlist  ⇄  ♥ Remove from Wishlist
function WishlistButton({ productId, initiallySaved = false }) {
  // null until the user clicks; before that, trust what the parent fetched
  const [savedOverride, setSaved] = useState(null)
  const saved = savedOverride ?? initiallySaved
  const [status, setStatus] = useState('idle') // idle | saving | added | error
  const [error, setError] = useState('')
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleClick = async () => {
    if (status === 'saving') return // block duplicate requests

    setStatus('saving')
    setError('')
    clearTimeout(timerRef.current)

    try {
      // One endpoint for both directions; the server says which state we ended in
      const { inWishlist } = await toggleWishlist(productId)
      setSaved(inWishlist)

      if (inWishlist) {
        setStatus('added')
        // Show the confirmation briefly, then offer the remove action
        timerRef.current = setTimeout(() => setStatus('idle'), 2000)
      } else {
        setStatus('idle')
      }
    } catch (err) {
      const httpStatus = err.response?.status

      setStatus('error')
      if (httpStatus === 401) setError('Please log in again to use your wishlist.')
      else if (saved) setError('Unable to remove product. Please try again.')
      else setError('Unable to save product. Please try again.')
    }
  }

  let label = saved ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'
  if (status === 'saving') label = saved ? '⏳ Removing...' : '⏳ Saving...'
  if (status === 'added') label = '♥ Added to Wishlist'

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'saving'}
        aria-pressed={saved}
        className={`w-full py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-60 disabled:cursor-wait ${
          saved
            ? 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
            : 'border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/60'
        }`}
      >
        {label}
      </button>
      {status === 'error' && (
        <p role="alert" className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}

export default WishlistButton
