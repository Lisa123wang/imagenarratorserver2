<?php
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
// header('Access-Control-Allow-Headers: Content-Type');
// $targetDir = "C:/xampp/htdocs/YTplugin/openai-chatgpt-chrome-extension-main/uploads/"; // Absolute path
// $fileName = time() . '_' . basename($_FILES["image"]["name"]);
// $targetFilePath = $targetDir . $fileName;
// $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);

// if(isset($_POST) && !empty($_FILES["image"]["name"])){
//     // Allow certain file formats
//     $allowTypes = array('jpg','png','jpeg','gif');
//     if(in_array($fileType, $allowTypes)){
//         // Upload file to the server
//         if(move_uploaded_file($_FILES["image"]["tmp_name"], $targetFilePath)){
//             echo "https://imagenarratorserver2-1.onrender.com/uploads/" . $fileName;
//         }else{
//             echo "Sorry, there was an error uploading your file.";
//         }
//     }else{
//         echo "Sorry, only JPG, JPEG, PNG, & GIF files are allowed to upload.";
//     }
// }else{
//     echo "Please select a file to upload.";
// }

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Folder inside phpserver/
$targetDir = "uploads/";
$fileName = time() . '_' . basename($_FILES["image"]["name"]);
$targetFilePath = $targetDir . $fileName;
$fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);

// ✅ Make sure the uploads folder exists
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if (isset($_FILES["image"]["name"]) && !empty($_FILES["image"]["name"])) {
    // Allow only specific file formats
    $allowTypes = array('jpg', 'png', 'jpeg', 'gif');
    if (in_array(strtolower($fileType), $allowTypes)) {
        // ✅ Upload the file
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFilePath)) {
            // ✅ Optional: Log the upload (for testing)
            file_put_contents("upload-log.txt", "Uploaded: $targetFilePath\n", FILE_APPEND);

            // Return the public URL
            echo "https://imagenarratorserver2-1.onrender.com/uploads/" . $fileName;
        } else {
            echo "Sorry, there was an error uploading your file.";
        }
    } else {
        echo "Sorry, only JPG, JPEG, PNG, & GIF files are allowed to upload.";
    }
} else {
    echo "Please select a file to upload.";
}
?>
