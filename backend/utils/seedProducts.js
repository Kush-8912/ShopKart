// Seeds the products collection with sample data.
// Run from the backend folder: npm run seed
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from '../models/product.model.js'

dotenv.config({ quiet: true })

const image = (seed) => `https://picsum.photos/seed/${seed}/600/450`

const products = [
  { name: 'Noise Cancelling Headphones', description: 'Wireless over-ear headphones with active noise cancellation and 30-hour battery life.', price: 4999, category: 'Electronics', image: image('headphones'), stock: 25 },
  { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with blue switches and detachable USB-C cable.', price: 2999, category: 'Electronics', image: image('keyboard'), stock: 10 },
  { name: 'Smartphone Stand', description: 'Adjustable aluminium phone stand for desks, compatible with all phones.', price: 499, category: 'Electronics', image: image('phonestand'), stock: 60 },
  { name: 'Wireless Mouse', description: 'Ergonomic silent-click wireless mouse with 18-month battery life.', price: 899, category: 'Electronics', image: image('mouse'), stock: 0 },
  { name: 'Classic Denim Jacket', description: 'Stonewashed denim jacket with a relaxed fit and button front.', price: 2199, category: 'Fashion', image: image('denim'), stock: 15 },
  { name: 'Running Shoes', description: 'Lightweight breathable running shoes with cushioned soles.', price: 3499, category: 'Fashion', image: image('shoes'), stock: 4 },
  { name: 'Cotton Crew T-Shirt', description: '100% combed cotton t-shirt, pre-shrunk and soft on the skin.', price: 399, category: 'Fashion', image: image('tshirt'), stock: 120 },
  { name: 'Atomic Habits', description: 'James Clear\'s guide to building good habits and breaking bad ones.', price: 499, category: 'Books', image: image('habits'), stock: 40 },
  { name: 'The Pragmatic Programmer', description: 'Timeless advice on software craftsmanship, 20th anniversary edition.', price: 1899, category: 'Books', image: image('programmer'), stock: 8 },
  { name: 'Ceramic Coffee Mug Set', description: 'Set of four handmade ceramic mugs, microwave and dishwasher safe.', price: 799, category: 'Home', image: image('mugs'), stock: 30 },
  { name: 'Scented Soy Candle', description: 'Hand-poured lavender soy candle with a 45-hour burn time.', price: 349, category: 'Home', image: image('candle'), stock: 3 },
  { name: 'Table Lamp', description: 'Minimal wooden table lamp with a warm linen shade.', price: 1599, category: 'Home', image: image('lamp'), stock: 12 }
]

const seed = async () => {
  try {
    await mongoose.connect(process.env.dbUrl)
    await Product.deleteMany({})
    const created = await Product.insertMany(products)
    console.log(`Seeded ${created.length} products`)
  } catch (error) {
    console.log(error)
  } finally {
    await mongoose.disconnect()
  }
}

seed()
