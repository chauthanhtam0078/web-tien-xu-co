// ============================================================================
// 📁 MODULE 0: INITIALIZATION (main.js)
// Lắng nghe các sự kiện khởi tạo hệ thống
// TÍCH HỢP: Debounce Search, Kích hoạt Server Tracking & Phím tắt Enter tiện lợi
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
    if(savedCart) { window.cart = JSON.parse(savedCart); updateCartBadge(); }
    
    // 2. Phục hồi trạng thái đăng nhập Admin
    const savedAdmin = localStorage.getItem('tienxu_admin');
    if(savedAdmin) { loggedInUser = JSON.parse(savedAdmin); }

    // Cập nhật mới: Phục hồi trạng thái đăng nhập Customer
    const savedCustomer = localStorage.getItem('tienxu_customer');
    if(savedCustomer) { window.loggedCustomer = JSON.parse(savedCustomer); }

    // 3. Khởi tạo mã QR động
    const nameInput = document.querySelector('input[name="customer_name"]');
    if (nameInput) nameInput.addEventListener('input', (e) => updateQRCode(e.target.value));

    // 4. Lắng nghe phím & Áp dụng Debounce cho ô tìm kiếm chính
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            if(e.target.value.trim() !== '') window.executeSearch();
        }, 500));
        
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') window.executeSearch();
        });
    }

    // --- [TỐI ƯU UX] BẮT PHÍM ENTER CHO CÁC Ô NHẬP LIỆU
    // 4b. Nhấn Enter để kích hoạt Tra Cứu Đơn Hàng
    const trackingInput = document.getElementById('trackingCodeInput');
    if(trackingInput) {
        trackingInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (typeof window.handleTrackOrder === 'function') window.handleTrackOrder();
            }
        });
    }
    // 4c. Nhấn Enter để kích hoạt Áp Dụng Mã Giảm Giá (Voucher)
    const voucherInput = document.getElementById('voucherCodeInput');
    if(voucherInput) {
        voucherInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (typeof window.applyVoucher === 'function') window.applyVoucher();
            }
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

    // 7. Báo cáo truy cập cho Máy chủ
    if (typeof window.recordVisitorOnServer === 'function') {
        window.recordVisitorOnServer();
    }
});