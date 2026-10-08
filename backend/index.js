import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import customerRoutes from './routes/customer.routes.js'
import productRoutes from './routes/product.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'

dotenv.config({ quiet: true })

const app = express()

// Any localhost port (Vite moves to 5174, 5175... when 5173 is taken), plus the
// deployed frontend URL(s) from CLIENT_URL, comma-separated
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  ...(process.env.CLIENT_URL || '').split(',').map((url) => url.trim()).filter(Boolean)
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'DELETE']
}))
app.use(express.json())
app.use(cookieParser())
app.use('/customers', customerRoutes)
app.use('/products', productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)

mongoose.connect(process.env.dbUrl).then(() => {
  console.log('DB Connected')
}).catch((err) => {
  console.log(err)
})

const Port = process.env.PORT || 8085

app.get('/', (req, res) => {
  res.send('Welcome to ShopKart')
})

app.listen(Port, () => {
  console.log(`Server started at port ${Port}`)
})
