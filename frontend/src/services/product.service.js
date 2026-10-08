import { api } from './api.js'

// Builds the query string and lets the backend do the searching/filtering.
// e.g. { search: 'phone', category: 'Electronics', sort: 'price_asc' }
//   -> GET /products?search=phone&category=Electronics&sort=price_asc
export const getProducts = async ({ search = '', category = '', sort = '' } = {}) => {
  const query = new URLSearchParams()

  if (search.trim()) query.set('search', search.trim())
  if (category) query.set('category', category)
  if (sort) query.set('sort', sort)

  const queryString = query.toString()
  const url = queryString ? `/products?${queryString}` : '/products'

  const res = await api.get(url)
  return res.data.products
}

// GET /products/:id
export const getProductById = async (id) => {
  const res = await api.get(`/products/${id}`)
  return res.data.product
}
