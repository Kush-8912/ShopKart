import Customer from '../models/customer.model.js'
import bcrypt from 'bcrypt'
import generateToken from '../utils/generateToken.js'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
}

export const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body || {}

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are mandatory' })
    }

    if ([fullName, email, password, phone].some((value) => typeof value !== 'string')) {
      return res.status(400).json({ success: false, message: 'All fields must be text' })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    const existingCustomer = await Customer.findOne({ email: email.trim().toLowerCase() })

    if (existingCustomer) {
      return res.status(409).json({ success: false, message: 'Email already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newCustomer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone
    })

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone
      }
    })

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body || {}

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are mandatory' })
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const customer = await Customer.findOne({ email: email.trim().toLowerCase() })

    if (!customer) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const isPasswordCorrect = await bcrypt.compare(password, customer.password)

    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const token = generateToken(customer._id)

    res.cookie('token', token, cookieOptions)

    return res.status(200).json({
      success: true,
      message: 'Login successful'
    })

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const getMyProfile = async (req, res) => {
  try {
    // Only the profile fields; cart/wishlist have their own endpoints
    const { _id, fullName, email, phone, createdAt } = req.user
    return res.status(200).json({ _id, fullName, email, phone, createdAt })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const logoutCustomer = async (req, res) => {
  try {
    res.clearCookie('token', cookieOptions)

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// Bonus: PATCH /customers/change-password   body: { oldPassword, newPassword }
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {}

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Old password and new password are required' })
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' })
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from the old password' })
    }

    // req.user was loaded without the password, so fetch the stored hash
    const customer = await Customer.findById(req.user._id)

    if (!customer) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const isOldPasswordCorrect = await bcrypt.compare(String(oldPassword), customer.password)

    if (!isOldPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Old password is incorrect' })
    }

    const salt = await bcrypt.genSalt(10)
    customer.password = await bcrypt.hash(newPassword, salt)
    await customer.save()

    return res.status(200).json({ success: true, message: 'Password changed successfully' })

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}
