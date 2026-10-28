import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { AuthField, AuthPage, SubmitButton } from '../components/AuthLayout.jsx'

function Login() {
  usePageTitle('Log in')
  const navigate = useNavigate()
  // Set by Register after a successful sign-up, so this page can say what just happened
  const registeredEmail = useLocation().state?.registeredEmail || ''

  const [form, setForm] = useState({ email: registeredEmail, password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    try {
      await api.post('/customers/login', form)
      navigate('/home')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Incorrect email or password. Please try again.')
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPage
      heading={registeredEmail ? 'Now log in to your new account' : 'Log in to your account'}
      description={
        registeredEmail
          ? 'Use the email and password you just signed up with.'
          : 'Enter the email and password you used when you signed up.'
      }
      steps={
        registeredEmail
          ? [
              { label: 'Create account', status: 'done' },
              { label: 'Log in', status: 'current' }
            ]
          : null
      }
      footer={
        <>
          New to ShopKart?{' '}
          <Link to="/register" className="text-brand-300 font-medium hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {registeredEmail && (
        <p role="status" className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
          Account created for <span className="font-medium">{registeredEmail}</span>.
        </p>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthField
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus={!registeredEmail}
          value={form.email}
          onChange={handleChange}
        />

        <AuthField
          label="Password"
          type="password"
          name="password"
          placeholder="Your password"
          autoComplete="current-password"
          autoFocus={Boolean(registeredEmail)}
          value={form.password}
          onChange={handleChange}
        />

        {error && (
          <p role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <SubmitButton loading={loading} loadingLabel="Logging in...">
          Log in
        </SubmitButton>
      </form>
    </AuthPage>
  )
}

export default Login
