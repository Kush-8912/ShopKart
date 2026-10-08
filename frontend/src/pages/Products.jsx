import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '../services/product.service.js'
import { getWishlist } from '../services/wishlist.service.js'
import Navbar from '../components/Navbar.jsx'
import SearchBar from '../components/SearchBar.jsx'
import ProductCard from '../components/ProductCard.jsx'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // IDs of products already in the user's wishlist, so cards start in the right state
  const [wishlistIds, setWishlistIds] = useState(() => new Set())

  // Search and category live in the page URL (/products?search=phone&category=Electronics)
  // so the filters are visible, shareable and survive a page refresh.
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || ''

  // What the user is typing right now. Kept separate so typing stays instant.
  const [searchInput, setSearchInput] = useState(search)

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    }, { replace: true })
  }

  // Debounce: copy the typed text into the URL once the user stops typing for 300ms
  useEffect(() => {
    const timer = setTimeout(() => updateParam('search', searchInput.trim()), 300)
    return () => clearTimeout(timer)
    // Only re-run when the typed text changes (updateParam is recreated on every URL change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  useEffect(() => {
    let ignore = false

    getWishlist()
      .then((items) => { if (!ignore) setWishlistIds(new Set(items.map((item) => item._id))) })
      .catch(() => { /* cards fall back to "Add to Wishlist"; a duplicate add returns 409 and syncs */ })

    return () => {
      ignore = true
    }
  }, [])

  // Whenever the URL's query params change, ask the backend for the filtered products
  useEffect(() => {
    let ignore = false

    const fetchProducts = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getProducts({ search, category, sort })
        if (!ignore) setProducts(data)
      } catch {
        if (!ignore) setError('Something went wrong while loading products.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchProducts()

    // Cleanup: ignore responses from outdated requests
    return () => {
      ignore = true
    }
  }, [search, category, sort])

  const renderContent = () => {
    if (loading) {
      return <p className="py-16 text-center text-sm text-zinc-400">Loading products...</p>
    }

    if (error) {
      return (
        <p className="py-4 text-center text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl">
          {error}
        </p>
      )
    }

    if (products.length === 0) {
      return <p className="py-16 text-center text-sm text-zinc-400">No products found.</p>
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} inWishlist={wishlistIds.has(product._id)} />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-zinc-400">Browse the ShopKart catalogue.</p>
        </div>

        <SearchBar
          search={searchInput}
          category={category}
          onSearchChange={setSearchInput}
          onCategoryChange={(value) => updateParam('category', value)}
          sort={sort}
          onSortChange={(value) => updateParam('sort', value)}
        />

        {renderContent()}
      </div>
    </div>
  )
}

export default Products
