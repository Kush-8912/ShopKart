import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'

function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.fullName || !form.email || !form.password || !form.phone) {
      setError('All fields are mandatory')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await api.post('/customers/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 px-4">
      <div className="w-full max-w-sm space-y-8 bg-zinc-900/50 border border-zinc-800/80 p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Create your ShopKart account</h1>
          <p className="text-sm text-zinc-400">Sign up to start shopping.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300 ml-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={form.fullName}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300 ml-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="john@gmail.com"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300 ml-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300 ml-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="9876543210"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-zinc-100 hover:bg-white disabled:opacity-60 text-zinc-950 font-medium rounded-xl text-sm transition-colors mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="text-zinc-100 font-medium hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
