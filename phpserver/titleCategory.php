<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0); // Immediately exit for CORS preflight requests
}

$data = json_decode(file_get_contents('php://input'), true);
$videoTitle = $data['videoTitle'] ?? null;

if (!empty($videoTitle)) {
    $attempt = 0;
    $maxAttempts = 3;
    $response = false;
    $err = '';

    while (!$response && $attempt < $maxAttempts) {
        $attempt++;
        $apiKey = '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'; // Replace with your actual API key
        $url = 'https://api.openai.com/v1/chat/completions';

        $postData = [
            'model' => 'gpt-4',
            'messages' => [
                ['role' => 'system', 'content' => "Tell me the category of this video: coding, animal, or others."],
                ['role' => 'user', 'content' => $videoTitle]
            ]
        ];

        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($postData));
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey
        ]);

        $response = curl_exec($curl);
        if (!$response) {
            $err = curl_error($curl);
        }
        curl_close($curl);

        if ($response === false) {
            continue; // Retry if the response was false
        }

        $responseArray = json_decode($response, true);
        if (isset($responseArray['error'])) {
            $response = false; // Set to false to retry on API error
        }
    }

    if ($response === false) {
        echo 'Failed to connect to the API after several attempts: ' . $err;
    } else {
        $responseArray = json_decode($response, true);
        if (isset($responseArray['error'])) {
            echo 'API error: ' . $responseArray['error']['message'];
        } else {
            $text = $responseArray['choices'][0]['message']['content'] ?? 'Analysis not available';
            echo $text; // Print the analysis result
        }
    }
} else {
    echo 'No video title provided.';
}
?>
