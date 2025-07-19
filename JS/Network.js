
        // --- 背景 & 節點 Canvas 相關變數和上下文 ---
        const backgroundCanvas = document.getElementById('backgroundCanvas');
        const backgroundCtx = backgroundCanvas.getContext('2d');
        const nodeCanvas = document.getElementById('nodeCanvas');
        const nodeCtx = nodeCanvas.getContext('2d');

        // --- 背景呼吸燈相關變數 ---
        const baseGradientColors = {
            start: '#000000',
            end: 'rgb(125, 125, 125)'
        };
        const breathingLightColors = [
            { r: 255, g:   0, b:   0 },   // 紅色
            { r:   0, g: 255, b:   0 },   // 綠色
            { r:   0, g:   0, b: 255 }    // 藍色
        ];
        let breathingLights = [];

        // --- 網路節點連線相關變數 ---
        let nodes = [];
        let links = [];
        let draggedNode = null;
        let hoveredNode = null; // 新增：追蹤當前懸浮的節點
        let offsetX, offsetY;

        // --- 縮放和平移變數 ---
        let zoomScale = 1.0; // 當前縮放比例
        let panX = 0;        // 當前平移偏移量 X
        let panY = 0;        // 當前平移偏移量 Y
        let isPanning = false; // 新增：判斷是否正在平移背景
        let lastPanMouseX = 0; // 新增：上次平移時的滑鼠 X 座標 (螢幕座標)
        let lastPanMouseY = 0; // 新增：上次平移時的滑鼠 Y 座標 (螢幕座標)
        const ZOOM_SPEED = 0.001; // 滾輪縮放速度
        const MIN_ZOOM = 0.1; // 最小縮放比例
        const MAX_ZOOM = 5.0; // 最大縮放比例
        const TEXT_VISIBILITY_THRESHOLD = 1.25; // 新增：文字顯示的縮放閾值
        const HOVER_TEXT_OFFSET = 15; // 懸浮時文字額外下移的像素距離
        const HOVERED_NODE_GLOW_COLOR = '#FFD700'; // 新增：懸浮節點的光暈顏色 (例如：金色)
        const TEXT_ANIMATION_SMOOTHING = 0.2; // 新增：文字動畫平滑度 (0.1 較慢，0.5 較快)
        const TEXT_ANIMATION_THRESHOLD = 0.1; // 新增：文字動畫停止的閾值
        
        // 新增：縮放拖曳條相關變數和元素
        const zoomSliderContainer = document.querySelector('.zoom-slider-container');
        const zoomSliderHandle = document.getElementById('zoomSliderHandle');
        let isSliderDragging = false;
        let sliderStartX = 0; // 滑塊拖曳開始時的滑鼠/觸摸 X 座標
        let sliderHandleInitialLeft = 0; // 滑塊拖曳開始時手柄的 left 屬性值

        // 新增：縮放按鈕元素
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const zoomInBtn = document.getElementById('zoomInBtn');

        // 新增：點擊與拖曳判斷相關變數
        let mouseDownPos = { x: 0, y: 0 }; // 記錄滑鼠按下時的螢幕座標
        // let isClicking = false; // 標記是否處於潛在的點擊狀態
        const CLICK_THRESHOLD = 5; // 滑鼠移動超過這個距離則視為拖曳，否則為點擊 (像素)        

        // 新增：手機端激活節點變數
        let activatedNode = null; // 當前被點擊激活的節點 (用於手機端模擬懸浮)

        // 新增：設備類型判斷變數
        let isTouchDevice = false; // 判斷是否為觸摸設備

        // --- 動畫控制變數 ---
        let nodeAnimationFrameId = null; // 節點動畫的 ID
        const stabilityThreshold = 0.2;
        let isSystemStable = false;

        // --- 背景呼吸燈相關函式 ---
        function initBreathingLights() {
            breathingLights = [];
            const minCanvasDim = Math.max(10, backgroundCanvas.width, backgroundCanvas.height);
            const minRadius = minCanvasDim * 0.8;
            const maxPulseAmplitude = minRadius * 0.4;

            breathingLights.push({ x: backgroundCanvas.width * 0.2, y: backgroundCanvas.height * 0.8, baseRadius: minRadius, maxPulse: maxPulseAmplitude, pulseSpeed: 0.001, color: breathingLightColors[0], offset: Math.PI * 0.7, baseOpacity: 0.10 });
            breathingLights.push({ x: backgroundCanvas.width * 0.5, y: backgroundCanvas.height * 0.5, baseRadius: minRadius, maxPulse: maxPulseAmplitude, pulseSpeed: 0.001, color: breathingLightColors[1], offset: Math.PI * 0.7, baseOpacity: 0.10 });
            breathingLights.push({ x: backgroundCanvas.width * 0.8, y: backgroundCanvas.height * 0.2, baseRadius: minRadius, maxPulse: maxPulseAmplitude, pulseSpeed: 0.001, color: breathingLightColors[2], offset: Math.PI * 0.7, baseOpacity: 0.10 });
        }

        function drawBaseGradient() {
            const gradient = backgroundCtx.createLinearGradient(0, 0, backgroundCanvas.width, backgroundCanvas.height);
            gradient.addColorStop(0, baseGradientColors.start);
            gradient.addColorStop(1, baseGradientColors.end);
            backgroundCtx.fillStyle = gradient;
            backgroundCtx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        }

        function drawBreathingLights() {
            if (!Number.isFinite(backgroundCanvas.width) || backgroundCanvas.width <= 0 || !Number.isFinite(backgroundCanvas.height) || backgroundCanvas.height <= 0) {
                console.error("Background Canvas dimensions are invalid or zero, skipping drawing frame.");
                return;
            }

            breathingLights.forEach(light => {
                const pulseValue = Math.sin(Date.now() * light.pulseSpeed + light.offset);
                let currentRadius = light.baseRadius + pulseValue * light.maxPulse;
                if (!Number.isFinite(currentRadius) || currentRadius < 1.0) currentRadius = 1.0;

                let currentOpacity = light.baseOpacity + Math.max(0, pulseValue * 0.05);
                if (!Number.isFinite(currentOpacity) || currentOpacity < 0) currentOpacity = 0.01;
                else if (currentOpacity > 1) currentOpacity = 1;

                const safeX = Number.isFinite(light.x) ? light.x : backgroundCanvas.width / 2;
                const safeY = Number.isFinite(light.y) ? light.y : backgroundCanvas.height / 2;

                if (!Number.isFinite(safeX) || !Number.isFinite(safeY) || !Number.isFinite(currentRadius) || currentRadius <= 0) {
                    console.error("Invalid parameters for createRadialGradient:", { safeX, safeY, currentRadius });
                    return;
                }

                const gradient = backgroundCtx.createRadialGradient(safeX, safeY, 0, safeX, safeY, currentRadius);
                gradient.addColorStop(0, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, ${currentOpacity * 1.5})`);
                gradient.addColorStop(0.5, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, ${currentOpacity * 0.8})`);
                gradient.addColorStop(1, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, 0)`);

                backgroundCtx.fillStyle = gradient;
                backgroundCtx.globalCompositeOperation = 'lighter';
                backgroundCtx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
                backgroundCtx.globalCompositeOperation = 'source-over';
            });
        }

        function backgroundAnimate() {
            drawBaseGradient();
            drawBreathingLights();
            requestAnimationFrame(backgroundAnimate);
        }

        // --- 網路節點連線相關函式 ---
        function initGraph() {
            nodes.forEach(node => {
                node.vx = 0;
                node.vy = 0;
                node.isDragged = false;
            });

            // 節點半徑，使其看起來更像「點」
            nodes = [
{ id: 'Rocky', name: 'Rocky', x: nodeCanvas.width * 0.5615043513005804, y: nodeCanvas.height * 0.2802726261943883, radius: 7.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'AIoT Lab/Rocky.html' },
{ id: '小瓜', name: '小瓜', x: nodeCanvas.width * 0.8216724473367891, y: nodeCanvas.height * 0.5829951254228254, radius: 5.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'AIoT Lab/小瓜.html' },
{ id: '慈慈', name: '慈慈', x: nodeCanvas.width * 0.6090453151066669, y: nodeCanvas.height * 0.6840904098416308, radius: 7.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'AIoT Lab/慈慈.html' },
{ id: '牛仔褲寶貝', name: '牛仔褲寶貝', x: nodeCanvas.width * 0.31744508108142283, y: nodeCanvas.height * 0.6842858552207156, radius: 8.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'AIoT Lab/牛仔褲寶貝.html' },
{ id: '老人與狗', name: '老人與狗', x: nodeCanvas.width * 0.43940187894104277, y: nodeCanvas.height * 0.6113287213199996, radius: 7.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'AIoT Lab/老人與狗.html' },
{ id: '裘萌 & 首蒙元', name: '裘萌 & 首蒙元', x: nodeCanvas.width * 0.5831019933427579, y: nodeCanvas.height * 0.8118667408697524, radius: 6.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'AIoT Lab/裘萌 & 首蒙元.html' },
{ id: '阿詠', name: '阿詠', x: nodeCanvas.width * 0.273322812546267, y: nodeCanvas.height * 0.4979081517686654, radius: 6.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'AIoT Lab/阿詠.html' },
{ id: 'Rock', name: 'Rock', x: nodeCanvas.width * 0.6768412337317852, y: nodeCanvas.height * 0.32601957200684856, radius: 5.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'Appendix/Rock.html' },
{ id: '深淵', name: '深淵', x: nodeCanvas.width * 0.42687956514073033, y: nodeCanvas.height * 0.8084471875987381, radius: 6.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'Appendix/深淵.html' },
{ id: '球球', name: '球球', x: nodeCanvas.width * 0.6082146600896162, y: nodeCanvas.height * 0.5674531965618882, radius: 5.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'Appendix/球球.html' },
{ id: '穢土轉生研究生', name: '穢土轉生研究生', x: nodeCanvas.width * 0.49898623979590107, y: nodeCanvas.height * 0.4523736744292676, radius: 5.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'Appendix/穢土轉生研究生.html' },
{ id: '憑拳大將軍', name: '憑拳大將軍', x: nodeCanvas.width * 0.6265005376864138, y: nodeCanvas.height * 0.2579706133440521, radius: 7.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'Badass/憑拳大將軍.html' },
{ id: '懶惰小依 & 賴床小依', name: '懶惰小依 & 賴床小依', x: nodeCanvas.width * 0.4452771027573472, y: nodeCanvas.height * 0.5116602156836786, radius: 9.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'Badass/懶惰小依 & 賴床小依.html' },
{ id: '渟渟急轉彎', name: '渟渟急轉彎', x: nodeCanvas.width * 0.5485309415126984, y: nodeCanvas.height * 0.726265380329339, radius: 7.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'Badass/渟渟急轉彎.html' },
{ id: '王依渟', name: '王依渟', x: nodeCanvas.width * 0.2917152793239298, y: nodeCanvas.height * 0.36028961377234375, radius: 6.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'Badass/王依渟.html' },
{ id: '紀崴', name: '紀崴', x: nodeCanvas.width * 0.4537152025072077, y: nodeCanvas.height * 0.37899756109928345, radius: 6.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'Badass/紀崴.html' },
{ id: '蒂娜', name: '蒂娜', x: nodeCanvas.width * 0.7550043700035579, y: nodeCanvas.height * 0.579912494726997, radius: 5.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'Badass/蒂娜.html' },
{ id: '海神巨獸', name: '海神巨獸', x: nodeCanvas.width * 0.6729052922723282, y: nodeCanvas.height * 0.4261027230760571, radius: 7.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'EMCA Lab/海神巨獸.html' },
{ id: '金門王', name: '金門王', x: nodeCanvas.width * 0.499859226269645, y: nodeCanvas.height * 0.5691254268374799, radius: 8.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'EMCA Lab/金門王.html' },
{ id: 'AIoT Lab', name: 'AIoT Lab', x: nodeCanvas.width * 0.6688841558758378, y: nodeCanvas.height * 0.5259811366746334, radius: 8.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'Lab/AIoT Lab.html' },
{ id: 'Badass', name: 'Badass', x: nodeCanvas.width * 0.6631582920523849, y: nodeCanvas.height * 0.6256408504305884, radius: 8.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'Lab/Badass.html' },
{ id: 'EMCA Lab', name: 'EMCA Lab', x: nodeCanvas.width * 0.412216973814166, y: nodeCanvas.height * 0.3007268733215436, radius: 6.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'Lab/EMCA Lab.html' },
{ id: 'SoC Lab', name: 'SoC Lab', x: nodeCanvas.width * 0.39999084214701547, y: nodeCanvas.height * 0.43824320406713063, radius: 13.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'Lab/SoC Lab.html' },
{ id: 'Prof. 蛋頭博士', name: 'Prof. 蛋頭博士', x: nodeCanvas.width * 0.31481678486261516, y: nodeCanvas.height * 0.5762487384447942, radius: 7.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/Prof. 蛋頭博士.html' },
{ id: '余十三', name: '余十三', x: nodeCanvas.width * 0.488093242955422, y: nodeCanvas.height * 0.7685444614176805, radius: 6.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/余十三.html' },
{ id: '小南瓜', name: '小南瓜', x: nodeCanvas.width * 0.6088181492405802, y: nodeCanvas.height * 0.453741185641319, radius: 5.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/小南瓜.html' },
{ id: '徐丞丞', name: '徐丞丞', x: nodeCanvas.width * 0.3340196345278101, y: nodeCanvas.height * 0.45305900643858976, radius: 7.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/徐丞丞.html' },
{ id: '心碎小狗', name: '心碎小狗', x: nodeCanvas.width * 0.3740705637864817, y: nodeCanvas.height * 0.6314359557115028, radius: 6.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/心碎小狗.html' },
{ id: '應葛格', name: '應葛格', x: nodeCanvas.width * 0.37549272840209547, y: nodeCanvas.height * 0.5314158446555933, radius: 6.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/應葛格.html' },
{ id: '敦敦', name: '敦敦', x: nodeCanvas.width * 0.4939598169593548, y: nodeCanvas.height * 0.6688200952766306, radius: 6.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/敦敦.html' },
{ id: '梵楓霖', name: '梵楓霖', x: nodeCanvas.width * 0.4719752969854263, y: nodeCanvas.height * 0.20913619278425, radius: 5.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/梵楓霖.html' },
{ id: '橋牌社長', name: '橋牌社長', x: nodeCanvas.width * 0.5535600823620764, y: nodeCanvas.height * 0.5098438280460251, radius: 7.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/橋牌社長.html' },
{ id: '湖口砲兵連連長', name: '湖口砲兵連連長', x: nodeCanvas.width * 0.35842195374762764, y: nodeCanvas.height * 0.359984631851463, radius: 6.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/湖口砲兵連連長.html' },
{ id: '焦糖o彤兒', name: '焦糖o彤兒', x: nodeCanvas.width * 0.542065325670728, y: nodeCanvas.height * 0.3759748386735243, radius: 6.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/焦糖o彤兒.html' },
{ id: '珊珊姊', name: '珊珊姊', x: nodeCanvas.width * 0.40551746335955435, y: nodeCanvas.height * 0.20119783539469868, radius: 7.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/珊珊姊.html' },
{ id: '色彩學大師', name: '色彩學大師', x: nodeCanvas.width * 0.41591605198691145, y: nodeCanvas.height * 0.7096218258371217, radius: 7.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/色彩學大師.html' },
{ id: '諸葛小劉', name: '諸葛小劉', x: nodeCanvas.width * 0.49642130258046574, y: nodeCanvas.height * 0.30218135724474515, radius: 5.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/諸葛小劉.html' },
{ id: '陳大帥帥', name: '陳大帥帥', x: nodeCanvas.width * 0.6070764769480312, y: nodeCanvas.height * 0.35365504579544427, radius: 6.0, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/陳大帥帥.html' },
{ id: '馬華', name: '馬華', x: nodeCanvas.width * 0.5544481345419764, y: nodeCanvas.height * 0.6266503119417555, radius: 5.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/馬華.html' },
{ id: '黃老二', name: '黃老二', x: nodeCanvas.width * 0.3511531964467488, y: nodeCanvas.height * 0.2605314902470134, radius: 7.5, originalColor: '#FFFFFF', color: '#FFFFFF', originalTextColor: '#FFFFFF', textColor: '#FFFFFF', vx: 0, vy: 0, isDragged: false, isHighlighted: false, currentTextYOffset: 0, link: 'SoC Lab/黃老二.html' }
]; 
            links = [
{ source: nodes[0], target: nodes[7], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[0], target: nodes[4], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[0], target: nodes[39], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[2], target: nodes[24], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[3], target: nodes[4], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[3], target: nodes[39], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[3], target: nodes[35], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[4], target: nodes[3], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[5], target: nodes[4], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[6], target: nodes[23], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[11], target: nodes[33], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[11], target: nodes[34], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[12], target: nodes[39], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[12], target: nodes[37], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[12], target: nodes[23], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[12], target: nodes[11], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[12], target: nodes[34], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[13], target: nodes[12], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[13], target: nodes[3], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[13], target: nodes[35], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[15], target: nodes[26], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[17], target: nodes[8], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[17], target: nodes[18], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[18], target: nodes[28], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[18], target: nodes[17], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[18], target: nodes[8], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[19], target: nodes[4], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[19], target: nodes[6], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[19], target: nodes[2], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[19], target: nodes[3], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[19], target: nodes[0], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[19], target: nodes[5], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[19], target: nodes[1], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[20], target: nodes[13], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[20], target: nodes[12], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[20], target: nodes[14], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[20], target: nodes[15], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[20], target: nodes[11], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[20], target: nodes[16], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[21], target: nodes[18], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[21], target: nodes[17], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[23], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[29], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[38], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[26], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[28], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[24], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[35], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[31], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[32], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[25], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[27], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[37], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[39], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[34], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[33], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[30], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[22], target: nodes[36], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[23], target: nodes[6], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[24], target: nodes[2], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[26], target: nodes[15], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[26], target: nodes[31], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[27], target: nodes[31], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[28], target: nodes[18], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[29], target: nodes[9], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[31], target: nodes[26], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[31], target: nodes[27], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[32], target: nodes[10], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[33], target: nodes[11], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[34], target: nodes[12], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[35], target: nodes[2], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 },
{ source: nodes[39], target: nodes[14], originalColor: '#FFFFFF50', color: '#FFFFFF', width: 2 }
];
            isSystemStable = false;
        }

        // 繪製節點 (使用節點自身的 color 和 textColor 屬性)
        function drawNode(node) {
            // 設定光暈效果 (在繪製節點前)
            if (node.isHighlighted) {
                nodeCtx.shadowBlur = 15; // 光暈模糊度
                nodeCtx.shadowColor = '#00FFFF'; // 青綠色光暈
                // 如果是直接懸浮的節點，使用新的光暈顏色；否則使用預設的青綠色
                nodeCtx.shadowColor = (node === hoveredNode) ? HOVERED_NODE_GLOW_COLOR : '#00FFFF';
                nodeCtx.shadowOffsetX = 0;
                nodeCtx.shadowOffsetY = 0;
            } else {
                nodeCtx.shadowBlur = 0; // 移除光暈
            }

            // 繪製白點
            nodeCtx.beginPath();
            nodeCtx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            nodeCtx.fillStyle = node.color; // 使用節點的當前顏色
            nodeCtx.fill();
            nodeCtx.strokeStyle = node.color; // 邊框也使用當前顏色
            nodeCtx.lineWidth = 1;
            nodeCtx.stroke();

            // 繪製節點名稱 (使用節點自身的 textColor 屬性)
            // 文字不需要光暈，所以在繪製文字前重置 shadowBlur
            // 只有當 zoomScale 達到閾值時才繪製文字
            if (zoomScale >= TEXT_VISIBILITY_THRESHOLD || node.isHighlighted) {
                nodeCtx.shadowBlur = 0;
                nodeCtx.fillStyle = node.textColor; // 使用節點的當前文字顏色
                // 文字大小也應該考慮到縮放，使其在不同縮放級別下保持可讀性
                nodeCtx.font = `${node.radius * 1.5}px GenJyuuGothic, sans-serif`;
                nodeCtx.textAlign = 'center';
                nodeCtx.textBaseline = 'top';

                // const textY = node.y + node.radius + 3;
                // let textY = node.y + node.radius + 3 / zoomScale; // 基礎文字Y座標
                // // 如果節點被高亮（鼠標懸浮），則額外向下偏移
                // if (node.isHighlighted) {
                //     textY += 15 / zoomScale; // 額外向下偏移 15 像素，並根據縮放比例調整
                // }
                const textY = node.y + node.radius + (3 + node.currentTextYOffset) / zoomScale;

                nodeCtx.fillText(node.name, node.x, textY);
            }
        }

        // 繪製連線 (使用連線自身的 color 屬性)
        function drawLink(link) {
            // 設定光暈效果 (在繪製連線前)
            if (link.isHighlighted) {
                nodeCtx.shadowBlur = 10; // 光暈模糊度
                nodeCtx.shadowColor = '#00FFFF'; // 青綠色光暈
                nodeCtx.shadowOffsetX = 0;
                nodeCtx.shadowOffsetY = 0;
            } else {
                nodeCtx.shadowBlur = 0; // 移除光暈
            }
            nodeCtx.beginPath();
            nodeCtx.moveTo(link.source.x, link.source.y);
            nodeCtx.lineTo(link.target.x, link.target.y);
            nodeCtx.strokeStyle = link.color; // 使用連線的當前顏色
            nodeCtx.lineWidth = link.width;
            nodeCtx.stroke();
            // 繪製完連線後，立即重置 shadowBlur，避免影響後續繪圖
            nodeCtx.shadowBlur = 0;
        }

        function updateGraph() {
            const repulsionForce = 2.5;
            const attractionForce = 0.0000025;
            const damping = 0.7;
            const RepulsionDistanceThreshold = 80;

            let totalDisplacement = 0;

            nodes.forEach(node => {
                if (!node.isDragged) {
                    node.vx = node.vx || 0;
                    node.vy = node.vy || 0;

                    let fx = 0;
                    let fy = 0;

                    nodes.forEach(otherNode => {
                        if (node !== otherNode) {
                            const dx = node.x - otherNode.x;
                            const dy = node.y - otherNode.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            if (distance > 0 && distance < RepulsionDistanceThreshold) {
                                const force = repulsionForce / (distance * distance);
                                fx += dx * force;
                                fy += dy * force;
                            }
                        }
                    });

                    links.forEach(link => {
                        if (link.source === node) {
                            const dx = link.target.x - node.x;
                            const dy = link.target.y - node.y;
                            fx += dx * attractionForce;
                            fy += dy * attractionForce;
                        } else if (link.target === node) {
                            const dx = link.source.x - node.x;
                            const dy = link.source.y - node.y;
                            fx += dx * attractionForce;
                            fy += dy * attractionForce;
                        }
                    });

                    node.vx = (node.vx + fx) * damping;
                    node.vy = (node.vy + fy) * damping;

                    const prevX = node.x;
                    const prevY = node.y;
                    node.x += node.vx;
                    node.y += node.vy;

                    const textHeightEstimate = node.radius * 1.5 + 3;
                    if (node.x < node.radius) { node.x = node.radius; node.vx = 0; }
                    if (node.x > nodeCanvas.width - node.radius) { node.x = nodeCanvas.width - node.radius; node.vx = 0; }
                    if (node.y < node.radius) { node.y = node.radius; node.vy = 0; }
                    if (node.y > nodeCanvas.height - node.radius - textHeightEstimate) { node.y = nodeCanvas.height - node.radius - textHeightEstimate; node.vy = 0; }

                    totalDisplacement += Math.abs(node.x - prevX) + Math.abs(node.y - prevY);
                } else {
                    node.vx = 0;
                    node.vy = 0;
                }
            });
            return totalDisplacement;
        }

        // // 更新高亮狀態的函式 (包含光暈邏輯)
        // function updateHighlight(newHoveredNode) {
        //     let needsRedraw = false;

        //     // 1. 遍歷所有節點，重置或設定高亮狀態和顏色
        //     nodes.forEach(node => {
        //         const isConnectedToHovered = (newHoveredNode && (links.some(link => (link.source === node && link.target === newHoveredNode) || (link.target === node && link.source === newHoveredNode))));
        //         let targetColor;
        //         let targetTextColor;
        //         let targetIsHighlighted;

        //         if (newHoveredNode === null) { // 沒有懸浮節點，全部恢復預設
        //             targetColor = node.originalColor;
        //             targetTextColor = node.originalTextColor;
        //             targetIsHighlighted = false;
        //         } else if (node === newHoveredNode) { // 懸浮節點本身
        //             targetColor = '#fddc78'; // 亮黃色
        //             targetTextColor = '#fddc78'; // 亮黃色
        //             targetIsHighlighted = true;
        //         } else if (isConnectedToHovered) { // 與懸浮節點相連的節點
        //             targetColor = 'rgba(255, 255, 255, 1.0)'; // 亮白色點
        //             targetTextColor = 'rgba(224, 224, 224, 1.0)'; // 亮文字
        //             targetIsHighlighted = true;
        //         } else { // 其他不相關的節點，變暗
        //             targetColor = 'rgba(255, 255, 255, 0.2)'; // 暗白色點
        //             targetTextColor = 'rgba(224, 224, 224, 0.2)'; // 暗文字
        //             targetIsHighlighted = false;
        //         }

        //         if (node.color !== targetColor || node.textColor !== targetTextColor || node.isHighlighted !== targetIsHighlighted) {
        //             node.color = targetColor;
        //             node.textColor = targetTextColor;
        //             node.isHighlighted = targetIsHighlighted;
        //             needsRedraw = true;
        //         }
        //     });

        //     // 2. 遍歷所有連線，重置或設定高亮狀態和顏色
        //     links.forEach(link => {
        //         let targetColor;
        //         let targetIsHighlighted;

        //         if (newHoveredNode === null) { // 沒有懸浮節點，全部恢復預設
        //             targetColor = link.originalColor;
        //             targetIsHighlighted = false;
        //         } else if (link.source === newHoveredNode || link.target === newHoveredNode) { // 與懸浮節點相連的連線
        //             targetColor = '#00FFFF80'; // 青綠色
        //             targetIsHighlighted = true;
        //         } else { // 其他不相關的連線，變暗
        //             targetColor = 'rgba(204, 204, 204, 0.2)'; // 暗灰色線
        //             targetIsHighlighted = false;
        //         }

        //         if (link.color !== targetColor || link.isHighlighted !== targetIsHighlighted) {
        //             link.color = targetColor;
        //             link.isHighlighted = targetIsHighlighted;
        //             needsRedraw = true;
        //         }
        //     });

        //     // 3. 如果有任何顏色或透明度變化，則請求重繪
        //     if (needsRedraw) {
        //         if (nodeAnimationFrameId === null) { // 如果節點動畫停止了，重新啟動它
        //             isSystemStable = false;
        //             networkAnimate();
        //         }
        //     }
        // }

        // 新增：更新高亮狀態的函式 (包含光暈邏輯)
        function updateHighlight(newHoveredOrActivatedNode) {
            let needsRedraw = false;

            // 判斷當前真正應該高亮的節點
            // 如果有鼠標懸浮，則以鼠標懸浮為準 (桌面優先)
            // 否則，以觸摸激活的節點為準 (手機)
            const activeNode = newHoveredOrActivatedNode || activatedNode; // 優先使用 newHoveredOrActivatedNode

            // 1. 遍歷所有節點，重置或設定高亮狀態和顏色
            nodes.forEach(node => {
                const isConnectedToActive = (activeNode && (links.some(link => (link.source === node && link.target === activeNode) || (link.target === node && link.source === activeNode))));
                let targetColor;
                let targetTextColor;
                let targetIsHighlighted;

                if (activeNode === null) { // 沒有任何激活或懸浮節點，全部恢復預設
                    targetColor = node.originalColor;
                    targetTextColor = node.originalTextColor;
                    targetIsHighlighted = false;
                } else if (node === activeNode) { // 激活/懸浮節點本身
                    targetColor = '#fddc78'; // 亮黃色
                    targetTextColor = '#fddc78'; // 亮黃色
                    targetIsHighlighted = true;
                } else if (isConnectedToActive) { // 與激活/懸浮節點相連的節點
                    targetColor = 'rgba(255, 255, 255, 1.0)'; // 亮白色點
                    targetTextColor = 'rgba(224, 224, 224, 1.0)'; // 亮文字
                    targetIsHighlighted = true;
                } else { // 其他不相關的節點，變暗
                    targetColor = 'rgba(255, 255, 255, 0.2)'; // 暗白色點
                    targetTextColor = 'rgba(224, 224, 224, 0.2)'; // 暗文字
                    targetIsHighlighted = false;
                }

                if (node.color !== targetColor || node.textColor !== targetTextColor || node.isHighlighted !== targetIsHighlighted) {
                    node.color = targetColor;
                    node.textColor = targetTextColor;
                    node.isHighlighted = targetIsHighlighted;
                    needsRedraw = true;
                }
            });

            // 2. 遍歷所有連線，重置或設定高亮狀態和顏色
            links.forEach(link => {
                let targetColor;
                let targetIsHighlighted;

                if (activeNode === null) { // 沒有任何激活或懸浮節點，全部恢復預設
                    targetColor = link.originalColor;
                    targetIsHighlighted = false;
                } else if (link.source === activeNode || link.target === activeNode) { // 與激活/懸浮節點相連的連線
                    targetColor = '#00FFFF80'; // 青綠色
                    targetIsHighlighted = true;
                } else { // 其他不相關的連線，變暗
                    targetColor = 'rgba(204, 204, 204, 0.2)'; // 暗灰色線
                    targetIsHighlighted = false;
                }

                if (link.color !== targetColor || link.isHighlighted !== targetIsHighlighted) {
                    link.color = targetColor;
                    link.isHighlighted = targetIsHighlighted;
                    needsRedraw = true;
                }
            });

            // 3. 如果有任何顏色或透明度變化，則請求重繪
            if (needsRedraw) {
                if (nodeAnimationFrameId === null) { // 如果節點動畫停止了，重新啟動它
                    isSystemStable = false;
                    networkAnimate();
                }
            }
        }

        // function networkAnimate() {
        //     nodeCtx.clearRect(0, 0, nodeCanvas.width, nodeCanvas.height); // 清空節點 Canvas

        //     // --- 應用縮放和平移變換 ---
        //     nodeCtx.save(); // 保存當前 Canvas 狀態
        //     nodeCtx.translate(panX, panY); // 先平移
        //     nodeCtx.scale(zoomScale, zoomScale); // 再縮放

        //     // --- 文字下移動畫邏輯 ---
        //     let textAnimationInProgress = false; // 追蹤文字動畫是否仍在進行
        //     nodes.forEach(node => {
        //         // 判斷目標偏移量：只有當前節點是直接懸浮的節點時，才設置為 HOVER_TEXT_OFFSET，否則為 0
        //         const targetOffset = (node === hoveredNode) ? HOVER_TEXT_OFFSET : 0; // 目標偏移量
        //         const delta = (targetOffset - node.currentTextYOffset) * TEXT_ANIMATION_SMOOTHING;

        //         // 檢查是否接近目標，避免無限微小移動
        //         if (Math.abs(delta) > TEXT_ANIMATION_THRESHOLD) { // 如果變化量足夠大
        //             node.currentTextYOffset += delta;
        //             textAnimationInProgress = true; // 標記文字動畫仍在進行
        //         } else {
        //             node.currentTextYOffset = targetOffset; // 直接設為目標值，防止微小抖動
        //         }
        //     });
        //     // --- 文字下移動畫邏輯結束 ---

        //     const totalMovement = updateGraph();
        //     links.forEach(drawLink); // 先繪製連線
        //     nodes.forEach(drawNode); // 再繪製節點，確保節點在連線之上

        //     nodeCtx.restore(); // 恢復 Canvas 狀態，移除變換

        //     // if (totalMovement < stabilityThreshold && !draggedNode && !isPanning) { // 新增：當沒有平移時才判斷穩定
        //     if (!draggedNode && !isPanning && totalMovement < stabilityThreshold && hoveredNode === null && !textAnimationInProgress) {
        //         isSystemStable = true;
        //         console.log("節點系統已穩定，動畫暫停。");
        //         nodeAnimationFrameId = null;
        //     } else {
        //         isSystemStable = false;
        //         nodeAnimationFrameId = requestAnimationFrame(networkAnimate);
        //     }
        //     // 新增：每次動畫幀更新縮放手柄位置，以防外部滾輪縮放
        //     updateSliderHandlePosition();
        // }

        function networkAnimate() {
            nodeCtx.clearRect(0, 0, nodeCanvas.width, nodeCanvas.height); // 清空節點 Canvas

            // --- 應用縮放和平移變換 ---
            nodeCtx.save(); // 保存當前 Canvas 狀態
            nodeCtx.translate(panX, panY); // 先平移
            nodeCtx.scale(zoomScale, zoomScale); // 再縮放

            // --- 文字下移動畫邏輯 ---
            let textAnimationInProgress = false; // 追蹤文字動畫是否仍在進行
            nodes.forEach(node => {
                // 判斷目標偏移量：只有當前節點是直接懸浮的節點 (hoveredNode) 或激活的節點 (activatedNode) 時，
                // 才設置為 HOVER_TEXT_OFFSET，否則為 0
                const targetOffset = (node === hoveredNode || node === activatedNode) ? HOVER_TEXT_OFFSET : 0; // 目標偏移量
                const delta = (targetOffset - node.currentTextYOffset) * TEXT_ANIMATION_SMOOTHING;

                // 檢查是否接近目標，避免無限微小移動
                if (Math.abs(delta) > TEXT_ANIMATION_THRESHOLD) { // 如果變化量足夠大
                    node.currentTextYOffset += delta;
                    textAnimationInProgress = true; // 標記文字動畫仍在進行
                } else {
                    node.currentTextYOffset = targetOffset; // 直接設為目標值，防止微小抖動
                }
            });
            // --- 文字下移動畫邏輯結束 ---

            const totalMovement = updateGraph();
            links.forEach(drawLink); // 先繪製連線
            nodes.forEach(drawNode); // 再繪製節點，確保節點在連線之上

            nodeCtx.restore(); // 恢復 Canvas 狀態，移除變換

            // 節點系統穩定判斷：當沒有拖曳、沒有平移、沒有懸浮、沒有激活節點且沒有文字動畫時才穩定
            if (!draggedNode && !isPanning && hoveredNode === null && activatedNode === null && totalMovement < stabilityThreshold && !textAnimationInProgress) {
                isSystemStable = true;
                console.log("節點系統已穩定，動畫暫停。");
                nodeAnimationFrameId = null;
            } else {
                isSystemStable = false;
                nodeAnimationFrameId = requestAnimationFrame(networkAnimate);
            }
            updateSliderHandlePosition(); // 每次動畫幀更新縮放手柄位置
        }

        // --- 滑鼠互動事件 (現在針對 nodeCanvas) ---
        // 獲取滑鼠在 Canvas 上的「世界座標」
        function getMouseWorldPos(event) {
            const rect = nodeCanvas.getBoundingClientRect(); // 針對 nodeCanvas 獲取位置
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // 將螢幕座標轉換為世界座標
            const worldX = (mouseX - panX) / zoomScale;
            const worldY = (mouseY - panY) / zoomScale;
            return { x: worldX, y: worldY };
        }

        // 獲取滑鼠在 Canvas 上的「螢幕座標」
        function getMouseScreenPos(event) {
            const rect = nodeCanvas.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        }

        // nodeCanvas.addEventListener('mousedown', function(event) {
        //     const mouseWorldPos = getMouseWorldPos(event); // 使用世界座標進行節點判斷
        //     const mouseScreenPos = getMouseScreenPos(event); // 獲取螢幕座標用於平移

        //     // 記錄滑鼠按下時的螢幕座標，用於判斷點擊或拖曳
        //     mouseDownPos.x = event.clientX;
        //     mouseDownPos.y = event.clientY;
        //     isClicking = true; // 預設為潛在的點擊

        //     let foundNode = null;
        //     // 檢查是否點擊到節點
        //     for (let i = nodes.length - 1; i >= 0; i--) {
        //         const node = nodes[i];
        //         const dx = mouseWorldPos.x - node.x;
        //         const dy = mouseWorldPos.y - node.y;
        //         const distance = Math.sqrt(dx * dx + dy * dy);
        //         if (distance < node.radius) {
        //             foundNode = node;
        //             break;
        //         }
        //     }
        //     if (foundNode) { // 只有當點擊到節點時才開始拖曳
        //         draggedNode = foundNode;
        //         draggedNode.isDragged = true;
        //         offsetX = mouseWorldPos.x - draggedNode.x;
        //         offsetY = mouseWorldPos.y - draggedNode.y;
        //         // 將被拖曳的節點移到列表末尾，使其繪製在最上層
        //         nodes.splice(nodes.indexOf(draggedNode), 1); // 使用 indexOf 找到正確索引
        //         nodes.push(draggedNode);

        //         // 拖曳時也觸發高亮更新，確保拖曳的節點被高亮
        //         updateHighlight(draggedNode);
        //         if (isSystemStable && nodeAnimationFrameId === null) {
        //             isSystemStable = false;
        //             networkAnimate(); // 重新啟動節點動畫
        //         }
        //         nodeCanvas.style.cursor = 'grabbing'; // 拖曳節點時游標變為拖曳中手
        //     } else { // 沒有點擊到節點，開始平移背景
        //         isPanning = true;
        //         lastPanMouseX = mouseScreenPos.x;
        //         lastPanMouseY = mouseScreenPos.y;
        //         // 確保在平移時動畫持續運行
        //         if (nodeAnimationFrameId === null) {
        //             isSystemStable = false;
        //             networkAnimate();
        //         }
        //         nodeCanvas.style.cursor = 'grabbing'; // 拖曳背景時游標變為拖曳中手
        //     }
        // });

        nodeCanvas.addEventListener('mousedown', function(event) {
            // 確保只在非觸摸設備上執行鼠標事件的 mousedown 邏輯
            if (isTouchDevice) return;

            const mouseWorldPos = getMouseWorldPos(event);
            const mouseScreenPos = getMouseScreenPos(event);

            // 記錄滑鼠按下時的螢幕座標，用於後續判斷點擊或拖曳
            mouseDownPos.x = event.clientX;
            mouseDownPos.y = event.clientY;

            let foundNode = null;
            for (let i = nodes.length - 1; i >= 0; i--) {
                const node = nodes[i];
                const dx = mouseWorldPos.x - node.x;
                const dy = mouseWorldPos.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < node.radius) {
                    foundNode = node;
                    break;
                }
            }
            if (foundNode) {
                draggedNode = foundNode;
                draggedNode.isDragged = true;
                offsetX = mouseWorldPos.x - draggedNode.x;
                offsetY = mouseWorldPos.y - draggedNode.y;
                nodes.splice(nodes.indexOf(draggedNode), 1);
                nodes.push(draggedNode);

                updateHighlight(draggedNode);
                activatedNode = null; // 開始拖曳時清除激活狀態

                if (isSystemStable && nodeAnimationFrameId === null) {
                    isSystemStable = false;
                    networkAnimate();
                }
                nodeCanvas.style.cursor = 'grabbing';
            } else {
                isPanning = true;
                lastPanMouseX = mouseScreenPos.x;
                lastPanMouseY = mouseScreenPos.y;
                if (nodeAnimationFrameId === null) {
                    isSystemStable = false;
                    networkAnimate();
                }
                nodeCanvas.style.cursor = 'grabbing';
                if (activatedNode !== null) { // 點擊空白處開始平移時清除激活狀態
                    activatedNode = null;
                    updateHighlight(null);
                }
            }
        });

        // nodeCanvas.addEventListener('mousemove', function(event) {
        //     const mouseScreenPos = getMouseScreenPos(event); // 始終獲取螢幕座標
        //     const mouseWorldPos = getMouseWorldPos(event); // 始終獲取世界座標

        //     // 新增：判斷是否為拖曳，如果移動距離超過閾值，則取消點擊狀態
        //     if (isClicking) {
        //         const distMoved = Math.sqrt(
        //             Math.pow(event.clientX - mouseDownPos.x, 2) +
        //             Math.pow(event.clientY - mouseDownPos.y, 2)
        //         );
        //         if (distMoved > CLICK_THRESHOLD) {
        //             isClicking = false; // 鼠標移動超過閾值，這是一個拖曳，不是點擊
        //         }
        //     }

        //     if (draggedNode) { // 如果正在拖曳，則更新節點位置
        //         draggedNode.x = mouseWorldPos.x - offsetX;
        //         draggedNode.y = mouseWorldPos.y - offsetY;
        //         draggedNode.vx = 0;
        //         draggedNode.vy = 0;
        //         nodeCanvas.style.cursor = 'grabbing';
        //     } else if (isPanning) { // 正在平移背景
        //         const dx = mouseScreenPos.x - lastPanMouseX;
        //         const dy = mouseScreenPos.y - lastPanMouseY;
        //         panX += dx;
        //         panY += dy;
        //         lastPanMouseX = mouseScreenPos.x;
        //         lastPanMouseY = mouseScreenPos.y;
        //         networkAnimate(); // 平移時強制重繪
        //         nodeCanvas.style.cursor = 'grabbing';
        //     } else { // 如果沒有拖曳，則檢查懸浮
        //         let foundNode = null;
        //         for (let i = nodes.length - 1; i >= 0; i--) {
        //             const node = nodes[i];
        //             const dx = mouseWorldPos.x - node.x;
        //             const dy = mouseWorldPos.y - node.y;
        //             const distance = Math.sqrt(dx * dx + dy * dy);
        //             if (distance < node.radius) {
        //                 foundNode = node;
        //                 break;
        //             }
        //         }
        //         if (foundNode !== hoveredNode) { // 只有當懸浮狀態改變時才更新
        //             hoveredNode = foundNode;
        //             updateHighlight(hoveredNode);
        //         }
        //         if (hoveredNode) {
        //             nodeCanvas.style.cursor = 'pointer';
        //         } else {
        //             nodeCanvas.style.cursor = 'grab';
        //         }
        //     }
        // });

        nodeCanvas.addEventListener('mousemove', function(event) {
            // 確保只在非觸摸設備上執行鼠標事件的 mousemove 邏輯
            if (isTouchDevice) return;

            const mouseScreenPos = getMouseScreenPos(event);
            const mouseWorldPos = getMouseWorldPos(event);

            if (draggedNode) {
                draggedNode.x = mouseWorldPos.x - offsetX;
                draggedNode.y = mouseWorldPos.y - offsetY;
                draggedNode.vx = 0;
                draggedNode.vy = 0;
                nodeCanvas.style.cursor = 'grabbing';
                if (activatedNode !== null) {
                    activatedNode = null;
                    updateHighlight(hoveredNode);
                }
            } else if (isPanning) {
                const dx = mouseScreenPos.x - lastPanMouseX;
                const dy = mouseScreenPos.y - lastPanMouseY;
                panX += dx;
                panY += dy;
                lastPanMouseX = mouseScreenPos.x;
                lastPanMouseY = mouseScreenPos.y;
                networkAnimate();
                nodeCanvas.style.cursor = 'grabbing';
                if (activatedNode !== null) {
                    activatedNode = null;
                    updateHighlight(hoveredNode);
                }
            } else {
                // 處理鼠標懸浮效果
                let foundNode = null;
                for (let i = nodes.length - 1; i >= 0; i--) {
                    const node = nodes[i];
                    const dx = mouseWorldPos.x - node.x;
                    const dy = mouseWorldPos.y - node.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < node.radius) {
                        foundNode = node;
                        break;
                    }
                }
                if (foundNode !== hoveredNode) {
                    hoveredNode = foundNode;
                    updateHighlight(hoveredNode);
                }
                if (hoveredNode) {
                    nodeCanvas.style.cursor = 'pointer';
                } else {
                    nodeCanvas.style.cursor = 'grab';
                }
            }
        });

        // nodeCanvas.addEventListener('mouseup', function(event) { // 確保 event 參數存在
        //     if (draggedNode) {
        //         draggedNode.isDragged = false;
        //         draggedNode = null;
        //         // 拖曳結束後，重新評估懸浮狀態，並重置高亮
        //         // 這裡需要重新檢查滑鼠是否仍在某個節點上，或者完全移開
        //         // 最簡單的方式是再次觸發一次 mousemove 的判斷邏輯
        //         const mouseWorldPos = getMouseWorldPos(event); // 注意：mouseup 的 event 可能沒有 clientX/Y，最好用一個全局變量存儲最後的鼠標位置
        //         let foundNodeAfterDrag = null;
        //         for (let i = nodes.length - 1; i >= 0; i--) {
        //             const node = nodes[i];
        //             const dx = mouseWorldPos.x - node.x;
        //             const dy = mouseWorldPos.y - node.y;
        //             const distance = Math.sqrt(dx * dx + dy * dy);
        //             if (distance < node.radius) {
        //                 foundNodeAfterDrag = node;
        //                 break;
        //             }
        //         }
        //         hoveredNode = foundNodeAfterDrag; // 更新 hoveredNode 狀態
        //         updateHighlight(hoveredNode); // 根據新的 hoveredNode 狀態更新高亮
        //     } else if (isPanning) { // 結束背景平移
        //         isPanning = false;
        //         // 平移結束後，如果系統已穩定，可以停止動畫
        //         // if (isSystemStable && nodeAnimationFrameId !== null) {
        //             // 這裡不需要額外呼叫 networkAnimate，因為 networkAnimate 內部會判斷是否停止
        //         // }
        //     }

        //     // 新增：判斷是否為點擊，如果是，則執行連結跳轉
        //     if (isClicking) {
        //         const mouseWorldPos = getMouseWorldPos(event);
        //         let clickedNode = null;
        //         for (let i = nodes.length - 1; i >= 0; i--) {
        //             const node = nodes[i];
        //             const dx = mouseWorldPos.x - node.x;
        //             const dy = mouseWorldPos.y - node.y;
        //             const distance = Math.sqrt(dx * dx + dy * dy);
        //             if (distance < node.radius) {
        //                 clickedNode = node;
        //                 break;
        //             }
        //         }

        //         if (clickedNode && clickedNode.link && clickedNode.link !== '#') {
        //             window.location.href = clickedNode.link; // 跳轉到節點的連結頁面
        //         }
        //     }
            
        //     // 重置 isClicking 旗標
        //     isClicking = false;

        //     if (hoveredNode) {
        //         nodeCanvas.style.cursor = 'pointer';
        //     } else {
        //         nodeCanvas.style.cursor = 'grab';
        //     }
        // });

        nodeCanvas.addEventListener('mouseup', function(event) {
            // 確保只在非觸摸設備上執行鼠標事件的 mouseup 邏輯
            if (isTouchDevice) return;

            if (draggedNode) {
                draggedNode.isDragged = false;
                draggedNode = null;
                const mouseWorldPos = getMouseWorldPos(event);
                let foundNodeAfterDrag = null;
                for (let i = nodes.length - 1; i >= 0; i--) {
                    const node = nodes[i];
                    const dx = mouseWorldPos.x - node.x;
                    const dy = mouseWorldPos.y - node.y;
                    const distance = Math.sqrt(dx * dx + dy * dy); // 修正：這裡多了一個 +dy
                    if (distance < node.radius) {
                        foundNodeAfterDrag = node;
                        break;
                    }
                }
                hoveredNode = foundNodeAfterDrag;
                updateHighlight(hoveredNode);
            } else if (isPanning) {
                isPanning = false;
            }

            // 調用通用點擊處理函數 (桌面版)
            processClickOrTap(event, false); // false 表示這是滑鼠事件

            // 更新鼠標樣式
            if (hoveredNode) {
                nodeCanvas.style.cursor = 'pointer';
            } else {
                nodeCanvas.style.cursor = 'grab';
            }
        });

        // nodeCanvas.addEventListener('mouseout', function() {
        //     if (hoveredNode !== null) { // 只有當有節點被懸浮時才重置
        //         hoveredNode = null;
        //         updateHighlight(null); // 傳入 null 表示沒有節點懸浮，全部恢復預設
        //     }
        //     // 如果滑鼠移出 Canvas，也停止平移
        //     if (isPanning) {
        //         isPanning = false;
        //     }
        //     nodeCanvas.style.cursor = 'default';
        // });

        nodeCanvas.addEventListener('mouseout', function() {
            // 確保只在非觸摸設備上執行鼠標事件的 mouseout 邏輯
            if (isTouchDevice) return;

            if (hoveredNode !== null) {
                hoveredNode = null;
                updateHighlight(null);
            }
            if (isPanning) {
                isPanning = false;
            }
            nodeCanvas.style.cursor = 'default';
        });

        // 新增：處理點擊或觸摸結束時的邏輯
        function processClickOrTap(event, isTouchEvent) {
            // 如果正在拖曳節點或平移背景，則不處理為點擊
            if (draggedNode || isPanning) {
                return;
            }

            // 獲取事件結束時的客戶端座標
            let clientX, clientY;
            if (isTouchEvent) {
                if (event.changedTouches && event.changedTouches.length > 0) {
                    clientX = event.changedTouches[0].clientX;
                    clientY = event.changedTouches[0].clientY;
                } else {
                    console.warn("touchend event missing changedTouches. Cannot determine click position.");
                    return;
                }
            } else {
                clientX = event.clientX;
                clientY = event.clientY;
            }

            // 判斷是否為點擊 (檢查移動距離)
            const distMoved = Math.sqrt(
                Math.pow(clientX - mouseDownPos.x, 2) +
                Math.pow(clientY - mouseDownPos.y, 2)
            );

            if (distMoved > CLICK_THRESHOLD) {
                // 移動距離超過閾值，視為拖曳，不處理為點擊
                return;
            }

            // 確定點擊到的節點
            const mouseWorldPos = getMouseWorldPos({ clientX: clientX, clientY: clientY });
            let clickedNode = null;
            for (let i = nodes.length - 1; i >= 0; i--) {
                const node = nodes[i];
                const dx = mouseWorldPos.x - node.x;
                const dy = mouseWorldPos.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < node.radius) {
                    clickedNode = node;
                    break;
                }
            }

            if (isTouchDevice) {
                // 手機版：初次點擊激活，再次點擊跳轉
                if (clickedNode) {
                    if (activatedNode === clickedNode) {
                        // 第二次點擊同一個節點，執行連結跳轉
                        if (clickedNode.link && clickedNode.link !== '#') {
                            window.location.href = clickedNode.link;
                        }
                        activatedNode = null; // 跳轉後清除激活狀態
                        updateHighlight(null); // 清除高亮
                    } else {
                        // 第一次點擊或點擊不同節點，激活新節點並顯示懸浮效果
                        if (activatedNode !== null) { // 先清除舊的激活高亮
                            updateHighlight(null);
                        }
                        activatedNode = clickedNode;
                        updateHighlight(activatedNode); // 再激活新節點的高亮
                    }
                } else {
                    // 點擊空白處，清除所有激活狀態
                    if (activatedNode !== null) {
                        activatedNode = null;
                        updateHighlight(null);
                    }
                }
            } else {
                // 桌面版：直接點擊跳轉
                if (clickedNode && clickedNode.link && clickedNode.link !== '#') {
                    window.location.href = clickedNode.link;
                }
                // 桌面版點擊後，hoveredNode 狀態會由 mousemove/mouseout 接管
            }
        }

        // 新增：滾輪事件監聽器
        nodeCanvas.addEventListener('wheel', function(event) {
            event.preventDefault(); // 阻止頁面滾動

            // 縮放前的滑鼠在 Canvas 上的座標
            const mouseX = event.clientX - nodeCanvas.getBoundingClientRect().left;
            const mouseY = event.clientY - nodeCanvas.getBoundingClientRect().top;

            // 計算滑鼠在世界座標（圖形座標）中的位置
            const worldX = (mouseX - panX) / zoomScale;
            const worldY = (mouseY - panY) / zoomScale;

            const scaleAmount = event.deltaY * -ZOOM_SPEED;
            let newZoomScale = zoomScale + scaleAmount;
            newZoomScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoomScale));

            if (newZoomScale !== zoomScale) {
                // 計算新的平移量，使滑鼠在縮放後仍然指向相同的世界座標點
                panX = mouseX - worldX * newZoomScale;
                panY = mouseY - worldY * newZoomScale;

                zoomScale = newZoomScale;
                isSystemStable = false; // 發生縮放，系統不再穩定
                networkAnimate(); // 觸發重繪
                updateSliderHandlePosition(); // 同步更新拖曳條手柄位置
            }
        });

        // // --- nodeCanvas 觸摸事件 (手機版互動) ---
        // nodeCanvas.addEventListener('touchstart', function(event) {
        //     // 確保只在觸摸設備上執行觸摸事件的 touchstart 邏輯
        //     if (!isTouchDevice) return;

        //     // 阻止瀏覽器預設的滾動行為，但僅在我們確定要處理拖曳或點擊時
        //     // 這裡暫時不阻止，在 touchmove 或 touchend 中根據判斷結果阻止
        //     // event.preventDefault(); // 初始觸摸不立即阻止，避免影響頁面滾動

        //     const touchWorldPos = getMouseWorldPos(event.touches[0]);

        //     // 記錄觸摸按下時的螢幕座標，用於後續判斷點擊或拖曳
        //     mouseDownPos.x = event.touches[0].clientX;
        //     mouseDownPos.y = event.touches[0].clientY;

        //     // 檢查是否觸摸到節點
        //     let foundNode = null;
        //     for (let i = nodes.length - 1; i >= 0; i--) {
        //         const node = nodes[i];
        //         const dx = touchWorldPos.x - node.x;
        //         const dy = touchWorldPos.y - node.y;
        //         const distance = Math.sqrt(dx * dx + dy * dy);
        //         if (distance < node.radius) {
        //             foundNode = node;
        //             break;
        //         }
        //     }

        //     if (foundNode) {
        //         // 如果觸摸到一個節點，且該節點不是當前激活的節點，則清除舊的激活狀態
        //         // 這樣在點擊不同節點時，舊節點的高亮會消失
        //         if (activatedNode !== foundNode) {
        //             activatedNode = null; // 暫時清除，touchend 會重新設置
        //             updateHighlight(null);
        //         }
        //         // 如果觸摸到節點，但不是為了拖曳，則在 touchend 時判斷是否為第二次點擊
        //     } else {
        //         // 如果觸摸到空白處，則清除任何激活狀態
        //         if (activatedNode !== null) {
        //             activatedNode = null;
        //             updateHighlight(null);
        //         }
        //         // 點擊空白處也可能開始平移
        //         isPanning = true;
        //         lastPanMouseX = event.touches[0].clientX;
        //         lastPanMouseY = event.touches[0].clientY;
        //         if (nodeAnimationFrameId === null) {
        //             isSystemStable = false;
        //             networkAnimate();
        //         }
        //         nodeCanvas.style.cursor = 'grabbing';
        //     }
        // }, { passive: false }); // 設置 passive: false 允許阻止滾動

        nodeCanvas.addEventListener('touchstart', function(event) {
            if (!isTouchDevice) return;

            // 記錄觸摸按下時的螢幕座標
            mouseDownPos.x = event.touches[0].clientX;
            mouseDownPos.y = event.touches[0].clientY;

            const touchWorldPos = getMouseWorldPos(event.touches[0]);
            let foundNode = null;
            for (let i = nodes.length - 1; i >= 0; i--) {
                const node = nodes[i];
                const dx = touchWorldPos.x - node.x;
                const dy = touchWorldPos.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < node.radius) {
                    foundNode = node;
                    break;
                }
            }

            if (foundNode) {
                // 如果觸摸到節點，則潛在為拖曳節點
                draggedNode = foundNode; // 暫時設置 draggedNode，如果移動距離小，touchend 會取消
                offsetX = touchWorldPos.x - draggedNode.x;
                offsetY = touchWorldPos.y - draggedNode.y;
                nodes.splice(nodes.indexOf(draggedNode), 1);
                nodes.push(draggedNode); // 將被拖曳的節點移到最上層

                // 如果觸摸到一個節點，且該節點不是當前激活的節點，則清除舊的激活狀態
                if (activatedNode !== foundNode) {
                    activatedNode = null;
                    updateHighlight(null);
                }
            } else {
                // 如果觸摸到空白處，則潛在為平移背景
                isPanning = true; // 暫時設置為平移模式
                lastPanMouseX = event.touches[0].clientX;
                lastPanMouseY = event.touches[0].clientY;
                // 觸摸空白處時，清除任何激活狀態
                if (activatedNode !== null) {
                    activatedNode = null;
                    updateHighlight(null);
                }
            }
            // 不在這裡阻止默認行為，讓瀏覽器判斷是否滾動，直到確認是拖曳或平移
        }, { passive: false });

        // nodeCanvas.addEventListener('touchmove', function(event) {
        //     // 確保只在觸摸設備上執行觸摸事件的 touchmove 邏輯
        //     if (!isTouchDevice) return;

        //     const touchScreenPos = getMouseScreenPos(event.touches[0]);
        //     const touchWorldPos = getMouseWorldPos(event.touches[0]);

        //     // 判斷是否為拖曳，如果移動距離超過閾值，則取消點擊狀態
        //     const distMoved = Math.sqrt(
        //         Math.pow(event.touches[0].clientX - mouseDownPos.x, 2) +
        //         Math.pow(event.touches[0].clientY - mouseDownPos.y, 2)
        //     );

        //     if (distMoved > CLICK_THRESHOLD) {
        //         // 如果移動距離超過閾值，則視為拖曳或平移，阻止頁面滾動
        //         event.preventDefault();
        //         // 如果之前是點擊模式，現在轉為拖曳模式
        //         // isClicking = false; // 移除此行
        //     }

        //     // 判斷是否正在拖曳節點
        //     if (draggedNode) {
        //         draggedNode.x = touchWorldPos.x - offsetX;
        //         draggedNode.y = touchWorldPos.y - offsetY;
        //         draggedNode.vx = 0;
        //         draggedNode.vy = 0;
        //         nodeCanvas.style.cursor = 'grabbing';
        //         if (activatedNode !== null) { // 拖曳時清除激活狀態
        //             activatedNode = null;
        //             updateHighlight(hoveredNode);
        //         }
        //         event.preventDefault(); // 拖曳節點時阻止頁面滾動
        //     } else if (isPanning) { // 判斷是否正在平移背景
        //         const dx = touchScreenPos.x - lastPanMouseX;
        //         const dy = touchScreenPos.y - lastPanMouseY;
        //         panX += dx;
        //         panY += dy;
        //         lastPanMouseX = touchScreenPos.x;
        //         lastPanMouseY = touchScreenPos.y;
        //         networkAnimate();
        //         nodeCanvas.style.cursor = 'grabbing';
        //         if (activatedNode !== null) { // 平移時清除激活狀態
        //             activatedNode = null;
        //             updateHighlight(hoveredNode);
        //         }
        //         event.preventDefault(); // 平移背景時阻止頁面滾動
        //     }
        //     // 在觸摸設備上，mousemove 不處理懸浮效果
        // }, { passive: false }); // 設置 passive: false 允許阻止滾動

        nodeCanvas.addEventListener('touchmove', function(event) {
            if (!isTouchDevice) return;

            const touchScreenPos = getMouseScreenPos(event.touches[0]);
            const touchWorldPos = getMouseWorldPos(event.touches[0]);

            // 判斷移動距離，用於區分點擊和拖曳/平移
            const distMoved = Math.sqrt(
                Math.pow(event.touches[0].clientX - mouseDownPos.x, 2) +
                Math.pow(event.touches[0].clientY - mouseDownPos.y, 2)
            );

            // 只有當移動距離超過閾值時，才確認為拖曳或平移，並阻止默認行為
            if (distMoved > CLICK_THRESHOLD) {
                // 如果之前設置了 draggedNode (表示觸摸到節點)
                if (draggedNode) {
                    draggedNode.x = touchWorldPos.x - offsetX;
                    draggedNode.y = touchWorldPos.y - offsetY;
                    draggedNode.vx = 0;
                    draggedNode.vy = 0;
                    nodeCanvas.style.cursor = 'grabbing';
                    if (activatedNode !== null) { // 拖曳時清除激活狀態
                        activatedNode = null;
                        updateHighlight(hoveredNode);
                    }
                    event.preventDefault(); // 拖曳節點時阻止頁面滾動
                }
                // 如果之前設置了 isPanning (表示觸摸到空白處)
                else if (isPanning) {
                    const dx = touchScreenPos.x - lastPanMouseX;
                    const dy = touchScreenPos.y - lastPanMouseY;
                    panX += dx;
                    panY += dy;
                    lastPanMouseX = touchScreenPos.x;
                    lastPanMouseY = touchScreenPos.y;
                    networkAnimate();
                    nodeCanvas.style.cursor = 'grabbing';
                    if (activatedNode !== null) { // 平移時清除激活狀態
                        activatedNode = null;
                        updateHighlight(hoveredNode);
                    }
                    event.preventDefault(); // 平移背景時阻止頁面滾動
                }
                // 如果既沒有 draggedNode 也沒有 isPanning，但移動距離很大，則將其視為平移
                else {
                    isPanning = true; // 轉為平移模式 (處理從未設置拖曳/平移但有大移動的情況)
                    lastPanMouseX = event.touches[0].clientX;
                    lastPanMouseY = event.touches[0].clientY;
                    networkAnimate();
                    nodeCanvas.style.cursor = 'grabbing';
                    event.preventDefault(); // 阻止頁面滾動
                }
            }
            // 在觸摸設備上，mousemove 不處理懸浮效果
        }, { passive: false });

        // nodeCanvas.addEventListener('touchend', function(event) {
        //     // 確保只在觸摸設備上執行觸摸事件的 touchend 邏輯
        //     if (!isTouchDevice) return;

        //     if (draggedNode) { // 如果正在拖曳，則停止拖曳
        //         draggedNode.isDragged = false;
        //         draggedNode = null;
        //         // 拖曳結束後，清除高亮 (因為觸摸設備沒有鼠標懸浮)
        //         hoveredNode = null; // 確保 hoveredNode 也被清除
        //         updateHighlight(null);
        //     } else if (isPanning) { // 結束背景平移
        //         isPanning = false;
        //     }

        //     // 調用通用點擊處理函數 (手機版)
        //     processClickOrTap(event, true); // true 表示這是觸摸事件

        //     // 更新鼠標樣式 (觸摸設備)
        //     if (activatedNode) {
        //         nodeCanvas.style.cursor = 'default';
        //     } else {
        //         nodeCanvas.style.cursor = 'grab';
        //     }
        // });

        nodeCanvas.addEventListener('touchend', function(event) {
            if (!isTouchDevice) return;

            // 判斷觸摸結束時的總移動距離
            const distMoved = Math.sqrt(
                Math.pow(event.changedTouches[0].clientX - mouseDownPos.x, 2) +
                Math.pow(event.changedTouches[0].clientY - mouseDownPos.y, 2)
            );

            // 如果移動距離小於閾值，則視為點擊
            if (distMoved <= CLICK_THRESHOLD) {
                // 調用通用點擊處理函數 (手機版)
                processClickOrTap(event, true); // true 表示這是觸摸事件
            }
            // 否則，如果移動距離大於閾值，則視為拖曳或平移結束
            else {
                if (draggedNode) {
                    draggedNode.isDragged = false;
                    draggedNode = null;
                    hoveredNode = null; // 確保 hoveredNode 也被清除
                    updateHighlight(null); // 清除高亮
                } else if (isPanning) {
                    isPanning = false;
                }
            }

            // 更新鼠標樣式 (觸摸設備)
            if (activatedNode) {
                nodeCanvas.style.cursor = 'default';
            } else {
                nodeCanvas.style.cursor = 'grab';
            }
        });

        // --- 縮放拖曳條事件 (滑鼠和觸摸) ---
        zoomSliderHandle.addEventListener('mousedown', function(event) {
            isSliderDragging = true;
            sliderStartX = event.clientX;
            sliderHandleInitialLeft = zoomSliderHandle.offsetLeft; // 獲取手柄當前 left 值
            zoomSliderHandle.style.cursor = 'grabbing';
            event.preventDefault(); // 阻止瀏覽器預設的拖曳行為
        });

        zoomSliderHandle.addEventListener('touchstart', function(event) {
            isSliderDragging = true;
            sliderStartX = event.touches[0].clientX;
            sliderHandleInitialLeft = zoomSliderHandle.offsetLeft;
            zoomSliderHandle.style.cursor = 'grabbing';
            event.preventDefault(); // 阻止瀏覽器預設的滾動行為
        }, { passive: false }); // 設置 passive: false 允許阻止滾動

        // 監聽整個文檔的 mousemove/touchmove，確保拖曳時即使滑鼠/觸摸移出按鈕也能繼續
        document.addEventListener('mousemove', function(event) {
            if (!isSliderDragging) return;

            const sliderWidth = zoomSliderContainer.offsetWidth;
            const handleWidth = zoomSliderHandle.offsetWidth;

            // 計算滑鼠移動的距離
            const deltaX = event.clientX - sliderStartX;

            // 計算手柄的新位置 (考慮到手柄的中心點)
            let newHandleLeft = sliderHandleInitialLeft + deltaX;

            // 限制手柄在拖曳條範圍內
            const minLeft = handleWidth / 2;
            const maxLeft = sliderWidth - (handleWidth / 2);
            newHandleLeft = Math.max(minLeft, Math.min(maxLeft, newHandleLeft));

            // 將手柄位置映射回 zoomScale
            const normalizedPosition = (newHandleLeft - minLeft) / (maxLeft - minLeft);
            const zoomRange = MAX_ZOOM - MIN_ZOOM;
            const newZoomScale = MIN_ZOOM + normalizedPosition * zoomRange;

            // // 更新 zoomScale 並觸發重繪
            // if (newZoomScale !== zoomScale) {
            //     zoomScale = newZoomScale;
            //     // 由於縮放會改變節點位置，需要重新計算節點佈局
            //     // 但為了平滑，我們只更新 scale，讓 networkAnimate 處理佈局更新
            //     // 這裡不需要重新計算 panX/panY，因為拖曳條只控制縮放，不改變中心點
            //     networkAnimate(); // 強制重繪
            // }

            if (newZoomScale !== zoomScale) {
                // 計算畫面中心點
                const centerX = nodeCanvas.width / 2;
                const centerY = nodeCanvas.height / 2;

                // 計算中心點在世界座標（圖形座標）中的位置
                const worldCenterX = (centerX - panX) / zoomScale;
                const worldCenterY = (centerY - panY) / zoomScale;

                // 計算新的平移量，使中心點在縮放後仍然保持在畫面中心
                panX = centerX - worldCenterX * newZoomScale;
                panY = centerY - worldCenterY * newZoomScale;

                zoomScale = newZoomScale;
                isSystemStable = false; // 發生縮放，系統不再穩定
                networkAnimate(); // 強制重繪
            }

            // 更新手柄的視覺位置
            zoomSliderHandle.style.left = `${newHandleLeft}px`;
        });

        document.addEventListener('touchmove', function(event) {
            if (!isSliderDragging) return;

            const sliderWidth = zoomSliderContainer.offsetWidth;
            const handleWidth = zoomSliderHandle.offsetWidth;

            const deltaX = event.touches[0].clientX - sliderStartX;
            let newHandleLeft = sliderHandleInitialLeft + deltaX;

            const minLeft = handleWidth / 2;
            const maxLeft = sliderWidth - (handleWidth / 2);
            newHandleLeft = Math.max(minLeft, Math.min(maxLeft, newHandleLeft));

            const normalizedPosition = (newHandleLeft - minLeft) / (maxLeft - minLeft);
            const zoomRange = MAX_ZOOM - MIN_ZOOM;
            const newZoomScale = MIN_ZOOM + normalizedPosition * zoomRange;

            // if (newZoomScale !== zoomScale) {
            //     zoomScale = newZoomScale;
            //     networkAnimate();
            // }

            if (newZoomScale !== zoomScale) {
                // 計算畫面中心點
                const centerX = nodeCanvas.width / 2;
                const centerY = nodeCanvas.height / 2;

                // 計算中心點在世界座標（圖形座標）中的位置
                const worldCenterX = (centerX - panX) / zoomScale;
                const worldCenterY = (centerY - panY) / zoomScale;

                // 計算新的平移量，使中心點在縮放後仍然保持在畫面中心
                panX = centerX - worldCenterX * newZoomScale;
                panY = centerY - worldCenterY * newZoomScale;

                zoomScale = newZoomScale;
                isSystemStable = false; // 發生縮放，系統不再穩定
                networkAnimate();
            }

            zoomSliderHandle.style.left = `${newHandleLeft}px`;
            event.preventDefault(); // 阻止瀏覽器預設的滾動行為
        }, { passive: false });

        document.addEventListener('mouseup', function() {
            isSliderDragging = false;
            if (zoomSliderHandle) {
                zoomSliderHandle.style.cursor = 'grab';
            }
        });

        // document.addEventListener('touchend', function() {
        //     isSliderDragging = false;
        //     if (zoomSliderHandle) {
        //         zoomSliderHandle.style.cursor = 'grab';
        //     }
        // });

        document.addEventListener('touchend', function(event) {
            isSliderDragging = false;
            if (zoomSliderHandle) {
                zoomSliderHandle.style.cursor = 'grab';
            }

            // 調用通用點擊處理函數
            processClickOrTap(event, true); // true 表示這是觸摸事件

            // 更新鼠標樣式 (觸摸設備)
            if (activatedNode) {
                nodeCanvas.style.cursor = 'default';
            } else {
                nodeCanvas.style.cursor = 'grab';
            }
        });
        
        // --- 縮放按鈕事件 ---
        zoomOutBtn.addEventListener('click', function() {
            adjustZoom(-1); // 點擊減號按鈕，縮小
        });

        zoomInBtn.addEventListener('click', function() {
            adjustZoom(1); // 點擊加號按鈕，放大
        });

        // 根據 zoomScale 更新拖曳手柄的位置
        function updateSliderHandlePosition() {
            if (!zoomSliderHandle || !zoomSliderContainer) return;

            const sliderWidth = zoomSliderContainer.offsetWidth; // 拖曳條的總寬度
            const handleWidth = zoomSliderHandle.offsetWidth; // 手柄的寬度

            // 將 zoomScale 從 [MIN_ZOOM, MAX_ZOOM] 映射到 [0, sliderWidth - handleWidth]
            const zoomRange = MAX_ZOOM - MIN_ZOOM;
            const normalizedZoom = (zoomScale - MIN_ZOOM) / zoomRange; // 0 到 1 之間的值

            // 計算手柄的 left 位置 (考慮到手柄的中心點)
            const newLeft = normalizedZoom * (sliderWidth - handleWidth) + (handleWidth / 2);

            zoomSliderHandle.style.left = `${newLeft}px`;
        }

        // 調整縮放比例的通用函數
        function adjustZoom(delta) {
            const scaleAmount = delta * ZOOM_SPEED * 100; // 調整步長，讓按鈕縮放更明顯
            let newZoomScale = zoomScale + scaleAmount;
            newZoomScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoomScale));

            if (newZoomScale !== zoomScale) {
                // 以畫面中心點進行縮放
                const centerX = nodeCanvas.width / 2;
                const centerY = nodeCanvas.height / 2;

                const worldCenterX = (centerX - panX) / zoomScale;
                const worldCenterY = (centerY - panY) / zoomScale;

                panX = centerX - worldCenterX * newZoomScale;
                panY = centerY - worldCenterY * newZoomScale;

                zoomScale = newZoomScale;
                isSystemStable = false; // 發生縮放，系統不再穩定
                networkAnimate(); // 觸發重繪
                updateSliderHandlePosition(); // 同步更新拖曳條手柄位置
            }
        }

        // // 統一的 resize 函式
        // function handleCanvasResize() {
        //     // 設定背景 Canvas 尺寸為視窗全寬高
        //     backgroundCanvas.width = window.innerWidth;
        //     backgroundCanvas.height = window.innerHeight;
        //     backgroundCanvas.style.width = window.innerWidth + 'px';
        //     backgroundCanvas.style.height = window.innerHeight + 'px';
        //     initBreathingLights(); // 重新初始化背景光暈

        //     // 設定節點 Canvas 尺寸為視窗的 80% (與之前保持一致)
        //     nodeCanvas.width = window.innerWidth * 1;
        //     nodeCanvas.height = window.innerHeight * 1;
        //     nodeCanvas.style.width = (window.innerWidth * 1) + 'px';
        //     nodeCanvas.style.height = (window.innerHeight * 1) + 'px';
            
        //     // 重置縮放和平移，並將圖形中心移到 Canvas 中心
        //     zoomScale = 1.0;
        //     panX = 0; // 初始平移為0，因為節點會根據 nodeCanvas 尺寸初始化位置
        //     panY = 0;
        //     initGraph(); // 重新初始化網路圖形數據

        //     // 確保兩個動畫都運行 (背景動畫始終運行，節點動畫根據穩定性運行)
        //     backgroundAnimate(); // 背景動畫始終運行
        //     if (nodeAnimationFrameId === null) { // 如果節點動畫停止了，則重新啟動
        //         isSystemStable = false;
        //         networkAnimate();
        //     }
        //     updateHighlight(null); // 重新載入或調整大小後，重置高亮狀態

        //     // 新增：調整大小後更新縮放手柄位置
        //     updateSliderHandlePosition();
        // }

        // 統一的 resize 函式
        function handleCanvasResize() {
            // 判斷是否為觸摸設備
            isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            console.log("DEBUG: Is Touch Device:", isTouchDevice); // 調試用

            // 設定背景 Canvas 尺寸為視窗全寬高
            backgroundCanvas.width = window.innerWidth;
            backgroundCanvas.height = window.innerHeight;
            backgroundCanvas.style.width = window.innerWidth + 'px';
            backgroundCanvas.style.height = window.innerHeight + 'px';
            initBreathingLights(); // 重新初始化背景光暈

            // 設定節點 Canvas 尺寸為視窗的 80% (與之前保持一致)
            nodeCanvas.width = window.innerWidth * 1;
            nodeCanvas.height = window.innerHeight * 1;
            nodeCanvas.style.width = (window.innerWidth * 1) + 'px';
            nodeCanvas.style.height = (window.innerHeight * 1) + 'px';

            // 重置縮放和平移，並將圖形中心移到 Canvas 中心
            zoomScale = 1.0;
            panX = 0;
            panY = 0;
            initGraph(); // 重新初始化網路圖形數據

            // 確保兩個動畫都運行 (背景動畫始終運行，節點動畫根據穩定性運行)
            backgroundAnimate(); // 背景動畫始終運行
            if (nodeAnimationFrameId === null) { // 如果節點動畫停止了，則重新啟動
                isSystemStable = false;
                networkAnimate();
            }
            updateSliderHandlePosition(); // 調整大小後更新縮放手柄位置
            updateHighlight(null); // 重新載入或調整大小後，重置高亮狀態
            activatedNode = null; // 新增：調整大小後清除激活節點狀態
        }

        // 初始化和啟動動畫
        window.addEventListener('resize', handleCanvasResize);
        handleCanvasResize(); // 首次載入時呼叫，設定尺寸並啟動動畫

        // 儲存所有需要翻譯的文本對象
        const translations = {
            'en': {
                'info_panel': 'Social Network',
                'languageToggleText': '⇄ 繁體中文',
                'back_to_menu': 'Back to MENU'
            },
            'zh': {
                'info_panel': '社交網路',
                'languageToggleText': '⇄ English',
                'back_to_menu': '回到選單'
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
            // 登入檢查
            const isLoggedIn = sessionStorage.getItem('loggedIn');
            if (isLoggedIn !== 'true') {
                const currentDirPath = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
                window.location.href = currentDirPath + 'index.html'; 
            }

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
        });

    