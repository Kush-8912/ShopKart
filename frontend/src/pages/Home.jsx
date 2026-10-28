import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { getProducts } from '../services/product.service.js'
import { useCart } from '../context/CartContext.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { CATEGORIES, imageFit } from '../utils/catalog.js'
import { formatPrice } from '../utils/format.js'
import Navbar from '../components/Navbar.jsx'
import { ArrowRightIcon, CardIcon, CartIcon, GridIcon, HeartIcon, PackageIcon, TruckIcon, UserIcon } from '../components/Icons.jsx'

const ORDER_STEPS = [
  { icon: GridIcon, title: 'Pick products', text: 'Browse, search and filter the catalogue.' },
  { icon: CartIcon, title: 'Add to cart', text: 'Change quantities any time before you pay.' },
  { icon: CardIcon, title: 'Pay at checkout', text: 'Enter a delivery address and pay with Razorpay.' },
  { icon: TruckIcon, title: 'Track the order', text: 'See it move from placed to delivered.' }
]

function Home() {
  usePageTitle('Home')
  // ProtectedRoute already fetched the logged-in customer
  const { customer } = useOutletContext()
  const { totalUnits, subtotal, loading: cartLoading } = useCart()

  const [products, setProducts] = useState([])

  // Newest products, used for "New arrivals" and the category pictures
  useEffect(() => {
    let ignore = false
    getProducts()
      .then((data) => { if (!ignore) setProducts(data) })
      .catch(() => { /* the sections below simply show without pictures */ })
    return () => {
      ignore = true
    }
  }, [])

  const firstName = customer.fullName.split(' ')[0]
  const imageFor = (category) => products.find((p) => p.category === category)?.image

  const quickLinks = [
    { to: '/products', icon: GridIcon, title: 'Browse products', text: 'Search and filter' },
    { to: '/wishlist', icon: HeartIcon, title: 'Your wishlist', text: 'Saved for later' },
    {
      to: '/cart',
      icon: CartIcon,
      title: 'Your cart',
      text: cartLoading || totalUnits === 0
        ? 'Nothing in it yet'
        : `${totalUnits} ${totalUnits === 1 ? 'item' : 'items'} · ${formatPrice(subtotal)}`
    },
    { to: '/orders', icon: PackageIcon, title: 'Your orders', text: 'Track deliveries' }
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        <section className="relative overflow-hidden p-8 sm:p-10 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl">
          <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-20 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="relative max-w-xl space-y-4">
            <p className="text-sm font-medium text-brand-300">You're logged in</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Welcome back, {firstName}!</h1>
            <p className="text-zinc-400 leading-relaxed">
              This is your ShopKart home. Start with the catalogue, or jump straight to your cart, wishlist or orders.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm transition-colors"
            >
              Start shopping <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section aria-label="Quick links" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map(({ to, icon: LinkIcon, title, text }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
            >
              <span className="shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-zinc-800/80 text-brand-300">
                <LinkIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-zinc-400">{text}</p>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
            </Link>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Shop by category</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => {
              const image = imageFor(category)
              return (
                <Link
                  key={category}
                  to={`/products?category=${encodeURIComponent(category)}`}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900"
                >
                  {image && (
                    <img src={image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition duration-300" />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />
                  <span className="absolute bottom-3 left-4 font-medium">{category}</span>
                </Link>
              )
            })}
          </div>
        </section>

        {products.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-tight">New arrivals</h2>
              <Link to="/products" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {products.slice(0, 4).map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="group overflow-hidden bg-zinc-900/50 border border-zinc-800/80 rounded-2xl hover:border-zinc-700 transition-colors"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-zinc-900">
                    <img src={product.image} alt={product.name} loading="lazy" className={`w-full h-full ${imageFit(product)} group-hover:scale-105 transition duration-300`} />
                  </div>
                  <div className="p-3 space-y-0.5">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-sm text-zinc-400">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <section className="lg:col-span-2 p-6 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl space-y-5">
            <h2 className="text-xl font-semibold tracking-tight">How ordering works</h2>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {ORDER_STEPS.map(({ icon: StepIcon, title, text }, index) => (
                <li key={title} className="flex gap-3">
                  <span className="shrink-0 grid place-items-center w-9 h-9 rounded-lg bg-zinc-800/80 text-brand-300">
                    <StepIcon className="w-4.5 h-4.5" />
                  </span>
                  <div>
                    <p className="font-medium">
                      <span className="text-zinc-500">{index + 1}.</span> {title}
                    </p>
                    <p className="text-sm text-zinc-400">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-xs text-zinc-500">Payments run in Razorpay test mode, so no real money is charged.</p>
          </section>

          <section className="p-6 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-brand-400/15 text-brand-300">
                <UserIcon />
              </span>
              <h2 className="text-xl font-semibold tracking-tight">Your account</h2>
            </div>
            <dl className="space-y-3 text-sm">
              {[
                ['Name', customer.fullName],
                ['Email', customer.email],
                ['Phone', customer.phone]
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-zinc-400">{label}</dt>
                  <dd className="font-medium break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Home
