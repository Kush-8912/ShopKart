import axios from 'axios'

// '/api' is forwarded to the backend: by the Vite dev server locally (vite.config.js)
// and by Vercel in production (vercel.json). Same-origin requests keep the login
// cookie first-party, so it works even in browsers that block third-party cookies.
// Set VITE_API_URL to call a backend URL directly instead.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})
