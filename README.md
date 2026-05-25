# Australian Linen & Towels — Static Website

## What's inside

```
alt_site/
├── index.html              Homepage
├── collection.html         Full catalogue with filters
├── product.html            Individual product pages (?sku=CCBT430)
├── contact.html            Contact form + real details
├── admin.html              Merchant dashboard (demo, static)
├── assets/
│   ├── styles.css          Shared design system
│   ├── partials.js         Shared header & footer
│   └── products-data.js    19 products + 4 categories (edit here to update)
└── images/                 19 Gemini-generated product photos + 4 category images
```

## Real data used

- Contact: info@auslinenandtowels.com.au · 0414 533 449
- Address: Unit 2 / 65 Kookora Street, Griffith NSW 2680
- Products: 19 SKUs from ALT_Product_Template.xlsx
- Prices: AU$1.00 – AU$21.95 (real Excel prices)
- Categories: White Towels (4), Charcoal Towels (3), Camel Towels (3 — enquire), White Sheets (9)

## Deploy on Hostinger

1. Log into Hostinger hPanel
2. Go to File Manager → `public_html/`
3. Delete the old dist files (or move them to a backup folder)
4. Upload everything inside `alt_site/` (not the folder itself — the contents)
5. Visit your domain → done

No database, no Firebase, no build step. Pure static HTML/CSS/JS.

## How to update products later

Open `assets/products-data.js` in any text editor. Each product is a JavaScript object:

```js
{
  sku: 'CCBT430',
  name: 'Classical Bath Towel',
  colour: 'White',
  price: 7.95,
  ...
}
```

Change a price, add a new product, remove one — save the file, re-upload. Done.

## To swap an image

1. Put new image in the `images/` folder (keep the same filename OR update the path in `products-data.js`)
2. Re-upload that one file to Hostinger

## To add backend later (Firebase/Supabase)

The `products-data.js` structure is database-ready. When you want to connect a backend:
- Move the `ALT_PRODUCTS` array to a Firestore `products` collection
- Move `ALT_CATEGORIES` array to a `categories` collection  
- Replace `window.ALT_PRODUCTS = [...]` with a Firestore fetch

Admin page can then actually edit products (right now it's read-only demo).

## Known limitations

- Contact form doesn't email anyone yet — it just shows "Thank you" message. Need to wire up EmailJS or Formspree (5 minutes of work).
- Admin dashboard is static demo — needs backend to actually save edits.
- No cart/checkout — B2B quote-request model, so not required (users click "Request Quote" which goes to contact form).
