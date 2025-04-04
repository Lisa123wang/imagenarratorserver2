<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.openai.com/");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);

if ($response) {
    echo "✅ Can connect to OpenAI";
} else {
    echo "❌ Cannot connect to OpenAI: " . $error;
}
?>
