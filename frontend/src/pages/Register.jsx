import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { AuthField, AuthPage, SubmitButton } from '../components/AuthLayout.jsx'

// Same rule as the checkout form, so the saved phone number can be used for delivery
const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone.replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''))

function Register() {
  usePageTitle('Sign up')
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
      setError('Please fill in all the fields.')
      return
    }

    if (!isValidPhone(form.phone)) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await api.post('/customers/register', form)
      // Login shows "Account created" and prefills this email
      navigate('/login', { state: { registeredEmail: form.email.trim().toLowerCase() } })
    } catch (err) {
      if (err.response?.status === 409) {
        setError('An account with this email already exists. Try logging in instead.')
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPage
      heading="Create your account"
      description="It takes less than a minute. You'll log in right after."
      steps={[
        { label: 'Create account', status: 'current' },
        { label: 'Log in', status: 'upcoming' }
      ]}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-brand-300 font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthField
          label="Full name"
          name="fullName"
          placeholder="Aarav Sharma"
          autoComplete="name"
          autoFocus
          value={form.fullName}
          onChange={handleChange}
        />

        <AuthField
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
        />

        <AuthField
          label="Phone number"
          type="tel"
          name="phone"
          placeholder="9876543210"
          autoComplete="tel"
          inputMode="tel"
          hint="10-digit mobile number. We'll prefill it at checkout."
          value={form.phone}
          onChange={handleChange}
        />

        <AuthField
          label="Password"
          type="password"
          name="password"
          placeholder="Create a password"
          autoComplete="new-password"
          hint="At least 6 characters."
          value={form.password}
          onChange={handleChange}
        />

        {error && (
          <p role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <SubmitButton loading={loading} loadingLabel="Creating account...">
          Create account
        </SubmitButton>
      </form>
    </AuthPage>
  )
}

export default Register
