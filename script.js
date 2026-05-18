// =========================================================
// 🛑 DÁN ĐƯỜNG LINK WEB APP (GOOGLE APPS SCRIPT) VÀO ĐÂY:
// =========================================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyQaGl0gwrYTq3iNrpK6UzVMndUNhOwdLuGIeIeNyyw308w-ujcYsJN3zZNJfDDl2Ap/exec';

let isAdminActive = false;
let hasAdminPrivilege = false;

// ================= TRẠNG THÁI GIỎ HÀNG & THANH TOÁN =================
let cart = [];
let currentOrderCode = '';
let currentOrderTotal = 0;

// ================= DỮ LIỆU MOCK (BIẾN JS GLOBAL) =================
let globalProducts = [
    // Sản phẩm mẫu 1 có gắn discount 15% để bạn test giao diện
    { id: "mock1", name: "Đồng Xu Khải Định 1 Đồng", price: "850.000đ", discount: "15", period: "Triều Nguyễn", years: "1916-1925", desc: "Tiền xu bằng đồng thời vua Khải Định, còn rõ nét chữ Hán và hoa văn rồng phụng cổ điển.", symbol: "宣", color: "text-brand-gold", images: [] },
    { id: "mock2", name: "Bạch Kim Bảo Đại 5 Xu", price: "1.200.000đ", period: "Triều Nguyễn", years: "1925-1945", desc: "Xu bạch kim thời vua Bảo Đại, kích thước nhỏ, bề mặt còn lưu dấu ấn đúc tiền triều đình.", symbol: "統", color: "text-gray-500", images: [] },
    { id: "mock3", name: "Đồng Tiền Tự Đức Thông Bảo", price: "650.000đ", period: "Triều Nguyễn", years: "1848-1883", desc: "Tiền xu đồng thời Tự Đức, bốn chữ 'Tự Đức Thông Bảo' xung quanh lỗ vuông trung tâm.", symbol: "嗣", color: "text-amber-700", images: [] },
    { id: "mock4", name: "Đồng Xu Minh Mạng Thông Bảo", price: "980.000đ", period: "Triều Nguyễn", years: "1820-1841", desc: "Xu đồng thời Minh Mạng, một trong những triều đại hưng thịnh nhất, chất lượng đúc cao.", symbol: "明", color: "text-gray-600", images: [] }
];
let globalAbout = { title: "Đang đồng bộ dữ liệu...", paragraphs: [], bullets: [] };
let globalNews = [];
let globalContact = { address: "", phone: "", email: "", zalo: "", messenger: "", notes: "" };

// Tạo mã tự động phía Client-side để đồng bộ giữa QR và Database Sheets
function generateClientCode(prefix) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + code;
}

// Cập nhật URL mã QR theo tên khách hàng và mã đơn hàng động
function updateQRCode(customerName) {
    const qrImg = document.getElementById('qrCodeImg');
    if (qrImg) {
        const cleanName = (customerName || '').trim();
        // Định dạng nội dung: [Ten Khach Hang] thanh toan don hang [Ma Don Hang]
        const infoText = cleanName 
            ? `${cleanName} thanh toan don hang ${currentOrderCode}`
            : `Thanh toan don hang ${currentOrderCode}`;
            
        qrImg.src = `https://img.vietqr.io/image/tcb-0916694438-compact2.jpg?amount=${currentOrderTotal}&addInfo=${encodeURIComponent(infoText)}`;
    }
}

// ================= KHỞI TẠO & LẮNG NGHE SỰ KIỆN =================
document.addEventListener('DOMContentLoaded', () => {
    fetchAllData();
    // Load giỏ hàng từ LocalStorage (nếu có) khi mở trang
    const savedCart = localStorage.getItem('tienxu_cart');
    if(savedCart) {
        cart = JSON.parse(savedCart);
        updateCartBadge();
    }

    // Lắng nghe sự kiện gõ tên khách hàng để cập nhật mã QR động ngay lập tức
    const nameInput = document.querySelector('input[name="customer_name"]');
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            updateQRCode(e.target.value);
        });
    }
});

async function fetchAllData() {
    if(SCRIPT_URL.includes('AKfycbyc9b2iKk') || SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) {
        alert("⚠️ CẢNH BÁO TỪ HỆ THỐNG:\nBạn chưa thay SCRIPT_URL bằng link Google Apps Script thật của bạn! Web đang chạy với dữ liệu rỗng.");
        finishLoading();
        return;
    }

    try {
        const response = await fetch(SCRIPT_URL + '?action=getAllData');
        const data = await response.json();
        
        if (data.products && data.products.length > 0) {
            globalProducts = data.products;
            globalProducts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        }
        if (data.news && data.news.length > 0) globalNews = data.news;
        if (data.about && data.about.title) globalAbout = data.about;
        if (data.contact && data.contact.address) globalContact = data.contact;

    } catch (error) {
        console.error("Lỗi lấy dữ liệu API:", error);
        alert("❌ Lỗi kết nối đến Google Sheets!\nHãy kiểm tra lại SCRIPT_URL đã đúng chưa.");
    }
    finishLoading();
}

function finishLoading() {
    document.getElementById('loadingIndicator').classList.add('hidden');
    if (!isAdminActive) document.getElementById('publicContainer').classList.remove('hidden');
    
    renderPublicGrid();
    renderAdminTable();
    renderAboutData();
    renderNewsData();
}

// ================= HÀM TIỆN ÍCH XỬ LÝ TIỀN TỆ & CHIẾT KHẤU =================
function getNumericPrice(priceStr) {
    if (!priceStr) return 0;
    return parseInt(priceStr.toString().replace(/[^\d]/g, '')) || 0;
}

function formatCurrency(num) {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
}

// Quy đổi chiết khấu từ Google Sheets một cách thông minh (Xử lý trường hợp 10% trả về dạng số thập phân 0.1)
function getDiscountPercent(discountStr) {
    if (!discountStr) return 0;
    let str = discountStr.toString().trim();
    if (str.endsWith('%')) {
        return parseInt(str.replace(/[^\d]/g, '')) || 0;
    }
    let val = parseFloat(str);
    if (!isNaN(val)) {
        if (val > 0 && val < 1) {
            return Math.round(val * 100);
        }
        return Math.round(val);
    }
    return 0;
}

// Hàm tính giá tiền sau khi trừ chiết khấu %
function calculateFinalPrice(priceStr, discountStr) {
    const price = getNumericPrice(priceStr);
    const discount = getDiscountPercent(discountStr);
    if (discount > 0 && discount <= 100) {
        return price - (price * discount / 100);
    }
    return price;
}

// ================= QUẢN LÝ GIỎ HÀNG (CART LOGIC) =================

window.addToCart = (productId) => {
    let product = globalProducts.find(p => p.id == productId || p.ma_sp == productId);
    if (!product && !isNaN(productId)) product = globalProducts[parseInt(productId)];
    if (!product) return;

    const existingItem = cart.find(item => item.id == product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartBadge();
    window.toggleCartModal(true);
};

window.removeFromCart = (productId) => {
    cart = cart.filter(item => item.id != productId);
    saveCart();
    updateCartBadge();
    renderCartItems();
};

window.changeCartQuantity = (productId, delta) => {
    const item = cart.find(item => item.id == productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            window.removeFromCart(productId);
            return;
        }
        saveCart();
        renderCartItems();
    }
};

function saveCart() {
    localStorage.setItem('tienxu_cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if(!badge) return;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
        badge.innerText = totalItems;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

window.toggleCartModal = (forceOpen = false) => {
    const modal = document.getElementById('cartModal');
    const content = document.getElementById('cartContent');
    
    const isOpening = forceOpen === true || modal.classList.contains('opacity-0');
    
    if (isOpening) {
        renderCartItems();
        modal.classList.remove('opacity-0', 'pointer-events-none');
        content.classList.remove('translate-x-full');
        document.body.classList.add('modal-open');
    } else {
        modal.classList.add('opacity-0', 'pointer-events-none');
        content.classList.add('translate-x-full');
        document.body.classList.remove('modal-open');
    }
};

document.getElementById('cartModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'cartModal') window.toggleCartModal(false);
});

function renderCartItems() {
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotalPrice');
    if(!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-10 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <p>Giỏ hàng của bạn đang trống.</p>
                <button onclick="window.toggleCartModal(false)" class="mt-4 text-brand-gold font-bold hover:underline">Tiếp tục xem sản phẩm</button>
            </div>
        `;
        totalEl.innerText = "0đ";
        return;
    }

    let html = '';
    let totalPrice = 0;

    cart.forEach(item => {
        const finalPrice = calculateFinalPrice(item.price, item.discount);
        const itemTotal = finalPrice * item.quantity;
        totalPrice += itemTotal;
        const discountVal = getDiscountPercent(item.discount);

        let imgUrl = (item.images && item.images.length > 0 && item.images[0]) ? item.images[0] : 'https://placehold.co/100x100/efe8d7/1c1612?text=Xu';

        html += `
            <div class="flex gap-4 p-3 bg-white border border-gray-100 rounded-sm shadow-sm relative">
                <img src="${imgUrl}" class="w-20 h-20 object-cover rounded-sm border border-gray-200">
                <div class="flex-grow flex flex-col justify-center">
                    <h4 class="font-serif font-bold text-sm text-brand-dark line-clamp-2 pr-6">${item.name}</h4>
                    ${discountVal > 0 ? `<p class="text-[10px] text-gray-500 line-through mb-0 mt-1 font-sans">${item.price}</p>` : ''}
                    <p class="text-red-700 font-bold text-sm font-sans ${discountVal > 0 ? 'mt-0' : 'mt-1'}">${formatCurrency(finalPrice)}</p>
                    
                    <div class="flex items-center gap-3 mt-2">
                        <div class="flex items-center border border-gray-300 rounded-full overflow-hidden">
                            <button onclick="window.changeCartQuantity('${item.id}', -1)" class="px-3 py-1 bg-gray-50 hover:bg-gray-200 transition text-xs font-bold">-</button>
                            <span class="px-3 py-1 text-xs font-medium border-x border-gray-300 font-sans">${item.quantity}</span>
                            <button onclick="window.changeCartQuantity('${item.id}', 1)" class="px-3 py-1 bg-gray-50 hover:bg-gray-200 transition text-xs font-bold">+</button>
                        </div>
                    </div>
                </div>
                <button onclick="window.removeFromCart('${item.id}')" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
    
    // Đổi font chữ thành Sans cho tổng tiền giỏ hàng
    if (totalEl) {
        totalEl.classList.remove('font-serif');
        totalEl.classList.add('font-sans');
        totalEl.innerText = formatCurrency(totalPrice);
    }
}

// Hàm được gọi khi bấm Tiến Hành Thanh Toán ở giỏ hàng
window.checkoutCart = () => {
    if (cart.length === 0) return;
    window.toggleCartModal(false);
    
    // Tính tổng tiền dựa trên giá đã chiết khấu
    let totalPrice = cart.reduce((sum, item) => sum + (calculateFinalPrice(item.price, item.discount) * item.quantity), 0);
    let summaryNames = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');

    setTimeout(() => {
        window.openModal(summaryNames, formatCurrency(totalPrice), totalPrice);
    }, 300);
};

// ================= HÀM RENDER HTML TỪ BIẾN MOCK/SHEETS =================

function renderAboutData() {
    const container = document.getElementById('aboutContainer');
    if(!container) return;
    
    let pHTML = globalAbout.paragraphs.map(p => p.trim() ? `<p class="text-gray-700 mb-4 leading-relaxed text-sm">${p}</p>` : '').join('');
    let liHTML = globalAbout.bullets.map(li => li.trim() ? `<li>${li}</li>` : '').join('');

    container.innerHTML = `
        <div>
            <div class="rounded-sm shadow-lg w-full aspect-video bg-[#efe8d7] relative overflow-hidden flex items-center justify-center border border-[#d8ccb8]">
                <div class="absolute inset-0 opacity-10 bg-[linear-gradient(#cda568_1px,transparent_1px),linear-gradient(90deg,#cda568_1px,transparent_1px)] bg-[size:15px_15px]"></div>
                <div class="relative flex items-center justify-center gap-2">
                    <div class="w-20 h-20 rounded-full border-[3px] border-[#cda568] bg-[#1c1612] flex items-center justify-center text-[#cda568] opacity-80 transform -rotate-12 translate-x-4 shadow-md"><span class="font-serif text-2xl font-bold">寶</span></div>
                    <div class="w-32 h-32 rounded-full border-[4px] border-[#cda568] bg-[#1c1612] flex items-center justify-center text-[#cda568] z-10 shadow-2xl"><span class="font-serif text-5xl font-bold">古</span></div>
                    <div class="w-24 h-24 rounded-full border-[3px] border-[#cda568] bg-[#1c1612] flex items-center justify-center text-[#cda568] opacity-90 transform rotate-12 -translate-x-4 shadow-lg"><span class="font-serif text-3xl font-bold">錢</span></div>
                </div>
            </div>
        </div>
        <div>
            <h3 class="text-xl font-bold text-[#8c5a2b] mb-4">${globalAbout.title}</h3>
            ${pHTML}
            <ul class="list-disc pl-5 text-gray-700 text-sm space-y-2">
                ${liHTML}
            </ul>
        </div>
    `;
}

function renderNewsData() {
    const container = document.getElementById('newsContainer');
    if(!container) return;
    container.innerHTML = '';
    
    globalNews.forEach(n => {
        container.innerHTML += `
        <div class="bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-md transition group cursor-pointer flex flex-col">
            <div class="w-full aspect-video bg-[#f8f5ee] relative overflow-hidden flex items-center justify-center border-b border-brand-border">
                <div class="transform group-hover:scale-105 transition duration-500 ease-out flex items-center justify-center">
                    <svg viewBox="0 0 120 120" class="w-28 h-28 drop-shadow-lg">
                        <polygon points="60,5 98,20 115,58 98,95 60,115 22,95 5,58 22,20" fill="none" stroke="#cda568" stroke-width="2" opacity="0.5"/>
                        <polygon points="60,12 91,25 105,58 91,91 60,108 29,91 15,58 29,25" fill="none" stroke="#8c5a2b" stroke-width="1" opacity="0.6"/>
                        <circle cx="60" cy="60" r="38" fill="#1c1612" stroke="#cda568" stroke-width="3"/>
                        <circle cx="60" cy="60" r="30" fill="none" stroke="#cda568" stroke-width="1" stroke-dasharray="3 3" opacity="0.7"/>
                        <rect x="50" y="50" width="20" height="20" fill="#f8f5ee" stroke="#cda568" stroke-width="2"/>
                        <text x="60" y="44" font-size="12" font-family="serif" font-weight="bold" text-anchor="middle" fill="#cda568">越</text>
                        <text x="60" y="86" font-size="12" font-family="serif" font-weight="bold" text-anchor="middle" fill="#cda568">南</text>
                        <text x="36" y="64" font-size="12" font-family="serif" font-weight="bold" text-anchor="middle" fill="#cda568">文</text>
                        <text x="84" y="64" font-size="12" font-family="serif" font-weight="bold" text-anchor="middle" fill="#cda568">史</text>
                    </svg>
                </div>
            </div>
            <div class="p-5 flex-grow">
                <span class="text-xs text-[#d5a044] font-bold uppercase mb-2 block">${n.category}</span>
                <h4 class="font-bold text-lg mb-2 group-hover:text-[#8c5a2b] transition">${n.title}</h4>
                <p class="text-gray-600 text-sm line-clamp-3">${n.desc}</p>
            </div>
        </div>
        `;
    });
}

function renderPublicGrid() {
    const featuredGrid = document.getElementById('featuredProductGrid');
    const allGrid = document.getElementById('allProductGrid');
    if(!featuredGrid || !allGrid) return;
    
    featuredGrid.innerHTML = ''; allGrid.innerHTML = '';
    if (globalProducts.length === 0) {
        featuredGrid.innerHTML = `<p class="col-span-full text-center text-gray-500 italic py-10">Chưa có sản phẩm.</p>`;
        return;
    }

    globalProducts.forEach((p, index) => {
        let imageHTML = '';
        let badgeHTML = '';
        let priceHTML = '';
        
        let firstImage = (p.images && p.images.length > 0 && p.images[0].trim() !== '') ? p.images[0] : '';
        const finalPrice = calculateFinalPrice(p.price, p.discount);
        const discountVal = getDiscountPercent(p.discount);

        // ĐỔI: Chữ số chỗ giá sản phẩm thành font-sans (Không chân)
        if (discountVal > 0) {
            badgeHTML = `<div class="absolute top-2 left-2 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xs shadow-md z-20">-${discountVal}%</div>`;
            priceHTML = `
                <div class="text-[11px] text-gray-500 line-through mb-0.5 font-sans">${p.price}</div>
                <div class="text-xl font-bold font-sans text-red-800 leading-none">${formatCurrency(finalPrice)}</div>
            `;
        } else {
            priceHTML = `<div class="text-xl font-bold font-sans text-red-800">${p.price}</div>`;
        }

        if (firstImage !== '') {
            imageHTML = `<img src="${firstImage}" alt="${p.name}" class="w-32 h-32 object-cover rounded-full drop-shadow-lg border-2 border-brand-gold border-opacity-40 bg-white group-hover:scale-105 transition-transform duration-500">`;
        } else {
            const sym = p.symbol || '古';
            imageHTML = `
            <svg viewBox="0 0 100 100" class="w-28 h-28 text-brand-gold opacity-80 drop-shadow-md group-hover:scale-105 transition-transform duration-500">
                <circle cx="50" cy="50" r="45" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/>
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="currentColor" stroke-width="1"/>
                <rect x="35" y="35" width="30" height="30" fill="transparent" stroke="currentColor" stroke-width="1"/>
                <text x="50" y="55" font-size="16" text-anchor="middle" fill="#1c1612" font-weight="bold">${sym}</text>
            </svg>`;
        }

        const cardHTML = `
        <div class="bg-white border border-brand-border rounded-sm shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full relative overflow-hidden group">
            <div class="cursor-pointer flex-grow flex flex-col" onclick="window.openProductDetail('${p.id || index}')">
                <div class="bg-brand-card h-48 relative flex justify-center items-center p-6 border-b border-brand-border">
                    <div class="absolute top-0 right-0 bg-brand-dark text-brand-gold text-xs px-2 py-1 font-mono z-10">${p.years}</div>
                    ${badgeHTML}
                    ${p.images && p.images.length > 1 ? `<div class="absolute bottom-2 left-2 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-sm z-10 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> ${p.images.length} ảnh</div>` : ''}
                    ${imageHTML}
                </div>
                <div class="p-5 flex-grow flex flex-col">
                    <h4 class="font-serif font-bold text-lg mb-2 text-brand-dark h-14 line-clamp-2 group-hover:text-[#8c5a2b] transition-colors">${p.name}</h4>
                    <p class="text-sm text-gray-600 mb-4 flex-grow line-clamp-2">${p.desc}</p>
                    <div class="dashed-line mt-auto"></div>
                </div>
            </div>
            <div class="px-5 pb-5 flex justify-between items-end">
                <div>
                    ${priceHTML}
                    <div class="text-xs text-gray-500 uppercase mt-1">${p.period}</div>
                </div>
                <button onclick="event.stopPropagation(); window.addToCart('${p.id || index}')" class="bg-brand-btn text-brand-gold hover:text-white px-4 py-2 text-[13px] transition-colors border border-brand-btn relative z-10 flex items-center gap-1 whitespace-nowrap rounded-full shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Thêm Vào Giỏ
                </button>
            </div>
        </div>`;
        allGrid.innerHTML += cardHTML;
        if(index < 4) featuredGrid.innerHTML += cardHTML;
    });
}

function renderAdminTable() {
    const tbody = document.getElementById('adminTableBody');
    if(!tbody) return;
    document.getElementById('productCountBadge').innerText = globalProducts.length;
    tbody.innerHTML = '';
    
    if(globalProducts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>`;
        return;
    }

    globalProducts.forEach((p) => {
        let thumbHTML = '';
        let firstImage = (p.images && p.images.length > 0 && p.images[0].trim() !== '') ? p.images[0] : '';
        if (firstImage !== '') {
            thumbHTML = `<div class="relative w-10 h-10"><img src="${firstImage}" class="w-10 h-10 rounded-full object-cover border border-gray-300 drop-shadow-sm bg-white">
                         ${p.images && p.images.length > 1 ? `<span class="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] px-1 rounded-full">+${p.images.length-1}</span>` : ''}</div>`;
        } else {
            thumbHTML = `<div class="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-brand-bg text-brand-gold"><span class="font-serif font-bold text-sm">${p.symbol || '古'}</span></div>`;
        }

        const discountVal = getDiscountPercent(p.discount);

        tbody.innerHTML += `
        <tr class="hover:bg-gray-50 transition border-b border-gray-100">
            <td class="px-4 py-3">${thumbHTML}</td>
            <td class="px-4 py-3 font-medium text-brand-dark">${p.name}</td>
            <td class="px-4 py-3 text-red-700 font-bold font-sans">${p.price} ${discountVal > 0 ? `<span class="text-xs text-white bg-red-500 px-1.5 py-0.5 ml-1 rounded-full">-${discountVal}%</span>` : ''}</td>
            <td class="px-4 py-3 text-center">
                <button onclick="alert('Tính năng xóa chưa cấu hình API Backend')" class="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-full text-xs border border-transparent hover:border-red-200 transition">Xóa</button>
            </td>
        </tr>`;
    });
}


// ================= QUẢN LÝ QUYỀN ADMIN =================

window.handleAuth = () => {
    if (hasAdminPrivilege) {
        if(confirm("Bạn muốn đăng xuất khỏi quyền Admin?")) {
            hasAdminPrivilege = false;
            isAdminActive = false;
            window.location.reload();
        }
    } else {
        const pass = prompt("Nhập mật khẩu Admin (Mặc định test: 123456):");
        if (pass === "123456") {
            hasAdminPrivilege = true;
            alert("Đăng nhập Admin thành công!");
            document.getElementById('adminControlBox').innerHTML = `
                <button onclick="window.toggleAdmin()" id="toggleAdminBtn" class="text-xs text-brand-gold border border-brand-gold px-4 py-1.5 hover:bg-brand-gold hover:text-[#1a1a1a] transition-colors rounded-full shadow-sm">
                    🔧 Vào Quản Trị
                </button>
                <button onclick="window.handleAuth()" class="text-xs text-gray-500 hover:text-red-400 underline transition-colors">
                    Đăng xuất
                </button>
            `;
        } else if (pass !== null) {
            alert("Sai mật khẩu!");
        }
    }
};

window.toggleAdmin = () => {
    if (!hasAdminPrivilege) return alert("Vui lòng đăng nhập quyền Admin ở cuối trang!");
    isAdminActive = !isAdminActive;
    const pubContainer = document.getElementById('publicContainer');
    const admView = document.getElementById('adminSection');
    const toggleBtn = document.getElementById('toggleAdminBtn');
    
    if(isAdminActive) {
        pubContainer.classList.add('hidden');
        admView.classList.remove('hidden');
        if(toggleBtn) toggleBtn.innerHTML = '👁️ Xem Trang Web'; 
        window.scrollTo(0, 0);
    } else {
        admView.classList.add('hidden');
        pubContainer.classList.remove('hidden');
        if(toggleBtn) toggleBtn.innerHTML = '🔧 Vào Quản Trị'; 
        window.switchPage('home'); 
    }
};

window.switchTab = (tabName) => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`)?.classList.add('active');
    
    ['viewProducts', 'viewOrders'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });

    const targetView = document.getElementById(`view${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if(targetView) {
        targetView.classList.remove('hidden');
        if(tabName === 'products') targetView.classList.add('grid');
    }
};

// ================= LOGIC MODAL CHI TIẾT SẢN PHẨM =================
let currentDetailImages = [];
let currentDetailIndex = 0;
let currentDetailProduct = null;

window.openProductDetail = (id) => {
    let product = globalProducts.find(p => p.id == id);
    if(!product && !isNaN(id)) product = globalProducts[parseInt(id)]; // Fallback
    if(!product) return;
    
    currentDetailProduct = product;
    currentDetailImages = product.images && product.images.length > 0 ? product.images : [];
    currentDetailIndex = 0;
    
    document.getElementById('detailTitle').innerText = product.name;
    
    // ĐỔI: Chuyển đổi font chữ giá tiền sang font-sans
    const finalPrice = calculateFinalPrice(product.price, product.discount);
    const discountVal = getDiscountPercent(product.discount);
    
    const detailPriceEl = document.getElementById('detailPrice');
    if (detailPriceEl) {
        detailPriceEl.classList.remove('font-serif');
        detailPriceEl.classList.add('font-sans');
        detailPriceEl.innerHTML = discountVal > 0 
            ? `<span class="text-sm text-gray-500 line-through mr-2 font-sans font-normal">${product.price}</span>${formatCurrency(finalPrice)}` 
            : product.price;
    }

    document.getElementById('detailPeriod').innerText = product.period;
    document.getElementById('detailYears').innerText = product.years;
    document.getElementById('detailDesc').innerText = product.desc;

    updateDetailImageDisplay();

    const detailModal = document.getElementById('detailModal');
    detailModal.classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('detailModalContent').classList.remove('scale-95');
    document.body.classList.add('modal-open');
};

function updateDetailImageDisplay() {
    const imgEl = document.getElementById('detailMainImage');
    const svgEl = document.getElementById('detailSvgFallback');
    const prevBtn = document.getElementById('detailPrevBtn');
    const nextBtn = document.getElementById('detailNextBtn');
    const counter = document.getElementById('detailImageCounter');

    if (currentDetailImages.length > 0 && currentDetailImages[0].trim() !== '') {
        imgEl.src = currentDetailImages[currentDetailIndex];
        imgEl.classList.remove('hidden'); svgEl.classList.add('hidden');
        if (currentDetailImages.length > 1) {
            prevBtn.classList.remove('hidden'); nextBtn.classList.remove('hidden'); counter.classList.remove('hidden');
            counter.innerText = `${currentDetailIndex + 1}/${currentDetailImages.length}`;
        } else {
            prevBtn.classList.add('hidden'); nextBtn.classList.add('hidden'); counter.classList.add('hidden');
        }
    } else {
        imgEl.classList.add('hidden'); prevBtn.classList.add('hidden'); nextBtn.classList.add('hidden'); counter.classList.add('hidden');
        svgEl.classList.remove('hidden');
        svgEl.innerHTML = `<svg viewBox="0 0 100 100" class="w-2/3 h-2/3 text-brand-gold opacity-80 drop-shadow-xl">
            <circle cx="50" cy="50" r="45" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/>
            <circle cx="50" cy="50" r="35" fill="transparent" stroke="currentColor" stroke-width="1"/>
            <rect x="35" y="35" width="30" height="30" fill="transparent" stroke="currentColor" stroke-width="1"/>
            <text x="50" y="55" font-size="16" text-anchor="middle" fill="#1c1612" font-weight="bold">${currentDetailProduct.symbol || '古'}</text>
        </svg>`;
    }
}

window.detailNextImage = () => {
    if (currentDetailImages.length <= 1) return;
    currentDetailIndex = (currentDetailIndex + 1) % currentDetailImages.length;
    updateDetailImageDisplay();
};
window.detailPrevImage = () => {
    if (currentDetailImages.length <= 1) return;
    currentDetailIndex = (currentDetailIndex - 1 + currentDetailImages.length) % currentDetailImages.length;
    updateDetailImageDisplay();
};
window.closeDetailModal = () => {
    const detailModal = document.getElementById('detailModal');
    detailModal.classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('detailModalContent').classList.add('scale-95');
    document.body.classList.remove('modal-open');
};

// Từ chi tiết sản phẩm -> Thêm vào giỏ
window.addToCartFromDetail = () => {
    if (currentDetailProduct) {
        window.addToCart(currentDetailProduct.id || currentDetailProduct.ma_sp);
    }
    window.closeDetailModal();
};

// ================= LOGIC GỬI THÊM SP VÀ ĐẶT HÀNG =================

const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

window.handleAddProduct = async (e) => {
    e.preventDefault();
    if(!hasAdminPrivilege) return alert("Bạn không có quyền!");
    if(SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) return alert("Hãy điền URL Google Script vào code JS trước!");

    const btn = e.target.querySelector('button');
    const oldText = btn.innerText;
    btn.innerText = "⏳ Đang tải ảnh lên Drive và lưu..."; btn.disabled = true;

    try {
        const fileInput = document.getElementById('addImages');
        let base64Images = [];
        if (fileInput.files.length > 0) {
            for (let i = 0; i < fileInput.files.length; i++) {
                base64Images.push(await fileToBase64(fileInput.files[i]));
            }
        }

        const productData = {
            name: document.getElementById('addName').value,
            price: document.getElementById('addPrice').value,
            years: document.getElementById('addYears').value,
            period: document.getElementById('addPeriod').value,
            symbol: document.getElementById('addSymbol').value || '古',
            desc: document.getElementById('addDesc').value,
            images: base64Images
        };

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'addProduct', data: productData })
        });
        
        const result = await response.json();
        if(result.success) {
            e.target.reset(); 
            alert("✅ Đã thêm sản phẩm! Vui lòng F5 trang để cập nhật dữ liệu.");
            window.location.reload();
        } else alert("❌ Lỗi Server: " + result.message);
    } catch (error) {
        alert("❌ Lỗi: " + error.message);
    } finally {
        btn.innerText = oldText; btn.disabled = false;
    }
};

const modal = document.getElementById('orderModal');
const modalContent = document.getElementById('modalContent');

// Khi gọi Modal Thanh toán, lấy luôn số tiền để sinh QR
window.openModal = (productSummaryNames, formattedPriceString, numericTotal) => {
    currentOrderCode = generateClientCode('TXC-O-'); // Tạo mã đơn hàng tại Client-side
    currentOrderTotal = numericTotal; // Lưu tổng tiền để đổi QR

    // Tự động render chi tiết sản phẩm vào cột bên trái
    const summaryContainer = document.getElementById('orderSummaryItems');
    if (summaryContainer) {
        let html = '';
        cart.forEach(item => {
            const finalPrice = calculateFinalPrice(item.price, item.discount);
            let imgUrl = (item.images && item.images.length > 0 && item.images[0]) ? item.images[0] : 'https://placehold.co/100x100/efe8d7/1c1612?text=Xu';
            html += `
                <div class="flex gap-3 items-center bg-white p-3 rounded-sm border border-gray-100 shadow-sm">
                    <img src="${imgUrl}" class="w-12 h-12 object-cover rounded-sm border border-gray-200">
                    <div class="flex-grow">
                        <h5 class="text-xs font-bold text-brand-dark line-clamp-1">${item.name}</h5>
                        <p class="text-[11px] text-gray-500 mt-0.5">SL: ${item.quantity}  <span class="text-red-600 font-sans ml-1 font-bold">x ${formatCurrency(finalPrice)}</span></p>
                    </div>
                </div>
            `;
        });
        summaryContainer.innerHTML = html;
    }

    // ĐỔI: Chữ số giá tiền trên Modal thanh toán thành font-sans
    const modalPriceEl = document.getElementById('modalProductPrice');
    if (modalPriceEl) {
        modalPriceEl.classList.remove('font-serif');
        modalPriceEl.classList.add('font-sans');
        modalPriceEl.innerText = formattedPriceString;
    }

    document.getElementById('hiddenProductName').value = productSummaryNames;
    
    // Tạo QR ban đầu chưa nhập tên
    updateQRCode('');
    
    document.getElementById('orderForm').reset();
    window.togglePaymentInfo();

    modal.classList.remove('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-95');
    modalContent.classList.add('scale-100');
    document.body.classList.add('modal-open');
}

window.closeModal = () => {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
        document.getElementById('orderForm').reset();
        window.togglePaymentInfo();
    }, 300);
}

window.togglePaymentInfo = () => {
    const methodEl = document.querySelector('input[name="payment_method"]:checked');
    if(!methodEl) return;
    
    const method = methodEl.value;
    const bankInfo = document.getElementById('bankInfoArea');
    const submitBtn = document.getElementById('submitOrderBtn');
    
    if(method === 'BANK') {
        bankInfo.classList.remove('hidden');
        submitBtn.innerText = "TÔI ĐÃ CHUYỂN KHOẢN & ĐẶT HÀNG";
    } else {
        bankInfo.classList.add('hidden');
        submitBtn.innerText = "ĐẶT HÀNG NGAY";
    }
};

window.submitOrder = async (event) => {
    event.preventDefault();
    if(SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) return alert("Bản xem trước: Chưa kết nối API Server. Giao dịch test thành công!");

    const btn = event.target.querySelector('button[type="submit"]');
    const oldText = btn.innerText;
    btn.innerText = "ĐANG XỬ LÝ..."; btn.disabled = true;

    // ĐỔI: Gom danh sách mảng sản phẩm chi tiết từ giỏ hàng để chuyển sang nhiều dòng
    const orderData = {
        order_code: currentOrderCode,
        customer_name: event.target.customer_name.value,
        phone: event.target.phone.value,
        email: event.target.email.value || "",
        address: event.target.address.value,
        notes: event.target.notes.value || "",
        payment_method: document.querySelector('input[name="payment_method"]:checked').value,
        items: cart.map(item => ({
            id: item.id,
            ma_sp: item.ma_sp || "",
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount || ""
        }))
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'addOrder', data: orderData })
        });
        const result = await response.json();
        if(result.success) {
            let msg = orderData.payment_method === 'BANK' 
                ? "✅ Cảm ơn! Hệ thống đã ghi nhận đơn hàng và mã thanh toán của bạn. Chúng tôi sẽ đối soát và gửi hàng sớm nhất." 
                : "✅ Cảm ơn! Đơn hàng COD của bạn đã được ghi nhận thành công.";
            alert(msg);
            
            // Xóa rỗng giỏ hàng sau khi đặt thành công
            cart = [];
            saveCart();
            updateCartBadge();
            window.closeModal();
            
        } else {
            alert("❌ Có lỗi xảy ra: " + result.message);
        }
    } catch (error) {
        alert("❌ Có lỗi kết nối mạng, vui lòng thử lại.");
    } finally {
        btn.innerText = oldText; btn.disabled = false;
    }
}

// Chuyển trang Navbar
window.switchPage = (pageId) => {
    if (isAdminActive) {
        isAdminActive = false;
        document.getElementById('adminSection').classList.add('hidden');
        document.getElementById('publicContainer').classList.remove('hidden');
    }

    document.querySelectorAll('.page-view').forEach(el => el.classList.add('hidden'));
    const viewEl = document.getElementById(`view-${pageId}`);
    if(viewEl) viewEl.classList.remove('hidden');
    window.scrollTo(0, 0);

    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('bg-[#d5a044]', 'text-white', 'px-3', 'rounded-full', 'hover:text-white');
        el.classList.add('text-[#8c5a2b]', 'hover:text-[#d5a044]');
    });
    const activeNav = document.getElementById(`nav-${pageId}`);
    if(activeNav) {
        activeNav.classList.remove('text-[#8c5a2b]', 'hover:text-[#d5a044]');
        activeNav.classList.add('bg-[#d5a044]', 'text-white', 'px-3', 'rounded-full', 'hover:text-white');
    }
};
