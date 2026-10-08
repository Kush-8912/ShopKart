import { formatPrice } from '../utils/format.js'

// Lists items as { name, price, quantity, image } plus a total.
// Used for the live cart on Checkout and for saved order snapshots.
function OrderSummary({ items, total, title = 'Order Summary', footer }) {
  return (
    <div className="p-5 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>

      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex items-center gap-3">
            {item.image && (
              <img src={item.image} alt="" loading="lazy" className="w-12 h-12 shrink-0 rounded-lg object-cover bg-zinc-900" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-100 truncate">{item.name}</p>
              <p className="text-xs text-zinc-400">
                {formatPrice(item.price)} × {item.quantity}
              </p>
            </div>
            <p className="text-sm font-medium tabular-nums">{formatPrice(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <div className="flex justify-between border-t border-zinc-800 pt-3 text-base font-semibold">
        <span>Total</span>
        <span className="tabular-nums">{formatPrice(total)}</span>
      </div>

      {footer}
    </div>
  )
}

export default OrderSummary
