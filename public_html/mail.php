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
