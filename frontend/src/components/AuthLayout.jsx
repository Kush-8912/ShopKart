import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import Logo from './Logo.jsx'
import { CheckIcon, EyeIcon, EyeOffIcon, GridIcon, HeartIcon, ShieldIcon, TruckIcon } from './Icons.jsx'

const FEATURES = [
  { icon: GridIcon, title: 'Browse the catalogue', text: 'Electronics, fashion, books and home essentials, with search and filters.' },
  { icon: HeartIcon, title: 'Save what you love', text: 'Keep products in your wishlist and come back to them any time.' },
  { icon: ShieldIcon, title: 'Pay securely', text: 'Checkout runs on Razorpay and every payment is verified by our server.' },
  { icon: TruckIcon, title: 'Track your orders', text: 'Follow each order from placed to delivered.' }
]

const HERO = {
  login: {
    eyebrow: 'Welcome back',
    title: 'Your cart, wishlist and orders are waiting for you.',
    text: 'Log in to pick up where you left off. Everything you saved is stored in your account.'
  },
  register: {
    eyebrow: 'New to ShopKart?',
    title: 'One free account for everything you shop.',
    text: 'Sign up once to save products, fill a cart, pay at checkout and follow your orders.'
  }
}

const TABS = [
  { mode: 'login', to: '/login', label: 'Log in' },
  { mode: 'register', to: '/register', label: 'Sign up' }
]

const inputClass =
  'w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-colors'

// steps: [{ label, status: 'done' | 'current' | 'upcoming' }]
function Steps({ steps }) {
  const currentIndex = steps.findIndex((step) => step.status === 'current')

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Step {currentIndex + 1} of {steps.length}
      </p>
      <ol className="flex items-center gap-3 text-sm">
        {steps.map((step, index) => (
          <li key={step.label} className="flex items-center gap-3" aria-current={step.status === 'current' ? 'step' : undefined}>
            {index > 0 && <span aria-hidden="true" className="w-8 h-px bg-zinc-700" />}
            <span
              className={`grid place-items-center w-6 h-6 rounded-full text-xs font-semibold border ${
                step.status === 'done'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : step.status === 'current'
                    ? 'bg-brand-400 border-brand-400 text-zinc-950'
                    : 'border-zinc-700 text-zinc-500'
              }`}
            >
              {step.status === 'done' ? <CheckIcon className="w-3.5 h-3.5" /> : index + 1}
            </span>
            <span className={step.status === 'upcoming' ? 'text-zinc-500' : 'text-zinc-200'}>{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

// Layout route shared by /login and /register. It stays mounted while the user
// switches between them, so the panel and tabs animate instead of being rebuilt.
export function AuthLayout() {
  const { pathname } = useLocation()
  const mode = pathname === '/register' ? 'register' : 'login'
  const hero = HERO[mode]

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-zinc-950 text-zinc-100">
      <aside className="relative hidden lg:flex flex-col justify-between gap-12 overflow-hidden p-12 bg-zinc-900 border-r border-zinc-800/80">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -left-32 w-[30rem] h-[30rem] rounded-full bg-brand-500/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -right-24 w-[26rem] h-[26rem] rounded-full bg-sky-500/10 blur-3xl" />

        <Logo className="relative" />

        <div className="relative max-w-md space-y-10">
          {/* key: the text fades in again whenever the page changes */}
          <div key={mode} className="space-y-4 animate-fade-in">
            <p className="text-sm font-medium text-brand-300">{hero.eyebrow}</p>
            <h2 className="text-4xl font-semibold tracking-tight leading-tight">{hero.title}</h2>
            <p className="text-zinc-400 leading-relaxed">{hero.text}</p>
          </div>

          <ul className="space-y-5">
            {FEATURES.map(({ icon: FeatureIcon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="shrink-0 grid place-items-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-brand-300">
                  <FeatureIcon />
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-zinc-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-zinc-500">
          ShopKart runs Razorpay in test mode, so no real money is charged.
        </p>
      </aside>

      {/* Top-aligned (not centred) so the tabs stay put when the two forms differ in height */}
      <main className="flex justify-center px-4 py-10 sm:px-8 lg:pt-[16vh]">
        <div className="w-full max-w-sm space-y-7">
          {/* The left panel is hidden on small screens, so keep a short intro here */}
          <div className="lg:hidden flex flex-col items-center gap-2 text-center">
            <Logo />
            <p key={mode} className="text-sm text-zinc-400 animate-fade-in">{hero.text}</p>
          </div>

          <nav aria-label="Account" className="relative grid grid-cols-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-sm">
            {/* One highlight that slides between the tabs */}
            <span
              aria-hidden="true"
              className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-zinc-100 shadow transition-transform duration-300 ease-out motion-reduce:transition-none ${
                mode === 'register' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />
            {TABS.map((tab) => {
              const active = tab.mode === mode
              return (
                <Link
                  key={tab.mode}
                  to={tab.to}
                  replace
                  aria-current={active ? 'page' : undefined}
                  className={`relative py-2 text-center font-medium rounded-lg transition-colors duration-300 ${
                    active ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>

          <div key={pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

// The page-specific part of /login and /register, shown under the tabs
export function AuthPage({ heading, description, steps, footer, children }) {
  return (
    <div className="space-y-7">
      {steps && <Steps steps={steps} />}

      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>

      {children}

      {footer && <p className="text-center text-sm text-zinc-400">{footer}</p>}
    </div>
  )
}

// Labelled input; type="password" gets a show/hide toggle
export function AuthField({ label, hint, type = 'text', name, ...inputProps }) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  const hintId = hint ? `${name}-hint` : undefined

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <input
          {...inputProps}
          id={name}
          name={name}
          type={isPassword && visible ? 'text' : type}
          aria-describedby={hintId}
          className={`${inputClass} ${isPassword ? 'pr-11' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 px-3 text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            {visible ? <EyeOffIcon className="w-4.5 h-4.5" /> : <EyeIcon className="w-4.5 h-4.5" />}
          </button>
        )}
      </div>
      {hint && <p id={hintId} className="text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}

export function SubmitButton({ loading, loadingLabel, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-100 hover:bg-white disabled:opacity-60 disabled:cursor-wait text-zinc-950 font-medium rounded-xl text-sm transition-colors"
    >
      {loading && <span className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-950 rounded-full animate-spin" />}
      {loading ? loadingLabel : children}
    </button>
  )
}
