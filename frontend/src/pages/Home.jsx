import { Link, useOutletContext } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

function Home() {
  // ProtectedRoute already fetched the logged-in customer
  const { customer } = useOutletContext()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-8 rounded-2xl shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome, {customer.fullName}
            </h1>
            <p className="text-sm text-zinc-400">Here's your ShopKart profile.</p>
          </div>

          <div className="space-y-3 border-t border-zinc-800 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Full Name</span>
              <span className="text-zinc-100 font-medium">{customer.fullName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Email</span>
              <span className="text-zinc-100 font-medium">{customer.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Phone</span>
              <span className="text-zinc-100 font-medium">{customer.phone}</span>
            </div>
          </div>

          <Link
            to="/products"
            className="block w-full py-2.5 text-center bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded-xl text-sm transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
