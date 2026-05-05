# 🔥 AceFit – Premium Fitness Wear E-Commerce

A production-ready full-stack e-commerce web app.

---

## 🚀 QUICK START 

```bash
# 1. Install
npm install

# 2. Configure (copy .env.example → .env and fill values)
cp .env.example .env

# 3. Run
npm run dev
```

## 🗄️ DATABASE SETUP (Supabase)

1. Create project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste contents of `acefit-migration.sql` → **Run**
3. Go to **Authentication → Providers → Email** → Enable **"Email OTP"** (important!)
4. Go to **Storage** → Create bucket `product-images` → set to **Public**
5. Create admin user: **Authentication → Users → Add User**
   - Email: `your mail`
   - Password: `your password`

---

## ⚙️ ENVIRONMENT VARIABLES

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional but recommended:
VITE_OPAY_MERCHANT_ID=your_merchant_id
VITE_OPAY_PUBLIC_KEY=your_public_key
```

---

## 🌐 DEPLOY TO NETLIFY

### Option A – Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Option B – Netlify Dashboard (recommended)
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
3. Set **Build command:** `npm run build`
4. Set **Publish directory:** `dist`
5. Add environment variables (from Settings → Environment Variables)
6. Deploy!

> The `netlify.toml` and `public/_redirects` files handle SPA routing automatically — `/admin` and all routes work on refresh.

---

## 📧 EMAIL SETUP (Resend — free, no domain needed)

1. Sign up at [resend.com](https://resend.com) — free tier available
2. Create API key
3. Deploy Supabase edge function:
```bash
supabase functions deploy send-email --no-verify-jwt
supabase secrets set RESEND_API_KEY=re_your_key
```

---

## ✅ FEATURE CHECKLIST

### Storefront
- ✅ Hero with 3D floating product animations  
- ✅ Category showcase (Men, Women, Tracksuits, Accessories)
- ✅ Filterable product grid (category, gender, price, search, sort)
- ✅ 3D tilt product cards with hover rotation
- ✅ Quick-view modal with size selector
- ✅ Cart sidebar with quantity management
- ✅ **OPay checkout** with delivery address form
- ✅ **Address autocomplete** via OpenStreetMap (no API key needed)
- ✅ **Delivery fee calculator** by Nigerian state/zone
- ✅ WhatsApp order button (direct chat)
- ✅ Wishlist with local persistence
- ✅ Dark / Light mode toggle
- ✅ Email OTP authentication (no password)
- ✅ Location consent + T&C modal on first visit
- ✅ Support chatbot with ticket form
- ✅ Star-rated feedback form
- ✅ About section with brand story
- ✅ Contact section with WhatsApp-linked form
- ✅ Social proof (Instagram feed)

### Order Tracking (User)
- ✅ Live tracking timeline: Placed → Packing → In Transit → Delivered
- ✅ Status history with timestamps per step
- ✅ Active order spotlight (pinned at top)
- ✅ Order detail: items, delivery address, payment summary
- ✅ Guest tracker — search by Order ID or payment reference
- ✅ Filter by status (Pending / Packing / In Transit / Delivered)
- ✅ Email notifications on every status change

### Admin Panel (`/admin`)
- ✅ Protected login with credentials shown on screen
- ✅ Dashboard — revenue, orders, customer stats, bar chart
- ✅ **Product CRUD** — image upload, sizes, stock, badges
- ✅ **Order management** — full tracking status updater
- ✅ **Status pipeline UI** — Placed → Packing → Dispatched → Delivered
- ✅ **Email notification** sent to customer on every status change
- ✅ Optional note to customer with each status update
- ✅ Support tickets with reply + customer email notification
- ✅ Customer list
- ✅ Feedback & reviews
- ✅ Settings (API keys, WhatsApp numbers, notifications)

### Emails Sent
| Trigger | Recipient |
|---|---|
| Sign up | Customer (Welcome) |
| OTP request | Customer (6-digit code) |
| Order placed | Customer (full receipt) |
| Payment failed | Customer |
| Status → Processing | Customer |
| Status → Shipped | Customer |
| Status → Delivered | Customer |
| Status → Cancelled | Customer |
| Support ticket raised | Customer |
| Admin replies ticket | Customer |

---

## 📞 CONTACT INFO

- 📞 07025692097 / 09153040271  
- 📧 Acefitandgainz@gmail.com  
- 📸 [@The_acefit](https://instagram.com/The_acefit)  
- 🎵 [@The_acefit](https://tiktok.com/@The_acefit)
