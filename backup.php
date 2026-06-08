<?php
// ============================================================
// Australian Linen & Towels — MySQL Backup (subscribers + enquiries)
// Cron: curl -s "https://auslinenandtowels.com.au/backup.php?token=YOUR_TOKEN"
// Saves timestamped CSV files to _backups/  (web-blocked by .htaccess)
// Token: set ALT_EXPORT_TOKEN in db-config.php
// ============================================================

$cfg = __DIR__ . '/db-config.php'; if (!file_exists($cfg)) $cfg = __DIR__ . '/../db-config.php'; require_once $cfg;

// Fail closed if token unset or placeholder
$provided = (string)($_GET['token'] ?? '');
if (!defined('ALT_EXPORT_TOKEN')
    || ALT_EXPORT_TOKEN === ''
    || ALT_EXPORT_TOKEN === 'CHANGE_THIS_TO_A_RANDOM_SECRET'
    || strlen($provided) < 16
    || !hash_equals(ALT_EXPORT_TOKEN, $provided)) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Forbidden']);
    exit;
}

$backupDir = __DIR__ . '/_backups';
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0750, true);
}

$stamp   = date('Y-m-d_His');
$results = [];

try {
    $pdo = new PDO(
        'mysql:host=' . ALT_DB_HOST . ';dbname=' . ALT_DB_NAME . ';charset=utf8mb4',
        ALT_DB_USER,
        ALT_DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 15]
    );

    // ── subscribers ──────────────────────────────────────────
    $rows = $pdo->query(
        "SELECT id, name, email, subscribed_at, source, status FROM subscribers ORDER BY subscribed_at DESC"
    )->fetchAll(PDO::FETCH_ASSOC);

    $file = $backupDir . "/subscribers-{$stamp}.csv";
    $fh   = fopen($file, 'w');
    fputcsv($fh, ['ID', 'Name', 'Email', 'Subscribed At', 'Source', 'Status']);
    foreach ($rows as $row) fputcsv($fh, array_values($row));
    fclose($fh);
    $results['subscribers'] = ['rows' => count($rows), 'file' => "subscribers-{$stamp}.csv"];

    // ── enquiries ────────────────────────────────────────────
    $rows = $pdo->query(
        "SELECT id, received_at, name, email, phone, company, enquiry_type, message, email_sent FROM enquiries ORDER BY received_at DESC"
    )->fetchAll(PDO::FETCH_ASSOC);

    $file = $backupDir . "/enquiries-{$stamp}.csv";
    $fh   = fopen($file, 'w');
    fputcsv($fh, ['ID', 'Received At', 'Name', 'Email', 'Phone', 'Company', 'Type', 'Message', 'Email Sent']);
    foreach ($rows as $row) fputcsv($fh, array_values($row));
    fclose($fh);
    $results['enquiries'] = ['rows' => count($rows), 'file' => "enquiries-{$stamp}.csv"];

    // ── prune old backups (keep last 30 days) ────────────────
    $cutoff = strtotime('-30 days');
    $pruned = 0;
    foreach (glob($backupDir . '/*.csv') as $f) {
        if (filemtime($f) < $cutoff) { unlink($f); $pruned++; }
    }

    header('Content-Type: application/json');
    echo json_encode([
        'ok'      => true,
        'stamp'   => $stamp,
        'tables'  => $results,
        'pruned'  => $pruned,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Database error — check db-config.php credentials.']);
}
