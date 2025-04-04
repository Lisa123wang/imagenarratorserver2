<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 引入数据库连接文件
include 'db_connect.php';

// 准备一条带有虚拟数据的 SQL 插入语句
$videoTitle = "2Test Video Title";
$videoSummary = "2This is a test summary for the video.";
$tags = "2testing";
$videoURL = "https://www.youtube.com/watch?v=9LgyKiq_hU0";
$duration = 360; // 假设持续时间为 120 秒

// 准备 SQL 插入语句
$stmt = $conn->prepare("INSERT INTO `video` (videoTitle, videoSummary, tags, videoURL, duration) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssssi", $videoTitle, $videoSummary, $tags, $videoURL, $duration);

// 执行 SQL 语句并检查是否成功
if ($stmt->execute()) {
    echo "Test record inserted successfully. Video ID: " . $stmt->insert_id;
} else {
    echo "Error inserting test record: " . $stmt->error;
}

// 关闭语句
$stmt->close();

// 关闭数据库连接
$conn->close();
?>
