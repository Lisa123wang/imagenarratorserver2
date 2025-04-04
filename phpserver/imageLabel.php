<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests for CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Decode JSON from the request body
$data = json_decode(file_get_contents('php://input'), true);
$imageUrl = $data['imageUrl'] ?? null;
$language = $data['language'] ?? 'en'; // Default to English if no language is set

if (!empty($imageUrl)) {
    $attempt = 0;
    $maxAttempts = 30;
    $response = false;
    $err = '';

    while (!$response && $attempt < $maxAttempts) {
        $attempt++;
        sleep(3); // Delay before retries

        $apiKey = getenv('API_KEY');

        $url = 'https://api.openai.com/v1/chat/completions';

        // Adjust the prompt based on the language
        $promptText = $language === 'fr' ? 
            "Dites-moi la catégorie de cette vidéo parmi la liste suivante : 
            'Python', 'Langage C', 'C++', 'C#', 'JavaScript', 'Java', 'HTML & CSS', 
            'Science', 'Économie', 'Sciences sociales', 'Humanités', 'Mathématiques', 
            'Technologie', 'Langues', 'Compétences commerciales', 'Compétences créatives', 'Santé et bien-être', 'Autres'.
            Je veux seulement une réponse d'un mot, comme 'Mathématiques', n'incluez pas d'apostrophe." :
            "Tell me the category of this video from below category list: 
            'Python', 'C Language', 'C++', 'C#', 'JavaScript', 'Java', 'HTML & CSS', 
            'Science', 'Economics', 'Social Sciences', 'Humanities', 'Mathematics', 
            'Technology', 'Languages', 'Business Skills', 'Creative Skills', 'Health and Wellness', 'Others'.
            I only want one word response, like 'Mathematics', do not include apostrophe.";

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
            curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 10); // Set connection timeout
            curl_setopt($curl, CURLOPT_TIMEOUT, 30); // Set response timeout
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true); // Enable SSL verification
    
            $response = curl_exec($curl);
            if (!$response) {
                $err = curl_error($curl); // Capture curl error
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
                echo 'API returned an error: ' . $responseArray['error']['message'];
            } else {
                $description = $responseArray['choices'][0]['message']['content'] ?? 'Description not available';
                echo $description; // Output the plain text result
            }
        }
    } else {
        echo 'No image URL provided.';
    }
?>