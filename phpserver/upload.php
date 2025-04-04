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

// ✅ Full absolute path to the upload folder (inside phpserver/)
$targetDir = __DIR__ . "/uploads/";
$fileName = time() . '_' . basename($_FILES["image"]["name"]);
$targetFilePath = $targetDir . $fileName;
$fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);

// ✅ Ensure the 'uploads' folder exists
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if (isset($_FILES["image"]["name"]) && !empty($_FILES["image"]["name"])) {
    // ✅ Allow only specific image formats
    $allowTypes = array('jpg', 'png', 'jpeg', 'gif');
    if (in_array(strtolower($fileType), $allowTypes)) {
        // ✅ Move the file to the uploads folder
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFilePath)) {
            // ✅ Make sure it's readable publicly
            chmod($targetFilePath, 0644);

            // ✅ Optional: Log the upload
            file_put_contents(__DIR__ . "/upload-log.txt", "Uploaded: $fileName\n", FILE_APPEND);

            // ✅ Return the public URL
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
