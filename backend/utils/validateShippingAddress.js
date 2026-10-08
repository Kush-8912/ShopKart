const FIELDS = {
  fullName: 'Full name',
  phone: 'Phone number',
  addressLine1: 'Address',
  city: 'City',
  state: 'State',
  pincode: 'Pincode'
}

// Returns { address, errors }. `address` holds only the known fields, trimmed,
// so extra keys sent by the client (e.g. totalAmount) are dropped here.
const validateShippingAddress = (input) => {
  const source = input && typeof input === 'object' ? input : {}
  const address = {}
  const errors = {}

  for (const [field, label] of Object.entries(FIELDS)) {
    const value = typeof source[field] === 'string' ? source[field].trim() : ''
    address[field] = value
    // Whitespace-only input is trimmed to '' and so counts as empty
    if (!value) errors[field] = `${label} is required`
  }

  if (address.phone && !errors.phone) {
    // Allow "98765 43210", "+91 9876543210" etc. and store the plain 10 digits
    const digits = address.phone.replace(/[\s-]/g, '').replace(/^(\+91|0)/, '')
    if (/^[6-9]\d{9}$/.test(digits)) address.phone = digits
    else errors.phone = 'Enter a valid 10-digit mobile number'
  }

  if (address.pincode && !errors.pincode && !/^\d{6}$/.test(address.pincode)) {
    errors.pincode = 'Pincode must contain 6 digits'
  }

  if (address.fullName && !errors.fullName && address.fullName.length < 2) {
    errors.fullName = 'Full name is too short'
  }

  return { address, errors }
}

export default validateShippingAddress
