<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
//real-login
// session_start();

// $email = $_POST['email'];
// $password = $_POST['password'];
// $link = mysqli_connect('localhost', 'root', '', 'narratordb_test1');
// $sql = "SELECT DISTINCT * FROM user WHERE email='$email' AND password='$password'";
// $result = mysqli_query($link, $sql);

// if ($row = mysqli_fetch_assoc($result)) {
//     $_SESSION['email'] = $row['email'];
//     // Assuming you want to pass the entire row as user details
//     echo json_encode(['message' => 'loginsuccess', 'user' => $row]);
// } else {
//     $message = "account or password is not correct";
//     echo json_encode(['message' => $message]);
// }

session_start();

// Optionally store the posted email in session
if (isset($_POST['email'])) {
    $_SESSION['email'] = $_POST['email'];
}

// Send login success directly
echo json_encode([
    'message' => 'loginsuccess',
    'user' => [
        'email' => $_POST['email'] ?? 'testemail',
        'name' => 'Demo User' // optional dummy data
    ]
]);
?>
