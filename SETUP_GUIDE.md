# AceFit v2 — Complete Setup Guide

> **Time to deploy: ~30–45 minutes**  
> Follow every step in order. Don't skip anything.

---

## What You Need Before Starting

| Tool | Where to Get |
|---|---|
| Supabase account (free) | https://supabase.com |
| Resend account (free) | https://resend.com |
| Paystack account | https://paystack.com |
| Netlify account (free) | https://netlify.com |
| Node.js 18+ | https://nodejs.org |
| Supabase CLI | `npm install -g supabase` |

---

## STEP 1 — Supabase Project Setup

### 1.1 Create Project
1. Go to https://supabase.com → **New Project**
2. Name it `acefit` · Choose a strong database password (save it!)
3. Select region: **West Europe** or **US East** (closest to Nigeria)
4. Wait ~2 minutes for it to spin up

### 1.2 Run the Database Migration
1. In your Supabase dashboard → **SQL Editor** (left sidebar)
2. Click **+ New query**
3. Open the file `acefit-migration-FINAL-v5.sql` from this project
4. Copy the entire contents → paste into the SQL Editor
5. Click **Run** (or press `Ctrl+Enter`)
6. You should see: `Success. No rows returned`

> ⚠️ This drops any old tables and creates everything fresh. Only run once.

### 1.3 Get Your API Keys
1. Go to **Project Settings** → **API**
2. Copy these two values — you'll need them later:
   - **Project URL** → looks like `https://abcdefgh.supabase.co`
   - **anon / public key** → long JWT string starting with `eyJ...`

### 1.4 Enable Email OTP (Magic Link / OTP Auth)
1. Go to **Authentication** → **Providers**
2. Click **Email**
3. Make sure **Enable Email Provider** is ON
4. Turn OFF "Confirm email" (OTP doesn't need it)
5. Click **Save**

### 1.5 Set Your Site URL (Important!)
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your Netlify URL (e.g. `https://acefit.netlify.app`)
3. Add to **Redirect URLs**: `https://acefit.netlify.app/**`
4. Click **Save**

> ⚠️ Without this, OTP emails will fail or redirect to the wrong place.

### 1.6 Create Storage Bucket
1. Go to **Storage** (left sidebar)
2. Click **New bucket**
3. Name: `acefit-media`
4. Toggle **Public bucket** → ON
5. Click **Save**

Then set the bucket policy (so uploads work):
1. Click on `acefit-media` → **Policies**
2. Click **New policy** → **For full customization**
3. Policy name: `allow_all`
4. Allowed operation: tick all (SELECT, INSERT, UPDATE, DELETE)
5. Policy definition:
```sql
true
```
6. Click **Review** → **Save policy**

---

## STEP 2 — Resend Setup (Email)

### 2.1 Get Your API Key
1. Go to https://resend.com → Sign up / Log in
2. Go to **API Keys** → **Create API Key**
3. Name: `AceFit Production`
4. Permission: **Full Access**
5. Copy the key (starts with `re_`)

> 📧 **Until you verify a domain**, emails send from `onboarding@resend.dev`. This is fine for testing. Customers will still receive emails.

### 2.2 (Optional but Recommended) Verify Your Domain
1. In Resend → **Domains** → **Add Domain**
2. Enter your domain (e.g. `acefit.com` or `acefitandgainz.com`)
3. Add the DNS records shown to your domain registrar (Namecheap, GoDaddy, etc.)
4. Click **Verify** after adding DNS records (takes 5–30 minutes)
5. Once verified, open `supabase/functions/send-email/index.ts` and change:
```ts
// Change this line:
const FROM_EMAIL = "AceFit <onboarding@resend.dev>"
// To:
const FROM_EMAIL = "AceFit <noreply@yourdomain.com>"
```

---

## STEP 3 — Paystack Setup

### 3.1 Get Your Keys
1. Go to https://dashboard.paystack.com → Sign in
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy:
   - **Public Key** (starts with `pk_live_` or `pk_test_`)
   - **Secret Key** (starts with `sk_live_` or `sk_test_`)

> 💡 Use **test keys** (`pk_test_`, `sk_test_`) while testing — no real charges. Switch to **live keys** when going live.

### 3.2 Webhook (Optional but Recommended)
1. In Paystack → **Settings** → **API Keys & Webhooks**
2. Scroll to **Webhooks**
3. Add URL: `https://your-supabase-project.supabase.co/functions/v1/send-email?action=webhook`
4. This lets Paystack notify your server of payment events

---

## STEP 4 — Deploy the Edge Function (Supabase)

Open your terminal:

```bash
# 1. Install Supabase CLI (if not already installed)
npm install -g supabase

# 2. Login
supabase login
# This opens a browser — click Authorize

# 3. Go to your project folder
cd path/to/acefit-v2

# 4. Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
# Find YOUR_PROJECT_REF in: Supabase Dashboard → Settings → General → Reference ID

# 5. Set secrets (replace with your actual keys)
supabase secrets set RESEND_API_KEY=re_your_resend_key_here
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_here

# 6. Deploy the edge function
supabase functions deploy send-email --no-verify-jwt
```

You should see: `Deployed Function send-email`

---

## STEP 5 — Environment Variables

Create a file called `.env` in the root of the project (copy from `.env.example`):

```bash
cp .env.example .env
```

Then fill in your values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key...

VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_key_here

VITE_ADMIN_EMAIL=admin@acefit.com
VITE_ADMIN_PASSWORD=YourStrongPassword@2026!

VITE_APP_URL=https://acefit.netlify.app
```

> ⚠️ Never commit `.env` to GitHub. It's already in `.gitignore`.

---

## STEP 6 — Deploy to Netlify

### 6.1 Push to GitHub First
```bash
cd acefit-v2
git init
git add .
git commit -m "AceFit v2 launch"
git remote add origin https://github.com/yourusername/acefit.git
git push -u origin main
```

### 6.2 Connect Netlify
1. Go to https://netlify.com → **Add new site** → **Import an existing project**
2. Connect **GitHub** → Select your `acefit` repository
3. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Click **Deploy site**

### 6.3 Add Environment Variables in Netlify
1. Go to **Site Settings** → **Environment variables**
2. Add each variable from your `.env` file:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PAYSTACK_PUBLIC_KEY`
   - `VITE_ADMIN_EMAIL`
   - `VITE_ADMIN_PASSWORD`
   - `VITE_APP_URL`
3. Click **Save** → Go to **Deploys** → **Trigger deploy** → **Deploy site**

### 6.4 Set Custom Domain (Optional)
1. In Netlify → **Domain management** → **Add custom domain**
2. Enter your domain (e.g. `acefit.com`)
3. Update your domain's nameservers to point to Netlify
4. Netlify automatically gives you free HTTPS (SSL)

---

## STEP 7 — Admin Panel

### Default Admin Login
| Field | Value |
|---|---|
| URL | `https://your-site.netlify.app/admin` |
| Email | `admin@acefit.com` |
| Password | `AceFit@2026!` |

> ⚠️ **Change this password immediately after first login!**  
> Go to `/admin/settings` → Change Admin Password

### First Things to Do in Admin

1. **Add your products** → `/admin/products`
   - Upload product images
   - Set prices, sizes, colors, stock
   - Set collection (Men's / Women's / Tracksuits / Accessories / Gainz)

2. **Set delivery prices** → `/admin/delivery`
   - Default zones are pre-loaded (Lagos, Southwest, North Central, etc.)
   - Edit fees and ETAs as needed
   - Add custom zones if required

3. **Upload hero slides** → `/admin/hero`
   - Upload images for the homepage carousel
   - Set headline text and CTA button text
   - Toggle slides on/off

4. **Write your first blog post** → `/admin/blog`

5. **Test a full order** using Paystack test keys

---

## STEP 8 — Test Everything

Run through this checklist before going live:

- [ ] Homepage loads with hero carousel
- [ ] Products show in shop with correct collections
- [ ] Add to cart works, cart sidebar opens
- [ ] Checkout opens, delivery fee calculates by state
- [ ] Paystack payment popup appears (test mode)
- [ ] Order confirmation email arrives in inbox
- [ ] Admin `/admin` login works
- [ ] Can add/edit/delete a product in admin
- [ ] Can update order status in admin → customer gets email
- [ ] Support chatbot opens → submit a ticket → email arrives
- [ ] Blog page loads at `/blog`
- [ ] Gainz page loads at `/gainz`
- [ ] Order tracking works at `/orders`
- [ ] OTP login: enter email → receive code → sign in

---

## Switching from Test to Live (Paystack)

1. Go to https://dashboard.paystack.com → **Settings** → **API Keys**
2. Copy your **Live Public Key** and **Live Secret Key**
3. In Netlify → Environment Variables → update `VITE_PAYSTACK_PUBLIC_KEY` to live key
4. In Supabase → update secret: `supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxx`
5. Trigger a new Netlify deploy

---

## Common Problems & Fixes

### "OTP email not arriving"
- Check Supabase → **Authentication** → **Logs** for errors
- Make sure Email provider is enabled in Supabase Auth settings
- Check spam folder
- If using Resend: verify API key is set correctly with `supabase secrets list`

### "Payment not working"
- Confirm `VITE_PAYSTACK_PUBLIC_KEY` is set in Netlify env vars
- Make sure you're using the right key (test vs live)
- Check browser console for errors

### "Images not uploading in admin"
- Confirm storage bucket `acefit-media` is created and set to **Public**
- Check bucket policies allow INSERT
- Max file size: 10MB

### "Admin login failing"
- Double-check `VITE_ADMIN_EMAIL` and `VITE_ADMIN_PASSWORD` in Netlify env vars
- Both values must match exactly (case sensitive)

### "Delivery fee not calculating"
- Make sure delivery zones are set in `/admin/delivery`
- Customer must enter their state in checkout for fee to appear

### "Email sending fails in production"
- Run `supabase secrets list` to verify secrets are set
- Check function logs: Supabase → **Edge Functions** → `send-email` → **Logs**
- Confirm function is deployed: `supabase functions list`

### "404 on page refresh"
- Netlify redirects are handled by `netlify.toml` (already included)
- If still 404, go to Netlify → **Redirects** and confirm the `/*` → `/index.html` rule exists

---

## Project Structure

```
acefit-v2/
├── public/                       # Static files
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx         # OTP sign-in modal
│   │   ├── CartSidebar.jsx       # Slide-out cart
│   │   ├── CategoriesSection.jsx # Homepage collection cards
│   │   ├── CheckoutModal.jsx     # Paystack checkout flow
│   │   ├── FeedbackSection.jsx   # Customer reviews form
│   │   ├── Footer.jsx            # Site footer
│   │   ├── Hero.jsx              # Homepage hero (DB-powered carousel)
│   │   ├── Navbar.jsx            # Navigation
│   │   └── SupportChatbot.jsx    # Live support + ticket form
│   ├── lib/
│   │   ├── deliveryFee.js        # Zone-based delivery calculator
│   │   ├── emailTemplates.js     # All 10 email templates
│   │   ├── paystack.js           # Paystack integration
│   │   ├── store.js              # Zustand global state
│   │   └── supabase.js           # Supabase client + helpers
│   ├── pages/
│   │   ├── StoreFront.jsx        # Main shop page
│   │   ├── BlogPage.jsx          # Blog listing
│   │   ├── BlogPostPage.jsx      # Single blog post
│   │   ├── GainzPage.jsx         # Supplements page
│   │   ├── OrdersPage.jsx        # Order tracking
│   │   └── admin/
│   │       ├── AdminLayout.jsx   # Admin shell + login
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminProducts.jsx
│   │       ├── AdminOrders.jsx
│   │       ├── AdminPayments.jsx
│   │       ├── AdminCustomers.jsx
│   │       ├── AdminTickets.jsx
│   │       ├── AdminFeedback.jsx
│   │       ├── AdminBlog.jsx
│   │       ├── AdminHero.jsx
│   │       ├── AdminDelivery.jsx
│   │       └── AdminSettings.jsx
│   ├── styles/globals.css
│   └── main.jsx                  # Routes
├── supabase/
│   └── functions/
│       └── send-email/
│           └── index.ts          # Edge function (email + Paystack verify)
├── acefit-migration-FINAL-v5.sql # Run this ONCE in Supabase SQL Editor
├── .env.example                  # Copy to .env and fill in values
├── netlify.toml                  # Netlify build + redirect config
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Social Media Links (Pre-configured)

| Platform | Handle | URL |
|---|---|---|
| Instagram | @acefit.shop | https://instagram.com/acefit.shop |
| TikTok | @the_acefit | https://tiktok.com/@the_acefit |
| Snapchat | acefit_official | https://snapchat.com/add/acefit_official |
| WhatsApp | 07025692097 | https://wa.me/2347025692097 |

---

## Email Templates Included

| Template | Trigger |
|---|---|
| OTP Code | Customer signs in |
| Welcome | New customer first sign-in |
| Order Confirmed | Payment successful |
| Order Status Update | Admin changes order status |
| Payment Failed | Paystack payment fails |
| Support Ticket Created | Customer submits chatbot form |
| Support Ticket Reply | Admin replies to ticket |
| Admin: New Order | Notifies admin of new sale |
| Admin: New Ticket | Notifies admin of new support ticket |

---

## Support

- **WhatsApp**: +234 702 569 2097
- **Email**: acefitandgainz@gmail.com

---

*AceFit v2 — Built with React + Vite + Supabase + Paystack + Resend*
