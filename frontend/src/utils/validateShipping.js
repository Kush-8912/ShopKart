// Same rules as the backend (utils/validateShippingAddress.js). The client check
// gives instant feedback and avoids a pointless request; the server check is the
// one that actually protects the data.
export const SHIPPING_FIELDS = [
  { name: 'fullName', label: 'Full Name', autoComplete: 'name', placeholder: 'Aarav Sharma' },
  { name: 'phone', label: 'Phone', autoComplete: 'tel', placeholder: '9876543210', inputMode: 'tel' },
  { name: 'addressLine1', label: 'Address', autoComplete: 'address-line1', placeholder: '22 MG Road' },
  { name: 'city', label: 'City', autoComplete: 'address-level2', placeholder: 'Bengaluru' },
  { name: 'state', label: 'State', autoComplete: 'address-level1', placeholder: 'Karnataka' },
  { name: 'pincode', label: 'Pincode', autoComplete: 'postal-code', placeholder: '560001', inputMode: 'numeric', maxLength: 6 }
]

export const validateShipping = (form) => {
  const errors = {}

  for (const { name, label } of SHIPPING_FIELDS) {
    // trim() turns whitespace-only input into '' so it counts as empty
    if (!form[name]?.trim()) errors[name] = `${label} is required`
  }

  const phone = form.phone?.replace(/[\s-]/g, '').replace(/^(\+91|0)/, '')
  if (!errors.phone && !/^[6-9]\d{9}$/.test(phone)) {
    errors.phone = 'Enter a valid 10-digit mobile number'
  }

  if (!errors.pincode && !/^\d{6}$/.test(form.pincode.trim())) {
    errors.pincode = 'Pincode must contain 6 digits'
  }

  if (!errors.fullName && form.fullName.trim().length < 2) {
    errors.fullName = 'Full name is too short'
  }

  return errors
}
