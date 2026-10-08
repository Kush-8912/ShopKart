import { SHIPPING_FIELDS } from '../utils/validateShipping.js'

const inputClass =
  'w-full px-3.5 py-2.5 bg-zinc-950 border rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors disabled:opacity-60'

// Presentational only: the form state lives in the Checkout page, which needs it
// to validate, submit and prefill Razorpay.
function CheckoutForm({ form, errors, disabled, onChange }) {
  return (
    <fieldset disabled={disabled} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {SHIPPING_FIELDS.map((field) => {
        const error = errors[field.name]
        const errorId = `${field.name}-error`
        return (
          <div key={field.name} className={`space-y-1 ${field.name === 'addressLine1' ? 'sm:col-span-2' : ''}`}>
            <label htmlFor={field.name} className="text-xs font-medium text-zinc-300 ml-1">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type="text"
              value={form[field.name]}
              onChange={onChange}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              inputMode={field.inputMode}
              maxLength={field.maxLength}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className={`${inputClass} ${error ? 'border-red-500/60 focus:border-red-400' : 'border-zinc-800 focus:border-zinc-600'}`}
            />
            {error && (
              <p id={errorId} className="text-xs text-red-400 ml-1">{error}</p>
            )}
          </div>
        )
      })}
    </fieldset>
  )
}

export default CheckoutForm
