<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve the POST data
    $postData = json_decode(file_get_contents('php://input'), true);
    
    // Check if userEmail is set in the POST data
    if (isset($postData['userEmail'])) {
        // Connect to your database
        $servername = "localhost";
        $username = "root";
        $password = "";
        $dbname = "narratordb_test1";
        
        // Create connection
        $conn = new mysqli($servername, $username, $password, $dbname);
        
        // Check connection
        if ($conn->connect_error) {
            // Handle connection error
            die("Connection failed: " . $conn->connect_error);
        }
        
        // Prepare SQL statement to retrieve userID and userEmail based on userEmail
        $stmt = $conn->prepare("SELECT userID, email FROM user WHERE email = ?");
        $stmt->bind_param("s", $postData['userEmail']);
        
        // Execute SQL statement
        $stmt->execute();
        
        // Bind result variables
        $stmt->bind_result($userID, $userEmail);
        
        // Fetch value
        $stmt->fetch();
        
        // Close statement
        $stmt->close();
        
        // Close connection
        $conn->close();
        
        // Cast userID to integer
        $userID = (int)$userID;
        
        // Prepare response data
        $responseData = array(
            'userID' => $userID,
            'userEmail' => $userEmail
        );
        
        // Send JSON response
        echo json_encode($responseData);
    } else {
        // If userEmail is not set in the POST data
        echo json_encode(array('error' => 'userEmail not provided'));
    }
} else {
    // If request method is not POST
    echo json_encode(array('error' => 'Invalid request method'));
}
?>
