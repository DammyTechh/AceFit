// Paystack integration helper
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ''

export function initPaystack({ email, amount, reference, metadata, onSuccess, onClose }) {
  return new Promise((resolve, reject) => {
    if (!window.PaystackPop) {
      reject(new Error('Paystack script not loaded'))
      return
    }
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.round(amount * 100), // kobo
      currency: 'NGN',
      ref: reference,
      metadata: metadata || {},
      callback: (response) => {
        onSuccess?.(response)
        resolve(response)
      },
      onClose: () => {
        onClose?.()
        reject(new Error('Payment cancelled'))
      },
    })
    handler.openIframe()
  })
}

export function generateReference() {
  return `ACE-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export const PAYSTACK_KEY = PAYSTACK_PUBLIC_KEY
