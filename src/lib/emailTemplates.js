// src/lib/emailTemplates.js
// ─────────────────────────────────────────────────────────────
// All AceFit transactional emails.
// Every template returns { subject, html } — pass to send-email edge function.
// ─────────────────────────────────────────────────────────────

const BRAND = {
  orange: '#FF6B00',
  orangeLight: '#FF8C3A',
  black: '#0A0A0A',
  darkCard: '#141414',
  darkBorder: '#242424',
  gray: '#888888',
  lightGray: '#cccccc',
  green: '#22c55e',
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#eab308',
  logo: 'https://i.imgur.com/eDF88SE.png',
  phone1: '07025692097',
  phone2: '09153040271',
  email: 'Acefitandgainz@gmail.com',
  whatsapp: 'https://wa.me/2347025692097',
  instagram: 'https://instagram.com/The_acefit',
  siteUrl: 'https://acefit.com', // update after deploy
}

// ─── Shared wrapper ───────────────────────────────────────────
const wrap = (body, preheader = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>AceFit</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    body{margin:0;padding:0;background:${BRAND.black};font-family:'DM Sans',Helvetica,Arial,sans-serif}
    img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}
    a{color:${BRAND.orange}}
    @media only screen and (max-width:600px){
      .email-container{width:100%!important;max-width:100%!important}
      .stack{display:block!important;width:100%!important}
      .pad-sm{padding:24px 20px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${BRAND.black}">
  <!-- Preheader -->
  ${preheader ? `<div style="display:none;font-size:1px;color:${BRAND.black};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.black}">
    <tr><td align="center" style="padding:24px 12px">

      <!-- Email container -->
      <table class="email-container" role="presentation" width="600" cellpadding="0" cellspacing="0"
        style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;border:1px solid ${BRAND.darkBorder}">

        <!-- Top accent bar -->
        <tr><td height="4" style="background:linear-gradient(90deg,${BRAND.orange},${BRAND.orangeLight},#FFB347);font-size:0;line-height:0">&nbsp;</td></tr>

        <!-- Header -->
        <tr>
          <td style="background:${BRAND.darkCard};padding:32px 40px 24px;border-bottom:1px solid ${BRAND.darkBorder}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td><img src="${BRAND.logo}" alt="AceFit" height="44" style="display:block"/></td>
                <td align="right" style="vertical-align:middle">
                  <span style="font-size:11px;color:${BRAND.gray};letter-spacing:2px;text-transform:uppercase;font-weight:600">Premium Fitness Wear</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td class="pad-sm" style="background:${BRAND.darkCard};padding:40px">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${BRAND.black};padding:28px 40px;border-top:1px solid ${BRAND.darkBorder}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:16px">
                  <a href="${BRAND.whatsapp}" style="display:inline-block;margin-right:12px;text-decoration:none">
                    <span style="display:inline-block;background:#25D366;color:#fff;font-size:11px;font-weight:700;padding:6px 14px;border-radius:20px">WhatsApp Us</span>
                  </a>
                  <a href="${BRAND.instagram}" style="display:inline-block;text-decoration:none">
                    <span style="display:inline-block;background:linear-gradient(135deg,#e1306c,#833ab4);color:#fff;font-size:11px;font-weight:700;padding:6px 14px;border-radius:20px">@The_acefit</span>
                  </a>
                </td>
              </tr>
              <tr>
                <td style="font-size:12px;color:${BRAND.gray};line-height:1.8">
                  📞 ${BRAND.phone1} &nbsp;|&nbsp; ${BRAND.phone2}<br/>
                  📧 <a href="mailto:${BRAND.email}" style="color:${BRAND.gray}">${BRAND.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding-top:16px;font-size:11px;color:#555">
                  © ${new Date().getFullYear()} AceFit. All rights reserved.<br/>
                  You received this email because you have an account or placed an order with AceFit.
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

// ─── Reusable UI blocks ───────────────────────────────────────
const badge = (text, color) =>
  `<span style="display:inline-block;background:${color}22;color:${color};font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:1px">${text}</span>`

const infoBox = (label, value, borderColor = BRAND.orange) =>
  `<div style="background:#1A1A1A;border-radius:10px;padding:18px 20px;margin:8px 0;border-left:4px solid ${borderColor}">
    <p style="color:${BRAND.gray};font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px">${label}</p>
    <p style="color:#fff;font-weight:700;font-size:17px;margin:0">${value}</p>
  </div>`

const divider = () =>
  `<div style="height:1px;background:${BRAND.darkBorder};margin:24px 0"></div>`

const btn = (text, href, color = BRAND.orange) =>
  `<a href="${href}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.5px">${text}</a>`

const statusStep = (label, done, active, color) =>
  `<div style="display:inline-block;text-align:center;width:22%">
    <div style="width:36px;height:36px;border-radius:50%;background:${done ? color : '#2A2A2A'};margin:0 auto 6px;display:flex;align-items:center;justify-content:center;font-size:${done ? '16px' : '0'}">
      ${done ? '✓' : ''}
    </div>
    <p style="font-size:10px;color:${done ? color : '#555'};margin:0;font-weight:${active ? '700' : '400'}">${label}</p>
  </div>`

// ─────────────────────────────────────────────────────────────
// 1. WELCOME EMAIL
// ─────────────────────────────────────────────────────────────
export const welcomeEmail = (name) => ({
  subject: `Welcome to AceFit, ${name}! 🔥`,
  html: wrap(`
    <h1 style="color:${BRAND.orange};font-size:32px;margin:0 0 8px;line-height:1.2">Welcome to<br/>the family! 🔥</h1>
    <p style="color:${BRAND.lightGray};font-size:15px;line-height:1.7;margin:0 0 28px">
      Hey <strong style="color:#fff">${name || 'Champion'}</strong>, you've just joined thousands of athletes who train harder and look better with AceFit.
    </p>

    ${divider()}

    <p style="color:${BRAND.gray};font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 16px">Your Member Benefits</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${[
        ['🛒', 'Easy Ordering', 'Shop via web or WhatsApp anytime'],
        ['📦', 'Order Tracking', 'Live status updates sent to your email'],
        ['❤️', 'Wishlist', 'Save your favourite items for later'],
        ['⚡', 'Early Access', 'First to know about new drops & sales'],
      ].map(([icon, title, sub]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${BRAND.darkBorder}">
            <span style="font-size:20px;margin-right:12px;vertical-align:middle">${icon}</span>
            <strong style="color:#fff;font-size:14px;vertical-align:middle">${title}</strong>
            <span style="color:${BRAND.gray};font-size:13px"> — ${sub}</span>
          </td>
        </tr>`
      ).join('')}
    </table>

    ${divider()}

    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:12px">${btn('Shop Now 🔥', BRAND.siteUrl)}</td>
        <td>${btn('WhatsApp Order', BRAND.whatsapp, '#25D366')}</td>
      </tr>
    </table>
  `, `Welcome to AceFit, ${name}! Start shopping premium fitness wear.`)
})

// ─────────────────────────────────────────────────────────────
// 2. OTP / LOGIN CODE
// ─────────────────────────────────────────────────────────────
export const otpEmail = (otp) => ({
  subject: `${otp} is your AceFit login code`,
  html: wrap(`
    <p style="color:${BRAND.gray};font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 24px">Sign In Verification</p>
    <h1 style="color:#fff;font-size:26px;margin:0 0 12px">Your one-time code</h1>
    <p style="color:${BRAND.lightGray};font-size:15px;line-height:1.7;margin:0 0 32px">
      Enter this 6-digit code in the AceFit app to sign in. It expires in <strong style="color:#fff">10 minutes</strong>.
    </p>

    <!-- OTP box -->
    <div style="background:linear-gradient(135deg,${BRAND.orange}22,${BRAND.orangeLight}11);border:2px solid ${BRAND.orange};border-radius:16px;padding:32px;text-align:center;margin-bottom:32px">
      <p style="font-size:52px;font-weight:900;letter-spacing:16px;color:${BRAND.orange};margin:0;font-family:monospace">${otp}</p>
      <p style="color:${BRAND.gray};font-size:12px;margin:12px 0 0">Valid for 10 minutes · One use only</p>
    </div>

    <div style="background:#1A1A1A;border-radius:10px;padding:16px 20px">
      <p style="color:${BRAND.gray};font-size:13px;margin:0">
        🔒 <strong style="color:#fff">Security tip:</strong> AceFit will never ask you to share this code with anyone. If you didn't request this, please ignore this email — your account is safe.
      </p>
    </div>
  `, `${otp} – Your AceFit login code (expires in 10 minutes)`)
})

// ─────────────────────────────────────────────────────────────
// 3. ORDER CONFIRMATION
// ─────────────────────────────────────────────────────────────
export const orderConfirmation = (order, items) => {
  const orderId = order.id?.slice(0, 8).toUpperCase()
  const total = Number(order.total || 0)
  const deliveryFee = Number(order.delivery_fee || 0)
  const subtotal = Number(order.subtotal || total)
  return {
    subject: `Order Confirmed #${orderId} – Your AceFit gear is being prepared! 🎉`,
    html: wrap(`
      <!-- Hero -->
      <div style="text-align:center;margin-bottom:32px">
        <span style="font-size:48px">🎉</span>
        <h1 style="color:${BRAND.orange};font-size:28px;margin:12px 0 8px">Order Confirmed!</h1>
        <p style="color:${BRAND.lightGray};font-size:15px;margin:0">
          Thank you <strong style="color:#fff">${order.customer_name || 'Champion'}</strong>! We've received your order and our team is on it.
        </p>
      </div>

      ${infoBox('Order ID', `#${orderId}`)}

      ${divider()}

      <!-- Items -->
      <p style="color:${BRAND.gray};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 16px">Items Ordered</p>
      ${(items || []).map(i => `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
          <tr>
            <td style="padding:12px;background:#1A1A1A;border-radius:10px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:50px;vertical-align:top;padding-right:12px">
                    <img src="${i.image_url || BRAND.logo}" width="50" height="60" style="border-radius:8px;object-fit:cover;display:block"/>
                  </td>
                  <td style="vertical-align:middle">
                    <p style="color:#fff;font-weight:600;font-size:14px;margin:0 0 4px">${i.name}</p>
                    <p style="color:${BRAND.gray};font-size:12px;margin:0">Size: ${i.size} &nbsp;·&nbsp; Qty: ${i.qty}</p>
                  </td>
                  <td align="right" style="vertical-align:middle">
                    <p style="color:${BRAND.orange};font-weight:700;font-size:15px;margin:0">₦${(i.price * i.qty).toLocaleString()}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`
      ).join('')}

      ${divider()}

      <!-- Price summary -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;color:${BRAND.gray};font-size:13px">Subtotal</td>
          <td align="right" style="color:#fff;font-size:13px">₦${subtotal.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:${BRAND.gray};font-size:13px">Delivery (${order.delivery_state || ''})</td>
          <td align="right" style="font-size:13px;color:${deliveryFee === 0 ? BRAND.green : '#fff'}">
            ${deliveryFee === 0 ? 'FREE 🎉' : `₦${deliveryFee.toLocaleString()}`}
          </td>
        </tr>
        <tr>
          <td style="padding:14px 0 6px;border-top:1px solid ${BRAND.darkBorder}"><strong style="color:#fff;font-size:16px">Total Paid</strong></td>
          <td align="right" style="padding:14px 0 6px;border-top:1px solid ${BRAND.darkBorder}"><strong style="color:${BRAND.orange};font-size:18px">₦${total.toLocaleString()}</strong></td>
        </tr>
      </table>

      ${divider()}

      <!-- Delivery info -->
      <p style="color:${BRAND.gray};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 12px">Delivery Details</p>
      <div style="background:#1A1A1A;border-radius:10px;padding:18px 20px">
        <p style="color:#fff;font-weight:600;font-size:14px;margin:0 0 6px">${order.customer_name}</p>
        <p style="color:${BRAND.lightGray};font-size:13px;margin:0 0 4px">📍 ${order.delivery_address}${order.delivery_landmark ? ` (near ${order.delivery_landmark})` : ''}</p>
        <p style="color:${BRAND.lightGray};font-size:13px;margin:0 0 4px">📞 ${order.customer_phone}</p>
        ${order.estimated_delivery ? `<p style="color:${BRAND.orange};font-size:12px;font-weight:600;margin:8px 0 0">⏱ Est. delivery: ${order.estimated_delivery}</p>` : ''}
      </div>

      ${divider()}

      <!-- CTA -->
      <p style="color:${BRAND.lightGray};font-size:14px;line-height:1.7;margin:0 0 24px">
        We'll email you as soon as your order is picked, packed and dispatched. You can also track your order anytime from your profile.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:12px">${btn('Track My Order', `${BRAND.siteUrl}/orders`)}</td>
          <td>${btn('Need Help?', BRAND.whatsapp, '#25D366')}</td>
        </tr>
      </table>
    `, `Order #${orderId} confirmed! Estimated delivery: ${order.estimated_delivery || '1–5 days'}`)
  }
}

// ─────────────────────────────────────────────────────────────
// 4. ORDER STATUS UPDATE  (admin sends this)
// ─────────────────────────────────────────────────────────────
export const orderStatusUpdate = (order, newStatus, note = '') => {
  const orderId = order.id?.slice(0, 8).toUpperCase()
  const statusMap = {
    processing: { emoji: '📦', label: 'Being Packed',     color: BRAND.blue,   desc: 'Great news! Our team has started carefully packing your order.' },
    shipped:    { emoji: '🚚', label: 'Out for Delivery', color: BRAND.orange, desc: `Your order is on its way to ${order.delivery_state}! Sit tight — it'll be with you soon.` },
    delivered:  { emoji: '✅', label: 'Delivered!',       color: BRAND.green,  desc: "Your AceFit gear has arrived! We hope you love it. Time to go crush those workouts. 🔥" },
    cancelled:  { emoji: '❌', label: 'Order Cancelled',  color: BRAND.red,    desc: 'Your order has been cancelled. If this was a mistake, please contact us immediately.' },
  }
  const info = statusMap[newStatus] || { emoji: '📋', label: newStatus, color: BRAND.orange, desc: 'Your order status has been updated.' }
  const pipelineStatuses = ['pending', 'processing', 'shipped', 'delivered']
  const currentIdx = pipelineStatuses.indexOf(newStatus)

  return {
    subject: `${info.emoji} Your AceFit order #${orderId} – ${info.label}`,
    html: wrap(`
      <!-- Status hero -->
      <div style="text-align:center;padding:16px 0 32px">
        <span style="font-size:52px">${info.emoji}</span>
        <h1 style="color:${info.color};font-size:26px;margin:12px 0 8px">${info.label}</h1>
        <p style="color:${BRAND.lightGray};font-size:15px;line-height:1.7;margin:0">
          Hi <strong style="color:#fff">${order.customer_name || 'Champion'}</strong>, ${info.desc}
        </p>
      </div>

      ${infoBox('Order ID', `#${orderId}`, info.color)}

      ${note ? `
      <div style="background:#1A1A1A;border-radius:10px;padding:16px 20px;margin:16px 0;border-left:4px solid ${info.color}">
        <p style="color:${BRAND.gray};font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 6px">Note from AceFit</p>
        <p style="color:${BRAND.lightGray};font-size:14px;line-height:1.6;margin:0">${note}</p>
      </div>` : ''}

      ${divider()}

      <!-- Pipeline tracker -->
      ${newStatus !== 'cancelled' ? `
      <p style="color:${BRAND.gray};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 20px;text-align:center">Order Progress</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
        <tr>
          ${['Order Placed', 'Packing', 'In Transit', 'Delivered'].map((label, i) => {
            const done = i <= currentIdx
            const active = i === currentIdx
            const colors = [BRAND.yellow, BRAND.blue, BRAND.orange, BRAND.green]
            return `<td style="text-align:center;vertical-align:top;padding:0 4px">
              <div style="width:34px;height:34px;border-radius:50%;background:${done ? colors[i] : '#2A2A2A'};margin:0 auto 8px;line-height:34px;text-align:center;font-size:${done ? '15px' : '0'};color:#fff">${done ? '✓' : ''}</div>
              <p style="font-size:10px;color:${done ? colors[i] : '#555'};margin:0;font-weight:${active ? '700' : '400'}">${label}</p>
            </td>`
          }).join(`<td style="vertical-align:middle;padding-bottom:20px"><div style="height:2px;background:#2A2A2A;width:100%"></div></td>`)}
        </tr>
      </table>` : ''}

      ${divider()}

      <!-- Delivery reminder -->
      <div style="background:#1A1A1A;border-radius:10px;padding:16px 20px">
        <p style="color:${BRAND.gray};font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 10px">Delivering to</p>
        <p style="color:#fff;font-weight:600;font-size:14px;margin:0 0 4px">${order.customer_name}</p>
        <p style="color:${BRAND.lightGray};font-size:13px;margin:0">📍 ${order.delivery_address}</p>
        <p style="color:${BRAND.lightGray};font-size:13px;margin:4px 0 0">📞 ${order.customer_phone}</p>
      </div>

      ${divider()}

      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:12px">${btn('Track My Order', `${BRAND.siteUrl}/orders`)}</td>
          <td>${btn('WhatsApp Support', BRAND.whatsapp, '#25D366')}</td>
        </tr>
      </table>
    `, `Your order #${orderId} is now: ${info.label}`)
  }
}

// ─────────────────────────────────────────────────────────────
// 5. PAYMENT FAILED
// ─────────────────────────────────────────────────────────────
export const paymentFailed = (order) => {
  const orderId = order.id?.slice(0, 8).toUpperCase() || order
  return {
    subject: `Payment Failed – AceFit Order #${orderId}`,
    html: wrap(`
      <div style="text-align:center;margin-bottom:32px">
        <span style="font-size:48px">😕</span>
        <h1 style="color:${BRAND.red};font-size:26px;margin:12px 0 8px">Payment Unsuccessful</h1>
        <p style="color:${BRAND.lightGray};font-size:15px;line-height:1.7;margin:0">
          Hi ${order.customer_name || 'there'}, your payment for order <strong style="color:#fff">#${orderId}</strong> could not be processed.
        </p>
      </div>

      <div style="background:#1A1A1A;border-radius:10px;padding:20px;border-left:4px solid ${BRAND.red};margin-bottom:28px">
        <p style="color:#fff;font-weight:600;margin:0 0 8px">What may have happened:</p>
        <ul style="color:${BRAND.lightGray};font-size:13px;line-height:1.9;margin:0;padding-left:18px">
          <li>Insufficient balance in your OPay account</li>
          <li>Card or bank transfer declined</li>
          <li>Network/connectivity issue during payment</li>
          <li>Payment session timed out</li>
        </ul>
      </div>

      <p style="color:${BRAND.lightGray};font-size:14px;line-height:1.7;margin:0 0 24px">
        Your cart has been saved. Click below to try again — or contact us on WhatsApp and we'll help you complete the order.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:12px">${btn('Retry Payment', `${BRAND.siteUrl}`)}</td>
          <td>${btn('WhatsApp Help', BRAND.whatsapp, '#25D366')}</td>
        </tr>
      </table>
    `, `Payment failed for AceFit order #${orderId}. Retry anytime.`)
  }
}

// ─────────────────────────────────────────────────────────────
// 6. SUPPORT TICKET RAISED
// ─────────────────────────────────────────────────────────────
export const supportTicketRaised = (ticket) => {
  const ticketId = ticket.id?.slice(0, 8).toUpperCase()
  return {
    subject: `Support Ticket #${ticketId} Received – AceFit`,
    html: wrap(`
      <h1 style="color:${BRAND.orange};font-size:26px;margin:0 0 12px">We got your message! 💬</h1>
      <p style="color:${BRAND.lightGray};font-size:15px;line-height:1.7;margin:0 0 28px">
        Hi <strong style="color:#fff">${ticket.name}</strong>, thank you for reaching out. Our support team has received your request and will respond within <strong style="color:#fff">24 hours</strong>.
      </p>

      ${infoBox('Ticket ID', `#${ticketId}`)}

      <div style="background:#1A1A1A;border-radius:10px;padding:18px 20px;margin-top:12px">
        <p style="color:${BRAND.gray};font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px">Your Message</p>
        <p style="color:${BRAND.lightGray};font-size:14px;line-height:1.7;margin:0">"${ticket.message}"</p>
      </div>

      ${divider()}

      <p style="color:${BRAND.lightGray};font-size:14px;line-height:1.7;margin:0 0 24px">
        Need a faster response? WhatsApp us directly — we're usually online.
      </p>

      ${btn('WhatsApp Support', `${BRAND.whatsapp}?text=${encodeURIComponent(`Hi, following up on ticket #${ticketId}`)}`, '#25D366')}
    `, `Ticket #${ticketId} received — we'll respond within 24 hours.`)
  }
}

// ─────────────────────────────────────────────────────────────
// 7. SUPPORT TICKET REPLY
// ─────────────────────────────────────────────────────────────
export const supportTicketReply = (ticket) => {
  const ticketId = ticket.id?.slice(0, 8).toUpperCase()
  return {
    subject: `Re: Your Support Ticket #${ticketId} – AceFit`,
    html: wrap(`
      <h1 style="color:${BRAND.green};font-size:26px;margin:0 0 12px">We've replied! ✅</h1>
      <p style="color:${BRAND.lightGray};font-size:15px;line-height:1.7;margin:0 0 28px">
        Hi <strong style="color:#fff">${ticket.name}</strong>, our support team has responded to your ticket.
      </p>

      ${infoBox('Ticket ID', `#${ticketId}`, BRAND.green)}

      <div style="background:#1A1A1A;border-radius:10px;padding:18px 20px;margin:12px 0">
        <p style="color:${BRAND.gray};font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px">Your Original Message</p>
        <p style="color:${BRAND.gray};font-size:13px;line-height:1.6;margin:0;font-style:italic">"${ticket.message}"</p>
      </div>

      <div style="background:linear-gradient(135deg,${BRAND.green}15,${BRAND.green}08);border:1px solid ${BRAND.green}33;border-radius:10px;padding:20px;margin:12px 0">
        <p style="color:${BRAND.green};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 10px">AceFit Support Reply</p>
        <p style="color:#fff;font-size:14px;line-height:1.7;margin:0">${ticket.reply}</p>
      </div>

      ${ticket.status === 'resolved' ? `
      <div style="background:#1A1A1A;border-radius:10px;padding:14px 18px;margin-top:16px;text-align:center">
        <span style="color:${BRAND.green};font-weight:700">✅ Ticket Resolved</span>
        <span style="color:${BRAND.gray};font-size:13px"> — If you need further help, reply to this email or contact us on WhatsApp.</span>
      </div>` : ''}

      ${divider()}

      ${btn('WhatsApp Us', BRAND.whatsapp, '#25D366')}
    `, `AceFit support has replied to your ticket #${ticketId}.`)
  }
}

// ─────────────────────────────────────────────────────────────
// LEGACY EXPORTS (backward compat with old template names)
// ─────────────────────────────────────────────────────────────
export const emailTemplates = {
  welcomeEmail,
  otpEmail,
  orderConfirmation,
  orderStatusUpdate,
  paymentFailed,
  supportTicket: supportTicketRaised,
  supportTicketReply,
  ticketResolved: supportTicketReply,
}

export default emailTemplates
