import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getWishlist, removeFromWishlist } from '../services/wishlist.service.js'
import Navbar from '../components/Navbar.jsx'
import WishlistCard from '../components/WishlistCard.jsx'

function Wishlist() {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchWishlist = useCallback(async (isIgnored = () => false) => {
    setLoading(true)
    setError(false)
    try {
      const data = await getWishlist()
      if (!isIgnored()) setWishlist(data)
    } catch {
      if (!isIgnored()) setError(true)
    } finally {
      if (!isIgnored()) setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    fetchWishlist(() => ignore)
    return () => {
      ignore = true
    }
  }, [fetchWishlist])

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId)
    } catch (err) {
      // 404 means it's already gone on the server — just drop it from the list
      if (err.response?.status !== 404) throw err
    }
    setWishlist((prev) => prev.filter((product) => product._id !== productId))
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="py-16 flex flex-col items-center gap-3 text-sm text-zinc-400">
          <span className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-200 rounded-full animate-spin" />
          Loading your wishlist...
        </div>
      )
    }

    if (error) {
      return (
        <div className="py-16 flex flex-col items-center gap-2 text-center">
          <p className="text-lg font-medium text-zinc-100">Something went wrong.</p>
          <p className="text-sm text-zinc-400">We couldn't load your wishlist.</p>
          <button
            type="button"
            onClick={() => fetchWishlist()}
            className="mt-4 px-6 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      )
    }

    if (wishlist.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center gap-2 text-center">
          <span className="text-4xl" aria-hidden="true">❤️</span>
          <p className="mt-2 text-lg font-medium text-zinc-100">Your wishlist is empty</p>
          <p className="text-sm text-zinc-400">Save products you love and find them here later.</p>
          <Link
            to="/products"
            className="mt-4 px-6 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {wishlist.map((product) => (
          <WishlistCard key={product._id} product={product} onRemove={handleRemove} />
        ))}
      </div>
    )
  }

  const showCount = !loading && !error && wishlist.length > 0

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">My Wishlist</h1>
            {showCount && (
              <p className="text-sm text-zinc-400">
                {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved
              </p>
            )}
          </div>
          {showCount && (
            <Link to="/products" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
              Continue shopping →
            </Link>
          )}
        </div>

        {renderContent()}
      </div>
    </div>
  )
}

export default Wishlist
