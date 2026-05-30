<?php
// ============================================================
// Shared DB connection + auth helper for the API layer.
// db-config.php lives at web root (../) and is gitignored.
// ============================================================

function alt_pdo() {
    static $pdo = null;
    if ($pdo !== null) return $pdo;
    require_once __DIR__ . '/../db-config.php';
    $pdo = new PDO(
        'mysql:host=' . ALT_DB_HOST . ';dbname=' . ALT_DB_NAME . ';charset=utf8mb4',
        ALT_DB_USER,
        ALT_DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT            => 10,
        ]
    );
    return $pdo;
}

// Constant-time admin token check. Same token as exports/backups.
// Fails closed if unset or still the placeholder.
function alt_require_token() {
    require_once __DIR__ . '/../db-config.php';
    $provided = (string)($_GET['token'] ?? $_POST['token'] ?? '');
    if (!defined('ALT_EXPORT_TOKEN')
        || ALT_EXPORT_TOKEN === ''
        || ALT_EXPORT_TOKEN === 'CHANGE_THIS_TO_A_RANDOM_SECRET'
        || strlen($provided) < 16
        || !hash_equals(ALT_EXPORT_TOKEN, $provided)) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['ok' => false, 'error' => 'Forbidden — invalid token']);
        exit;
    }
}

function alt_json_body() {
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
