
        const canvas = document.getElementById('breathingGradientCanvas');
        const ctx = canvas.getContext('2d');

        // 語言翻譯字典
        const translations = {
            zh: {
                menu_title: "選單",
                welcome_message: "歡迎, ", // 注意：這裡只放“歡迎,”，後面的用戶名會動態拼接
                logout_button: "登出",
                network_button_label: "社交網路",
                lab_folder: "實驗室",
                    soc_lab_link: "系統單晶片 實驗室",
                    aiot_lab_link: "人工智慧物聯網 實驗室",
                    emca_lab_link: "電機控制與應用 實驗室",
                    badass_link: "狠角色",
                algorithm_folder: "演算法",
                    paper_based_folder: "論文系",
                        halftone_link: "半色調",
                        digital_ic_design_link: "數位晶片設計",
                        firework_algorithm_link: "煙花演算法",
                        lossy_compression_link: "破壞性資料壓縮",
                        auto_white_balance_link: "自動白平衡",
                        tone_reproduction_link: "色調重現",
                    hand_based_folder: "手牌系",
                        artificial_intelligence_link: "人工智慧",
                        histogram_equalization_link: "直方圖均衡化",
                        eye_corner_detection_link: "眼角偵測",
                        iris_matching_link: "虹膜匹配",
                        demosaicing_link: "解馬賽克",
                        hierarchical_search_link: "階層式搜索",
                    rule_based_folder: "規則系",
                        big_data_analysis_link: "大數據分析",
                        nas_database_link: "NAS 資料庫",
                        parallel_computing_link: "平行計算",
                        motion_estimation_8_compensation_link: "動作估計 & 補償",
                        fuzzy_control_link: "模糊控制",
                        noise_filter_link: "雜訊濾波器",
                action_folder: "動作",
                    assign_link: "指定",
                    seminar_link: "書報討論",
                    defer_link: "休學",
                    analyze_link: "研究",
                    retract_link: "撤銷",
                    anticipate_link: "預判",
                    plagiarize_link: "抄襲",
                    dump_link: "擺爛",
                    forced_publish_link: "強制發表",
                    falsify_link: "偽造",
                    start_over_link: "砍掉重練",
                    all_nighter_link: "今晚加班",
                    paper_storm_link: "論文高產",
                    lets_ball_link: "走啊打球",
                    side_quest: "支線任務",
                appendix_folder: "附件"
            },
            en: {
                menu_title: "MENU",
                welcome_message: "Welcome, ", // 注意：這裡只放“Welcome,”，後面的用戶名會動態拼接
                logout_button: "Log out",
                network_button_label: "Social Network",
                lab_folder: "Lab",
                    soc_lab_link: "SoC Lab",
                    aiot_lab_link: "AIoT Lab",
                    emca_lab_link: "EMCA Lab",
                    badass_link: "Badass",
                algorithm_folder: "Algorithm",
                    paper_based_folder: "Paper Based",
                        halftone_link: "Halftone",
                        digital_ic_design_link: "Digital IC Design",
                        firework_algorithm_link: "Firework Algorithm",
                        lossy_compression_link: "Lossy Compression",
                        auto_white_balance_link: "Auto White Balance",
                        tone_reproduction_link: "Tone Reproduction",
                    hand_based_folder: "Hand Based",
                        artificial_intelligence_link: "Artificial Intelligence",
                        histogram_equalization_link: "Histogram Equalization",
                        eye_corner_detection_link: "Eye Corner Detection",
                        iris_matching_link: "Iris Matching",
                        demosaicing_link: "Demosaicing",
                        phase_search_link: "Hierarchical Search",
                    rule_based_folder: "Rule Based",
                        big_data_analysis_link: "Big Data Analysis",
                        nas_database_link: "NAS Database",
                        parallel_computing_link: "Parallel Computing",
                        motion_estimation_8_compensation_link: "Motion Estimation & Compensation",
                        fuzzy_control_link: "Fuzzy Control",
                        noise_filter_link: "Noise Filter",
                action_folder: "Action",
                    assign_link: "Assign",
                    seminar_link: "Seminar",
                    defer_link: "Defer",
                    analyze_link: "Analyze",
                    retract_link: "Retract",
                    anticipate_link: "Anticipate",
                    plagiarize_link: "Plagiarize",
                    dump_link: "Dump",
                    forced_publish_link: "Forced Publish",
                    falsify_link: "Falsify",
                    start_over_link: "Start Over",
                    all_nighter_link: "All-nighter",
                    paper_storm_link: "Paper Storm",
                    lets_ball_link: "Let's ball",
                    side_quest: "Side Quest",
                appendix_folder: "Appendix"
            }
        };

        // 獲取所有需要翻譯的元素
        const translatableElements = document.querySelectorAll('[data-lang-key]');

        // 函數：應用翻譯
        function applyTranslations(lang) {
            translatableElements.forEach(element => {
                const key = element.getAttribute('data-lang-key');
                if (key && translations[lang] && translations[lang][key] !== undefined) {
                    if (key === 'welcome_message') {
                        // 特殊處理 welcome_message，只翻譯前綴，保留用戶名
                        const currentUserId = sessionStorage.getItem('currentUserId');
                        element.textContent = translations[lang][key] + (currentUserId ? currentUserId + '!' : 'Guest!');
                    } else {
                        element.textContent = translations[lang][key];
                    }
                }
            });

            // 更新語言切換按鈕的 active 狀態
            document.querySelectorAll('.lang-button').forEach(button => {
                if (button.getAttribute('data-lang') === lang) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });

            // 將當前語言儲存到 localStorage
            localStorage.setItem('currentLanguage', lang);
        }

        // 基礎暗色背景漸層顏色
        const baseGradientColors = {
            start: '#000000', // 非常暗的藍紫色
            end: 'rgb(125, 125, 125)'    // 稍微亮一點的暗紫色
        };

        // 呼吸光暈的顏色 (已調整為更鮮豔的色彩值)
        const breathingLightColors = [
            { r: 255, g: 0, b: 0 },   // 紅色 (更鮮豔的紅)
            { r: 0, g: 255, b: 0 },   // 綠色 (更鮮豔的綠/青綠)
            { r: 0, g: 0, b: 255 }    // 藍色 (保持不變)
        ];

        // 呼吸光暈物件陣列
        let breathingLights = [];

        // 初始化呼吸光暈的屬性
        function initBreathingLights() {
            breathingLights = []; 
            // 確保 Canvas 尺寸至少為 10，避免 Math.max(0,0) * 0.8 = 0 的情況
            // 使用 Math.max(10, ...) 確保即使 window.innerWidth/Height 為 0 或無效，也能有最小尺寸
            const minCanvasDim = Math.max(10, Number.isFinite(canvas.width) && canvas.width > 0 ? canvas.width : 800, Number.isFinite(canvas.height) && canvas.height > 0 ? canvas.height : 600);
            const minRadius = minCanvasDim * 0.8; 
            // 增加脈衝幅度，讓呼吸效果更明顯
            const maxPulseAmplitude = minRadius * 0.4; 

            // 紅光暈
            breathingLights.push({
                x: canvas.width * 0.2, 
                y: canvas.height * 0.8,
                baseRadius: minRadius,
                maxPulse: maxPulseAmplitude,
                pulseSpeed: 0.001, 
                color: breathingLightColors[0],
                offset: Math.PI * 0.7, 
                baseOpacity: 0.10 
            });

            // 綠光暈
            breathingLights.push({
                x: canvas.width * 0.5, 
                y: canvas.height * 0.5,
                baseRadius: minRadius,
                maxPulse: maxPulseAmplitude,
                pulseSpeed: 0.001, 
                color: breathingLightColors[1],
                offset: Math.PI * 0.7, 
                baseOpacity: 0.10 
            });

            // 藍光暈
            breathingLights.push({
                x: canvas.width * 0.8, 
                y: canvas.height * 0.2,
                baseRadius: minRadius,
                maxPulse: maxPulseAmplitude,
                pulseSpeed: 0.001, 
                color: breathingLightColors[2],
                offset: Math.PI * 0.7, 
                baseOpacity: 0.10 
            });
        }

        // 繪製基礎暗色背景漸層
        function drawBaseGradient() {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height); 
            gradient.addColorStop(0, baseGradientColors.start);
            gradient.addColorStop(1, baseGradientColors.end);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 繪製呼吸光暈
        function drawBreathingLights() {
            // 在繪製前再次檢查 Canvas 尺寸是否有效
            if (!Number.isFinite(canvas.width) || canvas.width <= 0 || !Number.isFinite(canvas.height) || canvas.height <= 0) {
                console.error("Canvas dimensions are invalid or zero, skipping drawing frame.");
                return; // 跳過繪製，避免錯誤
            }

            breathingLights.forEach(light => {
                const pulseValue = Math.sin(Date.now() * light.pulseSpeed + light.offset);
                
                // 計算 currentRadius，確保它是有限的正數，且至少為 1.0
                let currentRadius = light.baseRadius + pulseValue * light.maxPulse;
                if (!Number.isFinite(currentRadius) || currentRadius < 1.0) {
                    currentRadius = 1.0; // Fallback to a safe positive value
                }
                
                // 計算 currentOpacity，確保它是有限且在 0-1 之間
                let currentOpacity = light.baseOpacity + Math.max(0, pulseValue * 0.05); 
                if (!Number.isFinite(currentOpacity) || currentOpacity < 0) {
                    currentOpacity = 0.01; 
                } else if (currentOpacity > 1) {
                    currentOpacity = 1;
                }

                // 確保 light.x 和 light.y 是有限的，避免 createRadialGradient 報錯
                const safeX = Number.isFinite(light.x) ? light.x : canvas.width / 2;
                const safeY = Number.isFinite(light.y) ? light.y : canvas.height / 2;

                // 在呼叫 createRadialGradient 前，再次對所有參數進行最終檢查
                if (!Number.isFinite(safeX) || !Number.isFinite(safeY) || !Number.isFinite(currentRadius) || currentRadius <= 0) {
                    console.error("Invalid parameters for createRadialGradient:", { safeX, safeY, currentRadius });
                    return; // 跳過此光暈的繪製
                }

                const gradient = ctx.createRadialGradient(safeX, safeY, 0, safeX, safeY, currentRadius);
                
                gradient.addColorStop(0, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, ${currentOpacity * 1.5})`); 
                gradient.addColorStop(0.5, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, ${currentOpacity * 0.8})`);
                gradient.addColorStop(1, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, 0)`);

                ctx.fillStyle = gradient;
                ctx.globalCompositeOperation = 'lighter'; 
                ctx.fillRect(0, 0, canvas.width, canvas.height); 
                ctx.globalCompositeOperation = 'source-over'; 
            });
        }

        // 動畫循環
        function animate() {
            drawBaseGradient();
            drawBreathingLights();
            requestAnimationFrame(animate);
        }

        // 處理視窗大小改變
        function resizeCanvas() {
            // 確保 width 和 height 是有效的正數，如果不是則設定預設值
            canvas.width = Number.isFinite(window.innerWidth) && window.innerWidth > 0 ? window.innerWidth : 800;
            canvas.height = Number.isFinite(window.innerHeight) && window.innerHeight > 0 ? window.innerHeight : 600;
            initBreathingLights();
        }

        // 初始化並啟動動畫
        window.addEventListener('resize', resizeCanvas); 
        resizeCanvas();
        animate();

        // MENU 頁面原有的 JavaScript 邏輯
        document.addEventListener('DOMContentLoaded', function() {
            // 登入檢查
            const isLoggedIn = sessionStorage.getItem('loggedIn');
            if (isLoggedIn !== 'true') {
                const currentDirPath = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
                window.location.href = currentDirPath + 'index.html'; 
            }

            // 顯示用戶資訊
            const userInfoSpan = document.getElementById('userInfo');
            const currentUserId = sessionStorage.getItem('currentUserId');

            // 登出按鈕功能
            const logoutButton = document.getElementById('logoutButton');
            if (logoutButton) {
                logoutButton.addEventListener('click', function(event) {
                    event.preventDefault();
                    sessionStorage.removeItem('loggedIn'); // 清除登入標誌
                    sessionStorage.removeItem('currentUserId'); // 移除用戶 ID
                    const currentDirPath = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
                    window.location.href = currentDirPath + 'index.html'; 
                });
            }

            // 資料夾收合/展開功能
            const folderToggles = document.querySelectorAll('.folder-toggle');
            folderToggles.forEach(toggle => {
                toggle.addEventListener('click', function() {
                    this.classList.toggle('expanded');
                    const content = this.closest('li').querySelector('.collapsible-content');
                    if (content) {
                        content.classList.toggle('expanded');
                    }
                });

                const folderName = toggle.nextElementSibling; // folder-name span
                if (folderName && folderName.classList.contains('folder-name')) {
                    folderName.addEventListener('click', function() {
                        this.previousElementSibling.click();
                    });
                }
            });

            // 【新增】語言切換邏輯
            const langZhButton = document.getElementById('langZh');
            const langEnButton = document.getElementById('langEn');

            if (langZhButton) {
                langZhButton.addEventListener('click', () => applyTranslations('zh'));
            }
            if (langEnButton) {
                langEnButton.addEventListener('click', () => applyTranslations('en'));
            }

            // 頁面載入時，檢查 localStorage 或預設為英文
            const savedLanguage = localStorage.getItem('currentLanguage');
            applyTranslations(savedLanguage || 'en'); // 預設為英文

        });
    