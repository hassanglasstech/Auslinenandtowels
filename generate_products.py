"""
DEPRECATED — do not run.

The product catalogue is now stored in MySQL (the `products`, `categories`,
and `product_parents` tables) and is the single source of truth.

  • Edit products in the admin dashboard:        /admin.html
  • Publish changes to the storefront:           click "Publish to storefront"
    (regenerates assets/products-data.js from the database via api/products.php)

The old hardcoded generator was archived as generate_products.py.deprecated.
Running it would OVERWRITE the database-generated catalogue with stale data,
so this stub refuses to run.

One-time DB setup, if not already done:
  1. Run setup-db.sql in phpMyAdmin (creates the product tables)
  2. Seed from the captured snapshot:
       POST /api/products.php?action=seed&token=YOUR_TOKEN
     (or use the "Seed from file" button in the admin dashboard)
"""

import sys

if __name__ == '__main__':
    sys.exit(
        "generate_products.py is deprecated. The catalogue now lives in MySQL.\n"
        "Edit products in /admin.html and click 'Publish to storefront'.\n"
        "See this file's docstring for details."
    )
