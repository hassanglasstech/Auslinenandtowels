<?php
// ============================================================
// Australian Linen & Towels — Product Catalogue API
// DB is the single source of truth. This endpoint provides:
//   GET    /api/products.php              → all products+categories+parents (JSON)
//   GET    /api/products.php?sku=ALU-BT-001 → single product
//   POST   /api/products.php              → create product        (token)
//   PUT    /api/products.php              → update product        (token)
//   DELETE /api/products.php?sku=...      → delete product        (token)
//   POST   /api/products.php?action=seed  → one-time seed from products-seed.json (token)
//   POST   /api/products.php?action=publish → regenerate ../assets/products-data.js (token)
//   POST   /api/products.php?action=category → upsert category    (token)
//   DELETE /api/products.php?category=ID  → delete category       (token)
// ============================================================

require_once __DIR__ . '/db.php';
header('Content-Type: application/json');
header('Cache-Control: no-store');

// camelCase (JS) ↔ snake_case (DB) field map for products
$FIELD_MAP = [
    'sku' => 'sku', 'name' => 'name', 'colour' => 'colour', 'size' => 'size',
    'weight' => 'weight', 'material' => 'material', 'categoryId' => 'category_id',
    'image' => 'image', 'zoomImage' => 'zoom_image', 'price' => 'price',
    'description' => 'description', 'colorGroup' => 'color_group',
    'parentSku' => 'parent_sku', 'variantName' => 'variant_name', 'tag' => 'tag',
];

function fail($code, $msg) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

// Convert a DB product row → JS-shaped object (camelCase + typed)
function row_to_js($r) {
    // Normalise price so whole numbers serialise as int (4) not float (4.0),
    // matching JS JSON.stringify — keeps generated products-data.js diff-clean.
    $price = (float)$r['price'];
    $price = ($price == (int)$price) ? (int)$price : $price;
    return [
        'sku'         => $r['sku'],
        'name'        => $r['name'],
        'colour'      => $r['colour'],
        'size'        => $r['size'],
        'weight'      => $r['weight'],
        'material'    => $r['material'],
        'categoryId'  => $r['category_id'],
        'image'       => $r['image'],
        'gallery'     => $r['gallery'] ? (json_decode($r['gallery'], true) ?: []) : [],
        'zoomImage'   => $r['zoom_image'],
        'price'       => $price,
        'description' => $r['description'],
        'colorGroup'  => $r['color_group'],
        'parentSku'   => $r['parent_sku'],
        'variantName' => $r['variant_name'],
        'tag'         => $r['tag'],
    ];
}

try {
    $pdo    = alt_pdo();
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    // ── SEED (one-time): populate empty tables from products-seed.json ──
    if ($method === 'POST' && $action === 'seed') {
        alt_require_token();
        $count = (int)$pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
        if ($count > 0 && empty($_GET['force'])) {
            fail(409, "Products table already has $count rows. Add &force=1 to wipe and reseed.");
        }
        $seedPath = __DIR__ . '/../assets/products-seed.json';
        if (!file_exists($seedPath)) fail(500, 'products-seed.json not found.');
        $seed = json_decode(file_get_contents($seedPath), true);
        if (!$seed) fail(500, 'products-seed.json is invalid JSON.');

        $pdo->beginTransaction();
        $pdo->exec("DELETE FROM products");
        $pdo->exec("DELETE FROM categories");
        $pdo->exec("DELETE FROM product_parents");

        // categories
        $cs = $pdo->prepare("INSERT INTO categories (id,name,parent,slug,image,sort_order) VALUES (?,?,?,?,?,?)");
        $i = 0;
        foreach ($seed['categories'] as $c) {
            $cs->execute([$c['id'], $c['name'], $c['parent'] ?? null, $c['slug'] ?? null, $c['image'] ?? null, $i++]);
        }
        // parents
        $ps = $pdo->prepare("INSERT INTO product_parents (sku,name,category) VALUES (?,?,?)");
        foreach ($seed['parents'] as $sku => $p) {
            $ps->execute([$sku, $p['name'], $p['category'] ?? null]);
        }
        // products
        $insert = $pdo->prepare(
            "INSERT INTO products
             (sku,name,colour,size,weight,material,category_id,image,gallery,zoom_image,price,description,color_group,parent_sku,variant_name,tag,sort_order,active)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)"
        );
        $i = 0;
        foreach ($seed['products'] as $p) {
            $insert->execute([
                $p['sku'], $p['name'], $p['colour'] ?? null, $p['size'] ?? null,
                $p['weight'] ?? null, $p['material'] ?? null, $p['categoryId'] ?? null,
                $p['image'] ?? null, json_encode($p['gallery'] ?? []), $p['zoomImage'] ?? null,
                $p['price'] ?? 0, $p['description'] ?? null, $p['colorGroup'] ?? null,
                $p['parentSku'] ?? null, $p['variantName'] ?? null, $p['tag'] ?? '', $i++,
            ]);
        }
        $pdo->commit();
        echo json_encode(['ok' => true, 'seeded' => [
            'products'   => count($seed['products']),
            'categories' => count($seed['categories']),
            'parents'    => count($seed['parents']),
        ]]);
        exit;
    }

    // ── PUBLISH: regenerate ../assets/products-data.js from DB ──
    if ($method === 'POST' && $action === 'publish') {
        alt_require_token();
        echo json_encode(alt_publish_catalog($pdo));
        exit;
    }

    // ── CATEGORY upsert / delete ──
    if ($action === 'category') {
        alt_require_token();
        if ($method === 'POST' || $method === 'PUT') {
            $b = alt_json_body();
            if (empty($b['id']) || empty($b['name'])) fail(400, 'Category id and name are required.');
            $stmt = $pdo->prepare(
                "INSERT INTO categories (id,name,parent,slug,image,sort_order)
                 VALUES (:id,:name,:parent,:slug,:image,:sort)
                 ON DUPLICATE KEY UPDATE name=:name,parent=:parent,slug=:slug,image=:image,sort_order=:sort"
            );
            $stmt->execute([
                'id' => $b['id'], 'name' => $b['name'], 'parent' => $b['parent'] ?? null,
                'slug' => $b['slug'] ?? null, 'image' => $b['image'] ?? null, 'sort' => $b['sortOrder'] ?? 0,
            ]);
            echo json_encode(['ok' => true, 'id' => $b['id']]);
            exit;
        }
        if ($method === 'DELETE') {
            $id = $_GET['category'] ?? '';
            if ($id === '') fail(400, 'category id required');
            $pdo->prepare("DELETE FROM categories WHERE id=?")->execute([$id]);
            echo json_encode(['ok' => true]);
            exit;
        }
    }

    // ── GET: list all or single ──
    if ($method === 'GET') {
        if (!empty($_GET['sku'])) {
            $stmt = $pdo->prepare("SELECT * FROM products WHERE sku=?");
            $stmt->execute([$_GET['sku']]);
            $row = $stmt->fetch();
            if (!$row) fail(404, 'Product not found');
            echo json_encode(['ok' => true, 'product' => row_to_js($row)]);
            exit;
        }
        $products = $pdo->query("SELECT * FROM products WHERE active=1 ORDER BY sort_order, id")->fetchAll();
        $cats     = $pdo->query("SELECT * FROM categories ORDER BY sort_order, id")->fetchAll();
        $parents  = $pdo->query("SELECT * FROM product_parents")->fetchAll();

        $catsOut = array_map(function($c) {
            return ['id' => $c['id'], 'name' => $c['name'], 'parent' => $c['parent'], 'slug' => $c['slug'], 'image' => $c['image']];
        }, $cats);
        $parentsOut = [];
        foreach ($parents as $p) $parentsOut[$p['sku']] = ['name' => $p['name'], 'category' => $p['category']];

        echo json_encode([
            'ok'         => true,
            'products'   => array_map('row_to_js', $products),
            'categories' => $catsOut,
            'parents'    => $parentsOut,
        ]);
        exit;
    }

    // ── Mutations below require token ──
    alt_require_token();

    if ($method === 'POST') {
        $b = alt_json_body();
        if (empty($b['sku']) || empty($b['name'])) fail(400, 'sku and name are required.');
        $exists = $pdo->prepare("SELECT id FROM products WHERE sku=?");
        $exists->execute([$b['sku']]);
        if ($exists->fetch()) fail(409, 'A product with this SKU already exists.');

        $maxSort = (int)$pdo->query("SELECT COALESCE(MAX(sort_order),0)+1 FROM products")->fetchColumn();
        $stmt = $pdo->prepare(
            "INSERT INTO products
             (sku,name,colour,size,weight,material,category_id,image,gallery,zoom_image,price,description,color_group,parent_sku,variant_name,tag,sort_order,active)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)"
        );
        $stmt->execute([
            $b['sku'], $b['name'], $b['colour'] ?? null, $b['size'] ?? null, $b['weight'] ?? null,
            $b['material'] ?? null, $b['categoryId'] ?? null, $b['image'] ?? null,
            json_encode($b['gallery'] ?? []), $b['zoomImage'] ?? null, $b['price'] ?? 0,
            $b['description'] ?? null, $b['colorGroup'] ?? null, $b['parentSku'] ?? null,
            $b['variantName'] ?? null, $b['tag'] ?? '', $maxSort,
        ]);
        echo json_encode(['ok' => true, 'sku' => $b['sku'], 'id' => $pdo->lastInsertId()]);
        exit;
    }

    if ($method === 'PUT') {
        $b = alt_json_body();
        if (empty($b['sku'])) fail(400, 'sku is required to identify the product.');
        global $FIELD_MAP;
        $sets = [];
        $vals = [];
        foreach ($FIELD_MAP as $js => $col) {
            if ($js === 'sku') continue; // sku is the key, not updated here
            if (array_key_exists($js, $b)) {
                $sets[] = "$col = ?";
                $vals[] = ($js === 'price') ? (float)$b[$js] : $b[$js];
            }
        }
        if (array_key_exists('gallery', $b)) { $sets[] = "gallery = ?"; $vals[] = json_encode($b['gallery']); }
        if (array_key_exists('active', $b))  { $sets[] = "active = ?";  $vals[] = $b['active'] ? 1 : 0; }
        if (!$sets) fail(400, 'No updatable fields provided.');
        $vals[] = $b['sku'];
        $stmt = $pdo->prepare("UPDATE products SET " . implode(',', $sets) . " WHERE sku = ?");
        $stmt->execute($vals);
        if ($stmt->rowCount() === 0) {
            // row may exist but be unchanged; verify existence
            $chk = $pdo->prepare("SELECT id FROM products WHERE sku=?");
            $chk->execute([$b['sku']]);
            if (!$chk->fetch()) fail(404, 'Product not found.');
        }
        echo json_encode(['ok' => true, 'sku' => $b['sku']]);
        exit;
    }

    if ($method === 'DELETE') {
        $sku = $_GET['sku'] ?? '';
        if ($sku === '') fail(400, 'sku required');
        $stmt = $pdo->prepare("DELETE FROM products WHERE sku=?");
        $stmt->execute([$sku]);
        echo json_encode(['ok' => true, 'deleted' => $stmt->rowCount()]);
        exit;
    }

    fail(405, 'Method not allowed');

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    fail(500, 'Server error: ' . $e->getMessage());
}

// ============================================================
// Regenerate ../assets/products-data.js from the DB.
// Output mirrors the original structure so the storefront
// (index/collection/product) keeps working with zero changes.
// ============================================================
function alt_publish_catalog($pdo) {
    $products = $pdo->query("SELECT * FROM products WHERE active=1 ORDER BY sort_order, id")->fetchAll();
    $cats     = $pdo->query("SELECT * FROM categories ORDER BY sort_order, id")->fetchAll();
    $parents  = $pdo->query("SELECT * FROM product_parents ORDER BY sku")->fetchAll();

    // Parents map
    $parentsMap = [];
    foreach ($parents as $p) $parentsMap[$p['sku']] = ['name' => $p['name'], 'category' => $p['category']];

    // Categories array
    $catsArr = array_map(function($c) {
        return ['id' => $c['id'], 'name' => $c['name'], 'parent' => $c['parent'], 'slug' => $c['slug'], 'image' => $c['image']];
    }, $cats);

    // Products array (JS field order preserved)
    $prodArr = array_map('row_to_js', $products);

    $J = function($v) { return json_encode($v, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); };

    $out  = "// products-data.js — AusLinen & Towels product catalogue\n";
    $out .= "// AUTO-GENERATED from MySQL by api/products.php?action=publish — do NOT hand-edit.\n";
    $out .= "// Edit products in the admin dashboard (admin.html), then click Publish.\n\n";
    $out .= "const PH = 'images/placeholder-product.svg';\n\n";
    $out .= "window.ALT_PARENTS = " . $J($parentsMap) . ";\n\n";
    $out .= "window.ALT_CATEGORIES = [\n";
    foreach ($catsArr as $c) $out .= "  " . $J($c) . ",\n";
    $out .= "];\n\n";
    $out .= "window.ALT_PRODUCTS = [\n";
    foreach ($prodArr as $p) $out .= "  " . $J($p) . ",\n";
    $out .= "];\n\n";

    // Append the static helpers logic block verbatim
    $helpers = file_get_contents(__DIR__ . '/catalog-helpers.js');
    $out .= $helpers;

    $target = __DIR__ . '/../assets/products-data.js';
    $bytes  = file_put_contents($target, $out);
    if ($bytes === false) {
        return ['ok' => false, 'error' => 'Could not write assets/products-data.js (check file permissions).'];
    }
    return ['ok' => true, 'written' => $target, 'bytes' => $bytes, 'products' => count($prodArr), 'categories' => count($catsArr)];
}
