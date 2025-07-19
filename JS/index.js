
        // Canvas 動畫 JavaScript 邏輯
        const canvas = document.getElementById('neonCanvas');
        const ctx = canvas.getContext('2d');
        let particles = [];

        const gradientStartColor = '#781E4F';
        const gradientMidColor = '#653371';
        const gradientEndColor = '#313C69';

        const neonColors = [
            '#53B4FF', '#00CFFF', '#2F7FFF', '#40A9FF',
            '#15FFD0', '#0FFFC0', '#40FFD6',
            '#51FF2B', '#13FF49', '#71FF40',
            '#FF1B54', '#FF4545', '#FF4D4D',
            '#FF45DD', '#FF80EC',
            '#F3FF55', '#FFFF60',
            '#FFAB4D', '#FFB354',
            '#BC48FF'
        ];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawGradient();
            initParticles();
        }

        function drawGradient() {
            const gradient = ctx.createLinearGradient(0, canvas.height, canvas.width, 0);
            gradient.addColorStop(0, gradientStartColor);
            gradient.addColorStop(0.5, gradientMidColor);
            gradient.addColorStop(1, gradientEndColor);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        class Particle {
            constructor(x, y, color, size, speedX, speedY) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.size = size;
                this.speedX = speedX;
                this.speedY = speedY;
                this.opacity = 0.05 + Math.random() * 0.15;
                this.life = 100 + Math.random() * 150;
                this.history = [{x: this.x, y: this.y}];
                this.type = 'line';
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life--;
                this.opacity = Math.max(0, this.opacity - 0.001);
                
                if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
                if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

                this.history.push({x: this.x, y: this.y});
                if (this.history.length > 20) {
                    this.history.shift();
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.fill();

                if (this.history.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(this.history[0].x, this.history[0].y);
                    for (let i = 1; i < this.history.length; i++) {
                        ctx.lineTo(this.history[i].x, this.history[i].y);
                    }
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = this.size * 0.4;
                    ctx.globalAlpha = this.opacity * 0.4;
                    ctx.stroke();
                }
            }
        }

        class NodeParticle extends Particle {
            constructor(x, y, color, size, speedX, speedY) {
                super(x, y, color, size, speedX, speedY);
                this.type = 'node';
                this.baseSize = size;
                this.pulseFactor = 0;
                this.pulseSpeed = 0.03 + Math.random() * 0.03;
            }
            update() {
                super.update();
                this.pulseFactor += this.pulseSpeed;
                this.size = this.baseSize + Math.sin(this.pulseFactor) * (this.baseSize * 0.6);
                this.opacity = Math.max(0, 0.1 + Math.sin(this.pulseFactor * 0.5) * 0.1);
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(0.8, this.color + 'A0');
                gradient.addColorStop(1, this.color + '00');
                ctx.fillStyle = gradient;
                ctx.globalAlpha = this.opacity;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const baseNum = Math.floor((canvas.width * canvas.height) / 80000);
            const numLineParticles = baseNum * 1.5;
            const numNodeParticles = baseNum * 0.5;

            for (let i = 0; i < numLineParticles; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const color = neonColors[Math.floor(Math.random() * neonColors.length)];
                const size = 0.5 + Math.random() * 0.8;
                const speedX = (Math.random() - 0.5) * 0.3;
                const speedY = (Math.random() - 0.5) * 0.3;
                particles.push(new Particle(x, y, color, size, speedX, speedY));
            }

            for (let i = 0; i < numNodeParticles; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const color = neonColors[Math.floor(Math.random() * neonColors.length)];
                const size = 1.5 + Math.random() * 2.5;
                const speedX = (Math.random() - 0.5) * 0.15;
                const speedY = (Math.random() - 0.5) * 0.15;
                particles.push(new NodeParticle(x, y, color, size, speedX, speedY));
            }
        }

        function drawConnections() {
            const nodeParticles = particles.filter(p => p.type === 'node');
            const maxDistance = 80;

            for (let i = 0; i < nodeParticles.length; i++) {
                for (let j = i + 1; j < nodeParticles.length; j++) {
                    const p1 = nodeParticles[i];
                    const p2 = nodeParticles[j];
                    const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

                    if (dist < maxDistance) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = p1.color;
                        ctx.lineWidth = 0.3;
                        ctx.globalAlpha = (1 - (dist / maxDistance)) * 0.1;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            drawGradient();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
            drawConnections();
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                if (particles[i].life <= 0 || particles[i].opacity <= 0) {
                    particles.splice(i, 1);
                    i--;
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    const color = neonColors[Math.floor(Math.random() * neonColors.length)];
                    const isNode = Math.random() < 0.1;
                    const size = isNode ? (1.5 + Math.random() * 2.5) : (0.5 + Math.random() * 0.8);
                    const speedX = (Math.random() - 0.5) * (isNode ? 0.15 : 0.3);
                    const speedY = (Math.random() - 0.5) * (isNode ? 0.15 : 0.3);

                    if (isNode) {
                        particles.push(new NodeParticle(x, y, color, size, speedX, speedY));
                    } else {
                        particles.push(new Particle(x, y, color, size, speedX, speedY));
                    }
                }
            }
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();

        // 儲存所有需要翻譯的文本對象
        const translations = {
            'en': {
                'loginTitle': 'Mad Grad',
                'usernameLabel': 'Username:',
                'passwordLabel': 'Password:',
                'loginButton': 'Log in',
                'registerButton': 'Register',
                'errorMessage': 'The Username or Password is incorrect.',
                'registerAccountTitle': 'Register Account',
                'nicknameLabel': 'Nickname:',
                'regUsernameLabel': 'Username:',
                'regPasswordLabel': 'Password:',
                'regConfirmPasswordLabel': 'Confirm Password:',
                'regEmailLabel': 'Email:',
                'submitButton': 'Submit',
                'registerErrorMessage': 'Please fill in all fields.',
                'passwordMismatch': 'Passwords do not match.',
                'passwordLength': 'Password must be at least 6 characters long.',
                'invalidEmail': 'Please enter a valid email address.',
                'submissionError': 'An error occurred during submission. Please try again.',
                'successMessageText': 'Received!<br>Activation will be notified by email.',
                'successOkButton': 'OK!',
                'languageToggleText': '⇄ 繁體中文'
            },
            'zh': {
                'loginTitle': '瘋生',
                'usernameLabel': '帳號:',
                'passwordLabel': '密碼:',
                'loginButton': '登入',
                'registerButton': '註冊',
                'errorMessage': '帳號或密碼不正確。',
                'registerAccountTitle': '註冊帳號',
                'nicknameLabel': '暱稱:',
                'regUsernameLabel': '帳號:',
                'regPasswordLabel': '密碼:',
                'regConfirmPasswordLabel': '確認密碼:',
                'regEmailLabel': '電子郵件:',
                'submitButton': '送出',
                'registerErrorMessage': '請填寫所有欄位',
                'passwordMismatch': '密碼不相符',
                'passwordLength': '登入密碼至少需要6個字元',
                'invalidEmail': '請輸入有效的電子郵件地址',
                'submissionError': '送出時發生錯誤，請重試',
                'successMessageText': '收到！<br>透過電子郵件通知啟用',
                'successOkButton': '好！',
                'languageToggleText': '⇄ English'
            }
        };

        // 獲取所有需要翻譯的元素 (現在使用 data-lang-key)
        const translatableElements = document.querySelectorAll('[data-lang-key]');
        const languageToggleButton = document.getElementById('languageToggleButton');

        // 【修正點 1】將 currentLanguage 聲明為全局變數
        let currentLanguage;

        // 函數：應用翻譯
        function applyTranslations(lang) {
            console.log(`Applying translations for: ${lang}`); // Debug log
            currentLanguage = lang; 
            document.querySelectorAll('[data-lang-key]').forEach(element => { // 直接使用 querySelectorAll
                const key = element.getAttribute('data-lang-key');
                // 修正: 處理 translations 物件中直接以鍵名為語言代碼的情況 (例如 'cancel_button_modal')
                // 這裡假設所有鍵都在 'en' 或 'zh' 下，所以簡化邏輯
                let translatedText = translations[lang] ? translations[lang][key] : undefined;

                if (translatedText !== undefined) {
                    if (key === 'successMessageText') { 
                        element.innerHTML = translatedText;
                    } else {
                        element.textContent = translatedText;
                    }
                } else {
                    console.warn(`Translation key '${key}' not found for language '${lang}'.`); // Debug log
                }
            });

            // 更新語言切換按鈕的文本
            const languageToggleButton = document.getElementById('languageToggleButton'); // 確保在這裡獲取
            if (languageToggleButton) {
                languageToggleButton.textContent = translations[lang]['languageToggleText'];
                console.log(`Language toggle button text updated to: ${languageToggleButton.textContent}`); // Debug log
            } else {
                console.error("languageToggleButton not found when trying to update its text."); // Debug log
            }

            // 將當前語言儲存到 localStorage
            localStorage.setItem('currentLanguage', lang);
            console.log(`Language saved to localStorage: ${lang}`); // Debug log
        }

        // 以下是原 Login 頁面的 JavaScript 邏輯
        document.addEventListener('DOMContentLoaded', function() {
            const loginForm = document.getElementById('loginForm');
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const errorMessage = document.getElementById('errorMessage');
            
            // --- 註冊功能相關 JavaScript 邏輯 ---
            const registerButton = document.getElementById('registerButton');
            const registerModal = document.getElementById('registerModal');
            const closeButton = registerModal.querySelector('.close-button');
            const registerForm = document.getElementById('registerForm');
            const regNicknameInput = document.getElementById('regNickname');
            const regUsernameInput = document.getElementById('regUsername');
            const regPasswordInput = document.getElementById('regPassword'); // HTML 欄位 ID
            const regConfirmPasswordInput = document.getElementById('regConfirmPassword');
            const regEmailInput = document.getElementById('regEmail');
            const registerErrorMessage = document.getElementById('registerErrorMessage');
            // 移除對 registerSuccessMessage 的引用，因為現在使用新的 successModal
            
            // 新增：獲取成功提示模態框的元素
            const successModal = document.getElementById('successModal');
            const successOkButton = document.getElementById('successOkButton');

            // 語言切換相關元素和邏輯
            // const languageToggleButton = document.getElementById('languageToggleButton');

            // let currentLanguage = localStorage.getItem('currentLanguage') || 'en'; // 默認語言或上次選擇的語言

            // function applyTranslations(lang) {
            //     // 更新語言切換按鈕文本
            //     languageToggleButton.textContent = translations[lang]['languageToggleText'];

            //     // 更新頁面所有帶有 data-lang-key 的元素
            //     document.querySelectorAll('[data-lang-key]').forEach(element => {
            //         const key = element.getAttribute('data-lang-key');
            //         if (translations[lang] && translations[lang][key]) {
            //             // 對於包含 HTML (如 <br>) 的文本，使用 innerHTML
            //             if (key === 'successMessageText') {
            //                 element.innerHTML = translations[lang][key];
            //             } else {
            //                 element.textContent = translations[lang][key];
            //             }
            //         }
            //     });
            // }

            // // 初始化頁面語言
            // applyTranslations(currentLanguage);

            // // 切換按鈕的事件監聽器
            // languageToggleButton.addEventListener('click', function() {
            //     currentLanguage = (currentLanguage === 'en') ? 'zh' : 'en';
            //     localStorage.setItem('currentLanguage', currentLanguage); // 保存語言偏好
            //     applyTranslations(currentLanguage); // 更新頁面內容
            // });


            // 【修正點】將 languageToggleButton 的獲取和事件監聽器綁定移到 DOMContentLoaded 內部
            const languageToggleButton = document.getElementById('languageToggleButton');
            if (languageToggleButton) {
                console.log("Language toggle button found in DOMContentLoaded. Attaching listener."); // Debug log
                languageToggleButton.addEventListener('click', function() {
                    console.log("Language toggle button clicked!"); // Debug log
                    let currentLangFromStorage = localStorage.getItem('currentLanguage') || 'en'; 
                    let newLang = (currentLangFromStorage === 'zh') ? 'en' : 'zh'; 
                    console.log(`Switching from ${currentLangFromStorage} to ${newLang}`); // Debug log
                    applyTranslations(newLang); 
                });
            } else {
                console.error("Language toggle button NOT found in DOMContentLoaded."); // Debug log
            }

            // 頁面載入時，檢查 localStorage 或預設為英文
            const savedLanguage = localStorage.getItem('currentLanguage');
            applyTranslations(savedLanguage || 'en'); // 預設為英文

            async function sha256(message) {
                const msgBuffer = new TextEncoder().encode(message); 
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                return hexHash;
            }

            // 從 Python 嵌入的所有用戶數據
            const users = [
    { username: "Momo", password_hashed: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3", user_id: "MOMO" },
    { username: "Evelyn", password_hashed: "b3a8e0e1f9ab1bfe3a36f231f676f78bb30a519d2b21e6c530c0eee8ebb4a5d0", user_id: "Azhu" },
    { username: "Test", password_hashed: "35a9e381b1a27567549b5f8a6f783c167ebf809f1c4d6a9e367240484d8ce281", user_id: "Tester" },
    { username: "Flydoco", password_hashed: "8810a72f30d555b9d74d145d3ad3408bf3e54155be2f5769a981db30c13e6566", user_id: "南瓜" }
]; 
            
            loginForm.addEventListener('submit', async function(event) {
                event.preventDefault();

                const username = usernameInput.value;
                const password = passwordInput.value;
                const hashedInputPassword = await sha256(password);
                
                let authenticatedUser = null;
                for (const user of users) {
                    if (username === user.username && hashedInputPassword === user.password_hashed) {
                        authenticatedUser = user;
                        break;
                    }
                }

                if (authenticatedUser) {
                    sessionStorage.setItem('loggedIn', 'true');
                    sessionStorage.setItem('currentUserId', authenticatedUser.user_id); 
                    window.location.href = 'MENU.html';
                } else {
                    errorMessage.textContent = translations[currentLanguage]['errorMessage'];
                    errorMessage.style.display = 'block';
                }
            });

            // 點擊註冊按鈕，顯示模態框
            registerButton.addEventListener('click', function() {
                registerModal.style.display = 'flex';
                registerErrorMessage.style.display = 'none';
                registerForm.reset();
            });

            // 點擊註冊模態框關閉按鈕，隱藏模態框
            closeButton.addEventListener('click', function() {
                registerModal.style.display = 'none';
            });

            // 點擊模態框背景，隱藏模態框
            window.addEventListener('click', function(event) {
                if (event.target == registerModal) {
                    registerModal.style.display = 'none';
                } else if (event.target == successModal) { // 也處理成功提示模態框的背景點擊
                    successModal.style.display = 'none';
                }
            });

            // 處理註冊表單提交
            registerForm.addEventListener('submit', async function(event) {
                event.preventDefault();

                registerErrorMessage.style.display = 'none';
                // 隱藏成功的文字訊息，改用模態框
                // registerSuccessMessage.style.display = 'none'; 

                const nickname = regNicknameInput.value.trim();
                const username = regUsernameInput.value.trim();
                const answer = regPasswordInput.value;
                const confirmPassword = regConfirmPasswordInput.value;
                const email = regEmailInput.value.trim();

                // 簡單的前端驗證
                if (nickname === '' || username === '' || answer === '' || confirmPassword === '' || email === '') {
                    registerErrorMessage.textContent = translations[currentLanguage]['registerErrorMessage'];
                    registerErrorMessage.style.display = 'block';
                    return;
                }
                if (answer !== confirmPassword) {
                    registerErrorMessage.textContent = translations[currentLanguage]['passwordMismatch'];
                    registerErrorMessage.style.display = 'block';
                    return;
                }
                if (answer.length < 6) {
                    registerErrorMessage.textContent = translations[currentLanguage]['passwordLength'];
                    registerErrorMessage.style.display = 'block';
                    return;
                }
                if (!/\S+@\S+\.\S+/.test(email)) {
                    registerErrorMessage.textContent = translations[currentLanguage]['invalidEmail'];
                    registerErrorMessage.style.display = 'block';
                    return;
                }

                // Google 表單的 action URL 和欄位 ID (請再次確認您的 ID 是否正確)
                const googleFormUrl = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSeAwlPTY8AXMIK6-m-WYSi7hetmvt_4tGXti6hahvRYqRgueA/formResponse';
                const formData = new FormData();
                formData.append('entry.69131785', nickname);
                formData.append('entry.574060034', username);
                formData.append('entry.1012256431', answer);
                formData.append('entry.2043582051', email);     

                try {
                    const response = await fetch(googleFormUrl, {
                        method: 'POST',
                        body: formData,
                        mode: 'no-cors'
                    });

                    console.log('Registration data sent to Google Form.');
                    registerModal.style.display = 'none'; // 成功後關閉註冊模態框
                    successModal.style.display = 'flex'; // 顯示成功提示模態框
                    registerForm.reset(); // 清空註冊表單

                } catch (error) {
                    console.error('Error submitting registration:', error);
                    registerErrorMessage.textContent = 'An error occurred during submission. Please try again.';
                    registerErrorMessage.style.display = 'block';
                }
            });

            // 新增：點擊成功提示模態框的 OK 按鈕，隱藏模態框
            successOkButton.addEventListener('click', function() {
                successModal.style.display = 'none';
            });
        });
    