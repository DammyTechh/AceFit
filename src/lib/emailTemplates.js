// src/lib/emailTemplates.js — All AceFit transactional emails

const BRAND = {
  orange:      '#FF6B00',
  orangeLight: '#FF8C3A',
  black:       '#0A0A0A',
  darkCard:    '#141414',
  darkBorder:  '#242424',
  gray:        '#888888',
  green:       '#22c55e',
  red:         '#ef4444',
  blue:        '#3b82f6',
  logo:        'https://i.imgur.com/eDF88SE.png',
  phone1:      '07025692097',
  phone2:      '09153040271',
  email:       'acefitandgainz@gmail.com',
  whatsapp:    'https://wa.me/2347025692097',
  instagram:   'https://instagram.com/acefit.shop',
  tiktok:      'https://tiktok.com/@the_acefit',
  snapchat:    'https://snapchat.com/add/acefit_official',
  siteUrl:     import.meta.env.VITE_APP_URL || 'https://acefit.netlify.app',
}

const wrap = (body, preheader = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>AceFit</title>
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    body{margin:0;padding:0;background:${BRAND.black};font-family:'DM Sans',Helvetica,Arial,sans-serif}
    img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
    a{color:${BRAND.orange}}
    @media only screen and (max-width:600px){
      .email-container{width:100%!important}
      .pad-sm{padding:24px 20px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${BRAND.black}">
  ${preheader ? `<div style="display:none;font-size:1px;color:${BRAND.black};max-height:0;overflow:hidden">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.black}">
    <tr><td align="center" style="padding:24px 12px">
      <table class="email-container" role="presentation" width="600" cellpadding="0" cellspacing="0"
        style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;border:1px solid ${BRAND.darkBorder}">
        <tr><td height="4" style="background:linear-gradient(90deg,${BRAND.orange},${BRAND.orangeLight},#FFB347);font-size:0;line-height:0">&nbsp;</td></tr>
        <tr>
          <td style="background:${BRAND.darkCard};padding:28px 40px 20px;border-bottom:1px solid ${BRAND.darkBorder}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td><img src="${BRAND.logo}" alt="AceFit" height="40" style="display:block"/></td>
                <td align="right" style="vertical-align:middle">
                  <span style="font-size:10px;color:${BRAND.gray};letter-spacing:2px;text-transform:uppercase;font-weight:600">Premium Fitness Wear</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="pad-sm" style="background:${BRAND.darkCard};padding:36px 40px">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background:${BRAND.black};padding:24px 40px;border-top:1px solid ${BRAND.darkBorder}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:14px">
                  <a href="${BRAND.whatsapp}" style="display:inline-block;margin-right:10px;text-decoration:none">
                    <span style="display:inline-block;background:#25D366;color:#fff;font-size:11px;font-weight:700;padding:6px 14px;border-radius:20px">WhatsApp Us</span>
                  </a>
                  <a href="${BRAND.instagram}" style="display:inline-block;margin-right:10px;text-decoration:none">
                    <span style="display:inline-block;background:linear-gradient(135deg,#e1306c,#833ab4);color:#fff;font-size:11px;font-weight:700;padding:6px 14px;border-radius:20px">Instagram</span>
                  </a>
                  <a href="${BRAND.tiktok}" style="display:inline-block;text-decoration:none">
                    <span style="display:inline-block;background:#000;color:#fff;font-size:11px;font-weight:700;padding:6px 14px;border-radius:20px">TikTok</span>
                  </a>
                </td>
              </tr>
              <tr>
                <td style="font-size:12px;color:${BRAND.gray};line-height:1.8">
                  <strong style="color:${BRAND.lightGray||'#ccc'}">AceFit</strong> — Premium Fitness Wear<br/>
                  📞 ${BRAND.phone1} | ${BRAND.phone2}<br/>
                  ✉️ ${BRAND.email}<br/>
                  <span style="font-size:11px">© ${new Date().getFullYear()} AceFit. All rights reserved.</span>
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

const btn = (text, url) =>
  `<a href="${url}" style="display:inline-block;background:${BRAND.orange};color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;letter-spacing:0.5px">${text}</a>`

const divider = `<hr style="border:none;border-top:1px solid ${BRAND.darkBorder};margin:24px 0"/>`

const orderTable = (items) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">
  <tr>
    <td style="font-size:11px;color:${BRAND.gray};font-weight:700;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px">Item</td>
    <td style="font-size:11px;color:${BRAND.gray};font-weight:700;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px;text-align:center">Qty</td>
    <td style="font-size:11px;color:${BRAND.gray};font-weight:700;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px;text-align:right">Price</td>
  </tr>
  ${items.map(i => `
  <tr>
    <td style="font-size:14px;color:#fff;padding:10px 0;border-top:1px solid ${BRAND.darkBorder}">
      ${i.name}${i.size ? ` <span style="color:${BRAND.gray};font-size:12px">(${i.size})</span>` : ''}
      ${i.color ? ` <span style="color:${BRAND.gray};font-size:12px">· ${i.color}</span>` : ''}
    </td>
    <td style="font-size:14px;color:#fff;padding:10px 0;border-top:1px solid ${BRAND.darkBorder};text-align:center">${i.qty}</td>
    <td style="font-size:14px;color:${BRAND.orange};font-weight:700;padding:10px 0;border-top:1px solid ${BRAND.darkBorder};text-align:right">₦${Number(i.price * i.qty).toLocaleString()}</td>
  </tr>`).join('')}
</table>`

export const emailTemplates = {

  // ── 1. OTP / Sign-in ─────────────────────────────────────
  otp: ({ email, otp }) => ({
    subject: `Your AceFit login code: ${otp}`,
    html: wrap(`
      <h1 style="font-size:28px;font-weight:900;color:#fff;margin:0 0 8px;font-family:Impact,sans-serif;letter-spacing:2px">YOUR LOGIN CODE</h1>
      <p style="font-size:14px;color:${BRAND.gray};margin:0 0 28px">Hi ${email} — here's your one-time code:</p>
      <div style="background:#111;border:2px solid ${BRAND.orange};border-radius:16px;padding:24px;text-align:center;margin:0 0 24px">
        <span style="font-size:42px;font-weight:900;color:${BRAND.orange};letter-spacing:10px;font-family:monospace">${otp}</span>
        <p style="font-size:12px;color:${BRAND.gray};margin:12px 0 0">Valid for 10 minutes. Do not share with anyone.</p>
      </div>
      <p style="font-size:13px;color:${BRAND.gray}">If you didn't request this, you can safely ignore this email.</p>
    `, `Your AceFit login code is ${otp}`)
  }),

  // ── 2. Welcome ───────────────────────────────────────────
  welcome: ({ name, email }) => ({
    subject: 'Welcome to AceFit 🔥 — Your Account is Ready',
    html: wrap(`
      <h1 style="font-size:32px;font-weight:900;color:#fff;margin:0 0 8px;font-family:Impact,sans-serif;letter-spacing:2px">WELCOME TO THE TEAM, ${(name || email).toUpperCase()}!</h1>
      <p style="font-size:15px;color:${BRAND.gray};margin:0 0 24px">You're now part of Nigeria's fastest-growing fitness community. Train harder, look better — with AceFit.</p>
      <div style="background:#111;border-radius:12px;padding:20px;margin:0 0 24px">
        <p style="font-size:13px;color:${BRAND.gray};margin:0 0 12px">✅ &nbsp;<strong style="color:#fff">Browse premium fitness wear</strong></p>
        <p style="font-size:13px;color:${BRAND.gray};margin:0 0 12px">✅ &nbsp;<strong style="color:#fff">Track your orders in real-time</strong></p>
        <p style="font-size:13px;color:${BRAND.gray};margin:0 0 12px">✅ &nbsp;<strong style="color:#fff">Save items to your wishlist</strong></p>
        <p style="font-size:13px;color:${BRAND.gray};margin:0">✅ &nbsp;<strong style="color:#fff">Get exclusive member deals</strong></p>
      </div>
      ${btn('Shop Now', BRAND.siteUrl)}
    `, 'Welcome to AceFit — Your account is ready!')
  }),

  // ── 3. Order Confirmation ────────────────────────────────
  orderConfirm: ({ order }) => ({
    subject: `Order Confirmed ✅ — #${order.id?.slice(0, 8).toUpperCase()}`,
    html: wrap(`
      <h1 style="font-size:28px;font-weight:900;color:#fff;margin:0 0 8px;font-family:Impact,sans-serif;letter-spacing:2px">ORDER CONFIRMED! 🎉</h1>
      <p style="font-size:14px;color:${BRAND.gray};margin:0 0 24px">Hey ${order.customer_name}, your order is confirmed and will be processed shortly.</p>
      <div style="background:#111;border-radius:12px;padding:20px;margin:0 0 20px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:12px;color:${BRAND.gray};padding-bottom:6px">Order ID</td>
            <td style="font-size:13px;color:${BRAND.orange};font-weight:700;text-align:right">#${order.id?.slice(0,8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:${BRAND.gray};padding-bottom:6px">Payment</td>
            <td style="font-size:13px;color:${BRAND.green};font-weight:700;text-align:right">Paid ✓</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:${BRAND.gray};padding-bottom:6px">Delivery to</td>
            <td style="font-size:13px;color:#fff;text-align:right">${order.delivery_state || 'Nigeria'}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:${BRAND.gray}">ETA</td>
            <td style="font-size:13px;color:#fff;text-align:right">${order.estimated_delivery || '2–5 days'}</td>
          </tr>
        </table>
      </div>
      ${orderTable(order.items || [])}
      ${divider}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:${BRAND.gray}">Subtotal</td>
          <td style="font-size:13px;color:#fff;text-align:right">₦${Number(order.subtotal).toLocaleString()}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:${BRAND.gray}">Delivery</td>
          <td style="font-size:13px;color:#fff;text-align:right">₦${Number(order.delivery_fee).toLocaleString()}</td>
        </tr>
        <tr>
          <td style="font-size:16px;font-weight:700;color:#fff;padding-top:10px">Total</td>
          <td style="font-size:16px;font-weight:700;color:${BRAND.orange};text-align:right;padding-top:10px">₦${Number(order.total).toLocaleString()}</td>
        </tr>
      </table>
      <div style="margin-top:28px">${btn('Track My Order', `${BRAND.siteUrl}/orders?ref=${order.id}`)}</div>
    `, `Your AceFit order #${order.id?.slice(0,8).toUpperCase()} is confirmed!`)
  }),

  // ── 4. Order Status Update ───────────────────────────────
  orderStatus: ({ order, newStatus }) => {
    const statusMap = {
      processing:       { icon: '⚙️',  label: 'Being Processed',     msg: 'Our team is preparing your order.' },
      packed:           { icon: '📦',  label: 'Packed & Ready',       msg: 'Your order is packed and ready for pickup by our delivery partner.' },
      shipped:          { icon: '🚚',  label: 'On Its Way!',          msg: `Your order is on the way. ETA: ${order.estimated_delivery || '2-5 days'}.` },
      out_for_delivery: { icon: '🛵',  label: 'Out for Delivery',     msg: 'Your order is out for delivery today!' },
      delivered:        { icon: '🎉',  label: 'Delivered!',           msg: 'Your order has been delivered. We hope you love it!' },
      cancelled:        { icon: '❌',  label: 'Order Cancelled',      msg: 'Your order has been cancelled. Contact us for help.' },
    }
    const s = statusMap[newStatus] || { icon: '📋', label: newStatus, msg: 'Your order status has been updated.' }
    return {
      subject: `${s.icon} Order Update — ${s.label} #${order.id?.slice(0,8).toUpperCase()}`,
      html: wrap(`
        <div style="text-align:center;margin-bottom:28px">
          <span style="font-size:56px">${s.icon}</span>
          <h1 style="font-size:28px;font-weight:900;color:#fff;margin:12px 0 8px;font-family:Impact,sans-serif;letter-spacing:2px">${s.label.toUpperCase()}</h1>
          <p style="font-size:14px;color:${BRAND.gray};margin:0">${s.msg}</p>
        </div>
        <div style="background:#111;border-radius:12px;padding:20px;margin:0 0 24px">
          <p style="font-size:13px;color:${BRAND.gray};margin:0 0 6px">Order ID: <strong style="color:${BRAND.orange}">#${order.id?.slice(0,8).toUpperCase()}</strong></p>
          <p style="font-size:13px;color:${BRAND.gray};margin:0">Customer: <strong style="color:#fff">${order.customer_name}</strong></p>
        </div>
        ${newStatus === 'delivered' ? `
        <div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:12px;padding:16px;margin:0 0 24px;text-align:center">
          <p style="font-size:14px;color:${BRAND.green};font-weight:600;margin:0">Leave us a review and help other shoppers! 💪</p>
        </div>
        ${btn('Leave a Review', BRAND.siteUrl + '/#feedback')}` :
        btn('Track My Order', `${BRAND.siteUrl}/orders?ref=${order.id}`)}
      `, `Your AceFit order is now: ${s.label}`)
    }
  },

  // ── 5. Payment Failed ────────────────────────────────────
  paymentFailed: ({ order, reference }) => ({
    subject: '⚠️ Payment Failed — Your AceFit Order',
    html: wrap(`
      <h1 style="font-size:28px;font-weight:900;color:${BRAND.red};margin:0 0 8px;font-family:Impact,sans-serif;letter-spacing:2px">PAYMENT FAILED</h1>
      <p style="font-size:14px;color:${BRAND.gray};margin:0 0 24px">Hi ${order.customer_name}, your payment for order <strong style="color:${BRAND.orange}">#${order.id?.slice(0,8).toUpperCase()}</strong> was not successful.</p>
      <div style="background:#111;border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:20px;margin:0 0 24px">
        <p style="font-size:13px;color:${BRAND.gray};margin:0 0 8px">Reference: <strong style="color:#fff">${reference || 'N/A'}</strong></p>
        <p style="font-size:13px;color:${BRAND.gray};margin:0">Your items are still in your cart. Please try again.</p>
      </div>
      <div style="margin-bottom:16px">${btn('Try Again', BRAND.siteUrl)}</div>
      <p style="font-size:13px;color:${BRAND.gray}">Need help? WhatsApp us on <a href="${BRAND.whatsapp}" style="color:${BRAND.orange}">${BRAND.phone1}</a></p>
    `, 'Your AceFit payment was not successful')
  }),

  // ── 6. Support Ticket ────────────────────────────────────
  ticketCreated: ({ ticket }) => ({
    subject: `Support Ticket Received — ${ticket.ticket_no || '#TKT'}`,
    html: wrap(`
      <h1 style="font-size:26px;font-weight:900;color:#fff;margin:0 0 8px;font-family:Impact,sans-serif;letter-spacing:2px">WE GOT YOUR MESSAGE</h1>
      <p style="font-size:14px;color:${BRAND.gray};margin:0 0 24px">Hi ${ticket.name}, our team will respond within 1 hour during business hours.</p>
      <div style="background:#111;border-radius:12px;padding:20px;margin:0 0 24px">
        <p style="font-size:12px;color:${BRAND.gray};margin:0 0 8px">Ticket No: <strong style="color:${BRAND.orange}">${ticket.ticket_no || 'N/A'}</strong></p>
        <p style="font-size:12px;color:${BRAND.gray};margin:0 0 8px">Subject: <strong style="color:#fff">${ticket.subject || 'General Enquiry'}</strong></p>
        <p style="font-size:12px;color:${BRAND.gray};margin:0">Your message: <em style="color:#aaa">"${ticket.message}"</em></p>
      </div>
      <p style="font-size:13px;color:${BRAND.gray}">For urgent issues, WhatsApp us directly: <a href="${BRAND.whatsapp}" style="color:${BRAND.orange}">${BRAND.phone1}</a></p>
    `, `Ticket ${ticket.ticket_no} received — we'll be in touch soon`)
  }),

  // ── 7. Support Reply ─────────────────────────────────────
  ticketReply: ({ ticket, reply }) => ({
    subject: `Re: Your AceFit Support Ticket — ${ticket.ticket_no}`,
    html: wrap(`
      <h1 style="font-size:26px;font-weight:900;color:#fff;margin:0 0 8px;font-family:Impact,sans-serif;letter-spacing:2px">WE'VE REPLIED</h1>
      <p style="font-size:14px;color:${BRAND.gray};margin:0 0 24px">Hi ${ticket.name}, here's our response to your ticket <strong style="color:${BRAND.orange}">${ticket.ticket_no}</strong>:</p>
      <div style="background:#111;border-left:3px solid ${BRAND.orange};border-radius:0 12px 12px 0;padding:20px;margin:0 0 24px">
        <p style="font-size:14px;color:#fff;margin:0;line-height:1.7">${reply}</p>
      </div>
      <p style="font-size:13px;color:${BRAND.gray}">Still need help? Reply to this email or WhatsApp: <a href="${BRAND.whatsapp}" style="color:${BRAND.orange}">${BRAND.phone1}</a></p>
    `, `AceFit replied to your ticket ${ticket.ticket_no}`)
  }),

  // ── 8. Admin: New Order Alert ────────────────────────────
  adminNewOrder: ({ order }) => ({
    subject: `🛒 New Order #${order.id?.slice(0,8).toUpperCase()} — ₦${Number(order.total).toLocaleString()}`,
    html: wrap(`
      <h1 style="font-size:26px;font-weight:900;color:${BRAND.orange};margin:0 0 8px;font-family:Impact,sans-serif;letter-spacing:2px">NEW ORDER RECEIVED</h1>
      <div style="background:#111;border-radius:12px;padding:20px;margin:0 0 20px">
        <p style="font-size:13px;color:${BRAND.gray};margin:0 0 8px">Order: <strong style="color:${BRAND.orange}">#${order.id?.slice(0,8).toUpperCase()}</strong></p>
        <p style="font-size:13px;color:${BRAND.gray};margin:0 0 8px">Customer: <strong style="color:#fff">${order.customer_name}</strong></p>
        <p style="font-size:13px;color:${BRAND.gray};margin:0 0 8px">Phone: <strong style="color:#fff">${order.customer_phone}</strong></p>
        <p style="font-size:13px;color:${BRAND.gray};margin:0 0 8px">State: <strong style="color:#fff">${order.delivery_state}</strong></p>
        <p style="font-size:13px;color:${BRAND.gray};margin:0">Total: <strong style="color:${BRAND.green};font-size:16px">₦${Number(order.total).toLocaleString()}</strong></p>
      </div>
      ${orderTable(order.items || [])}
      <div style="margin-top:24px">${btn('View in Admin', `${BRAND.siteUrl}/admin/orders`)}</div>
    `, `New order from ${order.customer_name}`)
  }),

  // ── 9. Admin: New Support Ticket ─────────────────────────
  adminNewTicket: ({ ticket }) => ({
    subject: `🎫 New Support Ticket — ${ticket.ticket_no}`,
    html: wrap(`
      <h1 style="font-size:26px;font-weight:900;color:${BRAND.orange};margin:0 0 8px;font-family:Impact,sans-serif;letter-spacing:2px">NEW SUPPORT TICKET</h1>
      <div style="background:#111;border-radius:12px;padding:20px;margin:0 0 20px">
        <p style="font-size:13px;color:${BRAND.gray};margin:0 0 8px">From: <strong style="color:#fff">${ticket.name}</strong> (${ticket.email})</p>
        <p style="font-size:13px;color:${BRAND.gray};margin:0 0 8px">Phone: <strong style="color:#fff">${ticket.phone || 'N/A'}</strong></p>
        <p style="font-size:13px;color:${BRAND.gray};margin:0 0 8px">Subject: <strong style="color:#fff">${ticket.subject || 'General'}</strong></p>
        <p style="font-size:13px;color:${BRAND.gray};margin:0">Message: <em style="color:#aaa">"${ticket.message}"</em></p>
      </div>
      <div style="margin-top:24px">${btn('Reply in Admin', `${BRAND.siteUrl}/admin/tickets`)}</div>
    `, `New support ticket from ${ticket.name}`)
  }),

  // ── 10. Newsletter / Welcome ─────────────────────────────
  newsletter: ({ email, subject, content }) => ({
    subject: subject || 'New from AceFit 🔥',
    html: wrap(`
      <h1 style="font-size:28px;font-weight:900;color:#fff;margin:0 0 20px;font-family:Impact,sans-serif;letter-spacing:2px">ACEFIT NEWS</h1>
      <div style="font-size:15px;color:#ccc;line-height:1.8">${content}</div>
      <div style="margin-top:28px">${btn('Shop Now', BRAND.siteUrl)}</div>
    `, subject)
  }),
}

export default emailTemplates
