<?php
// no whitespace before <?php
header('Content-Type: application/json');

// read raw POST body
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// validate
if (!isset($data['mood']) || !in_array($data['mood'], [0, 1, 2])) {
    http_response_code(400);
    echo json_encode(["error"=>"Invalid mood"]);
    exit;
}

// write mood to JSON file
file_put_contents(__DIR__ . '/stateA.json', json_encode([
    "mood" => $data['mood'],
    "updatedAt" => time()
], JSON_PRETTY_PRINT));

// send response
echo json_encode(["status"=>"ok"]);
