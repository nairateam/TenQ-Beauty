# Payload Store

Next.js 16 + Payload CMS 3 (with the official ecommerce plugin), Tailwind CSS v4, Lenis smooth scroll and GSAP (ScrollTrigger + SplitText).

## Getting started

```bash
cp .env.example .env      # then fill in DATABASE_URL and PAYLOAD_SECRET
npm install               # or pnpm install
npm run seed              # load the starting catalogue, shipping and settings into Payload
npm run dev
```

- Storefront: http://localhost:3000
- Admin: http://localhost:3000/admin (the first account you create becomes an admin)

On first `npm run dev`, Payload generates `src/payload-types.ts` and fills in `src/app/(payload)/admin/importMap.js`. Run `npm run generate:types` after changing collections.

## Project structure

```
src/
├── app/
│   ├── (frontend)/              # Public website (own <html>, Lenis, header/footer)
│   │   ├── layout.tsx
│   │   ├── globals.css          # Tailwind v4 + design tokens
│   │   ├── page.tsx             # Home        /
│   │   ├── shop/page.tsx        # Shop        /shop
│   │   ├── about/page.tsx       # About Us    /about
│   │   ├── contact/page.tsx     # Contact Us  /contact
│   │   ├── blog/page.tsx        # Blog        /blog
│   │   └── not-found.tsx
│   └── (payload)/               # Payload admin + REST/GraphQL API (don't edit by hand)
│       ├── admin/
│       ├── api/
│       └── layout.tsx
├── access/                      # Access-control rules (admin, owner, published…)
├── collections/                 # Users, Media, Categories, Posts, Testimonials
│   └── shop/                    # Collections, concerns, hair types, reviews, promo codes,
│                                #   shipping methods, and cart/order/transaction extras
├── globals/                     # Homepage, Store settings
├── payments/                    # Paystack adapter + server-side checkout totals
├── seed/                        # `npm run seed` and the starting content it loads (seed/data)
├── fields/                      # Reusable fields (slug)
├── plugins/                     # Ecommerce plugin config (products, carts, orders, payments)
├── components/
│   ├── animations/              # SplitTextReveal, FadeIn (GSAP)
│   ├── layout/                  # Header, Footer, NavLinks
│   ├── providers/               # Lenis smooth scroll
│   └── ui/                      # Small reusable UI pieces (Container…)
├── config/site.ts               # Site name + main navigation
├── lib/
│   ├── gsap.ts                  # Registers GSAP plugins once — import gsap from here
│   ├── payload.ts               # getPayload() for Server Components
│   ├── queries/                 # Payload reads for each page (shop, product, home, checkout)
│   ├── cart.ts                  # The bag: a client store over the plugin's cart endpoints
│   ├── pricing.ts               # Promo and shipping rules shared by server and browser
│   ├── currencies.ts            # NGN
│   └── utils.ts                 # cn() class helper
└── payload.config.ts
```

## Notes

- **Ecommerce:** the plugin adds Products, Variants, Carts, Orders, Addresses and Transactions collections automatically. Currency is NGN; prices are stored in kobo. Everything the shop shows — products, sizes (variants), collections, filters, reviews, delivery rates, promo codes and shop copy — is edited in the admin; nothing in the storefront is hard-coded.
- **Stock:** leave a product's or size's inventory empty to not track it; a number goes down as orders are paid, and 0 shows as sold out.
- **Payments:** Paystack, via the adapter in `src/payments/paystack.ts`. Set `PAYSTACK_SECRET_KEY`, and in the Paystack dashboard set the webhook URL to `<your site>/api/payments/paystack/webhooks` so orders are created even if a customer closes the tab before returning.
- **Database:** MongoDB. To use Postgres instead, swap `@payloadcms/db-mongodb` for `@payloadcms/db-postgres` in `payload.config.ts`.
- **Media:** stored on Cloudinary when the `CLOUDINARY_*` variables are set (see `src/storage/cloudinary.ts`); otherwise in `/media`, which only works locally.
- **Animations:** wrap text in `<SplitTextReveal as="h1">…</SplitTextReveal>` or blocks in `<FadeIn>…</FadeIn>`. Lenis is synced with GSAP's ticker and ScrollTrigger.

## Deploying to Vercel

1. **Cloudinary first.** Add the `CLOUDINARY_*` variables to `.env`, then copy the existing uploads up once:
   ```bash
   pnpm media:cloudinary
   ```
   Images already in the database keep their names, so nothing needs re-linking.
2. **MongoDB Atlas.** Under Network Access, allow `0.0.0.0/0` — Vercel's servers don't have fixed IP addresses.
3. **Import the GitHub repo in Vercel** (framework: Next.js; pnpm and the build command are picked up automatically).
4. **Environment variables** (Production, and Preview if you use preview deployments):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | The Atlas connection string, including the `/tenq` database name |
   | `PAYLOAD_SECRET` | The same long random string as locally |
   | `NEXT_PUBLIC_SERVER_URL` | The live address, e.g. `https://tenqbeauty.com` (defaults to the Vercel domain) |
   | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From the Cloudinary dashboard |
   | `PAYSTACK_SECRET_KEY` | From Paystack (a test key until launch) |

5. **After the first deploy**, set Paystack's webhook URL to `<live address>/api/payments/paystack/webhooks`.

Pages are rebuilt from Payload at most once a minute, so admin edits reach the live site within a minute.
Uploads pass through a Vercel function, which accepts files up to about 4.5 MB — compress larger images first.
