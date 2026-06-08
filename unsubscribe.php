<?php
// ============================================================
// Australian Linen & Towels — Newsletter Unsubscribe
// Spam Act 2003 (Cth): every commercial message must carry a
// functional unsubscribe. Newsletter links to:
//   /unsubscribe.php?e=<email>&t=<unsubscribe_token>
// ============================================================

$email = isset($_GET['e']) ? trim($_GET['e']) : '';
$token = isset($_GET['t']) ? trim($_GET['t']) : '';
$done  = false;
$error = '';

function alt_db_conn() {
    $cfg = __DIR__ . '/db-config.php'; if (!file_exists($cfg)) $cfg = __DIR__ . '/../db-config.php';
    if (!file_exists($cfg)) return null;
    require_once $cfg;
    try {
        return new PDO(
            'mysql:host=' . ALT_DB_HOST . ';dbname=' . ALT_DB_NAME . ';charset=utf8mb4',
            ALT_DB_USER,
            ALT_DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 5]
        );
    } catch (Exception $e) {
        return null;
    }
}

$email = filter_var($email, FILTER_VALIDATE_EMAIL);
if (!$email || $token === '' || !ctype_xdigit($token) || strlen($token) !== 32) {
    $error = 'This unsubscribe link is invalid or incomplete.';
} else {
    $pdo = alt_db_conn();
    if (!$pdo) {
        $error = 'We could not process your request right now. Please email info@auslinenandtowels.com.au.';
    } else {
        try {
            $stmt = $pdo->prepare(
                'UPDATE subscribers SET status = \'unsubscribed\'
                 WHERE email = :email AND unsubscribe_token = :token'
            );
            $stmt->execute(['email' => $email, 'token' => $token]);
            // Treat "already unsubscribed" (0 rows) as success too — don't leak validity.
            $done = true;
        } catch (Exception $e) {
            $error = 'We could not process your request right now. Please email info@auslinenandtowels.com.au.';
        }
    }
}
?><!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="robots" content="noindex, nofollow"/>
<title>Unsubscribe — Australian Linen &amp; Towels</title>
<style>
  body{margin:0;font-family:"Inter",-apple-system,Segoe UI,sans-serif;background:#faf8f5;color:#1a1c2e;
       display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
  .card{background:#fff;max-width:440px;width:100%;padding:40px 36px;border-top:3px solid #b8893a;
        box-shadow:0 20px 60px rgba(15,18,53,.10);text-align:center}
  h1{font-family:"Playfair Display",Georgia,serif;font-weight:400;font-size:24px;margin:0 0 14px;color:#1a3a6b}
  p{font-size:14px;line-height:1.65;color:#54576e;margin:0 0 10px}
  a{color:#b8893a}
  .eyebrow{font-family:"JetBrains Mono",monospace;font-size:10px;letter-spacing:.2em;
           text-transform:uppercase;color:#b8893a;margin-bottom:18px}
</style>
</head>
<body>
  <div class="card">
    <div class="eyebrow">Australian Linen &amp; Towels</div>
    <?php if ($done): ?>
      <h1>You've been unsubscribed</h1>
      <p>You won't receive any further marketing emails from us. We're sorry to see you go.</p>
      <p>Changed your mind? <a href="https://auslinenandtowels.com.au/">Re-subscribe on our website.</a></p>
    <?php else: ?>
      <h1>Unsubscribe failed</h1>
      <p><?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></p>
      <p><a href="https://auslinenandtowels.com.au/">Return to homepage</a></p>
    <?php endif; ?>
  </div>
</body>
</html>
