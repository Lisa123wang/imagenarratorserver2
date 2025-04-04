<?php
header('Access-Control-Allow-Origin: *'); // Adjust as necessary for security
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$host = 'localhost';
$dbname = 'narratordb_test1';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_PERSISTENT => true // Optional: Enables persistent connections
    ]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Could not connect to the database: " . $e->getMessage()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $jsonData = file_get_contents("php://input");
    $data = json_decode($jsonData, true);

    if ($data) {
        $selectSql = "SELECT videoID FROM video WHERE videoTitle = :videoTitle AND userID = :userID";
        $selectStmt = $pdo->prepare($selectSql);
        $selectStmt->bindParam(':videoTitle', $data['videoTitle']);
        $selectStmt->bindParam(':userID', $data['userID']);
        $selectStmt->execute();
        $videoID = $selectStmt->fetchColumn();

        if ($videoID) {
            $sql = "INSERT INTO imagerecognition (videoID, videoTimestamp, OCRText, imagedescription, aiquestion, userID, dateCreated)
                    VALUES (:videoID, :currentTime, :textDetection, :imageCaption, :exercise, :userID, NOW())";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':videoID', $videoID);
            $stmt->bindParam(':currentTime', $data['currentTime']);
            $stmt->bindParam(':textDetection', $data['textDetection']);
            $stmt->bindParam(':imageCaption', $data['imageCaption']);
            $stmt->bindParam(':exercise', $data['exercise']);
            $stmt->bindParam(':userID', $data['userID']);

            // Update the tag data in video table
            $updateSql = "UPDATE video SET tags = :imageCategory WHERE videoID = :videoID AND userID = :userID";
            $updateStmt = $pdo->prepare($updateSql);
            $updateStmt->bindParam(':imageCategory', $data['label']);
            $updateStmt->bindParam(':videoID', $videoID);
            $updateStmt->bindParam(':userID', $data['userID']);

            try {
                $pdo->beginTransaction(); // Start transaction
                $stmt->execute();
                $updateStmt->execute();
                $pdo->commit(); // Commit transaction
                echo json_encode(["status" => "success", "message" => "Data inserted and tag updated successfully."]);
            } catch (PDOException $e) {
                $pdo->rollBack(); // Roll back transaction on error
                echo json_encode(["status" => "error", "message" => "Error during database operation: " . $e->getMessage()]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Video title not found for given user ID."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Error: No valid JSON data received or data is malformed."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Error: This endpoint accepts only POST requests."]);
}
?>
