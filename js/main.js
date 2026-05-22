// ============================================================================
// 📁 MODULE 0: INITIALIZATION (main.js)
// Lắng nghe các sự kiện khởi tạo hệ thống
// TÍCH HỢP: Debounce Search
// ============================================================================

// Hàm Debounce giảm tải Request liên tục khi gõ tìm kiếm
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const later = () => { clearTimeout(timeout); func.apply(this, args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Phục hồi giỏ hàng
    const savedCart = localStorage.getItem('tienxu_cart');
    if(savedCart) { cart = JSON.parse(savedCart); updateCartBadge(); }
    
    // 2. Phục hồi trạng thái đăng nhập Admin (Token sẽ được verify bên admin.js khi bấm mở)
    const savedAdmin = localStorage.getItem('tienxu_admin');
    if(savedAdmin) { loggedInUser = JSON.parse(savedAdmin); }

    // 3. Khởi tạo mã QR động
    const nameInput = document.querySelector('input[name="customer_name"]');
    if (nameInput) nameInput.addEventListener('input', (e) => updateQRCode(e.target.value));

    // 4. Lắng nghe phím & Áp dụng Debounce cho ô tìm kiếm
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        // Khi gõ liên tục, chờ 500ms mới chạy hàm executeSearch()
        searchInput.addEventListener('input', debounce((e) => {
            if(e.target.value.trim() !== '') window.executeSearch();
        }, 500));
        
        // Nếu nhấn Enter thì chạy ngay
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') window.executeSearch();
        });
    }

    // 5. Quản lý Router nút Back của trình duyệt
    window.addEventListener('popstate', (e) => {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page') || 'home';
        window.switchPage(page, false);
    });

    // 6. Kéo dữ liệu từ Google Sheets
    fetchAllData();
});