"""
Generate assets/products-data.js from scratch.
Matches Excel category/sort order exactly.
Run: python generate_products.py
"""

import os, json, textwrap

OUT = os.path.join(os.path.dirname(__file__), 'assets', 'products-data.js')

PH = 'images/placeholder-product.svg'

# ── ALT_PARENTS ──────────────────────────────────────────────────────────────
PARENTS = {
    # Towels — Bath
    'ALU-BT': {'name': 'Bath Towels', 'category': 'towels-bath'},
    'ALU-BS': {'name': 'Bath Sheets', 'category': 'towels-bath-sheets'},
    'ALU-HT': {'name': 'Hand Towels', 'category': 'towels-hand'},
    'ALU-FW': {'name': 'Face Washers', 'category': 'towels-face'},
    'ALU-BM': {'name': 'Bath Mats', 'category': 'towels-mats'},
    'ALU-PT': {'name': 'Pool Towels', 'category': 'towels-pool'},
    'ALU-GY': {'name': 'Gym & Fitness Towels', 'category': 'towels-gym'},
    'ALU-SL': {'name': 'Salon Towels', 'category': 'towels-salon'},
    'ALU-RB': {'name': 'Bath Robes', 'category': 'towels-robes'},
    # Tea Towels
    'ALU-TT': {'name': 'Tea Towels', 'category': 'tea-towels'},
    # Sheets
    'ALU-FL': {'name': 'Flat Sheets', 'category': 'sheets-flat'},
    'ALU-FI': {'name': 'Fitted Sheets', 'category': 'sheets-fitted'},
    'ALU-PC': {'name': 'Pillowcases', 'category': 'sheets-pillow'},
    'ALU-SS': {'name': 'Satin Stripe', 'category': 'sheets-satin'},
    # Quilt Covers
    'ALU-QC': {'name': 'Quilt Covers', 'category': 'quilt-covers'},
    # Quilts
    'ALU-QL': {'name': 'Quilts', 'category': 'quilts-micro'},
    # Blankets
    'ALU-BK': {'name': 'Blankets', 'category': 'blankets-cotton'},
    # Mattress Protection
    'ALU-MP': {'name': 'Mattress Protectors', 'category': 'mp-protectors'},
    'ALU-MT': {'name': 'Mattress Toppers', 'category': 'mp-toppers'},
    'ALU-PP': {'name': 'Pillow Protectors', 'category': 'mp-pillow'},
    # Pillows
    'ALU-PIL': {'name': 'Microfibre Pillows', 'category': 'pillows'},
}

# ── ALT_CATEGORIES ────────────────────────────────────────────────────────────
CATEGORIES = [
    # Towels
    {'id': 'towels-bath',        'name': 'Bath Towels',          'parent': 'Towels',              'slug': 'bath-towels',              'image': 'images/cat-white-towels.webp'},
    {'id': 'towels-bath-sheets', 'name': 'Bath Sheets',          'parent': 'Towels',              'slug': 'bath-sheets',              'image': 'images/scraped/Bath-Sheet-CHARCOAL.jpg'},
    {'id': 'towels-hand',        'name': 'Hand Towels',          'parent': 'Towels',              'slug': 'hand-towels',              'image': 'images/scraped/classic-white-hand-towels.jpg'},
    {'id': 'towels-face',        'name': 'Face Washers',         'parent': 'Towels',              'slug': 'face-washers',             'image': 'images/scraped/Classical-White-Face-Towel.jpg'},
    {'id': 'towels-mats',        'name': 'Bath Mats',            'parent': 'Towels',              'slug': 'bath-mats',                'image': 'images/scraped/Executive-White-Bath-Mat.jpg'},
    {'id': 'towels-pool',        'name': 'Pool Towels',          'parent': 'Towels',              'slug': 'pool-towels',              'image': 'images/pool-stripe-towel.png'},
    {'id': 'towels-gym',         'name': 'Gym & Fitness Towels', 'parent': 'Towels',              'slug': 'gym-towels',               'image': 'images/gym-salon-towels.png'},
    {'id': 'towels-salon',       'name': 'Salon Towels',         'parent': 'Towels',              'slug': 'salon-towels',             'image': 'images/gym-salon-towels.png'},
    {'id': 'towels-robes',       'name': 'Bath Robes',           'parent': 'Towels',              'slug': 'bath-robes',               'image': 'images/terry-bathrobe.png'},
    # Tea Towels
    {'id': 'tea-towels',         'name': 'Tea Towels',           'parent': 'Tea Towels',          'slug': 'tea-towels',               'image': 'images/tea-towels.png'},
    # Sheets
    {'id': 'sheets-flat',        'name': 'Flat Sheets',          'parent': 'Sheets',              'slug': 'flat-sheets',              'image': 'images/white-towel-stack-3.webp'},
    {'id': 'sheets-fitted',      'name': 'Fitted Sheets',        'parent': 'Sheets',              'slug': 'fitted-sheets',            'image': 'images/white-towel-stack-5.webp'},
    {'id': 'sheets-pillow',      'name': 'Pillowcases',          'parent': 'Sheets',              'slug': 'pillowcases',              'image': 'images/white-pillowcase-pair.webp'},
    {'id': 'sheets-satin',       'name': 'Satin Stripe',         'parent': 'Sheets',              'slug': 'satin-stripe-sheets',      'image': PH},
    # Quilt Covers
    {'id': 'quilt-covers',       'name': 'Quilt Covers',         'parent': 'Quilt Covers',        'slug': 'quilt-covers',             'image': PH},
    # Quilts
    {'id': 'quilts-micro',       'name': 'Microfibre Quilts',    'parent': 'Quilts',              'slug': 'microfibre-quilts',        'image': PH},
    {'id': 'quilts-navy',        'name': 'Navy Reversible Quilts','parent': 'Quilts',             'slug': 'navy-quilts',              'image': PH},
    # Blankets
    {'id': 'blankets-cotton',    'name': 'Cellular Cotton Blankets','parent': 'Blankets',         'slug': 'cellular-blankets',        'image': PH},
    {'id': 'blankets-fleece',    'name': 'Faux Wool Blankets',   'parent': 'Blankets',            'slug': 'faux-wool-blankets',       'image': PH},
    # Mattress Protection
    {'id': 'mp-protectors',      'name': 'Mattress Protectors',  'parent': 'Mattress Protection', 'slug': 'mattress-protectors',      'image': PH},
    {'id': 'mp-toppers',         'name': 'Mattress Toppers',     'parent': 'Mattress Protection', 'slug': 'mattress-toppers',         'image': PH},
    {'id': 'mp-pillow',          'name': 'Pillow Protectors',    'parent': 'Mattress Protection', 'slug': 'pillow-protectors',        'image': PH},
    # Pillows
    {'id': 'pillows',            'name': 'Microfibre Pillows',   'parent': 'Pillows',             'slug': 'microfibre-pillows',       'image': PH},
]

# ── PRODUCTS ──────────────────────────────────────────────────────────────────
# Each entry: (sku, name, colour, size, weight, material, categoryId,
#              image, moq, cartonQty, price, description, colorGroup, parentSku,
#              variantName, tag)
# gallery / zoomImage default to [] and image respectively.

def p(sku, name, colour, size, weight, material, cat,
      image=PH, moq='50', carton_qty='', price=0,
      desc='', color_group='', parent_sku='', variant_name='', tag=''):
    return {
        'sku': sku,
        'name': name,
        'colour': colour,
        'size': size,
        'weight': weight,
        'material': material,
        'categoryId': cat,
        'image': image,
        'gallery': [],
        'zoomImage': image,
        'moq': moq,
        'cartonQty': carton_qty,
        'price': price,
        'description': desc,
        'colorGroup': color_group,
        'parentSku': parent_sku,
        'variantName': variant_name,
        'tag': tag,
    }

PRODUCTS = [

    # ════════════════════════════════════════════════════════════
    # TOWELS — BATH TOWELS
    # ════════════════════════════════════════════════════════════

    # ALU-BT-001 Classical Bath Towel White 450 GSM
    p('ALU-BT-001', 'Classical Bath Towel', 'White', '70×140 cm', '450 GSM', '100% Cotton',
      'towels-bath', 'images/scraped/Classical-White-Bath-Towel.jpg',
      moq='50', carton_qty='50', price=7.95,
      desc='Reliable 450 GSM bath towel. Suited for hotels, motels and accommodation providers requiring a cost-effective white towel solution.',
      color_group='ALU-BT-001', parent_sku='ALU-BT-001', variant_name='White', tag=''),

    # ALU-BT-002 Deluxe Bath Towel — 5 colours
    p('ALU-BT-002-WHT', 'Deluxe Bath Towel', 'White', '70×140 cm', '500 GSM', '100% Cotton',
      'towels-bath', 'images/scraped/Classical-White-Bath-Towel.jpg',
      moq='50', carton_qty='48', price=10.95,
      desc='500 GSM deluxe bath towel with dobby border. Available in a selection of commercial colours.',
      color_group='ALU-BT-002', parent_sku='ALU-BT-002', variant_name='White', tag=''),
    p('ALU-BT-002-BLK', 'Deluxe Bath Towel', 'Black', '70×140 cm', '500 GSM', '100% Cotton',
      'towels-bath', 'images/scraped/black-bath-towels.jpg',
      moq='50', carton_qty='48', price=11.95,
      desc='500 GSM deluxe bath towel in Black.',
      color_group='ALU-BT-002', parent_sku='ALU-BT-002', variant_name='Black', tag=''),
    p('ALU-BT-002-CAM', 'Deluxe Bath Towel', 'Camel', '70×140 cm', '500 GSM', '100% Cotton',
      'towels-bath', 'images/scraped/Bath-Towel-Camel.jpg',
      moq='50', carton_qty='48', price=11.95,
      desc='500 GSM deluxe bath towel in Camel.',
      color_group='ALU-BT-002', parent_sku='ALU-BT-002', variant_name='Camel', tag=''),
    p('ALU-BT-002-NVY', 'Deluxe Bath Towel', 'Navy', '70×140 cm', '500 GSM', '100% Cotton',
      'towels-bath', 'images/scraped/blue-bath-towel.jpg',
      moq='50', carton_qty='48', price=11.95,
      desc='500 GSM deluxe bath towel in Navy.',
      color_group='ALU-BT-002', parent_sku='ALU-BT-002', variant_name='Navy', tag=''),
    p('ALU-BT-002-CHR', 'Deluxe Bath Towel', 'Charcoal', '70×140 cm', '500 GSM', '100% Cotton',
      'towels-bath', 'images/scraped/Bath-Towel-CHARCOAL.jpg',
      moq='50', carton_qty='48', price=11.95,
      desc='500 GSM deluxe bath towel in Charcoal.',
      color_group='ALU-BT-002', parent_sku='ALU-BT-002', variant_name='Charcoal', tag=''),

    # ALU-BT-003 Deluxe Queen Bath Towel White 550 GSM
    p('ALU-BT-003', 'Deluxe Queen Bath Towel', 'White', '75×150 cm', '550 GSM', '100% Cotton',
      'towels-bath', 'images/scraped/Deluxe-White-Queen-Bath-Towel.jpg',
      moq='50', carton_qty='36', price=11.95,
      desc='550 GSM queen-size bath towel offering a premium feel for upscale accommodation.',
      color_group='ALU-BT-003', parent_sku='ALU-BT-003', variant_name='White', tag=''),

    # ALU-BT-004 Executive Bath Towel White 550 GSM
    p('ALU-BT-004', 'Executive Bath Towel', 'White', '70×140 cm', '550 GSM', '100% Cotton',
      'towels-bath', 'images/scraped/executive-white-bath-towels.jpg',
      moq='50', carton_qty='48', price=12.95,
      desc='550 GSM executive bath towel with premium dobby border finish.',
      color_group='ALU-BT-004', parent_sku='ALU-BT-004', variant_name='White', tag=''),

    # ALU-BT-005 King Bath Towel — Black & Charcoal
    p('ALU-BT-005-BLK', 'King Bath Towel', 'Black', '80×160 cm', '650 GSM', '100% Cotton',
      'towels-bath', 'images/scraped/black-bath-towels.jpg',
      moq='25', carton_qty='24', price=14.95,
      desc='Oversized 650 GSM king bath towel in Black. Ideal for luxury accommodation and spas.',
      color_group='ALU-BT-005', parent_sku='ALU-BT-005', variant_name='Black', tag=''),
    p('ALU-BT-005-CHR', 'King Bath Towel', 'Charcoal', '80×160 cm', '650 GSM', '100% Cotton',
      'towels-bath', 'images/scraped/Bath-Towel-CHARCOAL.jpg',
      moq='25', carton_qty='24', price=14.95,
      desc='Oversized 650 GSM king bath towel in Charcoal.',
      color_group='ALU-BT-005', parent_sku='ALU-BT-005', variant_name='Charcoal', tag=''),

    # ALU-BT-006 Elegant Coloured Bath Towel — 10 colours
    p('ALU-BT-006-AQU', 'Elegant Coloured Bath Towel', 'Aqua', '70×140 cm', '500 GSM', '100% Cotton',
      'towels-bath', 'images/COL-AQ-BT-aqua-main.jpg', moq='50', carton_qty='48', price=9.95,
      desc='500 GSM coloured bath towel in a vibrant Aqua finish.',
      color_group='ALU-BT-006', parent_sku='ALU-BT-006', variant_name='Aqua', tag=''),
    p('ALU-BT-006-CHE', 'Elegant Coloured Bath Towel', 'Cherry', '70×140 cm', '500 GSM', '100% Cotton',
      'towels-bath', 'images/COL-CH-BT-cherry-main.jpg', moq='50', carton_qty='48', price=9.95,
      desc='500 GSM coloured bath towel in Cherry.',
      color_group='ALU-BT-006', parent_sku='ALU-BT-006', variant_name='Cherry', tag=''),
    p('ALU-BT-006-COF', 'Elegant Coloured Bath Towel', 'Coffee', '70×140 cm', '500 GSM', '100% Cotton',
      'towels-bath', 'images/COL-CF-BT-coffee-main.jpg', moq='50', carton_qty='48', price=9.95,
      desc='500 GSM coloured bath towel in Coffee.',
      color_group='ALU-BT-006', parent_sku='ALU-BT-006', variant_name='Coffee', tag=''),
    p('ALU-BT-006-FUC', 'Elegant Coloured Bath Towel', 'Fuchsia', '70×140 cm', '500 GSM', '100% Cotton',
      'towels-bath', 'images/COL-FU-BT-fuchsia-main.jpg', moq='50', carton_qty='48', price=9.95,
      desc='500 GSM coloured bath towel in Fuchsia.',
      color_group='ALU-BT-006', parent_sku='ALU-BT-006', variant_name='Fuchsia', tag=''),
    p('ALU-BT-006-GAR', 'Elegant Coloured Bath Towel', 'Garnet', '70×140 cm', '500 GSM', '100% Cotton',
      'towels-bath', 'images/COL-GA-BT-garnet-main.jpg', moq='50', carton_qty='48', price=9.95,
      desc='500 GSM coloured bath towel in Garnet.',
      color_group='ALU-BT-006', parent_sku='ALU-BT-006', variant_name='Garnet', tag=''),
    p('ALU-BT-006-LIM', 'Elegant Coloured Bath Towel', 'Lime', '70×140 cm', '500 GSM', '100% Cotton',
      'towels-bath', 'images/COL-LM-BT-lime-main.jpg', moq='50', carton_qty='48', price=9.95,
      desc='500 GSM coloured bath towel in Lime.',
      color_group='ALU-BT-006', parent_sku='ALU-BT-006', variant_name='Lime', tag=''),
    p('ALU-BT-006-MIR', 'Elegant Coloured Bath Towel', 'Mint', '70×140 cm', '500 GSM', '100% Cotton',
      'towels-bath', 'images/COL-MI-BT-mint-main.jpg', moq='50', carton_qty='48', price=9.95,
      desc='500 GSM coloured bath towel in Mint.',
      color_group='ALU-BT-006', parent_sku='ALU-BT-006', variant_name='Mint', tag=''),
    p('ALU-BT-006-PNK', 'Elegant Coloured Bath Towel', 'Pink', '70×140 cm', '500 GSM', '100% Cotton',
      'towels-bath', 'images/COL-PK-BT-pink-main.jpg', moq='50', carton_qty='48', price=9.95,
      desc='500 GSM coloured bath towel in Pink.',
      color_group='ALU-BT-006', parent_sku='ALU-BT-006', variant_name='Pink', tag=''),
    p('ALU-BT-006-PUR', 'Elegant Coloured Bath Towel', 'Purple', '70×140 cm', '500 GSM', '100% Cotton',
      'towels-bath', 'images/COL-PU-BT-purple-main.jpg', moq='50', carton_qty='48', price=9.95,
      desc='500 GSM coloured bath towel in Purple.',
      color_group='ALU-BT-006', parent_sku='ALU-BT-006', variant_name='Purple', tag=''),
    p('ALU-BT-006-RBL', 'Elegant Coloured Bath Towel', 'Royal Blue', '70×140 cm', '500 GSM', '100% Cotton',
      'towels-bath', 'images/COL-RB-BT-royalblue-main.jpg', moq='50', carton_qty='48', price=9.95,
      desc='500 GSM coloured bath towel in Royal Blue.',
      color_group='ALU-BT-006', parent_sku='ALU-BT-006', variant_name='Royal Blue', tag=''),

    # ════════════════════════════════════════════════════════════
    # TOWELS — BATH SHEETS
    # ════════════════════════════════════════════════════════════

    # ALU-BS-001 Executive Bath Sheet White 900 GSM
    p('ALU-BS-001', 'Executive Bath Sheet', 'White', '90×180 cm', '900 GSM', '100% Cotton',
      'towels-bath-sheets', 'images/scraped/Bath-Sheet-CHARCOAL.jpg',
      moq='25', carton_qty='24', price=17.95,
      desc='900 GSM executive bath sheet in White. Designed for premium spa and resort use.',
      color_group='ALU-BS-001', parent_sku='ALU-BS-001', variant_name='White', tag=''),

    # ALU-BS-003 Executive Bath Sheet Large White — Supplier code 009
    p('ALU-BS-003', 'Executive Bath Sheet Large', 'White', '90×180 cm', '900 GSM', '100% Combed Cotton',
      'towels-bath-sheets', 'images/scraped/Classical-White-Bath-Towel.jpg',
      moq='10', carton_qty='24', price=17.95,
      desc='900 GSM executive bath sheet in White. 100% combed cotton with double stitched hemming. Perfect for 4-star and 5-star accommodation, hotels, motels and nursing homes.',
      color_group='ALU-BS-003', parent_sku='ALU-BS-003', variant_name='White', tag='Sale'),

    # ALU-BS-002 Bath Sheet — 4 colours
    p('ALU-BS-002-BLK', 'Bath Sheet', 'Black', '90×180 cm', '900 GSM', '100% Cotton',
      'towels-bath-sheets', 'images/scraped/black-bath-sheet.jpg',
      moq='25', carton_qty='24', price=19.95,
      desc='900 GSM bath sheet in Black.',
      color_group='ALU-BS-002', parent_sku='ALU-BS-002', variant_name='Black', tag=''),
    p('ALU-BS-002-CAM', 'Bath Sheet', 'Camel', '90×180 cm', '900 GSM', '100% Cotton',
      'towels-bath-sheets', 'images/scraped/Bath-Sheet-Camel.jpg',
      moq='25', carton_qty='24', price=19.95,
      desc='900 GSM bath sheet in Camel.',
      color_group='ALU-BS-002', parent_sku='ALU-BS-002', variant_name='Camel', tag=''),
    p('ALU-BS-002-NVY', 'Bath Sheet', 'Navy', '90×180 cm', '900 GSM', '100% Cotton',
      'towels-bath-sheets', 'images/scraped/blue-bath-sheet.jpg',
      moq='25', carton_qty='24', price=19.95,
      desc='900 GSM bath sheet in Navy.',
      color_group='ALU-BS-002', parent_sku='ALU-BS-002', variant_name='Navy', tag=''),
    p('ALU-BS-002-CHR', 'Bath Sheet', 'Charcoal', '90×180 cm', '900 GSM', '100% Cotton',
      'towels-bath-sheets', 'images/scraped/Bath-Sheet-CHARCOAL.jpg',
      moq='25', carton_qty='24', price=19.95,
      desc='900 GSM bath sheet in Charcoal.',
      color_group='ALU-BS-002', parent_sku='ALU-BS-002', variant_name='Charcoal', tag=''),

    # ════════════════════════════════════════════════════════════
    # TOWELS — HAND TOWELS
    # ════════════════════════════════════════════════════════════

    p('ALU-HT-001', 'Classical Hand Towel', 'White', '40×70 cm', '450 GSM', '100% Cotton',
      'towels-hand', 'images/scraped/classic-white-hand-towels.jpg',
      moq='100', carton_qty='100', price=2.25,
      desc='450 GSM classic white hand towel. A dependable choice for accommodation and hospitality.',
      color_group='ALU-HT-001', parent_sku='ALU-HT-001', variant_name='White', tag=''),

    p('ALU-HT-002', 'Deluxe Hand Towel', 'White', '40×70 cm', '450 GSM', '100% Cotton',
      'towels-hand', 'images/scraped/classic-white-hand-towels.jpg',
      moq='100', carton_qty='100', price=2.75,
      desc='450 GSM deluxe white hand towel with dobby border finish.',
      color_group='ALU-HT-002', parent_sku='ALU-HT-002', variant_name='White', tag=''),

    p('ALU-HT-003-BLK', 'Hand Towel', 'Black', '40×66 cm', '500 GSM', '100% Cotton',
      'towels-hand', 'images/scraped/black-hand-towels.jpg',
      moq='100', carton_qty='100', price=3.50,
      desc='500 GSM hand towel in Black.',
      color_group='ALU-HT-003', parent_sku='ALU-HT-003', variant_name='Black', tag=''),
    p('ALU-HT-003-CAM', 'Hand Towel', 'Camel', '40×66 cm', '500 GSM', '100% Cotton',
      'towels-hand', 'images/scraped/hand-towel-Camel.jpg',
      moq='100', carton_qty='100', price=3.50,
      desc='500 GSM hand towel in Camel.',
      color_group='ALU-HT-003', parent_sku='ALU-HT-003', variant_name='Camel', tag=''),
    p('ALU-HT-003-NVY', 'Hand Towel', 'Navy', '40×66 cm', '500 GSM', '100% Cotton',
      'towels-hand', 'images/scraped/blue-hand-towel.jpg',
      moq='100', carton_qty='100', price=3.50,
      desc='500 GSM hand towel in Navy.',
      color_group='ALU-HT-003', parent_sku='ALU-HT-003', variant_name='Navy', tag=''),
    p('ALU-HT-003-CHR', 'Hand Towel', 'Charcoal', '40×66 cm', '500 GSM', '100% Cotton',
      'towels-hand', 'images/scraped/Hand-Towel-CHARCOAL.jpg',
      moq='100', carton_qty='100', price=3.50,
      desc='500 GSM hand towel in Charcoal.',
      color_group='ALU-HT-003', parent_sku='ALU-HT-003', variant_name='Charcoal', tag=''),

    p('ALU-HT-004', 'Executive Hand Towel', 'White', '40×70 cm', '550 GSM', '100% Cotton',
      'towels-hand', 'images/scraped/Executive-White-Hand-Towel.jpg',
      moq='100', carton_qty='100', price=4.00,
      desc='550 GSM executive hand towel with premium dobby border.',
      color_group='ALU-HT-004', parent_sku='ALU-HT-004', variant_name='White', tag=''),

    # ════════════════════════════════════════════════════════════
    # TOWELS — FACE WASHERS
    # ════════════════════════════════════════════════════════════

    p('ALU-FW-001', 'Deluxe Face Washer', 'White', '30×30 cm', '500 GSM', '100% Cotton',
      'towels-face', 'images/scraped/Classical-White-Face-Towel.jpg',
      moq='100', carton_qty='200', price=1.00,
      desc='500 GSM deluxe white face washer.',
      color_group='ALU-FW-001', parent_sku='ALU-FW-001', variant_name='White', tag=''),

    p('ALU-FW-002-BLK', 'Face Washer', 'Black', '32×32 cm', '500 GSM', '100% Cotton',
      'towels-face', 'images/scraped/black-facia.jpg',
      moq='100', carton_qty='200', price=1.20,
      desc='500 GSM face washer in Black.',
      color_group='ALU-FW-002', parent_sku='ALU-FW-002', variant_name='Black', tag=''),
    p('ALU-FW-002-CAM', 'Face Washer', 'Camel', '32×32 cm', '500 GSM', '100% Cotton',
      'towels-face', 'images/scraped/face-towel-Camel.jpg',
      moq='100', carton_qty='200', price=1.20,
      desc='500 GSM face washer in Camel.',
      color_group='ALU-FW-002', parent_sku='ALU-FW-002', variant_name='Camel', tag=''),
    p('ALU-FW-002-NVY', 'Face Washer', 'Navy', '32×32 cm', '500 GSM', '100% Cotton',
      'towels-face', 'images/scraped/blue-face-towel.jpg',
      moq='100', carton_qty='200', price=1.20,
      desc='500 GSM face washer in Navy.',
      color_group='ALU-FW-002', parent_sku='ALU-FW-002', variant_name='Navy', tag=''),
    p('ALU-FW-002-CHR', 'Face Washer', 'Charcoal', '32×32 cm', '500 GSM', '100% Cotton',
      'towels-face', 'images/scraped/face-towel-CHARCOAL.jpg',
      moq='100', carton_qty='200', price=1.20,
      desc='500 GSM face washer in Charcoal.',
      color_group='ALU-FW-002', parent_sku='ALU-FW-002', variant_name='Charcoal', tag=''),

    p('ALU-FW-003', 'Executive Face Washer', 'White', '33×33 cm', '600 GSM', '100% Cotton',
      'towels-face', 'images/scraped/Classical-White-Face-Towel.jpg',
      moq='100', carton_qty='200', price=1.20,
      desc='600 GSM executive face washer for premium accommodation.',
      color_group='ALU-FW-003', parent_sku='ALU-FW-003', variant_name='White', tag=''),

    # ALU-FW-004 Elegant Coloured Face Washer — 10 colours
    p('ALU-FW-004-AQU', 'Elegant Coloured Face Washer', 'Aqua', '30×30 cm', '500 GSM', '100% Cotton',
      'towels-face', 'images/COL-AQ-FW-aqua-main.jpg', moq='100', carton_qty='200', price=1.20,
      desc='500 GSM coloured face washer in Aqua.',
      color_group='ALU-FW-004', parent_sku='ALU-FW-004', variant_name='Aqua', tag=''),
    p('ALU-FW-004-CHE', 'Elegant Coloured Face Washer', 'Cherry', '30×30 cm', '500 GSM', '100% Cotton',
      'towels-face', 'images/COL-CH-FW-cherry-main.jpg', moq='100', carton_qty='200', price=1.20,
      desc='500 GSM coloured face washer in Cherry.',
      color_group='ALU-FW-004', parent_sku='ALU-FW-004', variant_name='Cherry', tag=''),
    p('ALU-FW-004-COF', 'Elegant Coloured Face Washer', 'Coffee', '30×30 cm', '500 GSM', '100% Cotton',
      'towels-face', 'images/COL-CF-FW-coffee-main.jpg', moq='100', carton_qty='200', price=1.20,
      desc='500 GSM coloured face washer in Coffee.',
      color_group='ALU-FW-004', parent_sku='ALU-FW-004', variant_name='Coffee', tag=''),
    p('ALU-FW-004-FUC', 'Elegant Coloured Face Washer', 'Fuchsia', '30×30 cm', '500 GSM', '100% Cotton',
      'towels-face', 'images/COL-FU-FW-fuchsia-main.jpg', moq='100', carton_qty='200', price=1.20,
      desc='500 GSM coloured face washer in Fuchsia.',
      color_group='ALU-FW-004', parent_sku='ALU-FW-004', variant_name='Fuchsia', tag=''),
    p('ALU-FW-004-GAR', 'Elegant Coloured Face Washer', 'Garnet', '30×30 cm', '500 GSM', '100% Cotton',
      'towels-face', 'images/COL-GA-FW-garnet-main.jpg', moq='100', carton_qty='200', price=1.20,
      desc='500 GSM coloured face washer in Garnet.',
      color_group='ALU-FW-004', parent_sku='ALU-FW-004', variant_name='Garnet', tag=''),
    p('ALU-FW-004-LIM', 'Elegant Coloured Face Washer', 'Lime', '30×30 cm', '500 GSM', '100% Cotton',
      'towels-face', 'images/COL-LM-FW-lime-main.jpg', moq='100', carton_qty='200', price=1.20,
      desc='500 GSM coloured face washer in Lime.',
      color_group='ALU-FW-004', parent_sku='ALU-FW-004', variant_name='Lime', tag=''),
    p('ALU-FW-004-MIR', 'Elegant Coloured Face Washer', 'Mint', '30×30 cm', '500 GSM', '100% Cotton',
      'towels-face', 'images/COL-MI-FW-mint-main.jpg', moq='100', carton_qty='200', price=1.20,
      desc='500 GSM coloured face washer in Mint.',
      color_group='ALU-FW-004', parent_sku='ALU-FW-004', variant_name='Mint', tag=''),
    p('ALU-FW-004-PNK', 'Elegant Coloured Face Washer', 'Pink', '30×30 cm', '500 GSM', '100% Cotton',
      'towels-face', 'images/COL-PK-FW-pink-main.jpg', moq='100', carton_qty='200', price=1.20,
      desc='500 GSM coloured face washer in Pink.',
      color_group='ALU-FW-004', parent_sku='ALU-FW-004', variant_name='Pink', tag=''),
    p('ALU-FW-004-PUR', 'Elegant Coloured Face Washer', 'Purple', '30×30 cm', '500 GSM', '100% Cotton',
      'towels-face', 'images/COL-PU-FW-purple-main.jpg', moq='100', carton_qty='200', price=1.20,
      desc='500 GSM coloured face washer in Purple.',
      color_group='ALU-FW-004', parent_sku='ALU-FW-004', variant_name='Purple', tag=''),
    p('ALU-FW-004-RBL', 'Elegant Coloured Face Washer', 'Royal Blue', '30×30 cm', '500 GSM', '100% Cotton',
      'towels-face', 'images/COL-RB-FW-royalblue-main.jpg', moq='100', carton_qty='200', price=1.20,
      desc='500 GSM coloured face washer in Royal Blue.',
      color_group='ALU-FW-004', parent_sku='ALU-FW-004', variant_name='Royal Blue', tag=''),

    # ════════════════════════════════════════════════════════════
    # TOWELS — BATH MATS
    # ════════════════════════════════════════════════════════════

    p('ALU-BM-001', 'Deluxe Bath Mat', 'White', '50×80 cm', '700 GSM', '100% Cotton',
      'towels-mats', 'images/scraped/Executive-White-Bath-Mat.jpg',
      moq='50', carton_qty='50', price=5.50,
      desc='700 GSM deluxe white bath mat.',
      color_group='ALU-BM-001', parent_sku='ALU-BM-001', variant_name='White', tag=''),

    p('ALU-BM-002-BLK', 'Bath Mat', 'Black', '50×70 cm', '720 GSM', '100% Cotton',
      'towels-mats', 'images/scraped/Black-Bath-Mat-scaled.jpg',
      moq='50', carton_qty='50', price=7.95,
      desc='720 GSM bath mat in Black.',
      color_group='ALU-BM-002', parent_sku='ALU-BM-002', variant_name='Black', tag=''),
    p('ALU-BM-002-CAM', 'Bath Mat', 'Camel', '50×70 cm', '720 GSM', '100% Cotton',
      'towels-mats', 'images/scraped/camel-bath-mat.jpg',
      moq='50', carton_qty='50', price=7.95,
      desc='720 GSM bath mat in Camel.',
      color_group='ALU-BM-002', parent_sku='ALU-BM-002', variant_name='Camel', tag=''),
    p('ALU-BM-002-NVY', 'Bath Mat', 'Navy', '50×70 cm', '720 GSM', '100% Cotton',
      'towels-mats', 'images/scraped/NAVY-BM.jpg',
      moq='50', carton_qty='50', price=7.95,
      desc='720 GSM bath mat in Navy.',
      color_group='ALU-BM-002', parent_sku='ALU-BM-002', variant_name='Navy', tag=''),
    p('ALU-BM-002-CHR', 'Bath Mat', 'Charcoal', '50×70 cm', '720 GSM', '100% Cotton',
      'towels-mats', 'images/scraped/bath-mat.jpg',
      moq='50', carton_qty='50', price=7.95,
      desc='720 GSM bath mat in Charcoal.',
      color_group='ALU-BM-002', parent_sku='ALU-BM-002', variant_name='Charcoal', tag=''),

    p('ALU-BM-003', 'Executive Bath Mat', 'White', '50×80 cm', '800 GSM', '100% Cotton',
      'towels-mats', 'images/scraped/Executive-White-Bath-Mat.jpg',
      moq='25', carton_qty='25', price=7.50,
      desc='800 GSM executive bath mat with premium weight and absorbency.',
      color_group='ALU-BM-003', parent_sku='ALU-BM-003', variant_name='White', tag=''),

    # ════════════════════════════════════════════════════════════
    # TOWELS — POOL TOWELS
    # ════════════════════════════════════════════════════════════

    p('ALU-PT-001', 'Commercial Pool Towel', 'Blue & White Stripe', '75×150 cm', '500 GSM', '100% Cotton',
      'towels-pool', 'images/pool-stripe-towel.png',
      moq='50', carton_qty='50', price=0,
      desc='500 GSM commercial pool towel in a classic blue and white stripe. Suitable for hotels, aquatic centres and resorts.',
      color_group='ALU-PT-001', parent_sku='ALU-PT-001', variant_name='Blue & White Stripe', tag=''),

    # ════════════════════════════════════════════════════════════
    # TOWELS — GYM & FITNESS TOWELS
    # ════════════════════════════════════════════════════════════

    p('ALU-GY-001-WHT', 'Commercial Gym Towel', 'White', '40×70 cm', '380 GSM', '100% Cotton',
      'towels-gym', 'images/gym-salon-towels.png',
      moq='100', carton_qty='100', price=0,
      desc='380 GSM compact gym towel in White. Suited for fitness centres and sporting facilities.',
      color_group='ALU-GY-001', parent_sku='ALU-GY-001', variant_name='White', tag=''),
    p('ALU-GY-001-BLK', 'Commercial Gym Towel', 'Black', '40×70 cm', '380 GSM', '100% Cotton',
      'towels-gym', 'images/gym-salon-towels.png',
      moq='100', carton_qty='100', price=0,
      desc='380 GSM compact gym towel in Black.',
      color_group='ALU-GY-001', parent_sku='ALU-GY-001', variant_name='Black', tag=''),


    # ════════════════════════════════════════════════════════════
    # TOWELS — SALON TOWELS
    # ════════════════════════════════════════════════════════════

    p('ALU-SL-001-WHT', 'Professional Salon Towel', 'White', '40×70 cm', '400 GSM', '100% Cotton',
      'towels-salon', 'images/gym-salon-towels.png',
      moq='100', carton_qty='100', price=0,
      desc='400 GSM professional salon towel in White.',
      color_group='ALU-SL-001', parent_sku='ALU-SL-001', variant_name='White', tag=''),
    p('ALU-SL-001-BLK', 'Professional Salon Towel', 'Black', '40×70 cm', '400 GSM', '100% Cotton',
      'towels-salon', 'images/gym-salon-towels.png',
      moq='100', carton_qty='100', price=0,
      desc='400 GSM professional salon towel in Black.',
      color_group='ALU-SL-001', parent_sku='ALU-SL-001', variant_name='Black', tag=''),


    # ════════════════════════════════════════════════════════════
    # TOWELS — BATH ROBES
    # ════════════════════════════════════════════════════════════

    p('ALU-RB-001', 'Hotel Terry Shawl Bathrobe', 'White', 'One Size', '400 GSM', '100% Cotton Terry',
      'towels-robes', 'images/terry-bathrobe.png',
      moq='10', carton_qty='12', price=0,
      desc='400 GSM terry shawl bathrobe in White. Shawl collar, two front pockets, self-tie belt.',
      color_group='ALU-RB-001', parent_sku='ALU-RB-001', variant_name='White', tag=''),

    p('ALU-RB-002', 'Hotel Waffle Bathrobe', 'White', 'One Size', '', '100% Cotton Waffle',
      'towels-robes', 'images/terry-bathrobe.png',
      moq='10', carton_qty='12', price=29.95,
      desc='Lightweight waffle weave bathrobe in White. Kimono or shawl collar styles available.',
      color_group='ALU-RB-002', parent_sku='ALU-RB-002', variant_name='White', tag=''),

    # ════════════════════════════════════════════════════════════
    # TEA TOWELS
    # ════════════════════════════════════════════════════════════

    p('ALU-TT-001', 'Classic Tea Towel — Blue Border', 'White/Blue', '45×70 cm', '160 GSM', '100% Cotton',
      'tea-towels', 'images/tea-towels.png',
      moq='100', carton_qty='100', price=0,
      desc='160 GSM woven tea towel with classic blue border stripe.',
      color_group='ALU-TT-001', parent_sku='ALU-TT-001', variant_name='Blue Border', tag=''),

    p('ALU-TT-002', 'Classic Tea Towel — Black Border', 'White/Black', '45×70 cm', '160 GSM', '100% Cotton',
      'tea-towels', 'images/tea-towels.png',
      moq='100', carton_qty='100', price=0,
      desc='160 GSM woven tea towel with classic black border stripe.',
      color_group='ALU-TT-002', parent_sku='ALU-TT-002', variant_name='Black Border', tag=''),


    # ════════════════════════════════════════════════════════════
    # SHEETS — FLAT SHEETS
    # ════════════════════════════════════════════════════════════

    p('ALU-FL-001-S', 'Classic White Flat Sheet', 'White', 'Single (160×265 cm)', '165 GSM', 'Cotton/Polyester Blend',
      'sheets-flat', 'images/white-towel-stack-3.webp',
      moq='10', carton_qty='', price=0,
      desc='165 GSM flat sheet in White — Single size.',
      color_group='ALU-FL-001', parent_sku='ALU-FL-001', variant_name='Single', tag=''),
    p('ALU-FL-001-KS', 'Classic White Flat Sheet', 'White', 'King Single (185×265 cm)', '165 GSM', 'Cotton/Polyester Blend',
      'sheets-flat', 'images/white-towel-stack-3.webp',
      moq='10', carton_qty='', price=16.95,
      desc='165 GSM flat sheet in White — King Single size.',
      color_group='ALU-FL-001', parent_sku='ALU-FL-001', variant_name='King Single', tag=''),
    p('ALU-FL-001-D', 'Classic White Flat Sheet', 'White', 'Double (220×265 cm)', '165 GSM', 'Cotton/Polyester Blend',
      'sheets-flat', 'images/white-towel-stack-3.webp',
      moq='10', carton_qty='', price=0,
      desc='165 GSM flat sheet in White — Double size.',
      color_group='ALU-FL-001', parent_sku='ALU-FL-001', variant_name='Double', tag=''),
    p('ALU-FL-001-Q', 'Classic White Flat Sheet', 'White', 'Queen (255×265 cm)', '165 GSM', 'Cotton/Polyester Blend',
      'sheets-flat', 'images/white-towel-stack-3.webp',
      moq='10', carton_qty='', price=0,
      desc='165 GSM flat sheet in White — Queen size.',
      color_group='ALU-FL-001', parent_sku='ALU-FL-001', variant_name='Queen', tag=''),
    p('ALU-FL-001-K', 'Classic White Flat Sheet', 'White', 'King (275×265 cm)', '165 GSM', 'Cotton/Polyester Blend',
      'sheets-flat', 'images/white-towel-stack-3.webp',
      moq='10', carton_qty='', price=0,
      desc='165 GSM flat sheet in White — King size.',
      color_group='ALU-FL-001', parent_sku='ALU-FL-001', variant_name='King', tag=''),

    p('ALU-FL-002-CAM-S',  'Coloured Flat Sheet', 'Camel', 'Single (180×300 cm)',      '165 GSM', '50% Cotton/50% Polyester',
      'sheets-flat', 'images/camel-sheets.jpg', moq='10', carton_qty='', price=27.95,
      desc='165 GSM coloured flat sheet in Camel — Single size.',
      color_group='ALU-FL-002', parent_sku='ALU-FL-002', variant_name='Camel Single', tag=''),
    p('ALU-FL-002-CAM-KS', 'Coloured Flat Sheet', 'Camel', 'King Single (200×300 cm)', '165 GSM', '50% Cotton/50% Polyester',
      'sheets-flat', 'images/camel-sheets.jpg', moq='10', carton_qty='', price=27.95,
      desc='165 GSM coloured flat sheet in Camel — King Single size.',
      color_group='ALU-FL-002', parent_sku='ALU-FL-002', variant_name='Camel King Single', tag=''),
    p('ALU-FL-002-CAM-D',  'Coloured Flat Sheet', 'Camel', 'Double (230×300 cm)',      '165 GSM', '50% Cotton/50% Polyester',
      'sheets-flat', 'images/camel-sheets.jpg', moq='10', carton_qty='', price=34.95,
      desc='165 GSM coloured flat sheet in Camel — Double size.',
      color_group='ALU-FL-002', parent_sku='ALU-FL-002', variant_name='Camel Double', tag=''),
    p('ALU-FL-002-CAM-Q',  'Coloured Flat Sheet', 'Camel', 'Queen (250×300 cm)',       '165 GSM', '50% Cotton/50% Polyester',
      'sheets-flat', 'images/camel-sheets.jpg', moq='10', carton_qty='', price=39.95,
      desc='165 GSM coloured flat sheet in Camel — Queen size.',
      color_group='ALU-FL-002', parent_sku='ALU-FL-002', variant_name='Camel Queen', tag=''),
    p('ALU-FL-002-CAM-K',  'Coloured Flat Sheet', 'Camel', 'King (290×300 cm)',        '165 GSM', '50% Cotton/50% Polyester',
      'sheets-flat', 'images/camel-sheets.jpg', moq='10', carton_qty='', price=44.95,
      desc='165 GSM coloured flat sheet in Camel — King size.',
      color_group='ALU-FL-002', parent_sku='ALU-FL-002', variant_name='Camel King', tag=''),

    p('ALU-FL-002-NVY-S',  'Coloured Flat Sheet', 'Navy', 'Single (180×300 cm)',      '165 GSM', '50% Cotton/50% Polyester',
      'sheets-flat', 'images/navy-sheets.jpg', moq='10', carton_qty='', price=22.95,
      desc='165 GSM coloured flat sheet in Navy — Single size.',
      color_group='ALU-FL-002', parent_sku='ALU-FL-002', variant_name='Navy Single', tag=''),
    p('ALU-FL-002-NVY-KS', 'Coloured Flat Sheet', 'Navy', 'King Single (200×300 cm)', '165 GSM', '50% Cotton/50% Polyester',
      'sheets-flat', 'images/navy-sheets.jpg', moq='10', carton_qty='', price=22.95,
      desc='165 GSM coloured flat sheet in Navy — King Single size.',
      color_group='ALU-FL-002', parent_sku='ALU-FL-002', variant_name='Navy King Single', tag=''),
    p('ALU-FL-002-NVY-D',  'Coloured Flat Sheet', 'Navy', 'Double (230×300 cm)',      '165 GSM', '50% Cotton/50% Polyester',
      'sheets-flat', 'images/navy-sheets.jpg', moq='10', carton_qty='', price=27.95,
      desc='165 GSM coloured flat sheet in Navy — Double size.',
      color_group='ALU-FL-002', parent_sku='ALU-FL-002', variant_name='Navy Double', tag=''),
    p('ALU-FL-002-NVY-Q',  'Coloured Flat Sheet', 'Navy', 'Queen (250×300 cm)',       '165 GSM', '50% Cotton/50% Polyester',
      'sheets-flat', 'images/navy-sheets.jpg', moq='10', carton_qty='', price=34.95,
      desc='165 GSM coloured flat sheet in Navy — Queen size.',
      color_group='ALU-FL-002', parent_sku='ALU-FL-002', variant_name='Navy Queen', tag=''),
    p('ALU-FL-002-NVY-K',  'Coloured Flat Sheet', 'Navy', 'King (290×300 cm)',        '165 GSM', '50% Cotton/50% Polyester',
      'sheets-flat', 'images/navy-sheets.jpg', moq='10', carton_qty='', price=39.95,
      desc='165 GSM coloured flat sheet in Navy — King size.',
      color_group='ALU-FL-002', parent_sku='ALU-FL-002', variant_name='Navy King', tag=''),

    # ════════════════════════════════════════════════════════════
    # SHEETS — FITTED SHEETS
    # ════════════════════════════════════════════════════════════

    p('ALU-FI-001-S', 'Classic White Fitted Sheet', 'White', 'Single (92×188 cm)', '165 GSM', 'Cotton/Polyester Blend',
      'sheets-fitted', 'images/white-towel-stack-5.webp',
      moq='10', carton_qty='', price=0,
      desc='165 GSM fitted sheet in White — Single size.',
      color_group='ALU-FI-001', parent_sku='ALU-FI-001', variant_name='Single', tag=''),
    p('ALU-FI-001-KS', 'Classic White Fitted Sheet', 'White', 'King Single (107×203 cm)', '165 GSM', 'Cotton/Polyester Blend',
      'sheets-fitted', 'images/white-towel-stack-5.webp',
      moq='10', carton_qty='', price=16.95,
      desc='165 GSM fitted sheet in White — King Single size.',
      color_group='ALU-FI-001', parent_sku='ALU-FI-001', variant_name='King Single', tag=''),
    p('ALU-FI-001-D', 'Classic White Fitted Sheet', 'White', 'Double (138×188 cm)', '165 GSM', 'Cotton/Polyester Blend',
      'sheets-fitted', 'images/white-towel-stack-5.webp',
      moq='10', carton_qty='', price=0,
      desc='165 GSM fitted sheet in White — Double size.',
      color_group='ALU-FI-001', parent_sku='ALU-FI-001', variant_name='Double', tag=''),
    p('ALU-FI-001-Q', 'Classic White Fitted Sheet', 'White', 'Queen (153×203 cm)', '165 GSM', 'Cotton/Polyester Blend',
      'sheets-fitted', 'images/white-towel-stack-5.webp',
      moq='10', carton_qty='', price=0,
      desc='165 GSM fitted sheet in White — Queen size.',
      color_group='ALU-FI-001', parent_sku='ALU-FI-001', variant_name='Queen', tag=''),
    p('ALU-FI-001-K', 'Classic White Fitted Sheet', 'White', 'King (183×203 cm)', '165 GSM', 'Cotton/Polyester Blend',
      'sheets-fitted', 'images/white-towel-stack-5.webp',
      moq='10', carton_qty='', price=0,
      desc='165 GSM fitted sheet in White — King size.',
      color_group='ALU-FI-001', parent_sku='ALU-FI-001', variant_name='King', tag=''),

    p('ALU-FI-002-CAM-S',  'Coloured Fitted Sheet', 'Camel', 'Single (92×188 cm)',       '165 GSM', '50% Cotton/50% Polyester',
      'sheets-fitted', 'images/camel-sheets.jpg', moq='10', carton_qty='', price=27.95,
      desc='165 GSM coloured fitted sheet in Camel — Single size.',
      color_group='ALU-FI-002', parent_sku='ALU-FI-002', variant_name='Camel Single', tag=''),
    p('ALU-FI-002-CAM-KS', 'Coloured Fitted Sheet', 'Camel', 'King Single (107×203 cm)', '165 GSM', '50% Cotton/50% Polyester',
      'sheets-fitted', 'images/camel-sheets.jpg', moq='10', carton_qty='', price=27.95,
      desc='165 GSM coloured fitted sheet in Camel — King Single size.',
      color_group='ALU-FI-002', parent_sku='ALU-FI-002', variant_name='Camel King Single', tag=''),
    p('ALU-FI-002-CAM-D',  'Coloured Fitted Sheet', 'Camel', 'Double (138×188 cm)',      '165 GSM', '50% Cotton/50% Polyester',
      'sheets-fitted', 'images/camel-sheets.jpg', moq='10', carton_qty='', price=34.95,
      desc='165 GSM coloured fitted sheet in Camel — Double size.',
      color_group='ALU-FI-002', parent_sku='ALU-FI-002', variant_name='Camel Double', tag=''),
    p('ALU-FI-002-CAM-Q',  'Coloured Fitted Sheet', 'Camel', 'Queen (153×203 cm)',       '165 GSM', '50% Cotton/50% Polyester',
      'sheets-fitted', 'images/camel-sheets.jpg', moq='10', carton_qty='', price=39.95,
      desc='165 GSM coloured fitted sheet in Camel — Queen size.',
      color_group='ALU-FI-002', parent_sku='ALU-FI-002', variant_name='Camel Queen', tag=''),
    p('ALU-FI-002-CAM-K',  'Coloured Fitted Sheet', 'Camel', 'King (183×203 cm)',        '165 GSM', '50% Cotton/50% Polyester',
      'sheets-fitted', 'images/camel-sheets.jpg', moq='10', carton_qty='', price=44.95,
      desc='165 GSM coloured fitted sheet in Camel — King size.',
      color_group='ALU-FI-002', parent_sku='ALU-FI-002', variant_name='Camel King', tag=''),

    p('ALU-FI-002-NVY-S',  'Coloured Fitted Sheet', 'Navy', 'Single (92×188 cm)',       '165 GSM', '50% Cotton/50% Polyester',
      'sheets-fitted', 'images/navy-sheets.jpg', moq='10', carton_qty='', price=22.95,
      desc='165 GSM coloured fitted sheet in Navy — Single size.',
      color_group='ALU-FI-002', parent_sku='ALU-FI-002', variant_name='Navy Single', tag=''),
    p('ALU-FI-002-NVY-KS', 'Coloured Fitted Sheet', 'Navy', 'King Single (107×203 cm)', '165 GSM', '50% Cotton/50% Polyester',
      'sheets-fitted', 'images/navy-sheets.jpg', moq='10', carton_qty='', price=22.95,
      desc='165 GSM coloured fitted sheet in Navy — King Single size.',
      color_group='ALU-FI-002', parent_sku='ALU-FI-002', variant_name='Navy King Single', tag=''),
    p('ALU-FI-002-NVY-D',  'Coloured Fitted Sheet', 'Navy', 'Double (138×188 cm)',      '165 GSM', '50% Cotton/50% Polyester',
      'sheets-fitted', 'images/navy-sheets.jpg', moq='10', carton_qty='', price=34.95,
      desc='165 GSM coloured fitted sheet in Navy — Double size.',
      color_group='ALU-FI-002', parent_sku='ALU-FI-002', variant_name='Navy Double', tag=''),
    p('ALU-FI-002-NVY-Q',  'Coloured Fitted Sheet', 'Navy', 'Queen (153×203 cm)',       '165 GSM', '50% Cotton/50% Polyester',
      'sheets-fitted', 'images/navy-sheets.jpg', moq='10', carton_qty='', price=39.95,
      desc='165 GSM coloured fitted sheet in Navy — Queen size.',
      color_group='ALU-FI-002', parent_sku='ALU-FI-002', variant_name='Navy Queen', tag=''),
    p('ALU-FI-002-NVY-K',  'Coloured Fitted Sheet', 'Navy', 'King (183×203 cm)',        '165 GSM', '50% Cotton/50% Polyester',
      'sheets-fitted', 'images/navy-sheets.jpg', moq='10', carton_qty='', price=44.95,
      desc='165 GSM coloured fitted sheet in Navy — King size.',
      color_group='ALU-FI-002', parent_sku='ALU-FI-002', variant_name='Navy King', tag=''),

    # ════════════════════════════════════════════════════════════
    # SHEETS — PILLOWCASES
    # ════════════════════════════════════════════════════════════

    p('ALU-PC-001-STD', 'Classic White Pillowcase', 'White', 'Standard (48×73 cm)', '165 GSM', 'Cotton/Polyester Blend',
      'sheets-pillow', 'images/white-pillowcase-pair.webp',
      moq='20', carton_qty='', price=0,
      desc='165 GSM white pillowcase — Standard size.',
      color_group='ALU-PC-001', parent_sku='ALU-PC-001', variant_name='Standard', tag=''),
    p('ALU-PC-001-K', 'Classic White Pillowcase', 'White', 'King (48×90 cm)', '165 GSM', 'Cotton/Polyester Blend',
      'sheets-pillow', 'images/white-pillowcase-pair.webp',
      moq='20', carton_qty='', price=4.50,
      desc='165 GSM white pillowcase — King size.',
      color_group='ALU-PC-001', parent_sku='ALU-PC-001', variant_name='King', tag=''),

    p('ALU-PC-002-CAM', 'Coloured Pillowcase', 'Camel', 'Standard (50×75 cm)', '165 GSM', '50% Cotton/50% Polyester',
      'sheets-pillow', 'images/camel-sheets.jpg',
      moq='20', carton_qty='', price=4.95,
      desc='165 GSM pillowcase in Camel — Standard size.',
      color_group='ALU-PC-002', parent_sku='ALU-PC-002', variant_name='Camel Standard', tag=''),
    p('ALU-PC-002-NVY', 'Coloured Pillowcase', 'Navy', 'Standard (50×75 cm)', '165 GSM', '50% Cotton/50% Polyester',
      'sheets-pillow', 'images/navy-sheets.jpg',
      moq='20', carton_qty='', price=3.95,
      desc='165 GSM pillowcase in Navy — Standard size.',
      color_group='ALU-PC-002', parent_sku='ALU-PC-002', variant_name='Navy Standard', tag=''),

    # ════════════════════════════════════════════════════════════
    # SHEETS — SATIN STRIPE
    # ════════════════════════════════════════════════════════════

    p('ALU-SS-001-S', 'Satin Stripe Top Sheet', 'White/Stripe', 'Single', '155 GSM', 'Cotton/Polyester Blend',
      'sheets-satin', 'images/STS-S-stripe-main.jpg',
      moq='10', carton_qty='', price=21.95,
      desc='Satin stripe woven top sheet — Single size.',
      color_group='ALU-SS-001', parent_sku='ALU-SS-001', variant_name='Single', tag=''),
    p('ALU-SS-001-Q', 'Satin Stripe Top Sheet', 'White/Stripe', 'Queen', '175 GSM', 'Cotton/Polyester Blend',
      'sheets-satin', 'images/STS-S-stripe-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='Satin stripe woven top sheet — Queen size.',
      color_group='ALU-SS-001', parent_sku='ALU-SS-001', variant_name='Queen', tag=''),
    p('ALU-SS-001-K', 'Satin Stripe Top Sheet', 'White/Stripe', 'King', '175 GSM', 'Cotton/Polyester Blend',
      'sheets-satin', 'images/STS-S-stripe-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='Satin stripe woven top sheet — King size.',
      color_group='ALU-SS-001', parent_sku='ALU-SS-001', variant_name='King', tag=''),

    p('ALU-SS-002-STD', 'Satin Stripe Pillowcase', 'White/Stripe', 'Standard (48×73 cm)', '155 GSM', 'Cotton/Polyester Blend',
      'sheets-satin', 'images/STS-PC-stripe-main.jpg',
      moq='20', carton_qty='', price=4.50,
      desc='Satin stripe pillowcase — Standard size.',
      color_group='ALU-SS-002', parent_sku='ALU-SS-002', variant_name='Standard', tag=''),
    p('ALU-SS-002-K', 'Satin Stripe Pillowcase', 'White/Stripe', 'King (48×90 cm)', '155 GSM', 'Cotton/Polyester Blend',
      'sheets-satin', 'images/STS-PC-stripe-main.jpg',
      moq='20', carton_qty='', price=5.95,
      desc='Satin stripe pillowcase — King size.',
      color_group='ALU-SS-002', parent_sku='ALU-SS-002', variant_name='King', tag=''),

    # ════════════════════════════════════════════════════════════
    # QUILT COVERS
    # ════════════════════════════════════════════════════════════

    p('ALU-QC-001-S', 'White Satin Stripe Quilt Cover', 'White/Stripe', 'Single', '175 GSM', 'Cotton/Polyester Blend',
      'quilt-covers', PH,
      moq='5', carton_qty='', price=0,
      desc='Satin stripe quilt cover in White — Single size.',
      color_group='ALU-QC-001', parent_sku='ALU-QC-001', variant_name='Single', tag=''),
    p('ALU-QC-001-D', 'White Satin Stripe Quilt Cover', 'White/Stripe', 'Double', '175 GSM', 'Cotton/Polyester Blend',
      'quilt-covers', PH,
      moq='5', carton_qty='', price=0,
      desc='Satin stripe quilt cover in White — Double size.',
      color_group='ALU-QC-001', parent_sku='ALU-QC-001', variant_name='Double', tag=''),
    p('ALU-QC-001-Q', 'White Satin Stripe Quilt Cover', 'White/Stripe', 'Queen', '175 GSM', 'Cotton/Polyester Blend',
      'quilt-covers', PH,
      moq='5', carton_qty='', price=0,
      desc='Satin stripe quilt cover in White — Queen size.',
      color_group='ALU-QC-001', parent_sku='ALU-QC-001', variant_name='Queen', tag=''),
    p('ALU-QC-001-K', 'White Satin Stripe Quilt Cover', 'White/Stripe', 'King', '175 GSM', 'Cotton/Polyester Blend',
      'quilt-covers', PH,
      moq='5', carton_qty='', price=0,
      desc='Satin stripe quilt cover in White — King size.',
      color_group='ALU-QC-001', parent_sku='ALU-QC-001', variant_name='King', tag=''),

    p('ALU-QC-002-CAM-S',  'Coloured Quilt Cover', 'Camel', 'Single',      '165 GSM', '50% Cotton/50% Polyester',
      'quilt-covers', 'images/camel-sheets.jpg', moq='5', carton_qty='', price=39.95,
      desc='165 GSM quilt cover in Camel — Single size.',
      color_group='ALU-QC-002', parent_sku='ALU-QC-002', variant_name='Camel Single', tag=''),
    p('ALU-QC-002-CAM-KS', 'Coloured Quilt Cover', 'Camel', 'King Single', '165 GSM', '50% Cotton/50% Polyester',
      'quilt-covers', 'images/camel-sheets.jpg', moq='5', carton_qty='', price=49.95,
      desc='165 GSM quilt cover in Camel — King Single size.',
      color_group='ALU-QC-002', parent_sku='ALU-QC-002', variant_name='Camel King Single', tag=''),
    p('ALU-QC-002-CAM-D',  'Coloured Quilt Cover', 'Camel', 'Double',      '165 GSM', '50% Cotton/50% Polyester',
      'quilt-covers', 'images/camel-sheets.jpg', moq='5', carton_qty='', price=54.95,
      desc='165 GSM quilt cover in Camel — Double size.',
      color_group='ALU-QC-002', parent_sku='ALU-QC-002', variant_name='Camel Double', tag=''),
    p('ALU-QC-002-CAM-Q',  'Coloured Quilt Cover', 'Camel', 'Queen',       '165 GSM', '50% Cotton/50% Polyester',
      'quilt-covers', 'images/camel-sheets.jpg', moq='5', carton_qty='', price=59.95,
      desc='165 GSM quilt cover in Camel — Queen size.',
      color_group='ALU-QC-002', parent_sku='ALU-QC-002', variant_name='Camel Queen', tag=''),
    p('ALU-QC-002-CAM-K',  'Coloured Quilt Cover', 'Camel', 'King',        '165 GSM', '50% Cotton/50% Polyester',
      'quilt-covers', 'images/camel-sheets.jpg', moq='5', carton_qty='', price=69.95,
      desc='165 GSM quilt cover in Camel — King size.',
      color_group='ALU-QC-002', parent_sku='ALU-QC-002', variant_name='Camel King', tag=''),
    p('ALU-QC-002-NVY-S',  'Coloured Quilt Cover', 'Navy', 'Single',      '165 GSM', '50% Cotton/50% Polyester',
      'quilt-covers', 'images/navy-sheets.jpg', moq='5', carton_qty='', price=39.95,
      desc='165 GSM quilt cover in Navy — Single size.',
      color_group='ALU-QC-002', parent_sku='ALU-QC-002', variant_name='Navy Single', tag=''),
    p('ALU-QC-002-NVY-KS', 'Coloured Quilt Cover', 'Navy', 'King Single', '165 GSM', '50% Cotton/50% Polyester',
      'quilt-covers', 'images/navy-sheets.jpg', moq='5', carton_qty='', price=49.95,
      desc='165 GSM quilt cover in Navy — King Single size.',
      color_group='ALU-QC-002', parent_sku='ALU-QC-002', variant_name='Navy King Single', tag=''),
    p('ALU-QC-002-NVY-D',  'Coloured Quilt Cover', 'Navy', 'Double',      '165 GSM', '50% Cotton/50% Polyester',
      'quilt-covers', 'images/navy-sheets.jpg', moq='5', carton_qty='', price=54.95,
      desc='165 GSM quilt cover in Navy — Double size.',
      color_group='ALU-QC-002', parent_sku='ALU-QC-002', variant_name='Navy Double', tag=''),
    p('ALU-QC-002-NVY-Q',  'Coloured Quilt Cover', 'Navy', 'Queen',       '165 GSM', '50% Cotton/50% Polyester',
      'quilt-covers', 'images/navy-sheets.jpg', moq='5', carton_qty='', price=59.95,
      desc='165 GSM quilt cover in Navy — Queen size.',
      color_group='ALU-QC-002', parent_sku='ALU-QC-002', variant_name='Navy Queen', tag=''),
    p('ALU-QC-002-NVY-K',  'Coloured Quilt Cover', 'Navy', 'King',        '165 GSM', '50% Cotton/50% Polyester',
      'quilt-covers', 'images/navy-sheets.jpg', moq='5', carton_qty='', price=69.95,
      desc='165 GSM quilt cover in Navy — King size.',
      color_group='ALU-QC-002', parent_sku='ALU-QC-002', variant_name='Navy King', tag=''),

    # ════════════════════════════════════════════════════════════
    # QUILTS
    # ════════════════════════════════════════════════════════════

    p('ALU-QL-001-S', 'Pinnacle Microfibre Quilt', 'White', 'Single', '300 GSM fill', 'Microfibre',
      'quilts-micro', 'images/pinnacle-quilt-white-main.jpg',
      moq='5', carton_qty='', price=0,
      desc='300 GSM fill microfibre quilt — Single size.',
      color_group='ALU-QL-001', parent_sku='ALU-QL-001', variant_name='Single', tag=''),
    p('ALU-QL-001-D', 'Pinnacle Microfibre Quilt', 'White', 'Double', '300 GSM fill', 'Microfibre',
      'quilts-micro', 'images/pinnacle-quilt-white-main.jpg',
      moq='5', carton_qty='', price=0,
      desc='300 GSM fill microfibre quilt — Double size.',
      color_group='ALU-QL-001', parent_sku='ALU-QL-001', variant_name='Double', tag=''),
    p('ALU-QL-001-Q', 'Pinnacle Microfibre Quilt', 'White', 'Queen', '300 GSM fill', 'Microfibre',
      'quilts-micro', 'images/pinnacle-quilt-white-main.jpg',
      moq='5', carton_qty='', price=0,
      desc='300 GSM fill microfibre quilt — Queen size.',
      color_group='ALU-QL-001', parent_sku='ALU-QL-001', variant_name='Queen', tag=''),
    p('ALU-QL-001-K', 'Pinnacle Microfibre Quilt', 'White', 'King', '300 GSM fill', 'Microfibre',
      'quilts-micro', 'images/pinnacle-quilt-white-main.jpg',
      moq='5', carton_qty='', price=0,
      desc='300 GSM fill microfibre quilt — King size.',
      color_group='ALU-QL-001', parent_sku='ALU-QL-001', variant_name='King', tag=''),

    p('ALU-QL-002-S', 'Classic Navy Reversible Quilt', 'Navy', 'Single', '300 GSM fill', 'Microfibre',
      'quilts-navy', 'images/navy-quilt-navy-main.jpg',
      moq='5', carton_qty='', price=0,
      desc='300 GSM fill reversible navy quilt — Single size.',
      color_group='ALU-QL-002', parent_sku='ALU-QL-002', variant_name='Single', tag=''),
    p('ALU-QL-002-D', 'Classic Navy Reversible Quilt', 'Navy', 'Double', '300 GSM fill', 'Microfibre',
      'quilts-navy', 'images/navy-quilt-navy-main.jpg',
      moq='5', carton_qty='', price=42.95,
      desc='300 GSM fill reversible navy quilt — Double size.',
      color_group='ALU-QL-002', parent_sku='ALU-QL-002', variant_name='Double', tag=''),
    p('ALU-QL-002-Q', 'Classic Navy Reversible Quilt', 'Navy', 'Queen', '300 GSM fill', 'Microfibre',
      'quilts-navy', 'images/navy-quilt-navy-main.jpg',
      moq='5', carton_qty='', price=49.95,
      desc='300 GSM fill reversible navy quilt — Queen size.',
      color_group='ALU-QL-002', parent_sku='ALU-QL-002', variant_name='Queen', tag=''),
    p('ALU-QL-002-K', 'Classic Navy Reversible Quilt', 'Navy', 'King', '300 GSM fill', 'Microfibre',
      'quilts-navy', 'images/navy-quilt-navy-main.jpg',
      moq='5', carton_qty='', price=0,
      desc='300 GSM fill reversible navy quilt — King size.',
      color_group='ALU-QL-002', parent_sku='ALU-QL-002', variant_name='King', tag=''),

    # ════════════════════════════════════════════════════════════
    # BLANKETS
    # ════════════════════════════════════════════════════════════

    p('ALU-BK-001-BGS', 'Classic Cellular Cotton Blanket', 'Beige', 'Single', '380 GSM', '100% Cotton',
      'blankets-cotton', 'images/BL-CC-S-beige-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='380 GSM cellular weave cotton blanket in Beige — Single size.',
      color_group='ALU-BK-001', parent_sku='ALU-BK-001', variant_name='Beige Single', tag=''),
    p('ALU-BK-001-BGD', 'Classic Cellular Cotton Blanket', 'Beige', 'Double/Queen', '380 GSM', '100% Cotton',
      'blankets-cotton', 'images/BL-CC-S-beige-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='380 GSM cellular weave cotton blanket in Beige — Double/Queen size.',
      color_group='ALU-BK-001', parent_sku='ALU-BK-001', variant_name='Beige Double/Queen', tag=''),
    p('ALU-BK-001-BLS', 'Classic Cellular Cotton Blanket', 'Blue', 'Single', '380 GSM', '100% Cotton',
      'blankets-cotton', 'images/BL-CC-B-blue-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='380 GSM cellular weave cotton blanket in Blue — Single size.',
      color_group='ALU-BK-001', parent_sku='ALU-BK-001', variant_name='Blue Single', tag=''),
    p('ALU-BK-001-BLD', 'Classic Cellular Cotton Blanket', 'Blue', 'Double/Queen', '380 GSM', '100% Cotton',
      'blankets-cotton', 'images/BL-CC-B-blue-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='380 GSM cellular weave cotton blanket in Blue — Double/Queen size.',
      color_group='ALU-BK-001', parent_sku='ALU-BK-001', variant_name='Blue Double/Queen', tag=''),
    p('ALU-BK-001-SW', 'Classic Cellular Cotton Blanket', 'White', 'Single', '380 GSM', '100% Cotton',
      'blankets-cotton', 'images/BL-CC-W-white-main.jpg',
      moq='10', carton_qty='', price=24.95,
      desc='380 GSM cellular weave cotton blanket in White — Single size.',
      color_group='ALU-BK-001', parent_sku='ALU-BK-001', variant_name='White Single', tag=''),
    p('ALU-BK-001-DQW', 'Classic Cellular Cotton Blanket', 'White', 'Double/Queen', '380 GSM', '100% Cotton',
      'blankets-cotton', 'images/BL-CC-W-white-main.jpg',
      moq='10', carton_qty='', price=39.95,
      desc='380 GSM cellular weave cotton blanket in White — Double/Queen size.',
      color_group='ALU-BK-001', parent_sku='ALU-BK-001', variant_name='White Double/Queen', tag=''),

    p('ALU-BK-002-S',  'Faux Wool Polar Fleece Blanket', 'Latte', 'Single/King Single (190×250 cm)', '380 GSM', 'Faux Wool/Polar Fleece',
      'blankets-fleece', 'images/BL-FW-latte-main.jpg',
      moq='1', carton_qty='6', price=39.95,
      desc='380 GSM faux wool polar fleece blanket in Latte. Fire retardant treated, twin overlocked hem.',
      color_group='ALU-BK-002', parent_sku='ALU-BK-002', variant_name='Single/KS', tag=''),
    p('ALU-BK-002-D',  'Faux Wool Polar Fleece Blanket', 'Latte', 'Double (230×250 cm)',        '380 GSM', 'Faux Wool/Polar Fleece',
      'blankets-fleece', 'images/BL-FW-latte-main.jpg',
      moq='1', carton_qty='5', price=44.95,
      desc='380 GSM faux wool polar fleece blanket in Latte — Double size.',
      color_group='ALU-BK-002', parent_sku='ALU-BK-002', variant_name='Double', tag=''),
    p('ALU-BK-002-Q',  'Faux Wool Polar Fleece Blanket', 'Latte', 'Queen',                      '380 GSM', 'Faux Wool/Polar Fleece',
      'blankets-fleece', 'images/BL-FW-latte-main.jpg',
      moq='1', carton_qty='', price=49.95,
      desc='380 GSM faux wool polar fleece blanket in Latte — Queen size.',
      color_group='ALU-BK-002', parent_sku='ALU-BK-002', variant_name='Queen', tag='Out of Stock'),
    p('ALU-BK-002-K',  'Faux Wool Polar Fleece Blanket', 'Latte', 'King',                       '380 GSM', 'Faux Wool/Polar Fleece',
      'blankets-fleece', 'images/BL-FW-latte-main.jpg',
      moq='1', carton_qty='', price=54.95,
      desc='380 GSM faux wool polar fleece blanket in Latte — King size.',
      color_group='ALU-BK-002', parent_sku='ALU-BK-002', variant_name='King', tag='Out of Stock'),
    p('ALU-BK-002-CHR', 'Faux Wool Polar Fleece Blanket', 'Charcoal', 'Double/Queen',           '380 GSM', 'Faux Wool/Polar Fleece',
      'blankets-fleece', 'images/BL-FW-D-charcoal-main.jpg',
      moq='1', carton_qty='', price=44.95,
      desc='380 GSM faux wool polar fleece blanket in Charcoal.',
      color_group='ALU-BK-002', parent_sku='ALU-BK-002', variant_name='Charcoal', tag=''),

    # ════════════════════════════════════════════════════════════
    # MATTRESS PROTECTION — PROTECTORS
    # ════════════════════════════════════════════════════════════

    p('ALU-MP-001-S', 'Strapped Mattress Protector', 'White', 'Single', '', 'Cotton/Polyester',
      'mp-protectors', 'images/MP-Q-white-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='Fitted strapped mattress protector in White — Single size.',
      color_group='ALU-MP-001', parent_sku='ALU-MP-001', variant_name='Single', tag=''),
    p('ALU-MP-001-KS', 'Strapped Mattress Protector', 'White', 'King Single', '', 'Cotton/Polyester',
      'mp-protectors', 'images/MP-Q-white-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='Fitted strapped mattress protector in White — King Single size.',
      color_group='ALU-MP-001', parent_sku='ALU-MP-001', variant_name='King Single', tag=''),
    p('ALU-MP-001-D', 'Strapped Mattress Protector', 'White', 'Double', '', 'Cotton/Polyester',
      'mp-protectors', 'images/MP-Q-white-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='Fitted strapped mattress protector in White — Double size.',
      color_group='ALU-MP-001', parent_sku='ALU-MP-001', variant_name='Double', tag=''),
    p('ALU-MP-001-Q', 'Strapped Mattress Protector', 'White', 'Queen', '', 'Cotton/Polyester',
      'mp-protectors', 'images/MP-Q-white-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='Fitted strapped mattress protector in White — Queen size.',
      color_group='ALU-MP-001', parent_sku='ALU-MP-001', variant_name='Queen', tag=''),
    p('ALU-MP-001-K', 'Strapped Mattress Protector', 'White', 'King', '', 'Cotton/Polyester',
      'mp-protectors', 'images/MP-Q-white-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='Fitted strapped mattress protector in White — King size.',
      color_group='ALU-MP-001', parent_sku='ALU-MP-001', variant_name='King', tag=''),

    p('ALU-MP-002-S', 'Waterproof Fitted Mattress Protector', 'White', 'Single', '', 'Cotton/Polyester Waterproof',
      'mp-protectors', 'images/FWMP-Q-white-main.jpg',
      moq='10', carton_qty='', price=21.95,
      desc='Waterproof fitted mattress protector — Single size.',
      color_group='ALU-MP-002', parent_sku='ALU-MP-002', variant_name='Single', tag='Waterproof'),
    p('ALU-MP-002-KS', 'Waterproof Fitted Mattress Protector', 'White', 'King Single', '', 'Cotton/Polyester Waterproof',
      'mp-protectors', 'images/FWMP-Q-white-main.jpg',
      moq='10', carton_qty='', price=22.95,
      desc='Waterproof fitted mattress protector — King Single size.',
      color_group='ALU-MP-002', parent_sku='ALU-MP-002', variant_name='King Single', tag='Waterproof'),
    p('ALU-MP-002-D', 'Waterproof Fitted Mattress Protector', 'White', 'Double', '', 'Cotton/Polyester Waterproof',
      'mp-protectors', 'images/FWMP-Q-white-main.jpg',
      moq='10', carton_qty='', price=27.95,
      desc='Waterproof fitted mattress protector — Double size.',
      color_group='ALU-MP-002', parent_sku='ALU-MP-002', variant_name='Double', tag='Waterproof'),
    p('ALU-MP-002-Q', 'Waterproof Fitted Mattress Protector', 'White', 'Queen', '', 'Cotton/Polyester Waterproof',
      'mp-protectors', 'images/FWMP-Q-white-main.jpg',
      moq='10', carton_qty='', price=32.95,
      desc='Waterproof fitted mattress protector — Queen size.',
      color_group='ALU-MP-002', parent_sku='ALU-MP-002', variant_name='Queen', tag='Waterproof'),
    p('ALU-MP-002-K', 'Waterproof Fitted Mattress Protector', 'White', 'King', '', 'Cotton/Polyester Waterproof',
      'mp-protectors', 'images/FWMP-Q-white-main.jpg',
      moq='10', carton_qty='', price=37.95,
      desc='Waterproof fitted mattress protector — King size.',
      color_group='ALU-MP-002', parent_sku='ALU-MP-002', variant_name='King', tag='Waterproof'),

    # ════════════════════════════════════════════════════════════
    # MATTRESS PROTECTION — TOPPERS
    # ════════════════════════════════════════════════════════════

    p('ALU-MT-001', 'Microfibre Mattress Topper', 'White', 'Queen', '1100 GSM fill', 'Microfibre',
      'mp-toppers', PH,
      moq='5', carton_qty='', price=0,
      desc='1100 GSM fill microfibre mattress topper — Queen size.',
      color_group='ALU-MT-001', parent_sku='ALU-MT-001', variant_name='Queen', tag=''),

    # ════════════════════════════════════════════════════════════
    # MATTRESS PROTECTION — PILLOW PROTECTORS
    # ════════════════════════════════════════════════════════════

    p('ALU-PP-001', 'Pillow Protector', 'White', 'Standard (48×73 cm)', '', 'Cotton/Polyester',
      'mp-pillow', 'images/PP-STD-white-main.jpg',
      moq='20', carton_qty='', price=0,
      desc='Zippered pillow protector in White — Standard size.',
      color_group='ALU-PP-001', parent_sku='ALU-PP-001', variant_name='Standard', tag=''),

    # ════════════════════════════════════════════════════════════
    # PILLOWS
    # ════════════════════════════════════════════════════════════

    p('ALU-PIL-001', 'Microfibre Pillow — Soft', 'White', '48×73 cm', '850g fill', 'Microfibre',
      'pillows', 'images/PIL-SOFT-white-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='850g fill soft microfibre pillow.',
      color_group='ALU-PIL-001', parent_sku='ALU-PIL-001', variant_name='Soft', tag=''),

    p('ALU-PIL-002', 'Microfibre Pillow — Medium', 'White', '48×73 cm', '1050g fill', 'Microfibre',
      'pillows', 'images/PIL-MED-white-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='1050g fill medium microfibre pillow.',
      color_group='ALU-PIL-002', parent_sku='ALU-PIL-002', variant_name='Medium', tag='Bestseller'),

    p('ALU-PIL-003', 'Microfibre Pillow — Firm', 'White', '48×73 cm', '1250g fill', 'Microfibre',
      'pillows', 'images/PIL-FIRM-white-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='1250g fill firm microfibre pillow.',
      color_group='ALU-PIL-003', parent_sku='ALU-PIL-003', variant_name='Firm', tag=''),

    p('ALU-PIL-004', 'King Microfibre Pillow', 'White', '48×90 cm', '1300g fill', 'Microfibre',
      'pillows', 'images/PIL-KING-white-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='1300g fill king-size microfibre pillow.',
      color_group='ALU-PIL-004', parent_sku='ALU-PIL-004', variant_name='King', tag=''),

    p('ALU-PIL-005', 'European Pillow', 'White', '65×65 cm', '1200g fill', 'Microfibre',
      'pillows', 'images/PIL-EURO-white-main.jpg',
      moq='10', carton_qty='', price=0,
      desc='1200g fill European square pillow.',
      color_group='ALU-PIL-005', parent_sku='ALU-PIL-005', variant_name='European', tag=''),

    p('ALU-PIL-006', 'Vacuum Pack Pillows — Pack of 10', 'White', '48×73 cm', '950g fill', 'Microfibre',
      'pillows', 'images/PIL-VAC-white-main.jpg',
      moq='10', carton_qty='10', price=0,
      desc='950g fill microfibre pillows sold as vacuum-packed pack of 10.',
      color_group='ALU-PIL-006', parent_sku='ALU-PIL-006', variant_name='Pack of 10', tag='Bulk Pack'),
]

# ── HELPERS (preserved from original) ────────────────────────────────────────
HELPERS = """\
window.ALT_HELPERS = {
  getProductsByCategory: function(categoryId) {
    return window.ALT_PRODUCTS.filter(function(p) { return p.categoryId === categoryId; });
  },
  getCategoryById: function(id) {
    return window.ALT_CATEGORIES.find(function(c) { return c.id === id; });
  },
  getProductBySku: function(sku) {
    return window.ALT_PRODUCTS.find(function(p) { return p.sku === sku; });
  },
  formatPrice: function(price) {
    if (!price || price === 0) return 'Request Quote';
    return '$' + parseFloat(price).toFixed(2);
  },
  getTotalSkuCount: function() {
    return window.ALT_PRODUCTS.length;
  },
  getCategoryCount: function() {
    return window.ALT_CATEGORIES.length;
  },
  isPlaceholderImage: function(img) {
    return !img || img === 'images/placeholder-product.svg';
  },
  getColorSiblings: function(product) {
    if (!product || !product.colorGroup) return [];
    return window.ALT_PRODUCTS.filter(function(p) {
      return p.colorGroup === product.colorGroup && p.sku !== product.sku;
    });
  }
};
"""

# ── SERIALISE ─────────────────────────────────────────────────────────────────

def js_str(v):
    if v is None:
        return 'null'
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    escaped = str(v).replace('\\', '\\\\').replace("'", "\\'")
    return f"'{escaped}'"

def product_to_js(prod):
    fields = [
        ('sku',         js_str(prod['sku'])),
        ('name',        js_str(prod['name'])),
        ('colour',      js_str(prod['colour'])),
        ('size',        js_str(prod['size'])),
        ('weight',      js_str(prod['weight'])),
        ('material',    js_str(prod['material'])),
        ('categoryId',  js_str(prod['categoryId'])),
        ('image',       js_str(prod['image'])),
        ('gallery',     '[]'),
        ('zoomImage',   js_str(prod['image'])),
        ('moq',         js_str(prod['moq'])),
        ('cartonQty',   js_str(prod['cartonQty'])),
        ('price',       js_str(prod['price'])),
        ('description', js_str(prod['description'])),
        ('colorGroup',  js_str(prod['colorGroup'])),
        ('parentSku',   js_str(prod['parentSku'])),
        ('variantName', js_str(prod['variantName'])),
        ('tag',         js_str(prod['tag'])),
    ]
    inner = ', '.join(f'{k}: {v}' for k, v in fields)
    return f'  {{ {inner} }}'

def category_to_js(cat):
    fields = [
        ('id',     js_str(cat['id'])),
        ('name',   js_str(cat['name'])),
        ('parent', js_str(cat['parent'])),
        ('slug',   js_str(cat['slug'])),
        ('image',  js_str(cat['image'])),
    ]
    inner = ', '.join(f'{k}: {v}' for k, v in fields)
    return f'  {{ {inner} }}'

lines = [
    "// products-data.js — AusLinen & Towels product catalogue",
    "// Generated by generate_products.py — do not edit directly",
    "// Products sorted to match ALT_Products_Catalogue.xlsx category order",
    "",
    "const PH = 'images/placeholder-product.svg';",
    "",
]

# ALT_PARENTS
lines.append("window.ALT_PARENTS = {")
for key, val in PARENTS.items():
    lines.append(f"  {js_str(key)}: {{ name: {js_str(val['name'])}, category: {js_str(val['category'])} }},")
lines.append("};")
lines.append("")

# ALT_CATEGORIES
lines.append("window.ALT_CATEGORIES = [")
for cat in CATEGORIES:
    lines.append(category_to_js(cat) + ',')
lines.append("];")
lines.append("")

# ALT_PRODUCTS
lines.append("window.ALT_PRODUCTS = [")
for prod in PRODUCTS:
    lines.append(product_to_js(prod) + ',')
lines.append("];")
lines.append("")

# ALT_HELPERS
lines.append(HELPERS)

output = '\n'.join(lines)
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(output)

print(f"Written {len(PRODUCTS)} products across {len(CATEGORIES)} categories to:")
print(f"  {OUT}")
