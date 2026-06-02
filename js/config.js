// ============================================================================
// 📁 MODULE 1: CONFIG & STATE (config.js)
// Định nghĩa các hằng số cấu hình và biến lưu trữ dữ liệu toàn cục
// ============================================================================

// 1. CẤU HÌNH API URL GIAO TIẾP VỚI SERVER
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbywDAUo_9WlK1B1zcG37QFKTfIwz03sBk2U7dfeD0IoeiC3PplWJs-s_CaQWZOBDz9Akw/exec';

// 2. KHAI BÁO BIẾN STATE TOÀN CỤC (Gắn thẳng vào window để chống mọi lỗi đụng độ)
window.globalProducts = [];
window.globalNews = [];
window.globalAbout = {};
window.globalContact = {};
window.globalAllNews = [];
window.globalAllContacts = [];
window.globalAllFeedback = [];
window.globalAdmins = [];
window.globalUsers = [];
window.globalOrders = [];
window.filteredProducts = null;
window.globalVouchers = [];
window.globalLogs = [];
window.globalVisitors = { online: 0, today: 0, yesterday: 0, total: 0 };

// 3. CÁC BIẾN QUẢN LÝ TRẠNG THÁI GIAO DIỆN (ADMIN)
window.loggedInUser = null;
window.isAdminActive = false;
window.adminSearchQuery = '';
window.revenueChartInstance = null;
window.currentEditSheet = '';
window.currentEditId = '';

// 4. BẢNG PHÂN QUYỀN (DÙNG CHO TRANG QUẢN TRỊ)
window.PERMISSION_MAP = {
    'Orders': { id: 'Orders', label: '🛒 Đơn Hàng' },
    'Users': { id: 'Users', label: '👥 Khách Hàng' },
    'Products': { id: 'Products', label: '📦 Sản Phẩm' },
    'Vouchers': { id: 'Vouchers', label: '🎟️ Mã Giảm Giá' },
    'News': { id: 'News', label: '📰 Tin Tức' },
    'Info': { id: 'Info', label: 'ℹ️ Giới Thiệu' },
    'Contact': { id: 'Contact', label: '📞 Thông Tin' },
    'Feedback': { id: 'Feedback', label: '💬 Phản Ánh' },
    'Admin': { id: 'Admin', label: '⚙️ Phân Quyền' }
};