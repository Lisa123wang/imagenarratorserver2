

  
//login
chrome.storage.local.get('userEmail', (result) => {
    if (!result.userEmail) {
        chrome.runtime.openOptionsPage();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        fetch('https://imagenarratorserver2-1.onrender.com/login.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                // Save the email and language to Chrome storage
                chrome.storage.local.set({'userEmail': data.user.email}, function() {
                    // Get the language setting from Chrome storage
                    chrome.storage.local.get('language', function(storageData) {
                        const language = storageData.language || 'en'; // Default to English if no language is set
                        const loginSuccessMessage = (language === 'fr') ? 'Connexion réussie, vous pouvez utiliser l\'extension maintenant.' : 'Login successful, you can use the extension now.';
                        const loginErrorMessage = (language === 'fr') ? 'Compte ou mot de passe incorrect' : 'Account or password not correct';

                        alert(loginSuccessMessage);
                        chrome.tabs.create({url: "https://www.youtube.com/"});
                    });
                });
            } else {
                chrome.storage.local.get('language', function(storageData) {
                    const language = storageData.language || 'en'; // Default to English if no language is set
                    const loginErrorMessage = (language === 'fr') ? 'Compte ou mot de passe incorrect' : 'Account or password not correct';
                    
                    alert(loginErrorMessage);
                });
            }
        })
        .catch(error => {
            chrome.storage.local.get('language', function(storageData) {
                const language = storageData.language || 'en'; // Default to English if no language is set
                const errorMessage = (language === 'fr') ? 'Erreur: ' : 'Error: ';
                document.getElementById('message').textContent = (language === 'fr') ? 'Échec de la connexion: ' + error.message : 'Login failed: ' + error.message;
                alert(errorMessage + error.message);
            });
        });
    });
});


//language
// Sets the default language to English if nothing is stored
chrome.storage.local.get('language', function(data) {
    if (data.language) {
        document.getElementById('languageSelect').value = data.language;
        changeLanguage();
    } else {
        chrome.storage.local.set({'language': 'en'});
        document.getElementById('languageSelect').value = 'en';
        changeLanguage();
    }
});

function changeLanguage() {
    const languageSelect = document.getElementById('languageSelect');
    const language = languageSelect.value;
    const emailLabel = document.getElementById('emailLabel');
    const passwordLabel = document.getElementById('passwordLabel');

    // Update labels based on selected language
    if (language === 'fr') {
        emailLabel.textContent = 'Courriel:';
        passwordLabel.textContent = 'Mot de passe:';
    } else {
        emailLabel.textContent = 'Email:';
        passwordLabel.textContent = 'Password:';
    }

    // Save the selected language to chrome.storage
    chrome.storage.local.set({'language': language});
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('languageSelect').addEventListener('change', changeLanguage);
});







'use strict';

var activePBRButton;
var screenshotKey = false;
var playbackSpeedButtons = false;
var screenshotFunctionality = 0;
var screenshotFormat = "png";
var extension = 'png';




function formatTime(timeInSeconds) {
	const pad = (num) => (num < 10 ? '0' : '') + num;
	let hours = Math.floor(timeInSeconds / 3600);
	let minutes = Math.floor((timeInSeconds % 3600) / 60);
	let seconds = Math.floor(timeInSeconds % 60);

	return `${pad(hours)}-${pad(minutes)}-${pad(seconds)}`;
}

//original login and capturescreenshot
// function CaptureScreenshot() {
//     chrome.storage.local.get(['userEmail', 'language'], (result) => {
//         const userEmail = result.userEmail;
//         const language = result.language || 'en'; // Default to English if no language is set

//         if (!userEmail) {
//             alert((language === 'fr') ? "L'utilisateur n'est pas connecté. Veuillez vous connecter d'abord pour prendre une capture d'écran." : "User is not logged in. Please login first to take a screenshot.");
//             chrome.runtime.sendMessage({ action: "openOptionsPage" });
//             return;
//         }

//         fetch('https://imagenarratorserver2-1.onrender.com/server/getUserID.php', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ userEmail })
//         })
//         .then(response => response.json())
//         .then(data => {
//             const userID = data.userID;

//             const player = document.querySelector('video');
//             if (!player) {
//                 console.log("No video player found.");
//                 return;
//             }

//             updateScreenshotContainer(); // Prepare or ensure the container is ready.

//             const canvas = document.createElement('canvas');
//             canvas.width = player.videoWidth;
//             canvas.height = player.videoHeight;
//             const ctx = canvas.getContext('2d');

//             ctx.fillStyle = '#FFFFFF'; // White background.
//             ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas.
//             ctx.drawImage(player, 0, 0, canvas.width, canvas.height); // Draw the video frame onto the canvas.

//             const dataURL = canvas.toDataURL('image/png');
//             const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
//             const container = document.getElementById('customScreenshotContainer');
//             const imgWrapper = document.createElement('div');
//             imgWrapper.style.marginBottom = '20px';
//             container.appendChild(imgWrapper);

//             const currentTime = formatTime(player.currentTime);
//             const formattedTime = Math.floor(player.currentTime);

//             const timeText = document.createElement('a');
//             timeText.href = '#';
//             timeText.innerText = (language === 'fr') ? "Temps: " + currentTime : "Time: " + currentTime;
//             timeText.style.color = 'white';
//             timeText.style.textAlign = 'left';
//             timeText.setAttribute('role', 'button'); // Add ARIA role for screen reader
//             timeText.setAttribute('aria-label', (language === 'fr') ? 'Aller au temps: ' + currentTime : 'Jump to time: ' + currentTime); // Add ARIA label for screen reader
//             timeText.setAttribute('tabindex', '0'); // Make the element focusable
//             imgWrapper.appendChild(timeText);

//             timeText.addEventListener('click', function (event) {
//                 event.preventDefault();
//                 player.currentTime = formattedTime;
//             });

//             const img = new Image();
//             img.src = "data:image/png;base64," + base64Data;
//             img.style.maxWidth = '100%';
//             img.style.display = 'block';
//             img.style.cursor = 'pointer';
//             imgWrapper.appendChild(img);

//             const loadingMessage = document.createElement('p');
//             loadingMessage.innerText = (language === 'fr') ? "Veuillez patienter un moment, l'image est en cours de reconnaissance..." : "Please wait for a while, the image is being recognized...";
//             loadingMessage.style.color = 'white';
//             container.appendChild(loadingMessage);  // Display the loading message

//             canvas.toBlob(function (blob) {
//                 const formData = new FormData();
//                 formData.append('image', blob, 'screenshot.png');
//                 formData.append('language', language); // Append language to form data

//                 fetch('https://imagenarratorserver2-1.onrender.com/upload.php', {
//                     method: 'POST',
//                     body: formData
//                 })
//                 .then(response => response.text())
//                 .then(imageUrl => {
//                     const imageUrlDisplay = document.createElement('p');
//                     imageUrlDisplay.style.color = 'white';
//                     imageUrlDisplay.innerText = (language === 'fr') ? "URL de l'image: " + imageUrl : "Image URL: " + imageUrl;
//                     imgWrapper.appendChild(imageUrlDisplay);

//                     // Return the imageUrl for the next steps
//                     return imageUrl;
//                 })
//                 .then(imageUrl => {
//                     const promises = [
//                         fetch('https://imagenarratorserver2-1.onrender.com/imageToText.php', {
//                             method: 'POST',
//                             body: JSON.stringify({ imageUrl, language }), // Include language in request
//                             headers: { 'Content-Type': 'application/json' }
//                         }).then(response => response.text()),

//                         fetch('https://imagenarratorserver2-1.onrender.com/imageCaption.php', {
//                             method: 'POST',
//                             body: JSON.stringify({ imageUrl, language }), // Include language in request
//                             headers: { 'Content-Type': 'application/json' }
//                         }).then(response => response.text()),

//                         fetch('https://imagenarratorserver2-1.onrender.com/imageExercise.php', {
//                             method: 'POST',
//                             body: JSON.stringify({ imageUrl, language }), // Include language in request
//                             headers: { 'Content-Type': 'application/json' }
//                         }).then(response => response.text()),

//                         fetch('https://imagenarratorserver2-1.onrender.com/imageLabel.php', {
//                             method: 'POST',
//                             body: JSON.stringify({ imageUrl, language }), // Include language in request
//                             headers: { 'Content-Type': 'application/json' }
//                         }).then(response => response.text())
//                     ];

//                     return Promise.all(promises).then(([textResponse, captionResponse, imageExerciseResponse, imageCategoryResponse]) => {
//                         container.removeChild(loadingMessage);

//                         const textApiResponseDisplay = document.createElement('div');
//                         textApiResponseDisplay.innerText = (language === 'fr') ? "Détection de texte \n: " + textResponse : "Text Detection \n: " + textResponse;
//                         textApiResponseDisplay.style.color = 'white';
//                         imgWrapper.appendChild(textApiResponseDisplay);

//                         const captionApiResponseDisplay = document.createElement('div');
//                         captionApiResponseDisplay.innerText = (language === 'fr') ? "Légende de l'image \n: " + captionResponse : "Image Caption \n: " + captionResponse;
//                         captionApiResponseDisplay.style.color = 'yellow';
//                         imgWrapper.appendChild(captionApiResponseDisplay);

//                         const imageExerciseApiResponseDisplay = document.createElement('div');
//                         imageExerciseApiResponseDisplay.innerText = (language === 'fr') ? "Exercice d'image \n: " + imageExerciseResponse : "Image Exercise \n: " + imageExerciseResponse;
//                         imageExerciseApiResponseDisplay.style.color = 'lightgreen';
//                         imgWrapper.appendChild(imageExerciseApiResponseDisplay);

//                         const imageCategoryApiResponseDisplay = document.createElement('div');
//                         imageCategoryApiResponseDisplay.innerText = (language === 'fr') ? "Étiquette d'image \n: " + imageCategoryResponse : "Image Label \n: " + imageCategoryResponse;
//                         imageCategoryApiResponseDisplay.style.color = 'pink';
//                         imgWrapper.appendChild(imageCategoryApiResponseDisplay);

//                         // Aggregating video and image analysis data
//                         const videodata = {
//                             videoTitle: getVideoTitle(), // Assuming getVideoTitle() fetches video title
//                             videoUrl: window.location.href,
//                             currentTime: currentTime,
//                             textDetection: textResponse,
//                             imageCaption: captionResponse,
//                             exercise: imageExerciseResponse,
//                             label: imageCategoryResponse,
//                             userID: userID, // Include the userID in the data being sent
//                             language: language // Include the language in the data being sent
//                         };

//                         // Send aggregated data to another HTTP PHP server
//                         fetch('https://imagenarratorserver2-1.onrender.com/server/save_imagerecognition.php', {
//                             method: 'POST',
//                             headers: { 'Content-Type': 'application/json' },
//                             body: JSON.stringify(videodata)
//                         })
//                         .then(response => response.json())
//                         .then(data => {
//                             console.log('Data sent to server and processed:', data);
//                         })
//                         .catch(error => {
//                             console.log('Failed to send data to the server:', error);
//                         });
//                         // Now combine question asking functionality
//                         addQuestionFunctionality(imageUrl, imgWrapper, language, currentTime, userID);
//                         // // Adding the question input for users to ask about the image
//                         // const questionInput = document.createElement('textarea');
//                         // questionInput.placeholder = (language === 'fr') ? "Entrez votre question ici..." : "Enter your question here...";
//                         // questionInput.style.width = '100%';
//                         // questionInput.style.height = '50px';
//                         // imgWrapper.appendChild(questionInput);

//                         // const submitButton = document.createElement('button');
//                         // submitButton.innerText = (language === 'fr') ? "Poser la question" : "Ask Question";
//                         // imgWrapper.appendChild(submitButton);

//                         // // Submit question with image URL
//                         // submitButton.addEventListener('click', function () {
//                         //     const question = questionInput.value;
                        
//                         //     if (!question) {
//                         //         alert((language === 'fr') ? "Veuillez entrer une question." : "Please enter a question.");
//                         //         return;
//                         //     }
                        
//                         //     fetch('https://imagenarratorserver2-1.onrender.com/upload_question.php', {
//                         //         method: 'POST',
//                         //         headers: { 'Content-Type': 'application/json' },
//                         //         body: JSON.stringify({
//                         //             imageUrl: imageUrl, // Send the imageUrl obtained after upload
//                         //             question: question // Send the user's question (no need for language)
//                         //         })
//                         //     })
//                         //     .then(response => response.text())  // Use .text() instead of .json()
//                         //     .then(answer => {
//                         //         const responseMessage = document.createElement('p');
//                         //         responseMessage.innerText = (language === 'fr') ? "Réponse: " + answer : "Answer: " + answer;
//                         //         responseMessage.style.color = 'white';  // Set text color to white
//                         //         imgWrapper.appendChild(responseMessage);
//                         //         // Adding the question input for users to ask about the image
//                         //         const questionInput = document.createElement('textarea');
//                         //         questionInput.placeholder = (language === 'fr') ? "Entrez votre question ici..." : "Enter your question here...";
//                         //         questionInput.style.width = '100%';
//                         //         questionInput.style.height = '50px';
//                         //         imgWrapper.appendChild(questionInput);

//                         //         const submitButton = document.createElement('button');
//                         //         submitButton.innerText = (language === 'fr') ? "Poser la question" : "Ask Question";
//                         //         imgWrapper.appendChild(submitButton);
//                         //             })
//                         //     .catch(error => {
//                         //         console.log('Failed to send question and image URL to the server:', error);
//                         //         const errorMessage = document.createElement('p');
//                         //         errorMessage.innerText = (language === 'fr') ? 'Le processus a échoué: ' + error.message : 'Process failed: ' + error.message;
//                         //         responseMessage.style.color = 'white';  // Set text color to white
//                         //         errorMessage.style.color = 'red';
//                         //         imgWrapper.appendChild(errorMessage);
//                         //     });
//                         // });
                        
                        
//                     });
//                 })
//                 .catch(error => {
//                     console.log('Error:', error);
//                     const responseText = document.createElement('p');
//                     responseText.innerText = (language === 'fr') ? 'Le processus a échoué: ' + error.message : 'Process failed: ' + error.message;
//                     responseText.style.color = 'red';
//                     imgWrapper.appendChild(responseText);
//                 });
//             }, 'image/png');
//         })
//         .catch(error => {
//             console.log('Failed to fetch userID:', error);
//         });
//     });
// }
function CaptureScreenshot() {
    chrome.storage.local.get(['userEmail', 'language'], (result) => {
        const userEmail = result.userEmail;
        const language = result.language || 'en'; // Default to English if no language is set

        if (!userEmail) {
            alert((language === 'fr') ? "L'utilisateur n'est pas connecté. Veuillez vous connecter d'abord pour prendre une capture d'écran." : "User is not logged in. Please login first to take a screenshot.");
            chrome.runtime.sendMessage({ action: "openOptionsPage" });
            return;
        }

        const player = document.querySelector('video');
        if (!player) {
            console.log("No video player found.");
            return;
        }

        updateScreenshotContainer(); // Prepare or ensure the container is ready.

        const canvas = document.createElement('canvas');
        canvas.width = player.videoWidth;
        canvas.height = player.videoHeight;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#FFFFFF'; // White background.
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas.
        ctx.drawImage(player, 0, 0, canvas.width, canvas.height); // Draw the video frame onto the canvas.

        const dataURL = canvas.toDataURL('image/png');
        const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
        const container = document.getElementById('customScreenshotContainer');
        const imgWrapper = document.createElement('div');
        imgWrapper.style.marginBottom = '20px';
        container.appendChild(imgWrapper);

        const currentTime = formatTime(player.currentTime);
        const formattedTime = Math.floor(player.currentTime);

        const timeText = document.createElement('a');
        timeText.href = '#';
        timeText.innerText = (language === 'fr') ? "Temps: " + currentTime : "Time: " + currentTime;
        timeText.style.color = 'white';
        timeText.style.textAlign = 'left';
        timeText.setAttribute('role', 'button');
        timeText.setAttribute('aria-label', (language === 'fr') ? 'Aller au temps: ' + currentTime : 'Jump to time: ' + currentTime);
        timeText.setAttribute('tabindex', '0');
        imgWrapper.appendChild(timeText);

        timeText.addEventListener('click', function (event) {
            event.preventDefault();
            player.currentTime = formattedTime;
        });

        const img = new Image();
        img.src = "data:image/png;base64," + base64Data;
        img.style.maxWidth = '100%';
        img.style.display = 'block';
        img.style.cursor = 'pointer';
        imgWrapper.appendChild(img);

        const loadingMessage = document.createElement('p');
        loadingMessage.innerText = (language === 'fr') ? "Veuillez patienter un moment, l'image est en cours de reconnaissance..." : "Please wait for a while, the image is being recognized...";
        loadingMessage.style.color = 'white';
        container.appendChild(loadingMessage);

        canvas.toBlob(function (blob) {
            const formData = new FormData();
            formData.append('image', blob, 'screenshot.png');
            formData.append('language', language);

            fetch('https://imagenarratorserver2-1.onrender.com/upload.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(imageUrl => {
                const imageUrlDisplay = document.createElement('p');
                imageUrlDisplay.style.color = 'white';
                imageUrlDisplay.innerText = (language === 'fr') ? "URL de l'image: " + imageUrl : "Image URL: " + imageUrl;
                imgWrapper.appendChild(imageUrlDisplay);

                return imageUrl;
            })
            .then(imageUrl => {
                const promises = [
                    fetch('https://imagenarratorserver2-1.onrender.com/imageToText.php', {
                        method: 'POST',
                        body: JSON.stringify({ imageUrl, language }),
                        headers: { 'Content-Type': 'application/json' }
                    }).then(res => res.text()),

                    fetch('https://imagenarratorserver2-1.onrender.com/imageCaption.php', {
                        method: 'POST',
                        body: JSON.stringify({ imageUrl, language }),
                        headers: { 'Content-Type': 'application/json' }
                    }).then(res => res.text()),

                    fetch('https://imagenarratorserver2-1.onrender.com/imageExercise.php', {
                        method: 'POST',
                        body: JSON.stringify({ imageUrl, language }),
                        headers: { 'Content-Type': 'application/json' }
                    }).then(res => res.text()),

                    fetch('https://imagenarratorserver2-1.onrender.com/imageLabel.php', {
                        method: 'POST',
                        body: JSON.stringify({ imageUrl, language }),
                        headers: { 'Content-Type': 'application/json' }
                    }).then(res => res.text())
                ];

                return Promise.all(promises).then(([textResponse, captionResponse, imageExerciseResponse, imageCategoryResponse]) => {
                    container.removeChild(loadingMessage);

                    const textApiResponseDisplay = document.createElement('div');
                    textApiResponseDisplay.innerText = (language === 'fr') ? "Détection de texte \n: " + textResponse : "Text Detection \n: " + textResponse;
                    textApiResponseDisplay.style.color = 'white';
                    imgWrapper.appendChild(textApiResponseDisplay);

                    const captionApiResponseDisplay = document.createElement('div');
                    captionApiResponseDisplay.innerText = (language === 'fr') ? "Légende de l'image \n: " + captionResponse : "Image Caption \n: " + captionResponse;
                    captionApiResponseDisplay.style.color = 'yellow';
                    imgWrapper.appendChild(captionApiResponseDisplay);

                    const imageExerciseApiResponseDisplay = document.createElement('div');
                    imageExerciseApiResponseDisplay.innerText = (language === 'fr') ? "Exercice d'image \n: " + imageExerciseResponse : "Image Exercise \n: " + imageExerciseResponse;
                    imageExerciseApiResponseDisplay.style.color = 'lightgreen';
                    imgWrapper.appendChild(imageExerciseApiResponseDisplay);

                    const imageCategoryApiResponseDisplay = document.createElement('div');
                    imageCategoryApiResponseDisplay.innerText = (language === 'fr') ? "Étiquette d'image \n: " + imageCategoryResponse : "Image Label \n: " + imageCategoryResponse;
                    imageCategoryApiResponseDisplay.style.color = 'pink';
                    imgWrapper.appendChild(imageCategoryApiResponseDisplay);

                    const videodata = {
                        videoTitle: getVideoTitle(),
                        videoUrl: window.location.href,
                        currentTime: currentTime,
                        textDetection: textResponse,
                        imageCaption: captionResponse,
                        exercise: imageExerciseResponse,
                        label: imageCategoryResponse,
                        language: language
                    };

                    fetch('https://imagenarratorserver2-1.onrender.com/server/save_imagerecognition.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(videodata)
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Data sent to server and processed:', data);
                    })
                    .catch(error => {
                        console.log('Failed to send data to the server:', error);
                    });

                    addQuestionFunctionality(imageUrl, imgWrapper, language, currentTime);
                });
            })
            .catch(error => {
                console.log('Error:', error);
                const responseText = document.createElement('p');
                responseText.innerText = (language === 'fr') ? 'Le processus a échoué: ' + error.message : 'Process failed: ' + error.message;
                responseText.style.color = 'red';
                imgWrapper.appendChild(responseText);
            });
        }, 'image/png');
    });
}


function addQuestionFunctionality(imageUrl, imgWrapper, language, userID) {
    const createQuestionArea = () => {
        // Creating the question input and submit button
        const questionInput = document.createElement('textarea');
        questionInput.placeholder = (language === 'fr') ? "Entrez votre question ici..." : "Enter your question here...";
        questionInput.style.width = '100%';
        questionInput.style.height = '50px';
        imgWrapper.appendChild(questionInput);

        const submitButton = document.createElement('button');
        submitButton.innerText = (language === 'fr') ? "Poser la question" : "Ask Question";
        imgWrapper.appendChild(submitButton);

        // Submit question with image URL
        submitButton.addEventListener('click', function () {
            const question = questionInput.value;

            if (!question) {
                alert((language === 'fr') ? "Veuillez entrer une question." : "Please enter a question.");
                return;
            }

            fetch('https://imagenarratorserver2-1.onrender.com/upload_question.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: imageUrl, // Send the imageUrl obtained after upload
                    question: question // Send the user's question (no need for language)
                })
            })
            .then(response => response.text())  // Use .text() instead of .json()
            .then(answer => {
                const responseMessage = document.createElement('p');
                responseMessage.innerText = (language === 'fr') ? "Réponse: " + answer : "Answer: " + answer;
                responseMessage.style.color = 'white';  // Set text color to white
                imgWrapper.appendChild(responseMessage);

                // Append a new ask question area after receiving the response
                createQuestionArea();
            })
            .catch(error => {
                console.log('Failed to send question and image URL to the server:', error);
                const errorMessage = document.createElement('p');
                errorMessage.innerText = (language === 'fr') ? 'Le processus a échoué: ' + error.message : 'Process failed: ' + error.message;
                errorMessage.style.color = 'red';
                imgWrapper.appendChild(errorMessage);
            });
        });
    };

    // Initial call to create the first question area
    createQuestionArea();
}


// Adding global event listener for Ctrl+Shift+S and Ctrl+Shift+ArrowRight
document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyS') {
        let focusedElement = document.activeElement;
        if (focusedElement && focusedElement.getAttribute('tabindex') === '0') {
            focusedElement.click();
        }
    }

    if (event.ctrlKey && event.shiftKey && event.code === 'ArrowRight') {
        let focusedElement = document.activeElement;
        if (focusedElement && focusedElement.getAttribute('tabindex') === '0') {
            let nextElement = focusedElement.parentElement.nextElementSibling;
            while (nextElement && !nextElement.querySelector('[tabindex="0"]')) {
                nextElement = nextElement.nextElementSibling;
            }
            if (nextElement) {
                nextElement.querySelector('[tabindex="0"]').focus();
            }
        }
    }
});



// function updateScreenshotContainer() {
//     const API_KEY = 'AIzaSyAtsBif-ZM6Jpgx1ld04fxYbI9MGnvqBvY'; // Replace with your actual YouTube Data API v3 key
//     const target = document.getElementById('secondary');
//     if (!target) {
//         console.log("YouTube secondary column not found.");
//         return;
//     }

//     let container = document.getElementById('customScreenshotContainer');
//     if (!container) {
//         container = document.createElement('div');
//         container.id = 'customScreenshotContainer';
//         container.style.cssText = 'max-width: 500px; margin-top: 16px; border: 2px solid #FFF; padding: 10px; box-sizing: border-box;';
//         container.setAttribute('tabindex', '-1');
//         container.setAttribute('aria-live', 'polite');
//         target.insertBefore(container, target.firstChild);
//     }

//     chrome.storage.local.get(['userEmail', 'language'], function(storageData) {
//         const userEmail = storageData.userEmail;
//         const language = storageData.language || 'en'; // Default to English if no language is set

//         fetch('https://imagenarratorserver2-1.onrender.com/server/getUserID.php', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ userEmail })
//         })
//         .then(response => response.json())
//         .then(data => {
//             const userID = data.userID;

//             let emailElement = container.querySelector('#userEmail');
//             if (!emailElement) {
//                 emailElement = document.createElement('p');
//                 emailElement.id = 'userEmail';
//                 emailElement.style.color = 'white';
//                 emailElement.textContent = (language === 'fr') ? `Courriel: ${userEmail}` : `Email: ${userEmail}`;
//                 container.insertBefore(emailElement, container.firstChild);
//             }

//             let userIDElement = container.querySelector('#userID');
//             if (!userIDElement) {
//                 userIDElement = document.createElement('p');
//                 userIDElement.id = 'userID';
//                 userIDElement.style.color = 'white';
//                 userIDElement.textContent = `User ID: ${userID}`;
//                 container.insertBefore(userIDElement, emailElement.nextSibling);
//             } else {
//                 userIDElement.textContent = `User ID: ${userID}`;
//             }

//             let logoutButton = document.getElementById('logoutButton');
//             if (!logoutButton) {
//                 logoutButton = document.createElement('button');
//                 logoutButton.id = 'logoutButton';
//                 logoutButton.textContent = (language === 'fr') ? 'Déconnexion' : 'Log Out';
//                 logoutButton.style.marginLeft = '10px';
//                 logoutButton.onclick = function() {
//                     chrome.storage.local.remove('userEmail', function() {
//                         alert((language === 'fr') ? 'Déconnecté avec succès.' : 'Logged out successfully.');
//                         location.reload(); // Refresh the page to update UI state
//                     });
//                 };
//                 emailElement.appendChild(logoutButton);
//             } else {
//                 logoutButton.textContent = (language === 'fr') ? 'Déconnexion' : 'Log Out';
//             }

//             const videoID = getYouTubeVideoId();
//             const videoTitle = getVideoTitle();
//             fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoID}&key=${API_KEY}&part=snippet`)
//                 .then(response => response.json())
//                 .then(data => {
//                     const videoDescription = data.items.length > 0 ? data.items[0].snippet.description : "No description available.";
//                     const url = window.location.href;

//                     let player = document.querySelector('video');
//                     if (!player) {
//                         console.log("No video player found.");
//                         return;
//                     }

//                     let canvas = document.createElement('canvas');
//                     canvas.width = player.videoWidth;
//                     canvas.height = player.videoHeight;
//                     let ctx = canvas.getContext('2d');
//                     ctx.drawImage(player, 0, 0, canvas.width, canvas.height);
//                     canvas.toBlob(function(blob) {
//                         let formData = new FormData();
                        
//                         formData.append('videoTitle', videoTitle);
//                         formData.append('videoURL', url);
//                         formData.append('videoSummary', videoDescription);
//                         formData.append('tags', ''); // Assuming tags is an empty string for now
//                         formData.append('duration', Math.floor(player.duration));
//                         formData.append('userID', userID);

//                         getVideoListFromCurrentChannel(API_KEY, videoID)
//                         .then(videos => {
//                             const videoListData = JSON.stringify(videos);
//                             formData.append('videoList', videoListData);

//                             fetch('https://imagenarratorserver2-1.onrender.com/server/save_video.php', {
//                                 method: 'POST',
//                                 body: formData
//                             })
//                             .then(response => response.text())
//                             .then(data => {
//                                 console.log('Screenshot and video data uploaded:', data);
//                                 const videoListText = videos.map(video => `${video.title} (URL: ${video.url})`).join(", ");
//                             })
//                             .catch(error => {
//                                 console.log('Failed to upload data:', error);
//                             });
//                         });
//                     }, 'image/png');
//                 })
//                 .catch(error => {
//                     console.log('Failed to fetch video description:', error);
//                 });
//         })
//         .catch(error => console.log('Error:', error));
//     });
// }
function updateScreenshotContainer() {
    const API_KEY = 'AIzaSyAtsBif-ZM6Jpgx1ld04fxYbI9MGnvqBvY'; // Replace with your actual YouTube Data API v3 key
    const target = document.getElementById('secondary');
    if (!target) {
        console.log("YouTube secondary column not found.");
        return;
    }

    let container = document.getElementById('customScreenshotContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'customScreenshotContainer';
        container.style.cssText = 'max-width: 500px; margin-top: 16px; border: 2px solid #FFF; padding: 10px; box-sizing: border-box;';
        container.setAttribute('tabindex', '-1');
        container.setAttribute('aria-live', 'polite');
        target.insertBefore(container, target.firstChild);
    }

    chrome.storage.local.get(['userEmail', 'language'], function (storageData) {
        const userEmail = storageData.userEmail;
        const language = storageData.language || 'en';

        // Show email
        let emailElement = container.querySelector('#userEmail');
        if (!emailElement) {
            emailElement = document.createElement('p');
            emailElement.id = 'userEmail';
            emailElement.style.color = 'white';
            emailElement.textContent = (language === 'fr') ? `Courriel: ${userEmail}` : `Email: ${userEmail}`;
            container.insertBefore(emailElement, container.firstChild);
        }

        // Show logout button
        let logoutButton = document.getElementById('logoutButton');
        if (!logoutButton) {
            logoutButton = document.createElement('button');
            logoutButton.id = 'logoutButton';
            logoutButton.textContent = (language === 'fr') ? 'Déconnexion' : 'Log Out';
            logoutButton.style.marginLeft = '10px';
            logoutButton.onclick = function () {
                chrome.storage.local.remove('userEmail', function () {
                    alert((language === 'fr') ? 'Déconnecté avec succès.' : 'Logged out successfully.');
                    location.reload();
                });
            };
            emailElement.appendChild(logoutButton);
        } else {
            logoutButton.textContent = (language === 'fr') ? 'Déconnexion' : 'Log Out';
        }

        // Prepare YouTube data
        const videoID = getYouTubeVideoId();
        const videoTitle = getVideoTitle();
        fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoID}&key=${API_KEY}&part=snippet`)
            .then(response => response.json())
            .then(data => {
                const videoDescription = data.items.length > 0 ? data.items[0].snippet.description : "No description available.";
                const url = window.location.href;

                const player = document.querySelector('video');
                if (!player) {
                    console.log("No video player found.");
                    return;
                }

                const canvas = document.createElement('canvas');
                canvas.width = player.videoWidth;
                canvas.height = player.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(player, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(function (blob) {
                    const formData = new FormData();
                    formData.append('videoTitle', videoTitle);
                    formData.append('videoURL', url);
                    formData.append('videoSummary', videoDescription);
                    formData.append('tags', '');
                    formData.append('duration', Math.floor(player.duration));
                    // ⛔️ No more formData.append('userID', ...)

                    getVideoListFromCurrentChannel(API_KEY, videoID).then(videos => {
                        const videoListData = JSON.stringify(videos);
                        formData.append('videoList', videoListData);

                        fetch('https://imagenarratorserver2-1.onrender.com/server/save_video.php', {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => response.text())
                        .then(data => {
                            console.log('Screenshot and video data uploaded:', data);
                        })
                        .catch(error => {
                            console.log('Failed to upload data:', error);
                        });
                    });
                }, 'image/png');
            })
            .catch(error => {
                console.log('Failed to fetch video description:', error);
            });
    });
}




function getYouTubeVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
}

function getVideoTitle() {
    var title;
    var headerEls = document.querySelectorAll("h1.title.ytd-video-primary-info-renderer");

    function SetTitle() {
        if (headerEls.length > 0) {
            title = headerEls[0].innerText.trim();
            return true;
        } else {
            return false;
        }
    }

    if (!SetTitle()) {
        headerEls = document.querySelectorAll("h1.watch-title-container");

        if (!SetTitle()) title = "Video Screenshot"; // Fallback title if none is found
    }

    return title;
}

function getVideoListFromCurrentChannel(apiKey, videoId) {
    const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

    return fetch(videoDetailsUrl)
        .then(response => response.json())
        .then(data => {
            const channelId = data.items[0].snippet.channelId;
            const listUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=3&type=video`;
            return fetch(listUrl);
        })
        .then(response => response.json())
        .then(data => data.items.map(video => ({
            title: video.snippet.title,
            url: `https://www.youtube.com/watch?v=${video.id.videoId}`
        }))) // Now the function returns objects with both title and URL
        .catch(error => console.log('Failed to fetch video list:', error));
}

function updateElement(container, id, tagName, textContent, color) {
    let element = container.querySelector(`#${id}`);
    if (!element) {
        element = document.createElement(tagName);
        element.id = id;
        element.style.color = color;
        container.appendChild(element);
    }
    element.textContent = textContent;
}






function getVideoListFromCurrentChannel(apiKey, videoId) {
    const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

    return fetch(videoDetailsUrl)
        .then(response => response.json())
        .then(data => {
            const channelId = data.items[0].snippet.channelId;
            const listUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=3&type=video`;
            return fetch(listUrl);
        })
        .then(response => response.json())
        .then(data => data.items.map(video => ({
            title: video.snippet.title,
            url: `https://www.youtube.com/watch?v=${video.id.videoId}`
        }))) // Now the function returns objects with both title and URL
        .catch(error => console.error('Failed to fetch video list:', error));
}
/*
function getVideoListFromCurrentChannel(apiKey, videoId) {
    const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

    return fetch(videoDetailsUrl)
        .then(response => response.json())
        .then(data => {
            const channelId = data.items[0].snippet.channelId;
            const listUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=3&type=video`;
            return fetch(listUrl);
        })
        .then(response => response.json())
        .then(data => data.items) // This will be the list of videos
        .catch(error => console.error('Failed to fetch video list:', error));
}
*/
// Define getYouTubeVideoId and getVideoTitle based on how you plan to retrieve them
// Placeholder functions:
function getYouTubeVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
}


// Call the main function to execute the script
updateScreenshotContainer();

// Keyboard shortcut to focus on the customScreenshotContainer for screen readers
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyS') {
        let container = document.getElementById('customScreenshotContainer');
        if (container) {
            container.focus(); // Focus the container
            container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
});

function getVideoTitle() {
	var title;
	var headerEls = document.querySelectorAll("h1.title.ytd-video-primary-info-renderer");

	function SetTitle() {
		if (headerEls.length > 0) {
			title = headerEls[0].innerText.trim();
			return true;
		} else {
			return false;
		}
	}

	if (!SetTitle()) {
		headerEls = document.querySelectorAll("h1.watch-title-container");

		if (!SetTitle()) title = "Video Screenshot"; // Fallback title if none is found
	}

	return title;
}





function AddScreenshotButton() {
	var ytpRightControls = document.getElementsByClassName("ytp-right-controls")[0];
	if (ytpRightControls) {
		ytpRightControls.prepend(screenshotButton);
	}

	chrome.storage.sync.get('playbackSpeedButtons', function(result) {
		if (result.playbackSpeedButtons) {
			ytpRightControls.prepend(speed3xButton);
			ytpRightControls.prepend(speed25xButton);
			ytpRightControls.prepend(speed2xButton);
			ytpRightControls.prepend(speed15xButton);
			ytpRightControls.prepend(speed1xButton);

			var playbackRate = document.getElementsByTagName('video')[0].playbackRate;
			switch (playbackRate) {
				case 1:
					speed1xButton.classList.add('SYTactive');
					activePBRButton = speed1xButton;
					break;
				case 2:
					speed2xButton.classList.add('SYTactive');
					activePBRButton = speed2xButton;
					break;
				case 2.5:
					speed25xButton.classList.add('SYTactive');
					activePBRButton = speed25xButton;
					break;
				case 3:
					speed3xButton.classList.add('SYTactive');
					activePBRButton = speed3xButton;
					break;
			}
		}
	});
}
// Initialize playback speed buttons and add them to the interface...

chrome.storage.sync.get(['screenshotKey', 'playbackSpeedButtons', 'screenshotFunctionality', 'screenshotFileFormat'], function (result) {
	screenshotKey = result.screenshotKey;
	playbackSpeedButtons = result.playbackSpeedButtons;
	screenshotFormat = result.screenshotFileFormat || 'png';
	screenshotFunctionality = result.screenshotFunctionality || 0;
	extension = screenshotFormat === 'jpeg' ? 'jpg' : screenshotFormat;
});

document.addEventListener('keydown', function (e) {
	// Key event listeners for playback speed adjustments and screenshot capture...
	// Check if Ctrl is pressed and the key is '6'
	if (e.ctrlKey && e.key === '6') {
		CaptureScreenshot();
		e.preventDefault(); // Prevent the default action of the key press
	}
});
var screenshotButton = document.createElement("button");
screenshotButton.className = "screenshotButton ytp-button";
screenshotButton.style.width = "auto";
screenshotButton.innerHTML = "Screenshot";
screenshotButton.style.cssFloat = "left";
screenshotButton.onclick = CaptureScreenshot;



chrome.storage.sync.get(['screenshotKey', 'playbackSpeedButtons', 'screenshotFunctionality', 'screenshotFileFormat'], function(result) {
	screenshotKey = result.screenshotKey;
	playbackSpeedButtons = result.playbackSpeedButtons;
	if (result.screenshotFileFormat === undefined) {
		screenshotFormat = 'png'
	} else {
		screenshotFormat = result.screenshotFileFormat
	}

	if (result.screenshotFunctionality === undefined) {
		screenshotFunctionality = 0;
	} else {
    	screenshotFunctionality = result.screenshotFunctionality;
	}

	if (screenshotFormat === 'jpeg') {
		extension = 'jpg';
	} else {
		extension = screenshotFormat;
	}
});

document.addEventListener('keydown', function(e) {
	if (document.activeElement.contentEditable === 'true' || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.contentEditable === 'plaintext')
		return true;

	if (playbackSpeedButtons) {
		switch (e.key) {
			case 'q':
				speed1xButton.click();
				e.preventDefault();
				return false;
			case 's':
				speed15xButton.click();
				e.preventDefault();
				return false;
			case 'w':
				speed2xButton.click();
				e.preventDefault();
				return false;
			case 'e':
				speed25xButton.click();
				e.preventDefault();
				return false;
			case 'r':
				speed3xButton.click();
				e.preventDefault();
				return false;
		}
	}

	if (screenshotKey && e.key === 'p') {
		CaptureScreenshot();
		e.preventDefault();
		return false;
	}
});

AddScreenshotButton();
