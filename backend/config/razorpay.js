import Razorpay from 'razorpay'

let instance = null

// Created lazily: ES module imports run before dotenv.config() in index.js,
// so reading process.env at import time would see undefined keys.
// Returns null when the keys aren't configured so callers can respond clearly.
export const getRazorpay = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return null

  if (!instance) {
    instance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    })
  }

  return instance
}
