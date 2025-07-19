
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
                const currentDirPath = "../../index.html";
                window.location.href = currentDirPath; 
            }
            // 在頁面載入時也執行一次，以確保按鈕的初始狀態正確
            toggleBackToTopButton();
        });
    