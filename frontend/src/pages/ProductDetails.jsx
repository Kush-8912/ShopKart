import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductById } from '../services/product.service.js'
import { formatPrice, getStockStatus } from '../utils/format.js'
import Navbar from '../components/Navbar.jsx'
import AddToCartButton from '../components/AddToCartButton.jsx'

function ProductDetails() {
  const { id } = useParams()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    const fetchProduct = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getProductById(id)
        if (!ignore) setProduct(data)
      } catch (err) {
        if (ignore) return
        const status = err.response?.status
        if (status === 404 || status === 400) {
          setError('Product not found.')
        } else {
          setError('Something went wrong while loading the product.')
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchProduct()

    return () => {
      ignore = true
    }
  }, [id])

  const renderContent = () => {
    if (loading) {
      return <p className="py-16 text-center text-sm text-zinc-400">Loading product...</p>
    }

    if (error) {
      return (
        <p className="py-4 text-center text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl">
          {error}
        </p>
      )
    }

    const stockStatus = getStockStatus(product.stock)
    const outOfStock = product.stock === 0

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="aspect-[4/3] bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col gap-4">
          <span className="self-start px-2.5 py-1 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-full">
            {product.category}
          </span>

          <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>

          <p className="text-3xl font-semibold">{formatPrice(product.price)}</p>

          <p className={`text-sm ${stockStatus.className}`}>
            {outOfStock ? 'Out of stock' : `In stock: ${product.stock} units`}
          </p>

          <p className="text-sm leading-relaxed text-zinc-400 border-t border-zinc-800 pt-4">
            {product.description}
          </p>

          <div className="mt-2 sm:self-start sm:min-w-64">
            <AddToCartButton product={product} className="px-8 py-3" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <Link to="/products" className="inline-block text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
          ← Back to products
        </Link>

        {renderContent()}
      </div>
    </div>
  )
}

export default ProductDetails
