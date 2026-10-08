import { Link } from 'react-router-dom'
import { formatPrice, getStockStatus } from '../utils/format.js'
import WishlistButton from './WishlistButton.jsx'
import AddToCartButton from './AddToCartButton.jsx'

function ProductCard({ product, inWishlist = false }) {
  const stockStatus = getStockStatus(product.stock)

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
          <AddToCartButton product={product} />
          <Link
            to={`/products/${product._id}`}
            className="block w-full py-2 text-center border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/60 text-zinc-200 font-medium rounded-xl text-sm transition-colors"
          >
            View Details
          </Link>
          <WishlistButton productId={product._id} initiallySaved={inWishlist} />
        </div>
      </div>
    </div>
  )
}

export default ProductCard
