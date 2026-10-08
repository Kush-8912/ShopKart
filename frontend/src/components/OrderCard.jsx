import { Link } from 'react-router-dom'
import { formatDate, formatPrice, shortOrderId } from '../utils/format.js'
import { StatusBadge, StatusTracker } from './OrderStatus.jsx'

function OrderCard({ order }) {
  return (
    <article className="p-5 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-medium">Order {shortOrderId(order._id)}</h2>
          <p className="text-xs text-zinc-400">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Names and prices come from the order snapshot, not the current products */}
      <ul className="space-y-1 text-sm text-zinc-300">
        {order.items.map((item, index) => (
          <li key={`${item.product}-${index}`} className="flex justify-between gap-4">
            <span className="truncate">{item.name} × {item.quantity}</span>
            <span className="tabular-nums text-zinc-400">{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <StatusTracker status={order.status} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
        <p className="text-sm">
          Total: <span className="font-semibold tabular-nums">{formatPrice(order.totalAmount)}</span>
        </p>
        <Link
          to={`/orders/${order._id}`}
          className="px-4 py-2 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/60 text-zinc-200 font-medium rounded-xl text-sm transition-colors"
        >
          View Details
        </Link>
      </div>
    </article>
  )
}

export default OrderCard
