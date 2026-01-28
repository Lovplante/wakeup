<?php
header('Content-Type: application/json');

if (!file_exists("stateA.json")) {
    echo json_encode(["mood" => null]);
    exit;
}

echo file_get_contents("stateA.json");
?>
