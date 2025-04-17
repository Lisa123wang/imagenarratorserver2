


  
// 如果沒有 userEmail，打開 options 頁
chrome.storage.local.get('userEmail', (result) => {
    if (!result.userEmail) {
        chrome.runtime.openOptionsPage();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const formTitle = document.getElementById('formTitle');

    const languageSelectLogin = document.getElementById('languageSelect');
    const languageSelectRegister = document.getElementById('regLanguageSelect');

    const emailLabel = document.getElementById('emailLabel');
    const passwordLabel = document.getElementById('passwordLabel');
    const loginButton = document.getElementById('loginButton');
    const toRegister = document.getElementById('toRegister');

    const regEmailLabel = document.getElementById('regEmailLabel');
    const regPasswordLabel = document.getElementById('regPasswordLabel');
    const registerButton = document.getElementById('registerButton');
    const toLogin = document.getElementById('toLogin');

    // 🔸 檢查註冊是否啟用，若未開啟則隱藏「註冊連結」
    fetch('https://imagenarrator.atwebpages.com/register.php')
        .then(response => response.json())
        .then(data => {
            if (!data.allow) {
                toRegister.style.display = 'none';
            }
        });

    function updateLoginTexts(language) {
        formTitle.textContent = {
            'fr': 'Page de connexion',
            'zh-TW': '登入頁面',
            'en': 'Login Page'
        }[language];

        emailLabel.textContent = {
            'fr': 'E-mail :',
            'zh-TW': '電子郵件：',
            'en': 'Email:'
        }[language];

        passwordLabel.textContent = {
            'fr': 'Mot de passe :',
            'zh-TW': '密碼：',
            'en': 'Password:'
        }[language];

        loginButton.textContent = {
            'fr': 'Connexion',
            'zh-TW': '登入',
            'en': 'Login'
        }[language];

        toRegister.textContent = {
            'fr': 'Pas encore de compte ? Inscrivez-vous',
            'zh-TW': '還沒有帳號？註冊一個',
            'en': "Don't have an account? Register"
        }[language];
    }

    function updateRegisterTexts(language) {
        formTitle.textContent = {
            'fr': "Page d'inscription",
            'zh-TW': '註冊頁面',
            'en': 'Register Page'
        }[language];

        regEmailLabel.textContent = {
            'fr': 'E-mail :',
            'zh-TW': '電子郵件：',
            'en': 'Email:'
        }[language];

        regPasswordLabel.textContent = {
            'fr': 'Mot de passe :',
            'zh-TW': '密碼：',
            'en': 'Password:'
        }[language];

        registerButton.textContent = {
            'fr': "S'inscrire",
            'zh-TW': '註冊',
            'en': 'Register'
        }[language];

        toLogin.textContent = {
            'fr': 'Vous avez déjà un compte ? Connexion',
            'zh-TW': '已經有帳號？登入',
            'en': 'Already have an account? Login'
        }[language];
    }

    // 初始語言設定
    chrome.storage.local.get('language', function (storageData) {
        const savedLang = storageData.language || 'en';
        languageSelectLogin.value = savedLang;
        languageSelectRegister.value = savedLang;

        if (loginForm.classList.contains('active')) {
            updateLoginTexts(savedLang);
        } else {
            updateRegisterTexts(savedLang);
        }
    });

    // 切換到註冊表單
    toRegister.addEventListener('click', () => {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');

        const lang = languageSelectLogin.value;
        languageSelectRegister.value = lang;
        chrome.storage.local.set({ language: lang });
        updateRegisterTexts(lang);
    });

    // 切換到登入表單
    toLogin.addEventListener('click', () => {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');

        const lang = languageSelectRegister.value;
        languageSelectLogin.value = lang;
        chrome.storage.local.set({ language: lang });
        updateLoginTexts(lang);
    });

    // 切換語言（登入表單）
    languageSelectLogin.addEventListener('change', function () {
        const lang = this.value;
        chrome.storage.local.set({ language: lang });

        languageSelectRegister.value = lang;
        if (loginForm.classList.contains('active')) updateLoginTexts(lang);
    });

    // 切換語言（註冊表單）
    languageSelectRegister.addEventListener('change', function () {
        const lang = this.value;
        chrome.storage.local.set({ language: lang });

        languageSelectLogin.value = lang;
        if (registerForm.classList.contains('active')) updateRegisterTexts(lang);
    });

    // 登入提交
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(this);
        const lang = languageSelectLogin.value;

        chrome.storage.local.set({ language: lang });

        fetch('https://imagenarrator.atwebpages.com/login.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const successMsgs = {
                'fr': 'Connexion réussie, vous pouvez utiliser l\'extension maintenant.',
                'zh-TW': '登入成功，您現在可以使用擴充功能。',
                'en': 'Login successful, you can use the extension now.'
            };

            const errorMsgs = {
                '❌ Incorrect password': {
                    'fr': 'Mot de passe incorrect',
                    'zh-TW': '密碼錯誤',
                    'en': 'Incorrect password'
                },
                '❌ Account not found': {
                    'fr': 'Compte non trouvé',
                    'zh-TW': '找不到帳號',
                    'en': 'Account not found'
                },
                '❌ Account is disabled': {
                    'fr': 'Compte désactivé',
                    'zh-TW': '帳號已停用',
                    'en': 'Account is disabled'
                }
            };

            if (data.user) {
                chrome.storage.local.set({ userEmail: data.user.email }, () => {
                    alert(successMsgs[lang]);
                    chrome.tabs.create({ url: "https://www.youtube.com/" });
                });
            } else {
                const msg = errorMsgs[data.message]?.[lang] || 'Login failed';
                document.getElementById('message').textContent = msg;
                alert(msg);
            }
        })
        .catch(error => {
            const prefix = (lang === 'fr') ? 'Erreur: ' : (lang === 'zh-TW') ? '錯誤：' : 'Error: ';
            document.getElementById('message').textContent = prefix + error.message;
            alert(prefix + error.message);
        });
    });

    // 註冊提交 
    registerForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(this);
        const lang = languageSelectRegister.value;

        chrome.storage.local.set({ language: lang });

        const successMsgs = {
            'fr': 'Inscription réussie',
            'zh-TW': '註冊成功',
            'en': 'Registration successful'
        };
        const failMsgs = {
            'fr': "Échec de l'inscription",
            'zh-TW': '註冊失敗',
            'en': 'Registration failed'
        };
        const disabledMsgs = {
            'fr': "L'inscription est actuellement désactivée",
            'zh-TW': '目前不開放註冊',
            'en': 'Registration is currently disabled'
        };

        fetch('https://imagenarrator.atwebpages.com/register.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.message.includes('✅')) {
                alert(successMsgs[lang]);
                toLogin.click();
            } else if (data.message.includes('disabled')) {
                document.getElementById('message').textContent = disabledMsgs[lang];
                alert(failMsgs[lang] + ': ' + disabledMsgs[lang]);
            } else {
                document.getElementById('message').textContent = data.message;
                alert(failMsgs[lang] + ': ' + data.message);
            }
        })
        .catch(error => {
            const prefix = (lang === 'fr') ? 'Erreur: ' : (lang === 'zh-TW') ? '錯誤：' : 'Error: ';
            document.getElementById('message').textContent = prefix + error.message;
            alert(prefix + error.message);
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

// function changeLanguage() {
//     const languageSelect = document.getElementById('languageSelect');
//     const language = languageSelect.value;
//     const emailLabel = document.getElementById('emailLabel');
//     const passwordLabel = document.getElementById('passwordLabel');

//     // Update labels based on selected language
//     if (language === 'fr') {
//         emailLabel.textContent = 'Courriel:';
//         passwordLabel.textContent = 'Mot de passe:';
//     } else {
//         emailLabel.textContent = 'Email:';
//         passwordLabel.textContent = 'Password:';
//     }

//     // Save the selected language to chrome.storage
//     chrome.storage.local.set({'language': language});
// }
function changeLanguage() {
    const languageSelect = document.getElementById('languageSelect');
    const language = languageSelect.value;
    const emailLabel = document.getElementById('emailLabel');
    const passwordLabel = document.getElementById('passwordLabel');
    const clearBtn = document.getElementById('clearExtensionData');
  
    if (language === 'fr') {
      emailLabel.textContent = 'Courriel:';
      passwordLabel.textContent = 'Mot de passe:';
      clearBtn.textContent = '🧹 Effacer les données de l\'extension';
    } else if (language === 'zh-TW') {
      emailLabel.textContent = '電子郵件：';
      passwordLabel.textContent = '密碼：';
      clearBtn.textContent = '🧹 清除擴充套件資料';
    } else {
      emailLabel.textContent = 'Email:';
      passwordLabel.textContent = 'Password:';
      clearBtn.textContent = '🧹 Clear extension data';
    }
  
    chrome.storage.local.set({ 'language': language });
  }
  
  document.addEventListener('DOMContentLoaded', function () {
    const clearBtn = document.getElementById('clearExtensionData');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        chrome.storage.local.get(['language'], (data) => {
          const lang = data.language || 'en';
  
          const messages = {
            en: "✅ All extension data cleared! Reload the page if needed.",
            fr: "✅ Toutes les données de l'extension ont été effacées ! Rechargez la page si nécessaire.",
            "zh-TW": "✅ 所有擴充套件資料已清除！如有需要請重新整理頁面。"
          };
  
          chrome.storage.local.clear(() => {
            alert(messages[lang]);
            console.log("📦 chrome.storage.local 已完全清除");
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            document.getElementById('message').textContent = '';
          });
        });
      });
    }
  });
  
  
  
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

function loadXLSXLibrary(callback) {
    if (window.XLSX) {
        callback(); // 已經載入過，不重複載
        return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = callback;
    document.head.appendChild(script);
}


function CaptureScreenshot() {
    // 🟡 Wait until the video element is loaded before proceeding
    function waitForVideoAndRun(callback, timeout = 5000) {
        const interval = 100;
        let waited = 0;
        const checker = setInterval(() => {
            const video = document.querySelector('video');
            if (video) {
                clearInterval(checker);
                callback(video);
            } else if (waited >= timeout) {
                clearInterval(checker);
                alert('❌ Video not found on the page.');
            }
            waited += interval;
        }, interval);
    }

    waitForVideoAndRun(function (player) {
        if (!document.getElementById('copy-style')) {
            const style = document.createElement('style');
            style.id = 'copy-style';
            style.textContent = `
            .code-wrapper {
                margin-bottom: 10px;
            }
            .copy-btn {
                display: block;
                margin-left: auto;
                margin-top: 4px;
                background-color: #e0e0e0 !important;
                color: #000000 !important;
                border: 1px solid #999;
                border-radius: 6px;
                padding: 4px 10px;
                font-size: 12px;
                font-family: inherit;
                cursor: pointer;
                touch-action: manipulation;
            }
            .copy-btn:hover {
                background-color: #d5d5d5 !important;
            }
            `;
            document.head.appendChild(style);
        }

        chrome.storage.local.get(['userEmail', 'language'], (result) => {
            const userEmail = result.userEmail;
            const language = result.language || 'en';

            const getLabel = (en, fr, zh) => {
                if (language === 'fr') return fr;
                if (language === 'zh-TW') return zh;
                return en;
            };

            const isDarkMode =
                window.matchMedia('(prefers-color-scheme: dark)').matches ||
                document.documentElement.hasAttribute('dark');

            const textColor = isDarkMode ? 'white' : 'black';
            const backgroundColor = isDarkMode ? '#1e1e1e' : '#ffffff';
            const borderColor = isDarkMode ? '#444' : '#ccc';

            const applyColorToAllChildren = (element) => {
                element.querySelectorAll('*').forEach(child => {
                    if (!child.classList.contains('ask-btn') && !child.classList.contains('copy-btn')) {
                        child.style.color = textColor;
                    }
                });
                if (!element.classList.contains('ask-btn') && !element.classList.contains('copy-btn')) {
                    element.style.color = textColor;
                }
            };

            function createSectionWrapper(childElement) {
                const section = document.createElement('div');
                section.style.border = `1px solid ${borderColor}`;
                section.style.borderRadius = '5px';
                section.style.padding = '10px';
                section.style.marginBottom = '10px';
                section.style.backgroundColor = backgroundColor;
                section.appendChild(childElement);
                return section;
            }

            function createCodeBlock(title, fullText) {
                const wrapper = document.createElement('div');
                wrapper.className = 'code-wrapper';

                const titleElement = document.createElement('p');
                titleElement.textContent = title;
                titleElement.style.fontWeight = 'bold';
                titleElement.style.color = textColor;

                const pre = document.createElement('pre');
                pre.style.whiteSpace = 'pre-wrap';
                pre.style.overflowX = 'auto';
                pre.style.marginTop = '8px';
                pre.style.color = textColor;
                const code = document.createElement('code');
                code.className = 'language-python';
                code.textContent = fullText;
                code.style.color = textColor;
                pre.appendChild(code);

                wrapper.appendChild(titleElement);
                wrapper.appendChild(pre);

                const codeMatch = fullText.match(/```(?:\w+)?\n([\s\S]*?)```/);
                if (codeMatch) {
                    const codeOnly = codeMatch[1].trim();
                    const copyBtn = document.createElement('button');
                    const copyLabel = getLabel('Copy Code', 'Copier le code', '複製程式碼');
                    copyBtn.textContent = `📋 ${copyLabel}`;
                    copyBtn.className = 'copy-btn';
                    copyBtn.setAttribute('aria-label', copyLabel);
                    copyBtn.addEventListener('click', () => {
                        navigator.clipboard.writeText(codeOnly).then(() => {
                            copyBtn.textContent = `📋 ${getLabel('Copied!', 'Copié!', '已複製')}`;
                            setTimeout(() => copyBtn.textContent = `📋 ${copyLabel}`, 1000);
                        });
                    });
                    wrapper.appendChild(copyBtn);
                }

                return createSectionWrapper(wrapper);
            }

            if (!userEmail) {
                alert(getLabel(
                    "User is not logged in. Please login first to take a screenshot.",
                    "L'utilisateur n'est pas connecté. Veuillez vous connecter d'abord pour prendre une capture d'écran.",
                    "使用者尚未登入，請先登入後再截圖。"
                ));
                chrome.runtime.sendMessage({ action: "openOptionsPage" });
                return;
            }

            const videoId = new URLSearchParams(window.location.search).get('v');
            const videoTitle = getVideoTitle();
            const videoKey = `classified_${videoId}`;
            const saveKey = `savedVideo_${videoId}_${userEmail}`;
            const cleanURL = `https://www.youtube.com/watch?v=${videoId}`; // ✅ Use clean URL

            chrome.storage.local.get(saveKey, (saved) => {
                if (!saved[saveKey]) {
                    const duration = player && !isNaN(player.duration) ? formatTime(player.duration) : "";
                    fetch('https://imagenarrator.atwebpages.com/saveVideo.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: userEmail,
                            title: videoTitle,
                            url: cleanURL, // ✅ Use clean URL here
                            duration: duration
                        })
                    })
                        .then(res => res.json())
                        .then(response => {
                            console.log("✅ Video save response:", response);
                            chrome.storage.local.set({ [saveKey]: true });
                        })
                        .catch(err => {
                            console.error("❌ Failed to save video info:", err);
                        });
                }
            });

            const categoryElement = document.createElement('p');

            chrome.storage.local.get(videoKey, (stored) => {
                const previousResult = stored[videoKey];
                if (!previousResult && videoId) {
                    fetch('https://imagenarrator.atwebpages.com/titleCategory.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: videoTitle })
                    })
                        .then(response => response.text())
                        .then(category => {
                            chrome.storage.local.set({ [videoKey]: category });
                            categoryElement.innerText = getLabel("Predicted Category: ", "Catégorie prédite : ", "預測分類：") + category;
                        })
                        .catch(error => {
                            categoryElement.innerText = getLabel("Predicted Category: ", "Catégorie prédite : ", "預測分類：") + getLabel("Error", "Erreur", "錯誤");
                            console.error("❌ Failed to classify video title:", error);
                        });
                } else {
                    categoryElement.innerText = getLabel("Predicted Category: ", "Catégorie prédite : ", "預測分類：") + previousResult;
                }
            });

            if (!player) {
                console.log("No video player found.");
                return;
            }

            updateScreenshotContainer();

            const container = document.getElementById('customScreenshotContainer');
            if (container) {
                container.style.setProperty('border', `1px solid ${borderColor}`, 'important');
                container.style.setProperty('background-color', backgroundColor, 'important');
                container.style.setProperty('border-radius', '5px', 'important');
                container.style.setProperty('padding', '12px', 'important');
                container.style.setProperty('box-sizing', 'border-box', 'important');
                container.style.setProperty('margin-top', '16px', 'important');

                container.setAttribute('tabindex', '-1');
                container.setAttribute('role', 'region');
                container.setAttribute('aria-live', 'polite');
                container.setAttribute('aria-label', getLabel('Screenshot output area', 'Zone de sortie de capture', '截圖輸出區'));

                const liveRegion = document.createElement('div');
                liveRegion.setAttribute('role', 'alert');
                liveRegion.setAttribute('aria-live', 'polite');
                liveRegion.style.position = 'absolute';
                liveRegion.style.left = '-9999px';
                liveRegion.textContent = getLabel('Screenshot output is ready.', 'La capture est prête.', '截圖結果已準備完成');
                document.body.appendChild(liveRegion);
                setTimeout(() => document.body.removeChild(liveRegion), 1500);

                container.focus();
                container.style.outline = '2px dashed yellow';
                setTimeout(() => (container.style.outline = ''), 1200);
            }

            const canvas = document.createElement('canvas');
            canvas.width = player.videoWidth;
            canvas.height = player.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(player, 0, 0, canvas.width, canvas.height);

            const dataURL = canvas.toDataURL('image/png');
            const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
            const imgWrapper = document.createElement('div');
            imgWrapper.style.marginBottom = '20px';
            container.appendChild(imgWrapper);

            const currentTime = formatTime(player.currentTime);
            const formattedTime = Math.floor(player.currentTime);

            const timeText = document.createElement('a');
            timeText.href = '#';
            timeText.innerText = getLabel("Time: ", "Temps: ", "時間：") + currentTime;
            timeText.style.color = textColor;
            timeText.style.textAlign = 'left';
            timeText.setAttribute('role', 'button');
            timeText.setAttribute('aria-label', getLabel("Jump to time: ", "Aller au temps: ", "跳轉至時間：") + currentTime);
            timeText.setAttribute('tabindex', '0');
            timeText.addEventListener('click', function (event) {
                event.preventDefault();
                player.currentTime = formattedTime;
            });

            const img = new Image();
            img.src = "data:image/png;base64," + base64Data;
            img.style.maxWidth = '100%';
            img.style.display = 'block';
            img.style.cursor = 'pointer';

            const timeImageBlock = document.createElement('div');
            timeImageBlock.style.border = `1px solid ${borderColor}`;
            timeImageBlock.style.borderRadius = '5px';
            timeImageBlock.style.padding = '10px';
            timeImageBlock.style.marginBottom = '10px';
            timeImageBlock.style.backgroundColor = backgroundColor;

            timeImageBlock.appendChild(timeText);
            timeImageBlock.appendChild(img);
            imgWrapper.appendChild(timeImageBlock);

            const loadingMessage = document.createElement('p');
            loadingMessage.innerText = getLabel(
                "Please wait for a while, the image is being recognized...",
                "Veuillez patienter un moment, l'image est en cours de reconnaissance...",
                "請稍候，正在辨識影像內容..."
            );
            loadingMessage.style.color = textColor;
            container.appendChild(loadingMessage);

            canvas.toBlob(function (blob) {
                const formData = new FormData();
                formData.append('image', blob, 'screenshot.png');
                formData.append('language', language);

                fetch('https://imagenarrator.atwebpages.com/upload.php', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.text())
                    .then(imageUrl => {
                        const imageUrlDisplay = document.createElement('p');
                        imageUrlDisplay.style.color = textColor;
                        imageUrlDisplay.innerText = getLabel("Image URL: ", "URL de l'image: ", "圖片連結：") + imageUrl;
                        timeImageBlock.appendChild(imageUrlDisplay);
                        return imageUrl;
                    })
                    .then(imageUrl => {
                        const promises = [
                            fetch('https://imagenarrator.atwebpages.com/imageToText.php', {
                                method: 'POST',
                                body: JSON.stringify({ imageUrl, language }),
                                headers: { 'Content-Type': 'application/json' }
                            }).then(res => res.text()),
                            fetch('https://imagenarrator.atwebpages.com/imageCaption.php', {
                                method: 'POST',
                                body: JSON.stringify({ imageUrl, language }),
                                headers: { 'Content-Type': 'application/json' }
                            }).then(res => res.text()),
                            fetch('https://imagenarrator.atwebpages.com/imageExercise.php', {
                                method: 'POST',
                                body: JSON.stringify({ imageUrl, language }),
                                headers: { 'Content-Type': 'application/json' }
                            }).then(res => res.text())
                        ];

                        return Promise.all(promises)
                            .then(([textResponse, captionResponse, imageExerciseResponse]) => {
                                container.removeChild(loadingMessage);
                                imgWrapper.appendChild(createCodeBlock(getLabel("Text Detection", "Détection de texte", "文字辨識"), textResponse, textColor));
                                imgWrapper.appendChild(createCodeBlock(getLabel("Image Caption", "Légende de l'image", "圖片說明"), captionResponse, textColor));
                                imgWrapper.appendChild(createCodeBlock(getLabel("Image Exercise", "Exercice d'image", "圖片練習"), imageExerciseResponse, textColor));

                                // ✅ Use cleanURL when saving recognition
                                fetch('https://imagenarrator.atwebpages.com/saveRecognition.php', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        email: userEmail,
                                        url: cleanURL, // ✅ here
                                        timestamp: currentTime
                                    })
                                })
                                    .then(res => res.json())
                                    .then(response => {
                                        if (response.success) {
                                            console.log("✅ Screenshot data saved successfully!");
                                        } else {
                                            console.error("❌ Failed to save screenshot data:", response.error);
                                        }
                                    })
                                    .catch(err => {
                                        console.error("❌ Network error while saving screenshot data:", err);
                                    });

                                const createAskQuestionBlock = () => {
                                    const questionInput = document.createElement('textarea');
                                    questionInput.placeholder = getLabel("Enter your question here...", "Entrez votre question ici...", "請輸入您的提問內容...");
                                    questionInput.style.width = '100%';
                                    questionInput.style.height = '50px';
                                    questionInput.style.color = textColor;
                                    questionInput.style.backgroundColor = backgroundColor;
                                    questionInput.style.border = `1px solid ${borderColor}`;

                                    const submitButton = document.createElement('button');
                                    submitButton.innerText = getLabel("Ask Question", "Poser la question", "提出問題");
                                    submitButton.className = 'ask-btn';

                                    const questionWrapper = document.createElement('div');
                                    questionWrapper.style.border = `1px solid ${borderColor}`;
                                    questionWrapper.style.borderRadius = '5px';
                                    questionWrapper.style.padding = '10px';
                                    questionWrapper.style.marginBottom = '10px';
                                    questionWrapper.style.backgroundColor = backgroundColor;
                                    questionWrapper.appendChild(questionInput);
                                    questionWrapper.appendChild(submitButton);
                                    imgWrapper.appendChild(questionWrapper);

                                    submitButton.addEventListener('click', function () {
                                        const question = questionInput.value;
                                        if (!question) {
                                            alert(getLabel("Please enter a question.", "Veuillez entrer une question.", "請輸入問題內容"));
                                            return;
                                        }

                                        fetch('https://imagenarrator.atwebpages.com/upload_question.php', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'text/plain' },
                                            body: JSON.stringify({ imageUrl, question })
                                        })
                                            .then(response => response.text())
                                            .then(answer => {
                                                const responseMessage = document.createElement('p');
                                                responseMessage.innerText = getLabel("Answer: ", "Réponse: ", "解答：") + answer;
                                                responseMessage.style.color = textColor;
                                                responseMessage.style.whiteSpace = 'pre-wrap';
                                                questionWrapper.appendChild(responseMessage);

                                                applyColorToAllChildren(questionWrapper);
                                                createAskQuestionBlock();
                                            })
                                            .catch(error => {
                                                const errorMessage = document.createElement('p');
                                                errorMessage.innerText = getLabel('Process failed: ', 'Le processus a échoué: ', '處理失敗：') + error.message;
                                                errorMessage.style.color = 'red';
                                                questionWrapper.appendChild(errorMessage);
                                            });
                                    });
                                };

                                createAskQuestionBlock();
                                return true;
                            });
                    })
                    .catch(error => {
                        const responseText = document.createElement('p');
                        responseText.innerText = getLabel('Process failed: ', 'Le processus a échoué: ', '處理失敗：') + error.message;
                        responseText.style.color = 'red';
                        container.appendChild(responseText);
                    });
            }, 'image/png');
        });
    });
}








// function addQuestionFunctionality(imageUrl, imgWrapper, language, userID) {
//     const createQuestionArea = () => {
//         // Creating the question input and submit button
//         const questionInput = document.createElement('textarea');
//         questionInput.placeholder = (language === 'fr') ? "Entrez votre question ici..." : "Enter your question here...";
//         questionInput.style.width = '100%';
//         questionInput.style.height = '50px';
//         imgWrapper.appendChild(questionInput);

//         const submitButton = document.createElement('button');
//         submitButton.innerText = (language === 'fr') ? "Poser la question" : "Ask Question";
//         imgWrapper.appendChild(submitButton);

//         // Submit question with image URL
//         submitButton.addEventListener('click', function () {
//             const question = questionInput.value;

//             if (!question) {
//                 alert((language === 'fr') ? "Veuillez entrer une question." : "Please enter a question.");
//                 return;
//             }

//             fetch('https://imagenarrator.atwebpages.com/upload_question.php', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     imageUrl: imageUrl, // Send the imageUrl obtained after upload
//                     question: question // Send the user's question (no need for language)
//                 })
//             })
//             .then(response => response.text())  // Use .text() instead of .json()
//             .then(answer => {
//                 const responseMessage = document.createElement('p');
//                 responseMessage.innerText = (language === 'fr') ? "Réponse: " + answer : "Answer: " + answer;
//                 responseMessage.style.color = 'blacek';  // Set text color to blacek
//                 imgWrapper.appendChild(responseMessage);

//                 // Append a new ask question area after receiving the response
//                 createQuestionArea();
//             })
//             .catch(error => {
//                 console.log('Failed to send question and image URL to the server:', error);
//                 const errorMessage = document.createElement('p');
//                 errorMessage.innerText = (language === 'fr') ? 'Le processus a échoué: ' + error.message : 'Process failed: ' + error.message;
//                 errorMessage.style.color = 'red';
//                 imgWrapper.appendChild(errorMessage);
//             });
//         });
//     };

//     // Initial call to create the first question area
//     createQuestionArea();
// }


// Adding global event listener for Ctrl+Shift+S and Ctrl+Shift+ArrowRight
document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyS') {
        const screenshotContainer = document.getElementById('customScreenshotContainer');
        if (screenshotContainer) {
            screenshotContainer.focus();
    
            // Optional announcement
            const tempText = document.createElement('div');
            tempText.textContent = (language === 'fr') ? "La capture d'écran est prête." : "Screenshot output is ready.";
            tempText.style.position = 'absolute';
            tempText.style.left = '-9999px';
            screenshotContainer.appendChild(tempText);
            setTimeout(() => screenshotContainer.removeChild(tempText), 1500);
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

//         fetch('https://imagenarrator.atwebpages.com/server/getUserID.php', {
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
//                 emailElement.style.color = 'blacek';
//                 emailElement.textContent = (language === 'fr') ? `Courriel: ${userEmail}` : `Email: ${userEmail}`;
//                 container.insertBefore(emailElement, container.firstChild);
//             }

//             let userIDElement = container.querySelector('#userID');
//             if (!userIDElement) {
//                 userIDElement = document.createElement('p');
//                 userIDElement.id = 'userID';
//                 userIDElement.style.color = 'blacek';
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

//                             fetch('https://imagenarrator.atwebpages.com/server/save_video.php', {
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
        target.insertBefore(container, target.firstChild);
    }

    // ✅ Inject CSS for copy and logout buttons if not already added
    if (!document.getElementById('copy-style')) {
        const style = document.createElement('style');
        style.id = 'copy-style';
        style.textContent = `
        .code-wrapper {
            margin-bottom: 10px;
        }
        .copy-btn, .logout-btn {
            display: block;
            margin-left: auto;
            margin-top: 4px;
            background-color: #e0e0e0 !important;
            color: #000000 !important;
            border: 1px solid #999;
            border-radius: 6px;
            padding: 4px 10px;
            font-size: 12px;
            font-family: inherit;
            cursor: pointer;
            touch-action: manipulation;
        }
        .copy-btn:hover,
        .logout-btn:hover {
            background-color: #d5d5d5 !important;
        }
            .code-wrapper {
                margin-bottom: 10px;
            }
            .copy-btn,
            .ask-btn {
                display: block;
                margin-left: auto;
                margin-top: 4px;
                background-color: #e0e0e0 !important;
                color: #000000 !important;
                border: 1px solid #999 !important;
                border-radius: 6px;
                padding: 4px 10px;
                font-size: 12px;
                font-family: inherit;
                cursor: pointer;
                touch-action: manipulation;
            }
            .copy-btn:hover,
                .ask-btn:hover {
                    background-color: #d5d5d5 !important;
            }

        `
        ;
        document.head.appendChild(style);
    }

    // Detect system or site dark mode
    const isDarkMode =
        window.matchMedia('(prefers-color-scheme: dark)').matches ||
        document.documentElement.hasAttribute('dark');

    const textColor = isDarkMode ? 'white' : 'black';
    const backgroundColor = isDarkMode ? '#1e1e1e' : '#ffffff';
    const borderColor = isDarkMode ? '#444' : '#ccc';

    // ✅ Style outer container using same theme as emailRow
    container.style.maxWidth = '500px';
    container.style.marginTop = '16px';
    container.style.boxSizing = 'border-box';
    container.style.padding = '12px';
    container.style.border = `1px solid ${borderColor}`;
    container.style.borderRadius = '5px';
    container.style.backgroundColor = backgroundColor;

    chrome.storage.local.get(['userEmail', 'language'], function (storageData) {
        const userEmail = storageData.userEmail;
        const language = storageData.language || 'en';

        const getLabel = (en, fr, zh) => {
            if (language === 'fr') return fr;
            if (language === 'zh-TW') return zh;
            return en;
        };

        // Create wrapper row
        let emailRow = container.querySelector('#emailRow');
        if (!emailRow) {
            emailRow = document.createElement('div');
            emailRow.id = 'emailRow';
            emailRow.style.display = 'flex';
            emailRow.style.justifyContent = 'space-between';
            emailRow.style.alignItems = 'center';
            emailRow.style.padding = '6px 12px';
            emailRow.style.border = `1px solid ${borderColor}`;
            emailRow.style.borderRadius = '5px';
            emailRow.style.marginBottom = '10px';
            emailRow.style.backgroundColor = backgroundColor;
            container.insertBefore(emailRow, container.firstChild);
        }

        // Email text
        let emailElement = emailRow.querySelector('#userEmail');
        if (!emailElement) {
            emailElement = document.createElement('span');
            emailElement.id = 'userEmail';
            emailRow.appendChild(emailElement);
        }
        emailElement.textContent = getLabel(`Email: ${userEmail}`, `Courriel: ${userEmail}`, `電子信箱：${userEmail}`);
        emailElement.style.setProperty('color', textColor, 'important');
        emailElement.style.setProperty('font-weight', 'bold', 'important');

        // Logout button
        let logoutButton = emailRow.querySelector('#logoutButton');
        if (!logoutButton) {
            logoutButton = document.createElement('button');
            logoutButton.id = 'logoutButton';
            logoutButton.className = 'logout-btn'; // ✅ 使用 class 控制樣式
            logoutButton.onclick = function () {
                chrome.storage.local.remove('userEmail', function () {
                    alert(getLabel('Logged out successfully.', 'Déconnecté avec succès.', '已成功登出'));
                    location.reload();
                });
            };
            emailRow.appendChild(logoutButton);
        }

        logoutButton.textContent = getLabel('Log Out', 'Déconnexion', '登出');
    });
}



// Prepare YouTube data
        // const videoID = getYouTubeVideoId();
        // const videoTitle = getVideoTitle();
        // fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoID}&key=${API_KEY}&part=snippet`)
        //     .then(response => response.json())
        //     .then(data => {
        //         const videoDescription = data.items.length > 0 ? data.items[0].snippet.description : "No description available.";
        //         const url = window.location.href;

        //         const player = document.querySelector('video');
        //         if (!player) {
        //             console.log("No video player found.");
        //             return;
        //         }

        //         const canvas = document.createElement('canvas');
        //         canvas.width = player.videoWidth;
        //         canvas.height = player.videoHeight;
        //         const ctx = canvas.getContext('2d');
        //         ctx.drawImage(player, 0, 0, canvas.width, canvas.height);

        //         canvas.toBlob(function (blob) {
        //             const formData = new FormData();
        //             formData.append('videoTitle', videoTitle);
        //             formData.append('videoURL', url);
        //             formData.append('videoSummary', videoDescription);
        //             formData.append('tags', '');
        //             formData.append('duration', Math.floor(player.duration));
        //             // ⛔️ No more formData.append('userID', ...)

        //             getVideoListFromCurrentChannel(API_KEY, videoID).then(videos => {
        //                 const videoListData = JSON.stringify(videos);
        //                 formData.append('videoList', videoListData);

        //                 fetch('https://imagenarrator.atwebpages.com/server/save_video.php', {
        //                     method: 'POST',
        //                     body: formData
        //                 })
        //                 .then(response => response.text())
        //                 .then(data => {
        //                     console.log('Screenshot and video data uploaded:', data);
        //                 })
        //                 .catch(error => {
        //                     console.log('Failed to upload data:', error);
        //                 });
        //             });
        //         }, 'image/png');
        //     })
        //     .catch(error => {
        //         console.log('Failed to fetch video description:', error);
        //     });


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

// ✅ Keyboard shortcut to focus on the screenshot output for screen readers
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyS') {
        const container = document.getElementById('customScreenshotContainer');
        
        if (container) {
            // ✅ Move focus to container
            container.focus();
            container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // 👁️ Optional debug outline (remove if not needed)
            container.style.outline = '2px dashed yellow';
            setTimeout(() => container.style.outline = '', 1000);

            // 🗣️ Force NVDA or other screen readers to announce
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('role', 'alert');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-9999px';
            liveRegion.textContent = 'Screenshot output is ready.';
            document.body.appendChild(liveRegion);
            setTimeout(() => {
                document.body.removeChild(liveRegion);
            }, 1500);
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
