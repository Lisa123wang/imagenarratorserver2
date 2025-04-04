<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

include 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $videoTitle = isset($_POST['videoTitle']) ? $_POST['videoTitle'] : '';
    $videoURL = isset($_POST['videoURL']) ? $_POST['videoURL'] : '';
    $tags = isset($_POST['tags']) ? $_POST['tags'] : '';
    $videoSummary = isset($_POST['videoSummary']) ? $_POST['videoSummary'] : '';
    $duration = isset($_POST['duration']) ? intval($_POST['duration']) : 0;
    $userID = isset($_POST['userID']) ? intval($_POST['userID']) : 1; // Default user ID

    // Decode JSON string to PHP array
    $videoList = isset($_POST['videoList']) ? json_decode($_POST['videoList'], true) : [];

    $checkStmt = $conn->prepare("SELECT COUNT(*) FROM video WHERE videoTitle = ? AND userID = ?");
    $checkStmt->bind_param("si", $videoTitle, $userID);
    $checkStmt->execute();
    $checkStmt->bind_result($count);
    $checkStmt->fetch();
    $checkStmt->close();

    if ($count > 0) {
        echo json_encode(['success' => false, 'message' => 'Video already exists']);
    } else {
        $stmt = $conn->prepare("INSERT INTO video (videoTitle, videoSummary, tags, videoURL, duration, userID) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssii", $videoTitle, $videoSummary, $tags, $videoURL, $duration, $userID);
        
        if ($stmt->execute()) {
            // Get the last inserted video ID
            $lastInsertedId = $conn->insert_id;

            echo json_encode(['success' => true, 'message' => 'Video data saved successfully']);

            // Prepare statement for inserting video list with URL
            $videoListStmt = $conn->prepare("INSERT INTO recvideo (recTitle, recURL, videoID, userID) VALUES (?, ?, ?, ?)");
            foreach ($videoList as $video) {
                $videoListStmt->bind_param("ssii", $video['title'], $video['url'], $lastInsertedId, $userID);
                $videoListStmt->execute();
            }
            $videoListStmt->close();
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to save video data: ' . $stmt->error]);
        }

        $stmt->close();
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

$conn->close();
?>
