<?php
// header('Access-Control-Allow-Origin: *'); // Adjust as necessary for security
// header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
// header('Access-Control-Allow-Headers: Content-Type');
// header('Content-Type: application/json');

// $input = file_get_contents('php://input');
// $data = json_decode($input, true);

// if (!isset($data['userID']) || !isset($data['videoList'])) {
//     echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
//     exit();
// }

// $userID = $data['userID'];
// $videoList = $data['videoList'];

// // Database credentials
// $servername = "localhost";
// $username = "root";
// $password = "";
// $dbname = "narratordb_test1";
// // include 'db_connect.php';

// $conn = new mysqli($servername, $username, $password, $dbname);
// if ($conn->connect_error) {
//     die("Connection failed: " . $conn->connect_error);
// }

// $insert_success = true;
// foreach ($videoList as $video) {
//     $videoID = $conn->real_escape_string($video['videoID']);
//     $recTitle = $conn->real_escape_string($video['title']);
//     $recURL = $conn->real_escape_string("https://www.youtube.com/watch?v=" . $video['videoID']);
//     $sql = "INSERT INTO recvideo (userID, videoID, recTitle, recURL) VALUES ('$userID', '$videoID', '$recTitle', '$recURL')";
//     if ($conn->query($sql) !== TRUE) {
//         $insert_success = false;
//         break;
//     }
// }

// $conn->close();
// echo json_encode(['status' => $insert_success ? 'success' : 'error', 'message' => $insert_success ? 'Video data saved successfully' : 'Failed to save video data']);


// -----------------------------------------------------------------------

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require 'db_connect.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['userID']) || !isset($data['videoList'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
    exit();
}

$userID = intval($data['userID']);
$videoList = $data['videoList'];

$insert_success = true;
$error_message = '';

foreach ($videoList as $video) {
    $videoID = intval($video['videoID']): 1;
    $recTitle = $conn->real_escape_string($video['title']);
    $recURL = $conn->real_escape_string("https://www.youtube.com/watch?v=" . $video['videoID']);

    $stmt = $conn->prepare("INSERT INTO recvideo (userID, videoID, recTitle, recURL) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iiss", $userID, $videoID, $recTitle, $recURL);

    if (!$stmt->execute()) {
        $insert_success = false;
        $error_message = $stmt->error;
        break;
    }

    $stmt->close();
}

$conn->close();

if ($insert_success) {
    echo json_encode(['status' => 'success', 'message' => 'Video data saved successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to save video data: ' . $error_message]);
}


?>
