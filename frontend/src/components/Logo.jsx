import { CartIcon } from './Icons.jsx'

function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-400 text-zinc-950 shadow-lg shadow-brand-500/20">
        <CartIcon className="w-4.5 h-4.5" />
      </span>
      <span className="text-lg text-zinc-100">
        Shop<span className="text-brand-300">Kart</span>
      </span>
    </span>
  )
}

export default Logo
