
        // 原始 Markdown 內容，這裡直接嵌入，實際應用中可以從文件讀取
        const markdownContent = `# Multiverse of 依渟
#### [[渟渟急轉彎]]
##### 香香妹紙
#### [[懶惰小依 & 賴床小依]]
##### 香香妹紙
#### [[王依渟]]
##### 網紅直播主
# Variants
#### [[紀崴]]
##### 工程師
#### [[憑拳大將軍]]
##### 平權鬥士
# Administration
#### [[蒂娜]]
##### 行政助理
`;

        // 模擬的圖片 URL 映射，請替換為實際的圖片路徑
        // 這裡使用 placeholder 圖片作為範例
        const imageUrls = {
"All-nighter": "../Illustration/All-nighter.png",
"Analyze": "../Illustration/Analyze.png",
"Anticipate": "../Illustration/Anticipate.png",
"Artificial Intelligence": "../Illustration/Artificial Intelligence.png",
"Assign": "../Illustration/Assign.png",
"Auto White Balance": "../Illustration/Auto White Balance.png",
"Background": "../Illustration/Background.png",
"Big Data Analysis": "../Illustration/Big Data Analysis.png",
"Defer": "../Illustration/Defer.png",
"Demosaicing": "../Illustration/Demosaicing.png",
"Digital IC Design": "../Illustration/Digital IC Design.png",
"Dump": "../Illustration/Dump.png",
"Eye Corner Detection": "../Illustration/Eye Corner Detection.png",
"Falsify": "../Illustration/Falsify.png",
"Firework Algorithm": "../Illustration/Firework Algorithm.png",
"Forced Publish": "../Illustration/Forced Publish.png",
"Fuzzy Control": "../Illustration/Fuzzy Control.png",
"Halftone": "../Illustration/Halftone.png",
"Histogram Equalization": "../Illustration/Histogram Equalization.png",
"Iris Matching": "../Illustration/Iris Matching.png",
"Let's ball": "../Illustration/Let's ball.png",
"Lossy Compression": "../Illustration/Lossy Compression.png",
"Motion Estimation & Compensation": "../Illustration/Motion Estimation & Compensation.png",
"NAS Database": "../Illustration/NAS Database.png",
"New_Cover": "../Illustration/New_Cover.png",
"Noise Filter": "../Illustration/Noise Filter.png",
"Paper Storm": "../Illustration/Paper Storm.png",
"Parallel Computing": "../Illustration/Parallel Computing.png",
"Phase Search": "../Illustration/Phase Search.png",
"Plagiarize": "../Illustration/Plagiarize.png",
"Prof. 蛋頭博士": "../Illustration/Prof. 蛋頭博士.png",
"Retract": "../Illustration/Retract.png",
"Rock": "../Illustration/Rock.png",
"Rocky": "../Illustration/Rocky.png",
"Seminar": "../Illustration/Seminar.png",
"Side Quest": "../Illustration/Side Quest.png",
"Start Over": "../Illustration/Start Over.png",
"Tone Reproduction": "../Illustration/Tone Reproduction.png",
"余十三": "../Illustration/余十三.png",
"小南瓜": "../Illustration/小南瓜.png",
"小瓜": "../Illustration/小瓜.png",
"徐丞丞": "../Illustration/徐丞丞.png",
"心碎小狗": "../Illustration/心碎小狗.png",
"慈慈": "../Illustration/慈慈.png",
"憑拳大將軍": "../Illustration/憑拳大將軍.png",
"應葛格": "../Illustration/應葛格.png",
"懶惰小依 & 賴床小依": "../Illustration/懶惰小依 & 賴床小依.png",
"懶惰小依": "../Illustration/懶惰小依.png",
"敦敦": "../Illustration/敦敦.png",
"梵楓霖": "../Illustration/梵楓霖.png",
"橋牌社長": "../Illustration/橋牌社長.png",
"海神巨獸 - 沉睡": "../Illustration/海神巨獸 - 沉睡.png",
"海神巨獸 - 甦醒": "../Illustration/海神巨獸 - 甦醒.png",
"海神巨獸": "../Illustration/海神巨獸.png",
"深淵": "../Illustration/深淵.png",
"渟渟急轉彎": "../Illustration/渟渟急轉彎.png",
"湖口砲兵連連長": "../Illustration/湖口砲兵連連長.png",
"焦糖o彤兒": "../Illustration/焦糖o彤兒.png",
"牛仔褲寶貝": "../Illustration/牛仔褲寶貝.png",
"王依渟": "../Illustration/王依渟.png",
"珊珊姊": "../Illustration/珊珊姊.png",
"球球": "../Illustration/球球.png",
"穢土轉生研究生": "../Illustration/穢土轉生研究生.png",
"紀崴": "../Illustration/紀崴.png",
"老人與狗": "../Illustration/老人與狗.png",
"色彩學大師": "../Illustration/色彩學大師.png",
"蒂娜": "../Illustration/蒂娜.png",
"裘萌 & 首蒙元": "../Illustration/裘萌 & 首蒙元.png",
"裘萌": "../Illustration/裘萌.png",
"諸葛小劉": "../Illustration/諸葛小劉.png",
"賴床小依": "../Illustration/賴床小依.png",
"金門王": "../Illustration/金門王.png",
"阿詠": "../Illustration/阿詠.png",
"陳大帥帥": "../Illustration/陳大帥帥.png",
"首蒙元": "../Illustration/首蒙元.png",
"馬華": "../Illustration/馬華.png",
"黃老二": "../Illustration/黃老二.png"
};

        // 您可以在這裡定義每個成員的超連結地址
        // 如果沒有提供，則使用 '#' 作為預設連結
        const personLinks = {
"All-nighter": "../Action/All-nighter.html",
"Analyze": "../Action/Analyze.html",
"Anticipate": "../Action/Anticipate.html",
"Artificial Intelligence": "../Algorithm/Hand Based/Artificial Intelligence.html",
"Assign": "../Action/Assign.html",
"Auto White Balance": "../Algorithm/Paper Based/Auto White Balance.html",
"Background": "#",
"Big Data Analysis": "../Algorithm/Rule Based/Big Data Analysis.html",
"Defer": "../Action/Defer.html",
"Demosaicing": "../Algorithm/Hand Based/Demosaicing.html",
"Digital IC Design": "../Algorithm/Paper Based/Digital IC Design.html",
"Dump": "../Action/Dump.html",
"Eye Corner Detection": "../Algorithm/Hand Based/Eye Corner Detection.html",
"Falsify": "../Action/Falsify.html",
"Firework Algorithm": "../Algorithm/Paper Based/Firework Algorithm.html",
"Forced Publish": "../Action/Forced Publish.html",
"Fuzzy Control": "../Algorithm/Rule Based/Fuzzy Control.html",
"Halftone": "../Algorithm/Paper Based/Halftone.html",
"Histogram Equalization": "../Algorithm/Hand Based/Histogram Equalization.html",
"Iris Matching": "../Algorithm/Hand Based/Iris Matching.html",
"Let's ball": "../Action/Let's ball.html",
"Lossy Compression": "../Algorithm/Paper Based/Lossy Compression.html",
"Motion Estimation & Compensation": "../Algorithm/Rule Based/Motion Estimation & Compensation.html",
"NAS Database": "../Algorithm/Rule Based/NAS Database.html",
"New_Cover": "#",
"Noise Filter": "../Algorithm/Rule Based/Noise Filter.html",
"Paper Storm": "../Action/Paper Storm.html",
"Parallel Computing": "../Algorithm/Rule Based/Parallel Computing.html",
"Phase Search": "#",
"Plagiarize": "../Action/Plagiarize.html",
"Prof. 蛋頭博士": "../SoC Lab/Prof. 蛋頭博士.html",
"Retract": "../Action/Retract.html",
"Rock": "../Appendix/Rock.html",
"Rocky": "../AIoT Lab/Rocky.html",
"Seminar": "../Action/Seminar.html",
"Side Quest": "../Action/Side Quest.html",
"Start Over": "../Action/Start Over.html",
"Tone Reproduction": "../Algorithm/Paper Based/Tone Reproduction.html",
"余十三": "../SoC Lab/余十三.html",
"小南瓜": "../SoC Lab/小南瓜.html",
"小瓜": "../AIoT Lab/小瓜.html",
"徐丞丞": "../SoC Lab/徐丞丞.html",
"心碎小狗": "../SoC Lab/心碎小狗.html",
"慈慈": "../AIoT Lab/慈慈.html",
"憑拳大將軍": "../Badass/憑拳大將軍.html",
"應葛格": "../SoC Lab/應葛格.html",
"懶惰小依 & 賴床小依": "../Badass/懶惰小依 & 賴床小依.html",
"懶惰小依": "#",
"敦敦": "../SoC Lab/敦敦.html",
"梵楓霖": "../SoC Lab/梵楓霖.html",
"橋牌社長": "../SoC Lab/橋牌社長.html",
"海神巨獸 - 沉睡": "#",
"海神巨獸 - 甦醒": "#",
"海神巨獸": "../EMCA Lab/海神巨獸.html",
"深淵": "../Appendix/深淵.html",
"渟渟急轉彎": "../Badass/渟渟急轉彎.html",
"湖口砲兵連連長": "../SoC Lab/湖口砲兵連連長.html",
"焦糖o彤兒": "../SoC Lab/焦糖o彤兒.html",
"牛仔褲寶貝": "../AIoT Lab/牛仔褲寶貝.html",
"王依渟": "../Badass/王依渟.html",
"珊珊姊": "../SoC Lab/珊珊姊.html",
"球球": "../Appendix/球球.html",
"穢土轉生研究生": "../Appendix/穢土轉生研究生.html",
"紀崴": "../Badass/紀崴.html",
"老人與狗": "../AIoT Lab/老人與狗.html",
"色彩學大師": "../SoC Lab/色彩學大師.html",
"蒂娜": "../Badass/蒂娜.html",
"裘萌 & 首蒙元": "../AIoT Lab/裘萌 & 首蒙元.html",
"裘萌": "#",
"諸葛小劉": "../SoC Lab/諸葛小劉.html",
"賴床小依": "#",
"金門王": "../EMCA Lab/金門王.html",
"阿詠": "../AIoT Lab/阿詠.html",
"陳大帥帥": "../SoC Lab/陳大帥帥.html",
"首蒙元": "#",
"馬華": "../SoC Lab/馬華.html",
"黃老二": "../SoC Lab/黃老二.html"
};

        function parseMarkdown(md) {
            const lines = md.split('\n').filter(line => line.trim() !== '');
            const data = {};
            const sectionOrder = []; // 用於儲存頂層區塊的順序
            let currentSectionKey = null; // 當前頂層區塊的名稱 (例如 "Professor", "Masters")
            let currentSubGroupKey = null; // 新增：當前子分組的名稱 (例如 "Year 110", "Subgroup A")

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // 1. 檢查頂層區塊 (例如：# Professor, # Masters, # Undergrads)
                if (line.startsWith('# ') && !line.startsWith('##')) {
                    currentSectionKey = line.substring(line.indexOf(' ') + 1).trim(); // 提取實際的區塊名稱
                    sectionOrder.push(currentSectionKey); // 記錄區塊順序
                    data[currentSectionKey] = {}; // 修正：所有頂層區塊現在都將包含一個物件，用於儲存子分組或預設分組
                    currentSubGroupKey = '_default'; // 預設子分組鍵，用於沒有 ### 標題的內容
                    data[currentSectionKey][currentSubGroupKey] = []; // 初始化預設子分組陣列
                    currentYear = null; // 重置年份，因為年份只在 Masters 區塊內部有特殊意義
                    continue;
                }

                // 2. 檢查子分組標題 (例如：### Year 110, ### Subgroup A)
                // 匹配以 "### " 開頭的任何內容作為子分組標題
                if (line.startsWith('### ')) {
                    currentSubGroupKey = line.substring(line.indexOf(' ') + 1).trim(); // 提取子分組名稱
                    if (currentSectionKey) { // 確保有當前頂層區塊
                        if (!data[currentSectionKey][currentSubGroupKey]) {
                            data[currentSectionKey][currentSubGroupKey] = []; // 初始化子分組陣列
                        }
                    } else {
                        console.warn(`警告: 子分組 '${currentSubGroupKey}' 在未定義的頂層區塊中被發現。`);
                    }
                    continue;
                }

                // 3. 檢查人物條目 (例如：#### [[名稱]])
                if (line.startsWith('#### [[')) {
                    const name = line.replace('#### [[', '').replace(']]', '').trim();

                    let department = '無系所職稱資訊';
                    const researchDetails = [];

                    let nextLineIndex = i + 1;

                    // 收集系所/職稱 (#####)
                    if (nextLineIndex < lines.length && lines[nextLineIndex].startsWith('##### ')) {
                        department = lines[nextLineIndex].replace('##### ', '').trim();
                        nextLineIndex++;
                    }

                    // 收集所有後續的研究題目/專長 (######)
                    while (nextLineIndex < lines.length && lines[nextLineIndex].startsWith('###### ')) {
                        researchDetails.push(lines[nextLineIndex].replace('###### ', '').trim());
                        nextLineIndex++;
                    }
                    i = nextLineIndex - 1; // 更新主迴圈索引，跳過所有已處理的詳細資訊行

                    const person = {
                        name: name,
                        imageUrl: imageUrls[name] || 'https://placehold.co/200x200/cccccc/333333?text=無圖片',
                        linkUrl: personLinks[name] || '#',
                        department: department,
                        researchDetails: researchDetails
                    };

                    // === 數據添加邏輯 (修正為通用子分組) ===
                    if (currentSectionKey && currentSubGroupKey) {
                        // 確保頂層區塊和子分組都已存在並是陣列
                        if (data[currentSectionKey][currentSubGroupKey]) {
                            data[currentSectionKey][currentSubGroupKey].push(person);
                        } else {
                            console.warn(`警告: 無法將人物 '${name}' 添加到區塊 '${currentSectionKey}' 下的子分組 '${currentSubGroupKey}'。`);
                        }
                    } else {
                        console.warn(`警告: 人物 '${name}' 在未定義的區塊或子分組中被發現。`);
                    }
                    // =========================
                }
            }
            data._sectionOrder = sectionOrder;
            return data;
        }

        // 創建人物卡片 HTML
        function createPersonCard(person) {
            // 處理研究題目/專長，如果有多行則用 <br> 連接，如果沒有則顯示預設文字
            let researchDetailsHtml = (person.researchDetails && person.researchDetails.length > 0) ?
                                       person.researchDetails.join('<br>') : ' ';

            // <--- 新增：根據文字內容高亮顯示
            // 定義要高亮的關鍵字和對應的類別
            const highlightKeywords = [
                { keyword: '電子紙', className: 'highlight-red' },
                { keyword: '數位相機', className: 'highlight-blue' },
                { keyword: '眼動儀', className: 'highlight-green' }
            ];

            highlightKeywords.forEach(item => {
                // 使用正則表達式進行全局替換，確保所有匹配項都被替換
                // g: 全局匹配, i: 不區分大小寫 (如果需要)
                const regex = new RegExp(item.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'); // 轉義特殊字符
                researchDetailsHtml = researchDetailsHtml.replace(regex, `<span class="${item.className}">${item.keyword}</span>`);
            });
            // --- 新增結束 ---

            // 使用 <a> 標籤包裹圖片和名稱，並設定 href
            return `
                <div class="person-card">
                    <a href="${person.linkUrl}" class="person-image-link">
                        <img src="${person.imageUrl}" alt="${person.name}" onerror="this.onerror=null;this.src='https://placehold.co/200x200/cccccc/333333?text=圖片載入失敗';">
                    </a>
                    <div>
                        <a href="${person.linkUrl}" class="person-name-link">
                            <h3>${person.name}</h3>
                        </a>
                        <div class="person-department">${person.department}</div>
                        <p>${researchDetailsHtml}</p>
                    </div>
                </div>
            `;
        }

        function renderData() {
            const parsedData = parseMarkdown(markdownContent);
            const dynamicSectionsContainer = document.getElementById('dynamic-lab-sections');

            if (!dynamicSectionsContainer) {
                console.error("錯誤: 找不到用於動態內容的主容器 'dynamic-lab-sections'。");
                return;
            }

            dynamicSectionsContainer.innerHTML = ''; // 清空舊內容

            const sectionOrder = parsedData._sectionOrder || [];
            delete parsedData._sectionOrder; // 移除內部順序鍵

            if (sectionOrder.length === 0) {
                dynamicSectionsContainer.innerHTML = '<p style="text-align: center; color: #999; margin-top: 50px;">目前沒有任何成員資料。</p>';
                return;
            }

            sectionOrder.forEach(sectionKey => {
                const sectionData = parsedData[sectionKey];

                // 檢查該頂層區塊是否有任何子分組或預設分組的數據
                const hasAnySubGroupData = Object.keys(sectionData).some(subGroupKey => {
                    const subGroupData = sectionData[subGroupKey];
                    // 如果是 Masters 區塊，且子分組是年份，則檢查年份下是否有數據
                    if (sectionKey === 'Masters' && subGroupKey.startsWith('Year ')) {
                        // Masters 年份子分組內部也是陣列
                        return subGroupData && subGroupData.length > 0;
                    }
                    // 其他情況（例如 _default 或其他 H3 子分組）直接檢查是否為非空陣列
                    return subGroupData && Array.isArray(subGroupData) && subGroupData.length > 0;
                });

                if (hasAnySubGroupData) {
                    const sectionHtml = document.createElement('section');
                    sectionHtml.className = 'section-block';

                    // 動態創建頂層區塊標題 (例如 Professor, Undergrads, Multiverse of 依渟)
                    const sectionTitle = document.createElement('h2');
                    sectionTitle.className = 'dynamic-section-title text-primary'; // 使用 text-primary 類別
                    sectionTitle.textContent = sectionKey;
                    sectionHtml.appendChild(sectionTitle);

                    // 遍歷該頂層區塊下的所有子分組
                    const subGroupKeys = Object.keys(sectionData);

                    // 如果是 Masters 區塊，按年份排序子分組
                    if (sectionKey === 'Masters') {
                        subGroupKeys.sort((a, b) => {
                            // 特殊處理 '_default' 鍵，讓它排在年份之後
                            if (a === '_default') return 1;
                            if (b === '_default') return -1;
                            // 對年份進行數字排序
                            const yearA = parseInt(a.replace('Year ', ''));
                            const yearB = parseInt(b.replace('Year ', ''));
                            return yearA - yearB;
                        });
                    }

                    subGroupKeys.forEach(subGroupKey => {
                        const subGroupData = sectionData[subGroupKey];

                        if (subGroupData && subGroupData.length > 0) { // 僅當子分組有數據時才渲染
                            // 如果不是預設分組，則創建子標題
                            if (subGroupKey !== '_default') {
                                const subTitle = document.createElement('h4'); // 使用 h4 作為子標題
                                subTitle.className = 'sub-section-title'; // 使用通用的子分組標題樣式
                                subTitle.textContent = subGroupKey; // 例如 "Year 110", "Subgroup A"
                                sectionHtml.appendChild(subTitle);
                            }

                            const gridDiv = document.createElement('div');
                            gridDiv.className = 'grid-container';
                            gridDiv.innerHTML = subGroupData.map(createPersonCard).join('');
                            sectionHtml.appendChild(gridDiv);
                        }
                    });
                    dynamicSectionsContainer.appendChild(sectionHtml);
                }
            });

            // 如果最終沒有任何內容被渲染
            if (dynamicSectionsContainer.innerHTML.trim() === '') {
                dynamicSectionsContainer.innerHTML = '<p style="text-align: center; color: #999; margin-top: 50px;">目前沒有任何成員資料。</p>';
            }
        }

        // 獲取「回到頂部」按鈕元素
        const backToTopBtn = document.getElementById("backToTopBtn");
        // 函數：根據滾動位置顯示或隱藏按鈕
        function toggleBackToTopButton() {
            // 當用戶滾動超過 200px 時顯示按鈕
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
        // 當用戶滾動頁面時，執行 toggleBackToTopButton 函數
        window.addEventListener('scroll', toggleBackToTopButton);
        // 當用戶點擊按鈕時，平滑滾動到頁面頂部
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // 啟用平滑滾動
            });
        });

        document.addEventListener('DOMContentLoaded', function() {
            const isLoggedIn = sessionStorage.getItem('loggedIn');
            if (isLoggedIn !== 'true') {
                // 如果沒有登入標誌，重定向到登入頁面
                const currentDirPath = "../index.html";
                // const currentDirPath = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
                window.location.href = currentDirPath; 
            }

            renderData();
        });
    