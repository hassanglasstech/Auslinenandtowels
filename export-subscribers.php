<?php
// ============================================================
// Australian Linen & Towels — Subscriber CSV Export
// Access: https://auslinenandtowels.com.au/export-subscribers.php?token=YOUR_TOKEN
// Set ALT_EXPORT_TOKEN in db-config.php first
// ============================================================

require_once __DIR__ . '/db-config.php';

// Token auth
if (($_GET['token'] ?? '') !== ALT_EXPORT_TOKEN || ALT_EXPORT_TOKEN === 'CHANGE_THIS_TO_A_RANDOM_SECRET') {
    http_response_code(403);
    exit('Forbidden');
}

try {
    $pdo = new PDO(
        'mysql:host=' . ALT_DB_HOST . ';dbname=' . ALT_DB_NAME . ';charset=utf8mb4',
        ALT_DB_USER,
        ALT_DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 10]
    );

    $status = $_GET['status'] ?? 'active';
    $allowed_statuses = ['active', 'unsubscribed', 'all'];
    if (!in_array($status, $allowed_statuses, true)) $status = 'active';

    if ($status === 'all') {
        $rows = $pdo->query(
            "SELECT name, email, subscribed_at, source, status FROM subscribers ORDER BY subscribed_at DESC"
        )->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $stmt = $pdo->prepare(
            "SELECT name, email, subscribed_at, source, status FROM subscribers WHERE status = :s ORDER BY subscribed_at DESC"
        );
        $stmt->execute(['s' => $status]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    $filename = 'subscribers-' . $status . '-' . date('Y-m-d') . '.csv';
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: no-store');

    $out = fopen('php://output', 'w');
    fputcsv($out, ['Name', 'Email', 'Subscribed At', 'Source', 'Status']);
    foreach ($rows as $row) {
        fputcsv($out, array_values($row));
    }
    fclose($out);

} catch (Exception $e) {
    http_response_code(500);
    exit('Database error — check db-config.php credentials.');
}
