export const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`

export const getStockStatus = (stock) => {
  if (stock === 0) return { label: 'Out of stock', className: 'text-red-400' }
  if (stock <= 5) return { label: `Only ${stock} left`, className: 'text-amber-400' }
  return { label: `${stock} units left`, className: 'text-emerald-400' }
}

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit'
  })

// Last 8 characters of the Mongo id, enough to tell orders apart at a glance
export const shortOrderId = (id) => `#${String(id).slice(-8).toUpperCase()}`
