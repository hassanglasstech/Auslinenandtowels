<?php
header('Content-Type: application/json');

$allowed_origins = [
    'https://auslinenandtowels.com.au',
    'https://www.auslinenandtowels.com.au',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// ── REFERER CHECK ─────────────────────────────────────────────────────────────
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$referer_ok = false;
foreach ($allowed_origins as $o) {
    if (strpos($referer, $o) === 0) { $referer_ok = true; break; }
}
if (!$referer_ok) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Forbidden']);
    exit;
}

// ── HONEYPOT CHECK ────────────────────────────────────────────────────────────
// Bots fill every field including hidden ones. Humans never see this field.
$honeypot = $_POST['website'] ?? null;
if ($honeypot !== '' && $honeypot !== null) {
    // Silently discard — don't tell the bot it was caught
    http_response_code(200);
    echo json_encode(['ok' => true]);
    exit;
}

// ── RATE LIMITING (per IP, max 3 submissions per 10 minutes) ─────────────────
$ip        = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip_hash   = 'alt_rl_' . md5($ip);        // anonymised key
$rate_file = sys_get_temp_dir() . '/' . $ip_hash . '.json';
$now       = time();
$window    = 600;   // 10 minutes
$max_hits  = 3;

$hits = [];
if (file_exists($rate_file)) {
    $data = json_decode(file_get_contents($rate_file), true);
    if (is_array($data)) {
        $hits = array_filter($data, fn($t) => ($now - $t) < $window);
        $hits = array_values($hits);
    }
}

if (count($hits) >= $max_hits) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'Too many requests. Please try again in a few minutes.']);
    exit;
}

$hits[] = $now;
file_put_contents($rate_file, json_encode($hits), LOCK_EX);

// ── NEWSLETTER SUBSCRIBER — MYSQL SAVE ───────────────────────────────────────
function alt_save_subscriber($name, $email, $source = 'website-newsletter') {
    $cfg = __DIR__ . '/db-config.php';
    if (!file_exists($cfg)) return false;
    require_once $cfg;
    try {
        $pdo = new PDO(
            'mysql:host=' . ALT_DB_HOST . ';dbname=' . ALT_DB_NAME . ';charset=utf8mb4',
            ALT_DB_USER,
            ALT_DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 5]
        );
        $stmt = $pdo->prepare(
            'INSERT IGNORE INTO subscribers (name, email, source) VALUES (:name, :email, :source)'
        );
        $stmt->execute(['name' => $name, 'email' => $email, 'source' => $source]);
        return true;
    } catch (Exception $e) {
        return false; // fail silently — email notification still goes through
    }
}

// ── INPUT SANITISATION ────────────────────────────────────────────────────────
function alt_clean($v) {
    return str_replace(["\r", "\n", "%0a", "%0d"], '', strip_tags(trim((string)$v)));
}

$to      = 'info@auslinenandtowels.com.au';
$name    = alt_clean($_POST['name']    ?? '');
$email   = filter_var(alt_clean($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$phone   = alt_clean($_POST['phone']   ?? '');
$company = alt_clean($_POST['company'] ?? '');
$enquiry = alt_clean($_POST['enquiry'] ?? '');
$message = strip_tags(trim($_POST['message'] ?? ''));

if (!$name || !$email || !$message) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Required fields missing']);
    exit;
}

// ── SAVE NEWSLETTER SUBSCRIBER TO DB ─────────────────────────────────────────
if ($enquiry === 'newsletter') {
    alt_save_subscriber($name, $email);
}

// ── BUILD & SEND EMAIL ────────────────────────────────────────────────────────
$subject = "New Enquiry from {$name} — Australian Linen & Towels";

$body  = "You have received a new enquiry via auslinenandtowels.com.au\n";
$body .= str_repeat('-', 50) . "\n\n";
$body .= "Name:     {$name}\n";
$body .= "Email:    {$email}\n";
if ($phone)   $body .= "Phone:    {$phone}\n";
if ($company) $body .= "Company:  {$company}\n";
if ($enquiry) $body .= "Enquiry:  {$enquiry}\n";
$body .= "\nMessage:\n{$message}\n";
$body .= "\n" . str_repeat('-', 50) . "\n";
$body .= "Sent: " . date('d M Y, h:i A') . " AEDT\n";
$body .= "IP:   {$ip}\n";

$safe_name = preg_replace('/[^A-Za-z0-9 ._-]/', '', $name);
$headers  = "From: Australian Linen & Towels <info@auslinenandtowels.com.au>\r\n";
$headers .= "Reply-To: {$safe_name} <{$email}>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: ALT-Website\r\n";

$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Mail server error']);
}
