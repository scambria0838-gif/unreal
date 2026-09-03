<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'POST required']);
  exit;
}

$payload = $_POST;
if ($payload === []) {
  $raw = file_get_contents('php://input');
  $decoded = json_decode($raw, true);
  if (is_array($decoded)) {
    $payload = $decoded;
  }
}

$name = trim((string) ($payload['name'] ?? ''));
$phone = trim((string) ($payload['phone'] ?? ''));
$intent = trim((string) ($payload['intent'] ?? ''));

if ($name === '' || $phone === '' || $intent === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Missing required fields']);
  exit;
}

$leadsDir = __DIR__ . '/leads';
if (!is_dir($leadsDir)) {
  mkdir($leadsDir, 0750, true);
}

$record = [
  'receivedAt' => date('c'),
  'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
  'fields' => $payload,
];

file_put_contents(
  $leadsDir . '/reviews.log',
  json_encode($record, JSON_UNESCAPED_SLASHES) . PHP_EOL,
  FILE_APPEND | LOCK_EX
);

$to = 'review@projectjls.com';
$subject = 'JLS project review — ' . $name;
$lines = [];
foreach ($payload as $key => $value) {
  if (is_scalar($value)) {
    $lines[] = $key . ': ' . $value;
  }
}
$headers = "From: website@projectjls.com\r\nReply-To: " . $phone . "\r\n";
@mail($to, $subject, implode("\n", $lines), $headers);

echo json_encode(['ok' => true]);
