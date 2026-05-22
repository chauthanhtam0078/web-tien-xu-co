// ============================================================================
// 📁 MODULE 1: CONFIG & STATE (config.js)
// Định nghĩa các hằng số cấu hình và biến lưu trữ dữ liệu toàn cục
// ============================================================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz9JK5YteyMC9YLHSS6mWxGfprNh8VN_lWV46pkAB2tulG4V7Dx0yZfMDF8QQjUKj39/exec';

const PERMISSION_MAP = {
    'orders': { id: 'Orders', label: '📋 Đơn Hàng' },
    'products': { id: 'Products', label: '📦 Sản Phẩm' },
    'users': { id: 'Users', label: '👥 Khách Hàng' }, 
    'info': { id: 'Info', label: '📖 Giới Thiệu' },
    'news': { id: 'News', label: '📰 Tin Tức' },
    'contact': { id: 'Contact', label: '📞 Liên Hệ' },
    'admin': { id: 'Admin', label: '⚙️ Quản Trị Viên' }
};

// Global State
let cart = [];
let currentOrderCode = '';
let currentOrderTotal = 0;

let globalProducts = [];
let globalAbout = { title: "Đang tải dữ liệu...", paragraphs: [], bullets: [], image: "" };
let globalNews = [];
let globalContact = { address: "", phone: "", email: "", zalo: "", messenger: "", notes: "" };
let globalAdmins = []; 
let globalUsers = [];
let globalOrders = [];
let globalAllContacts = [];
let globalAllNews = [];
let filteredProducts = null; 

let isAdminActive = false;
let loggedInUser = null; 
let revenueChartInstance = null;
let adminSearchQuery = ''; 
