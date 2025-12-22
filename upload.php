<?php

// Temporäre Datei vom Upload
$tmp  = $_FILES['file']['tmp_name'];

// Original Dateiname, zum Beispiel recording.wav
$name = $_FILES['file']['name'];

// Datei aus dem temporären Ordner
// in den Ordner von upload.php verschieben
move_uploaded_file($tmp, __DIR__ . '/recordings/' . $name);


// Antwort an den Browser schicken
echo "OK";