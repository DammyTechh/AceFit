# AceFit — Update notes

This build implements the five requested changes. Nothing existing was removed;
the delivery zones you already had keep working as the default.

## 1. Mobile responsiveness / "can't tap checkout"
The cart and checkout drawers used `h-full`, which on phones renders taller than
the visible screen, hiding the footer button under the browser toolbar. Fixed by
switching to `h-[100dvh]` (dynamic viewport height) and giving the quick-view and
admin modals `max-h-[90dvh] overflow-y-auto` so their action buttons stay reachable.
Files: `CartSidebar.jsx`, `CheckoutModal.jsx`, `StoreFront.jsx`, admin modals.

## 2. Color preview on the item
Tap a color swatch (on the card or in quick-view) and the garment image switches
to that color.
- Admin: in **Products → Colors**, each color now has an **Image** button — upload
  a photo of the item in that color.
- Storefront: shows that per-color photo when the color is selected.
- Fallback: if no photo was uploaded for a color, the store tints the main photo
  toward that color automatically, so it works even before you add color photos.
Files: `src/lib/colors.js` (new), `StoreFront.jsx`, `AdminProducts.jsx`.
DB: adds `products.color_images` (see migration v6).

## 3. Hero reflects new products
The hero now merges your manual hero slides with products flagged **Featured in
Hero** (`is_featured`) or **New** (`is_new`). Upload/flag a product and it appears
in the hero automatically — no separate slide needed.
File: `src/components/Hero.jsx`.

## 4. Admin-managed banner (below the product grid)
New **Banners** section in admin (`/admin/banners`): upload image, optional title/
subtitle/link, toggle active, sort. Renders directly below the products on the
landing page. Hidden automatically when there are no active banners.
Files: `src/components/BannerSection.jsx` (new), `src/pages/admin/AdminBanners.jsx`
(new), routing + sidebar wired in `main.jsx` and `AdminLayout.jsx`.
DB: adds `banners` table (see migration v6).

> Placement note: it currently sits directly under the product grid. Send the
> screenshot and I'll move/style it to match the exact spot you meant.

## 5. Rider / delivery payments (Fez)
You already predict price ahead by state via `delivery_zones` — that's the right
pattern. This build adds an **optional** Fez integration so you can (a) charge the
real live rate at checkout and (b) auto-book the delivery after payment, so you
stop paying riders manually.
- Off by default (`VITE_FEZ_ENABLED=false`) — zones keep working untouched.
- `supabase/functions/fez/index.ts` (new): server-side proxy, keeps your secret key safe.
- `src/lib/fezDelivery.js` (new): `getFezQuote()` and `createFezOrder()`.
- Checkout uses the live quote only when enabled; otherwise the zone fee.

### Enabling Fez later
1. Sign up (sandbox first) at Fez, get your **secret key** from Developers → Manage Keys.
2. Deploy the function and secrets:
   ```bash
   supabase functions deploy fez --no-verify-jwt
   supabase secrets set FEZ_BASE_URL=https://apisandbox.fezdelivery.co/v1
   supabase secrets set FEZ_SECRET_KEY=your_secret_key
   supabase secrets set FEZ_COST_PATH=/order-price   # confirm exact path in Fez dashboard
   ```
3. Set `VITE_FEZ_ENABLED=true` and redeploy the site.
The `/order` endpoint (create delivery) is documented and stable; confirm the
cost/quote path with Fez before relying on live quotes.

## Run the migration
In Supabase → SQL Editor, run `acefit-migration-v6-banners-colors.sql`.
It's idempotent and safe on your existing v5 database.
