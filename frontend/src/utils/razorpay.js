const CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

let loadingPromise = null

// Loads Razorpay's Checkout script once. Resolves true when window.Razorpay is
// available and false if the script couldn't load (offline, blocked by an ad blocker...).
export const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true)
  if (loadingPromise) return loadingPromise

  loadingPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = CHECKOUT_SCRIPT
    script.onload = () => resolve(Boolean(window.Razorpay))
    script.onerror = () => {
      script.remove()
      loadingPromise = null // allow a retry on the next attempt
      resolve(false)
    }
    document.body.appendChild(script)
  })

  return loadingPromise
}
