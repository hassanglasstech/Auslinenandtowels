<?php
// ============================================================
// Australian Linen & Towels — Health Check Endpoint
// Used by uptime monitors (UptimeRobot, Better Uptime, etc.)
// URL: https://auslinenandtowels.com.au/health.php
// Returns 200 OK + JSON when everything is healthy
// Returns 503 if DB is unreachable
// ============================================================

header('Content-Type: application/json');
header('Cache-Control: no-store');

$status = ['ok' => true, 'checks' => []];

// ── DB check ─────────────────────────────────────────────────
$cfg = __DIR__ . '/db-config.php'; if (!file_exists($cfg)) $cfg = __DIR__ . '/../db-config.php';
if (file_exists($cfg)) {
    require_once $cfg;
    try {
        $pdo = new PDO(
            'mysql:host=' . ALT_DB_HOST . ';dbname=' . ALT_DB_NAME . ';charset=utf8mb4',
            ALT_DB_USER,
            ALT_DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 3]
        );
        $pdo->query('SELECT 1');
        $status['checks']['db'] = 'ok';
    } catch (Exception $e) {
        $status['ok'] = false;
        $status['checks']['db'] = 'error';
    }
} else {
    $status['checks']['db'] = 'no-config';
}

// ── PHP check (always passes if we got here) ─────────────────
$status['checks']['php'] = 'ok';

if (!$status['ok']) {
    http_response_code(503);
}

echo json_encode($status);
