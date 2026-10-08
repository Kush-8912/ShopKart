const STEPS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

const LABELS = {
  PENDING_PAYMENT: 'Payment pending',
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered'
}

const BADGE_CLASSES = {
  PENDING_PAYMENT: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  PLACED: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  CONFIRMED: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  SHIPPED: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
  DELIVERED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium border rounded-full ${BADGE_CLASSES[status] || 'border-zinc-700 text-zinc-300'}`}>
      {LABELS[status] || status}
    </span>
  )
}

// Bonus: PLACED → CONFIRMED → SHIPPED → DELIVERED progress bar
export function StatusTracker({ status }) {
  const current = STEPS.indexOf(status)
  if (current === -1) return null

  return (
    <ol className="grid grid-cols-4 gap-2" aria-label={`Order status: ${LABELS[status]}`}>
      {STEPS.map((step, index) => {
        const done = index <= current
        return (
          <li key={step} className="space-y-1.5" aria-current={index === current ? 'step' : undefined}>
            <div className={`h-1.5 rounded-full ${done ? 'bg-emerald-400' : 'bg-zinc-800'}`} />
            <p className={`text-xs ${done ? 'text-zinc-100' : 'text-zinc-500'}`}>{LABELS[step]}</p>
          </li>
        )
      })}
    </ol>
  )
}
