<?php

// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
// header('Access-Control-Allow-Headers: Content-Type');

// // Handle preflight requests for CORS
// if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
//     exit(0);
// }

// $data = json_decode(file_get_contents('php://input'), true);
// $imageUrl = $data['imageUrl'] ?? null;
// $language = $data['language'] ?? 'en'; // Default to English if no language is set

// if (!empty($imageUrl)) {
//     $attempt = 0;
//     $maxAttempts = 50;
//     $response = false;
//     $err = '';

//     while (!$response && $attempt < $maxAttempts) {
//         $attempt++;
//         sleep(1); // Wait for 3 seconds before each retry

//         $apiKey = getenv('API_KEY');

//         $url = 'https://api.openai.com/v1/chat/completions';

//         // Adjust the prompt based on the language
//         $promptText = $language === 'fr' ? 
//             "si cette image concerne le codage, convertissez le code de l'image en un format exécutable avec le résultat. S'il n'y a pas de code dans cette image, relayer simplement le texte de l'image." :
//             "if this image is about coding, convert the image's code to executable format with output. If there's no code in this image, simply relay the image's text.";

//         $postData = [
//             'model' => 'gpt-4o',
//             'messages' => [
//                 [
//                     'role' => 'user',
//                     'content' => [
//                         ['type' => 'text', 'text' => $promptText],
//                         ['type' => 'image_url', 'image_url' => ['url' => $imageUrl]],
//                     ],
//                 ],
//             ],
//         ];

//         $curl = curl_init($url);
//         curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
//         curl_setopt($curl, CURLOPT_POST, true);
//         curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($postData));
//         curl_setopt($curl, CURLOPT_HTTPHEADER, [
//             'Content-Type: application/json',
//             'Authorization: Bearer ' . $apiKey
//         ]);
//         curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 10); // Set connection timeout
//         curl_setopt($curl, CURLOPT_TIMEOUT, 30); // Set response timeout
//         curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true); // Enable SSL verification

//         $response = curl_exec($curl);
//         if (!$response) {
//             $err = curl_error($curl); // Capture curl error
//         }
//         curl_close($curl);

//         if ($response === false) {
//             continue; // Retry if the response was false
//         }

//         $responseArray = json_decode($response, true);
//         if (isset($responseArray['error'])) {
//             $response = false; // Set to false to retry on API error
//         }
//     }

//     if ($response === false) {
//         echo 'Failed to connect to the API after several attempts: ' . $err;
//     } else {
//         $responseArray = json_decode($response, true);
//         if (isset($responseArray['error'])) {
//             echo 'API returned an error: ' . $responseArray['error']['message'];
//         } else {
//             $description = $responseArray['choices'][0]['message']['content'] ?? 'Description not available';
//             echo $description; // Output the plain text result
//         }
//     }
// } else {
//     echo 'No image URL provided.';
// }


header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents('php://input'), true);
$imageUrl = $data['imageUrl'] ?? null;
$language = $data['language'] ?? 'en'; // Default to English if no language is set

if (!empty($imageUrl)) {
    $attempt = 0;
    $maxAttempts = 50;
    $response = false;
    $err = '';
    $httpInfo = [];

    while (!$response && $attempt < $maxAttempts) {
        $attempt++;
        sleep(1); // Wait for 1 second before each retry

        $apiKey = getenv('API_KEY');
        if (!$apiKey) {
            echo "❌ Missing API_KEY environment variable.";
            exit;
        }

        $url = 'https://api.openai.com/v1/chat/completions';

        $promptText = $language === 'fr'
            ? "si cette image concerne le codage, convertissez le code de l'image en un format exécutable avec le résultat. S'il n'y a pas de code dans cette image, relayer simplement le texte de l'image."
            : "if this image is about coding, convert the image's code to executable format with output. If there's no code in this image, simply relay the image's text.";

        $postData = [
            'model' => 'gpt-4o',
            'messages' => [
                [
                    'role' => 'user',
                    'content' => [
                        ['type' => 'text', 'text' => $promptText],
                        ['type' => 'image_url', 'image_url' => ['url' => $imageUrl]],
                    ],
                ],
            ],
        ];

        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($postData));
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey
        ]);
        curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($curl, CURLOPT_TIMEOUT, 30);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);

        $response = curl_exec($curl);
        $httpInfo = curl_getinfo($curl);
        if (!$response) {
            $err = curl_error($curl);
        }
        curl_close($curl);

        if ($response === false) {
            continue; // Retry
        }

        $responseArray = json_decode($response, true);
        if (isset($responseArray['error'])) {
            $response = false; // Retry
        }
    }

    if ($response === false) {
        echo "❌ Failed to connect to the API after {$attempt} attempts.\n";
        echo "🔧 Last CURL error: {$err}\n";
        echo "📡 HTTP Info:\n";
        print_r($httpInfo);
    } else {
        $responseArray = json_decode($response, true);
        if (isset($responseArray['error'])) {
            echo '❌ API returned an error: ' . $responseArray['error']['message'] . "\n";
            echo "🧾 Full API Response:\n";
            print_r($responseArray);
        } else {
            $description = $responseArray['choices'][0]['message']['content'] ?? 'Description not available';
            echo $description;
        }
    }
} else {
    echo '⚠️ No image URL provided.';
}


?>
