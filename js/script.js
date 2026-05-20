// =========================================================
// 🛑 DÁN ĐƯỜNG LINK WEB APP (GOOGLE APPS SCRIPT) VÀO ĐÂY:
// =========================================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwNkiZkCJfsF8c6ZqW4MfCfH7fijRe6hXb-j-Cd0XQbi7HQSm_0h99a14rNGCx3-dqo/exec';

let cart = [];
let currentOrderCode = '';
let currentOrderTotal = 0;

// GLOBAL DATA
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

// ADMIN STATE
let isAdminActive = false;
let loggedInUser = null; 
let revenueChartInstance = null;
let adminSearchQuery = ''; 

const PERMISSION_MAP = {
    'orders': { id: 'Orders', label: '📋 Đơn Hàng' },
    'products': { id: 'Products', label: '📦 Sản Phẩm' },
    'users': { id: 'Users', label: '👥 Khách Hàng' }, 
    'info': { id: 'Info', label: '📖 Giới Thiệu' },
    'news': { id: 'News', label: '📰 Tin Tức' },
    'contact': { id: 'Contact', label: '📞 Liên Hệ' },
    'admin': { id: 'Admin', label: '⚙️ Quản Trị Viên' }
};

// ================= TIỆN ÍCH =================
function generateClientCode(prefix) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + code;
}

function updateQRCode(customerName) {
    const qrImg = document.getElementById('qrCodeImg');
    if (qrImg) {
        const cleanName = (customerName || '').trim();
        const infoText = cleanName ? `${cleanName} thanh toan don hang ${currentOrderCode}` : `Thanh toan don hang ${currentOrderCode}`;
        qrImg.src = `https://img.vietqr.io/image/tcb-0916694438-compact2.jpg?amount=${currentOrderTotal}&addInfo=${encodeURIComponent(infoText)}`;
    }
}

function getNumericPrice(priceStr) { return parseInt((priceStr||'').toString().replace(/[^\d]/g, '')) || 0; }
function formatCurrency(num) { return new Intl.NumberFormat('vi-VN').format(num) + 'đ'; }
function getDiscountPercent(discountStr) {
    if (!discountStr) return 0;
    let str = discountStr.toString().trim();
    if (str.endsWith('%')) return parseInt(str.replace(/[^\d]/g, '')) || 0;
    let val = parseFloat(str);
    if (!isNaN(val)) return (val > 0 && val < 1) ? Math.round(val * 100) : Math.round(val);
    return 0;
}
function calculateFinalPrice(priceStr, discountStr) {
    const price = getNumericPrice(priceStr);
    const discount = getDiscountPercent(discountStr);
    return (discount > 0 && discount <= 100) ? price - (price * discount / 100) : price;
}

// ================= TOAST NOTIFICATION =================
window.showToast = (message, type = 'success') => {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    const bgColors = {
        success: 'bg-white border-l-4 border-green-500 text-gray-800',
        error: 'bg-white border-l-4 border-red-500 text-gray-800',
        info: 'bg-gray-800 text-white'
    };
    const iconHTML = type === 'success' 
        ? `<svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
        : (type === 'error' ? `<svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>` : '');
    
    toast.className = `${bgColors[type]} p-4 rounded shadow-lg flex items-center toast-enter min-w-[250px] pointer-events-auto`;
    toast.innerHTML = `${iconHTML}<span class="text-sm font-medium leading-tight">${message}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-leave');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

// ================= TÌM KIẾM PUBLIC =================
window.executeSearch = () => {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    if(query === "") {
        window.showToast("Vui lòng nhập từ khóa tìm kiếm!", "info");
        return;
    }

    const matchedProducts = globalProducts.filter(p => 
        (p.name && p.name.toLowerCase().includes(query)) || 
        (p.desc && p.desc.toLowerCase().includes(query)) ||
        (p.period && p.period.toLowerCase().includes(query))
    );

    const matchedNews = globalNews.filter(n => 
        (n.title && n.title.toLowerCase().includes(query)) ||
        (n.desc && n.desc.toLowerCase().includes(query)) ||
        (n.category && n.category.toLowerCase().includes(query))
    );

    renderSearchResults(query, matchedProducts, matchedNews);
    window.switchPage('search');
};

function renderSearchResults(query, matchedProducts, matchedNews) {
    document.getElementById('searchCountDesc').innerText = `Tìm thấy ${matchedProducts.length} sản phẩm và ${matchedNews.length} bài viết cho từ khóa "${query}"`;
    const productGrid = document.getElementById('searchProductGrid');
    const newsGrid = document.getElementById('searchNewsGrid');

    if (matchedProducts.length === 0) {
        productGrid.innerHTML = `<p class="col-span-full text-center text-gray-500 italic py-4">Không tìm thấy sản phẩm nào.</p>`;
    } else {
        productGrid.innerHTML = '';
        matchedProducts.forEach((p, index) => {
            let firstImage = (p.images && p.images.length > 0 && p.images[0].trim() !== '') ? p.images[0] : '';
            const finalPrice = calculateFinalPrice(p.price, p.discount);
            const discountVal = getDiscountPercent(p.discount);
            let badgeHTML = discountVal > 0 ? `<div class="absolute top-2 left-2 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xs shadow-md z-20">-${discountVal}%</div>` : '';
            let priceHTML = discountVal > 0 ? `<div class="text-[11px] text-gray-500 line-through mb-0.5 font-sans">${p.price}</div><div class="text-xl font-bold font-sans text-red-800 leading-none">${formatCurrency(finalPrice)}</div>` : `<div class="text-xl font-bold font-sans text-red-800">${p.price}</div>`;
            
            const sym = p.symbol || '古';
            let imageHTML = firstImage !== '' 
                ? `<img src="${firstImage}" alt="${p.name}" class="w-32 h-32 object-cover rounded-full drop-shadow-lg border-2 border-brand-gold border-opacity-40 bg-white group-hover:scale-105 transition-transform duration-500">` 
                : `<svg viewBox="0 0 100 100" class="w-28 h-28 text-brand-gold opacity-80 drop-shadow-md group-hover:scale-105 transition-transform duration-500">
                    <circle cx="50" cy="50" r="45" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="50" cy="50" r="35" fill="transparent" stroke="currentColor" stroke-width="1"/>
                    <rect x="35" y="35" width="30" height="30" fill="transparent" stroke="currentColor" stroke-width="1"/>
                    <text x="50" y="55" font-size="16" text-anchor="middle" fill="#1c1612" font-weight="bold">${sym}</text>
                </svg>`;

            const cardHTML = `
            <div class="bg-white border border-brand-border rounded-sm shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full relative overflow-hidden group">
                <div class="cursor-pointer flex-grow flex flex-col" onclick="window.openProductDetail('${p.id || index}')">
                    <div class="bg-brand-card h-48 relative flex justify-center items-center p-6 border-b border-brand-border">
                        <div class="absolute top-0 right-0 bg-brand-dark text-brand-gold text-xs px-2 py-1 font-mono z-10">${p.years}</div>
                        ${badgeHTML} ${imageHTML}
                    </div>
                    <div class="p-5 flex-grow flex flex-col items-center text-center"><h4 class="font-serif font-bold text-lg mb-2 text-brand-dark h-14 line-clamp-2">${p.name}</h4><p class="text-sm text-gray-600 mb-4 line-clamp-2">${p.desc}</p><div class="dashed-line mt-auto w-full"></div></div>
                </div>
                <div class="px-5 pb-5 flex flex-col items-center gap-3">
                    <div class="text-center">${priceHTML}<div class="text-xs text-gray-500 uppercase mt-1">${p.period}</div></div>
                    <button onclick="event.stopPropagation(); window.addToCart('${p.id || index}')" class="w-full justify-center bg-brand-btn text-brand-gold hover:text-white px-4 py-2 text-[13px] transition-colors rounded-full shadow-sm flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> Thêm Vào Giỏ
                    </button>
                </div>
            </div>`;
            productGrid.innerHTML += cardHTML;
        });
    }

    if (matchedNews.length === 0) {
        newsGrid.innerHTML = `<p class="col-span-full text-center text-gray-500 italic py-4">Không tìm thấy bài viết nào.</p>`;
    } else {
        newsGrid.innerHTML = matchedNews.map(n => `
            <div class="bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-md transition group cursor-pointer flex flex-col" onclick="window.switchPage('news')">
                <div class="w-full aspect-video bg-[#f8f5ee] relative overflow-hidden flex items-center justify-center border-b border-brand-border">
                    ${n.image ? `<img src="${n.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">` : `
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
                    </div>`}
                </div>
                <div class="p-5 flex-grow text-center"><span class="text-xs text-[#d5a044] font-bold uppercase mb-2 block">${n.category}</span><h4 class="font-bold text-lg mb-2 group-hover:text-[#8c5a2b] transition">${n.title}</h4><p class="text-gray-600 text-sm line-clamp-3">${n.desc}</p></div>
            </div>`).join('');
    }
}

document.getElementById('searchInput')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') window.executeSearch();
});

// ================= KHỞI TẠO =================
document.addEventListener('DOMContentLoaded', () => {
    const savedCart = localStorage.getItem('tienxu_cart');
    if(savedCart) { cart = JSON.parse(savedCart); updateCartBadge(); }
    const savedAdmin = localStorage.getItem('tienxu_admin');
    if(savedAdmin) { loggedInUser = JSON.parse(savedAdmin); }

    const nameInput = document.querySelector('input[name="customer_name"]');
    if (nameInput) nameInput.addEventListener('input', (e) => updateQRCode(e.target.value));

    window.addEventListener('popstate', (e) => {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page') || 'home';
        window.switchPage(page, false);
    });

    fetchAllData();
});

function applyDataToGlobals(data) {
    if (data.products) { 
        globalProducts = data.products; 
        // Logic Sắp xếp MỚI: Ưu tiên Discount cao nhất -> Tới Timestamp mới nhất
        globalProducts.sort((a, b) => {
            const discA = getDiscountPercent(a.discount);
            const discB = getDiscountPercent(b.discount);
            if (discB !== discA) return discB - discA; 
            return (b.timestamp || 0) - (a.timestamp || 0); 
        });
    }
    if (data.news) globalNews = data.news;
    if (data.allNews) globalAllNews = data.allNews;
    if (data.about && data.about.title) globalAbout = data.about;
    if (data.contact && data.contact.address) globalContact = data.contact;
    if (data.allContacts) globalAllContacts = data.allContacts;
    if (data.admins) globalAdmins = data.admins;
    if (data.users) globalUsers = data.users;
    if (data.orders) { globalOrders = data.orders; globalOrders.sort((a,b) => { return new Date(b.date) - new Date(a.date); }); }
}

async function fetchAllData() {
    if(SCRIPT_URL.includes('AKfycbyc9b2iKk') || SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) {
        window.showToast("CẢNH BÁO: Chưa thay SCRIPT_URL!", "error");
        finishLoading(); return;
    }

    const cachedData = localStorage.getItem('tienxu_cached_webdata');
    if (cachedData) {
        try { applyDataToGlobals(JSON.parse(cachedData)); finishLoading(); } catch(e) {}
    }

    try {
        const response = await fetch(SCRIPT_URL + '?action=getAllData');
        const data = await response.json();
        localStorage.setItem('tienxu_cached_webdata', JSON.stringify(data));
        applyDataToGlobals(data);
        finishLoading(); 
        if(isAdminActive) buildAdminInterface(); 
    } catch (error) {
        if (!cachedData) document.getElementById('loadingIndicator').innerHTML = `<p class="text-red-500">Lỗi kết nối cơ sở dữ liệu.</p>`;
    }
}

function finishLoading() {
    document.getElementById('loadingIndicator').classList.add('hidden');
    if (!isAdminActive) document.getElementById('publicContainer').classList.remove('hidden');
    
    renderPublicGrid();
    renderAboutData();
    renderNewsData();
    renderContactData();
    updateAdminBtnState();
}

// ================= PUBLIC RENDERERS =================
function renderAboutData() {
    const container = document.getElementById('aboutContainer');
    if(!container) return;
    let pHTML = globalAbout.paragraphs.map(p => p.trim() ? `<p class="text-gray-700 mb-4 leading-relaxed text-sm">${p}</p>` : '').join('');
    let liHTML = globalAbout.bullets.map(li => li.trim() ? `<li>${li}</li>` : '').join('');
    
    // Nếu có upload ảnh thì render ảnh thật, không thì render Graphic CSS cũ
    let imageOrGraphic = (globalAbout.image && globalAbout.image.trim() !== '') ?
        `<img src="${globalAbout.image}" class="w-full h-full object-cover object-center shadow-lg rounded-sm border border-brand-border min-h-[300px]">` :
        `<div class="rounded-sm shadow-lg w-full aspect-video bg-[#efe8d7] relative overflow-hidden flex items-center justify-center border border-[#d8ccb8]">
            <div class="absolute inset-0 opacity-10 bg-[linear-gradient(#cda568_1px,transparent_1px),linear-gradient(90deg,#cda568_1px,transparent_1px)] bg-[size:15px_15px]"></div>
            <div class="relative flex items-center justify-center gap-2">
                <div class="w-20 h-20 rounded-full border-[3px] border-[#cda568] bg-[#1c1612] flex items-center justify-center text-[#cda568] opacity-80 transform -rotate-12 translate-x-4 shadow-md"><span class="font-serif text-2xl font-bold">寶</span></div>
                <div class="w-32 h-32 rounded-full border-[4px] border-[#cda568] bg-[#1c1612] flex items-center justify-center text-[#cda568] z-10 shadow-2xl"><span class="font-serif text-5xl font-bold">古</span></div>
                <div class="w-24 h-24 rounded-full border-[3px] border-[#cda568] bg-[#1c1612] flex items-center justify-center text-[#cda568] opacity-90 transform rotate-12 -translate-x-4 shadow-lg"><span class="font-serif text-3xl font-bold">錢</span></div>
            </div>
        </div>`;

    container.innerHTML = `
        <div>${imageOrGraphic}</div>
        <div>
            <h3 class="text-xl font-bold text-[#8c5a2b] mb-4">${globalAbout.title}</h3>
            ${pHTML}
            <ul class="list-disc pl-5 text-gray-700 text-sm space-y-2">${liHTML}</ul>
        </div>
    `;
}

function renderNewsData() {
    const container = document.getElementById('newsContainer');
    if(!container) return;
    container.innerHTML = globalNews.map(n => `
        <div class="bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-md transition group cursor-pointer flex flex-col">
            <div class="w-full aspect-video bg-[#f8f5ee] relative overflow-hidden flex items-center justify-center border-b border-brand-border">
                ${n.image ? `<img src="${n.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">` : `
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
                </div>`}
            </div>
            <div class="p-5 flex-grow text-center"><span class="text-xs text-[#d5a044] font-bold uppercase mb-2 block">${n.category}</span><h4 class="font-bold text-lg mb-2 group-hover:text-[#8c5a2b] transition">${n.title}</h4><p class="text-gray-600 text-sm line-clamp-3">${n.desc}</p></div>
        </div>`).join('');
}

function renderContactData() {
    const c = document.getElementById('contactContainer');
    if(c) c.innerHTML = `
        <li class="flex items-start gap-3"><span class="text-xl">📍</span><div><strong>Địa chỉ:</strong><br>${globalContact.address}</div></li>
        <li class="flex items-start gap-3"><span class="text-xl">📞</span><div><strong>Hotline/Zalo:</strong><br><span class="text-[#eeb135] font-bold text-lg">${globalContact.phone}</span></div></li>
        <li class="flex items-start gap-3"><span class="text-xl">✉️</span><div><strong>Email:</strong><br>${globalContact.email}</div></li>
        <li class="mt-4 italic text-xs text-gray-500">${globalContact.notes}</li>
    `;
}

function renderPublicGrid() {
    const featuredGrid = document.getElementById('featuredProductGrid');
    const allGrid = document.getElementById('allProductGrid');
    if(!featuredGrid || !allGrid) return;
    featuredGrid.innerHTML = ''; allGrid.innerHTML = '';
    
    const dataToRender = filteredProducts !== null ? filteredProducts : globalProducts;
    if (dataToRender.length === 0) {
        allGrid.innerHTML = `<p class="col-span-full text-center text-gray-500 italic py-10">Chưa có sản phẩm.</p>`; 
        return;
    }
    dataToRender.forEach((p, index) => {
        let firstImage = (p.images && p.images.length > 0 && p.images[0].trim() !== '') ? p.images[0] : '';
        const finalPrice = calculateFinalPrice(p.price, p.discount);
        const discountVal = getDiscountPercent(p.discount);
        let badgeHTML = discountVal > 0 ? `<div class="absolute top-2 left-2 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xs shadow-md z-20">-${discountVal}%</div>` : '';
        let priceHTML = discountVal > 0 ? `<div class="text-[11px] text-gray-500 line-through mb-0.5 font-sans">${p.price}</div><div class="text-xl font-bold font-sans text-red-800 leading-none">${formatCurrency(finalPrice)}</div>` : `<div class="text-xl font-bold font-sans text-red-800">${p.price}</div>`;
        
        const sym = p.symbol || '古';
        let imageHTML = firstImage !== '' 
            ? `<img src="${firstImage}" alt="${p.name}" class="w-32 h-32 object-cover rounded-full drop-shadow-lg border-2 border-brand-gold border-opacity-40 bg-white group-hover:scale-105 transition-transform duration-500">` 
            : `<svg viewBox="0 0 100 100" class="w-28 h-28 text-brand-gold opacity-80 drop-shadow-md group-hover:scale-105 transition-transform duration-500">
                <circle cx="50" cy="50" r="45" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/>
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="currentColor" stroke-width="1"/>
                <rect x="35" y="35" width="30" height="30" fill="transparent" stroke="currentColor" stroke-width="1"/>
                <text x="50" y="55" font-size="16" text-anchor="middle" fill="#1c1612" font-weight="bold">${sym}</text>
            </svg>`;

        const cardHTML = `
        <div class="bg-white border border-brand-border rounded-sm shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full relative overflow-hidden group">
            <div class="cursor-pointer flex-grow flex flex-col" onclick="window.openProductDetail('${p.id || index}')">
                <div class="bg-brand-card h-48 relative flex justify-center items-center p-6 border-b border-brand-border">
                    <div class="absolute top-0 right-0 bg-brand-dark text-brand-gold text-xs px-2 py-1 font-mono z-10">${p.years}</div>
                    ${badgeHTML} ${imageHTML}
                </div>
                <div class="p-5 flex-grow flex flex-col items-center text-center"><h4 class="font-serif font-bold text-lg mb-2 text-brand-dark h-14 line-clamp-2">${p.name}</h4><p class="text-sm text-gray-600 mb-4 line-clamp-2">${p.desc}</p><div class="dashed-line mt-auto w-full"></div></div>
            </div>
            <div class="px-5 pb-5 flex flex-col items-center gap-3">
                <div class="text-center">${priceHTML}<div class="text-xs text-gray-500 uppercase mt-1">${p.period}</div></div>
                <button onclick="event.stopPropagation(); window.addToCart('${p.id || index}')" class="w-full justify-center bg-brand-btn text-brand-gold hover:text-white px-4 py-2 text-[13px] transition-colors rounded-full shadow-sm flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> Thêm Vào Giỏ
                </button>
            </div>
        </div>`;
        allGrid.innerHTML += cardHTML;
        if(index < 4 && filteredProducts === null) featuredGrid.innerHTML += cardHTML;
    });
}

// ================= GIỎ HÀNG & ĐẶT HÀNG =================
window.addToCart = (productId) => {
    let product = globalProducts.find(p => p.id == productId || p.ma_sp == productId);
    if (!product && !isNaN(productId)) product = globalProducts[parseInt(productId)];
    if (!product) return;
    const existingItem = cart.find(item => item.id == product.id);
    if (existingItem) existingItem.quantity += 1; else cart.push({ ...product, quantity: 1 });
    saveCart(); updateCartBadge(); window.toggleCartModal(true);
    window.showToast(`Đã thêm ${product.name} vào giỏ`, 'success');
};
window.removeFromCart = (productId) => { cart = cart.filter(item => item.id != productId); saveCart(); updateCartBadge(); renderCartItems(); };
window.changeCartQuantity = (productId, delta) => {
    const item = cart.find(item => item.id == productId);
    if (item) { item.quantity += delta; if (item.quantity <= 0) window.removeFromCart(productId); else { saveCart(); renderCartItems(); } }
};
function saveCart() { localStorage.setItem('tienxu_cart', JSON.stringify(cart)); }
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if(badge) { badge.innerText = totalItems; totalItems > 0 ? badge.classList.remove('hidden') : badge.classList.add('hidden'); }
}
window.toggleCartModal = (forceOpen = false) => {
    const modal = document.getElementById('cartModal'), content = document.getElementById('cartContent');
    if (forceOpen === true || modal.classList.contains('opacity-0')) {
        renderCartItems(); modal.classList.remove('opacity-0', 'pointer-events-none'); content.classList.remove('translate-x-full'); document.body.classList.add('modal-open');
    } else {
        modal.classList.add('opacity-0', 'pointer-events-none'); content.classList.add('translate-x-full'); document.body.classList.remove('modal-open');
    }
};

function renderCartItems() {
    const container = document.getElementById('cartItemsContainer'), totalEl = document.getElementById('cartTotalPrice');
    if(cart.length === 0) {
        container.innerHTML = `<div class="text-center py-10 text-gray-500"><p>Giỏ hàng đang trống.</p></div>`;
        if(totalEl) totalEl.innerText = "0đ"; return;
    }
    let html = '', totalPrice = 0;
    cart.forEach(item => {
        const finalPrice = calculateFinalPrice(item.price, item.discount); totalPrice += finalPrice * item.quantity;
        const discountVal = getDiscountPercent(item.discount);
        let imgUrl = (item.images && item.images.length > 0) ? item.images[0] : 'https://placehold.co/100x100/efe8d7/1c1612?text=Xu';
        html += `
            <div class="flex gap-4 p-3 bg-white border border-gray-100 rounded-sm shadow-sm relative">
                <img src="${imgUrl}" class="w-20 h-20 object-cover rounded-sm border border-gray-200">
                <div class="flex-grow flex flex-col justify-center">
                    <h4 class="font-serif font-bold text-sm line-clamp-2 pr-6">${item.name}</h4>
                    ${discountVal > 0 ? `<p class="text-[10px] text-gray-500 line-through mb-0 mt-1 font-sans">${item.price}</p>` : ''}
                    <p class="text-red-700 font-bold text-sm font-sans ${discountVal > 0 ? 'mt-0' : 'mt-1'}">${formatCurrency(finalPrice)}</p>
                    <div class="flex items-center gap-3 mt-2">
                        <div class="flex items-center border border-gray-300 rounded-full overflow-hidden">
                            <button onclick="window.changeCartQuantity('${item.id}', -1)" class="px-3 py-1 bg-gray-50 hover:bg-gray-200 font-bold">-</button>
                            <span class="px-3 py-1 text-xs font-medium border-x border-gray-300 font-sans">${item.quantity}</span>
                            <button onclick="window.changeCartQuantity('${item.id}', 1)" class="px-3 py-1 bg-gray-50 hover:bg-gray-200 font-bold">+</button>
                        </div>
                    </div>
                </div>
                <button onclick="window.removeFromCart('${item.id}')" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1">✖</button>
            </div>`;
    });
    container.innerHTML = html;
    if (totalEl) { totalEl.classList.add('font-sans'); totalEl.innerText = formatCurrency(totalPrice); }
}

window.checkoutCart = () => {
    if (cart.length === 0) return;
    window.toggleCartModal(false);
    let totalPrice = cart.reduce((sum, item) => sum + (calculateFinalPrice(item.price, item.discount) * item.quantity), 0);
    let summaryNames = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');
    setTimeout(() => { window.openModal(summaryNames, formatCurrency(totalPrice), totalPrice); }, 300);
};

window.openModal = (productSummaryNames, formattedPriceString, numericTotal) => {
    currentOrderCode = generateClientCode('TXC-O-'); currentOrderTotal = numericTotal; 
    const summaryContainer = document.getElementById('orderSummaryItems');
    if (summaryContainer) {
        summaryContainer.innerHTML = cart.map(item => {
            const finalPrice = calculateFinalPrice(item.price, item.discount);
            let imgUrl = (item.images && item.images.length > 0) ? item.images[0] : 'https://placehold.co/100/efe8d7/1c1612';
            return `<div class="flex gap-3 items-center bg-white p-3 rounded-sm shadow-sm"><img src="${imgUrl}" class="w-12 h-12 object-cover rounded-sm border border-gray-200"><div class="flex-grow"><h5 class="text-xs font-bold line-clamp-1">${item.name}</h5><p class="text-[11px] text-gray-500 mt-0.5">SL: ${item.quantity} <span class="text-red-600 font-sans ml-1 font-bold">x ${formatCurrency(finalPrice)}</span></p></div></div>`;
        }).join('');
    }
    const modalPriceEl = document.getElementById('modalProductPrice');
    if (modalPriceEl) { modalPriceEl.classList.add('font-sans'); modalPriceEl.innerText = formattedPriceString; }
    document.getElementById('hiddenProductName').value = productSummaryNames;
    updateQRCode(''); document.getElementById('orderForm').reset(); window.togglePaymentInfo();
    document.getElementById('orderModal').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('modalContent').classList.remove('scale-95'); document.body.classList.add('modal-open');
}

window.closeModal = () => {
    document.getElementById('orderModal').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('modalContent').classList.add('scale-95'); document.body.classList.remove('modal-open');
}

window.togglePaymentInfo = () => {
    const method = document.querySelector('input[name="payment_method"]:checked')?.value;
    const btnText = document.querySelector('#submitOrderBtn .btn-text');
    if(method === 'BANK') { 
        document.getElementById('bankInfoArea').classList.remove('hidden'); 
        if(btnText) btnText.innerText = "TÔI ĐÃ CHUYỂN KHOẢN & ĐẶT HÀNG"; 
    } else { 
        document.getElementById('bankInfoArea').classList.add('hidden'); 
        if(btnText) btnText.innerText = "ĐẶT HÀNG NGAY"; 
    }
};

window.submitOrder = async (event) => {
    event.preventDefault();
    if(SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) return window.showToast("Bản xem trước: Chưa kết nối API!", "error");
    
    const btn = event.target.querySelector('button[type="submit"]'); 
    const spinner = btn.querySelector('.spinner-icon');
    const textSpan = btn.querySelector('.btn-text');
    const oldText = textSpan.innerText;
    
    textSpan.innerText = "ĐANG XỬ LÝ..."; 
    btn.disabled = true;
    spinner.classList.remove('hidden');

    const orderData = {
        order_code: currentOrderCode, customer_name: event.target.customer_name.value, phone: event.target.phone.value,
        email: event.target.email.value || "", address: event.target.address.value, notes: event.target.notes.value || "",
        payment_method: document.querySelector('input[name="payment_method"]:checked').value,
        items: cart.map(item => ({ id: item.id, ma_sp: item.ma_sp || "", name: item.name, quantity: item.quantity, price: item.price, discount: item.discount || "" }))
    };

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'addOrder', data: orderData }) });
        const result = await response.json();
        if(result.success) {
            window.showToast(orderData.payment_method === 'BANK' ? "Cảm ơn! Hệ thống đã ghi nhận mã thanh toán của bạn." : "Cảm ơn! Đơn hàng COD của bạn đã được ghi nhận.", "success");
            cart = []; saveCart(); updateCartBadge(); window.closeModal();
            fetchAllData(); 
        } else {
            window.showToast("Lỗi: " + result.message, "error");
        }
    } catch (error) { 
        window.showToast("Lỗi mạng, vui lòng thử lại.", "error"); 
    } finally { 
        textSpan.innerText = oldText; 
        btn.disabled = false;
        spinner.classList.add('hidden');
    }
}

// CẬP NHẬT: CHUYỂN TAB MƯỢT MÀ VÀ SỬA LỖI CSS + SEO
window.switchPage = (pageId, pushState = true) => {
    if (isAdminActive) { 
        isAdminActive = false; 
        document.getElementById('adminSection').classList.add('hidden'); 
        document.getElementById('publicContainer').classList.remove('hidden'); 
    }
    
    // Đổi URL và Title
    if (pushState) history.pushState(null, '', `?page=${pageId}`);
    const titles = {
        'home': 'Tiền Xu Cổ Việt Nam - Trang Chủ',
        'about': 'Giới Thiệu - Văn Minh Việt Sử Hội',
        'products': 'Tất Cả Sản Phẩm - Tiền Xu Cổ',
        'news': 'Tin Tức & Kiến Thức Sưu Tầm',
        'contact': 'Liên Hệ Với Chúng Tôi',
        'search': 'Kết Quả Tìm Kiếm'
    };
    document.title = titles[pageId] || 'Tiền Xu Cổ Việt Nam';

    if(pageId !== 'products' && pageId !== 'search') {
        document.getElementById('searchInput').value = '';
        if (filteredProducts !== null) {
            filteredProducts = null;
            renderPublicGrid(); 
        }
    }

    document.querySelectorAll('.nav-link').forEach(el => { 
        el.classList.remove('bg-[#d5a044]', 'text-white', 'px-3', 'rounded-full', 'hover:text-white'); 
        el.classList.add('text-[#8c5a2b]', 'hover:text-[#d5a044]'); 
    });
    const activeNav = document.getElementById(`nav-${pageId}`);
    if(activeNav) { 
        activeNav.classList.remove('text-[#8c5a2b]', 'hover:text-[#d5a044]'); 
        activeNav.classList.add('bg-[#d5a044]', 'text-white', 'px-3', 'rounded-full', 'hover:text-white'); 
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.querySelectorAll('.page-view').forEach(el => { 
        el.classList.add('hidden'); 
        el.style.opacity = '0';
    });
    
    const viewEl = document.getElementById(`view-${pageId}`);
    if(viewEl) {
        viewEl.classList.remove('hidden'); 
        viewEl.style.opacity = '0';
        viewEl.style.transform = 'translateY(15px)';
        viewEl.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
        
        setTimeout(() => {
            viewEl.style.opacity = '1';
            viewEl.style.transform = 'translateY(0)';
        }, 10);
    }
};

// ================= MODAL CHI TIẾT SẢN PHẨM =================
let currentDetailImages = [];
let currentDetailIndex = 0;
let currentDetailProduct = null;

window.openProductDetail = (id) => {
    let product = globalProducts.find(p => p.id == id);
    if(!product && !isNaN(id)) product = globalProducts[parseInt(id)]; 
    if(!product) return;
    
    currentDetailProduct = product;
    currentDetailImages = product.images && product.images.length > 0 ? product.images : [];
    currentDetailIndex = 0;
    
    document.getElementById('detailTitle').innerText = product.name;
    const finalPrice = calculateFinalPrice(product.price, product.discount);
    const discountVal = getDiscountPercent(product.discount);
    const detailPriceEl = document.getElementById('detailPrice');
    if (detailPriceEl) {
        detailPriceEl.classList.remove('font-serif'); detailPriceEl.classList.add('font-sans');
        detailPriceEl.innerHTML = discountVal > 0 ? `<span class="text-sm text-gray-500 line-through mr-2 font-sans font-normal">${product.price}</span>${formatCurrency(finalPrice)}` : product.price;
    }
    document.getElementById('detailPeriod').innerText = product.period;
    document.getElementById('detailYears').innerText = product.years;
    document.getElementById('detailDesc').innerText = product.desc;

    updateDetailImageDisplay();
    document.getElementById('detailModal').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('detailModalContent').classList.remove('scale-95');
    document.body.classList.add('modal-open');
};

function updateDetailImageDisplay() {
    const imgEl = document.getElementById('detailMainImage'), svgEl = document.getElementById('detailSvgFallback');
    const prevBtn = document.getElementById('detailPrevBtn'), nextBtn = document.getElementById('detailNextBtn');
    const counter = document.getElementById('detailImageCounter');

    if (currentDetailImages.length > 0 && currentDetailImages[0].trim() !== '') {
        imgEl.src = currentDetailImages[currentDetailIndex];
        imgEl.classList.remove('hidden'); svgEl.classList.add('hidden');
        if (currentDetailImages.length > 1) {
            prevBtn.classList.remove('hidden'); nextBtn.classList.remove('hidden'); counter.classList.remove('hidden');
            counter.innerText = `${currentDetailIndex + 1}/${currentDetailImages.length}`;
        } else { prevBtn.classList.add('hidden'); nextBtn.classList.add('hidden'); counter.classList.add('hidden'); }
    } else {
        imgEl.classList.add('hidden'); prevBtn.classList.add('hidden'); nextBtn.classList.add('hidden'); counter.classList.add('hidden');
        svgEl.classList.remove('hidden');
        svgEl.innerHTML = `<svg viewBox="0 0 100 100" class="w-2/3 h-2/3 text-brand-gold opacity-80 drop-shadow-xl"><circle cx="50" cy="50" r="45" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="35" fill="transparent" stroke="currentColor" stroke-width="1"/><rect x="35" y="35" width="30" height="30" fill="transparent" stroke="currentColor" stroke-width="1"/><text x="50" y="55" font-size="16" text-anchor="middle" fill="#1c1612" font-weight="bold">${currentDetailProduct.symbol || '古'}</text></svg>`;
    }
}

window.detailNextImage = () => { if (currentDetailImages.length <= 1) return; currentDetailIndex = (currentDetailIndex + 1) % currentDetailImages.length; updateDetailImageDisplay(); };
window.detailPrevImage = () => { if (currentDetailImages.length <= 1) return; currentDetailIndex = (currentDetailIndex - 1 + currentDetailImages.length) % currentDetailImages.length; updateDetailImageDisplay(); };
window.closeDetailModal = () => { document.getElementById('detailModal').classList.add('opacity-0', 'pointer-events-none'); document.getElementById('detailModalContent').classList.add('scale-95'); document.body.classList.remove('modal-open'); };
window.addToCartFromDetail = () => { if (currentDetailProduct) window.addToCart(currentDetailProduct.id || currentDetailProduct.ma_sp); window.closeDetailModal(); };


// ================= KHU VỰC ADMIN, AUTH & CMS =================

function updateAdminBtnState() {
    const btn = document.querySelector('footer button[onclick="window.openLoginModal()"]');
    if(!btn) return;
    if(loggedInUser) { btn.innerHTML = `🧑‍💼 Chào, ${loggedInUser.username} | Quản Trị`; btn.onclick = window.toggleAdmin; } 
    else { btn.innerHTML = `🔑 Cổng Quản Trị`; btn.onclick = window.openLoginModal; }
}

window.openLoginModal = () => {
    document.getElementById('loginModal').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('loginContent').classList.remove('scale-95');
    document.getElementById('loginUsername').value = ''; document.getElementById('loginPassword').value = '';
}
window.closeLoginModal = () => { document.getElementById('loginModal').classList.add('opacity-0', 'pointer-events-none'); document.getElementById('loginContent').classList.add('scale-95'); }

window.submitLogin = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const spinner = btn.querySelector('.spinner-icon');
    btn.disabled = true;
    spinner.classList.remove('hidden');

    const u = document.getElementById('loginUsername').value.trim(); 
    const p = document.getElementById('loginPassword').value.trim();
    
    try {
        const response = await fetch(SCRIPT_URL, { 
            method: 'POST', 
            body: JSON.stringify({ action: 'login', data: { username: u, password: p } }) 
        });
        const result = await response.json();
        if(result.success) {
            loggedInUser = result.user; 
            localStorage.setItem('tienxu_admin', JSON.stringify(result.user));
            window.showToast("Đăng nhập thành công!", "success"); 
            window.closeLoginModal(); 
            updateAdminBtnState(); 
            window.toggleAdmin();
        } else {
            window.showToast(result.message || "Sai Tên đăng nhập hoặc Mật khẩu!", "error");
        }
    } catch(err) {
        window.showToast("Lỗi kết nối máy chủ.", "error");
    } finally {
        btn.disabled = false;
        spinner.classList.add('hidden');
    }
}

window.logOutAdmin = () => {
    if(confirm("Xác nhận đăng xuất khỏi trang Quản trị?")) {
        loggedInUser = null; localStorage.removeItem('tienxu_admin'); isAdminActive = false;
        document.getElementById('adminSection').classList.add('hidden'); document.getElementById('publicContainer').classList.remove('hidden');
        updateAdminBtnState(); window.switchPage('home');
    }
}

window.toggleAdmin = () => {
    if (!loggedInUser) return window.openLoginModal();
    isAdminActive = !isAdminActive;
    if(isAdminActive) {
        document.getElementById('publicContainer').classList.add('hidden'); document.getElementById('adminSection').classList.remove('hidden');
        document.getElementById('adminWelcomeName').innerText = `Bảng Điều Khiển: ${loggedInUser.username}`;
        buildAdminInterface(); window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        document.getElementById('adminSection').classList.add('hidden'); document.getElementById('publicContainer').classList.remove('hidden');
        window.switchPage('home'); 
    }
};

function buildAdminInterface() {
    if(!loggedInUser) return;
    const perms = (loggedInUser.permissions || "").toLowerCase().split(',').map(s=>s.trim());
    const tabsContainer = document.getElementById('adminTabsContainer');
    tabsContainer.innerHTML = ''; document.querySelectorAll('.admin-view').forEach(v => v.classList.add('hidden'));

    let firstTab = null;
    if(perms.includes('orders') || perms.includes('order') || perms.includes('admin')) {
        tabsContainer.innerHTML += `<div id="tabDashboard" onclick="window.switchAdminTab('Dashboard')" class="admin-tab whitespace-nowrap">📊 Báo Cáo</div>`;
        firstTab = 'Dashboard'; renderDashboard();
    }

    Object.keys(PERMISSION_MAP).forEach(key => {
        if(perms.includes(key) || perms.includes(key.replace(/s$/,'')) || perms.includes('admin')) {
            const mapData = PERMISSION_MAP[key];
            tabsContainer.innerHTML += `<div id="tab${mapData.id}" onclick="window.switchAdminTab('${mapData.id}')" class="admin-tab whitespace-nowrap">${mapData.label}</div>`;
            if(!firstTab) firstTab = mapData.id;
            
            // Xoá search box khi render lại các tab để chuẩn bị filter
            document.getElementById('adminLocalSearch').value = '';
            adminSearchQuery = '';

            if(mapData.id === 'Products') renderAdminProducts();
            if(mapData.id === 'Orders') renderAdminOrders();
            if(mapData.id === 'Users') renderAdminUsers();
            if(mapData.id === 'Info') renderAdminInfo();
            if(mapData.id === 'News') renderAdminNews();
            if(mapData.id === 'Contact') renderAdminContact();
            if(mapData.id === 'Admin') renderAdminAdmins();
        }
    });

    if(firstTab) window.switchAdminTab(firstTab);
}

window.handleAdminSearch = () => {
    adminSearchQuery = document.getElementById('adminLocalSearch').value.toLowerCase().trim();
    const activeTab = document.querySelector('.admin-tab.active');
    if (!activeTab) return;
    const tabId = activeTab.id.replace('tab', '');
    
    if(tabId === 'Products') renderAdminProducts();
    if(tabId === 'Orders') renderAdminOrders();
    if(tabId === 'Users') renderAdminUsers();
    if(tabId === 'Info') renderAdminInfo();
    if(tabId === 'News') renderAdminNews();
    if(tabId === 'Contact') renderAdminContact();
    if(tabId === 'Admin') renderAdminAdmins();
}

window.switchAdminTab = (tabId) => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active', 'border-brand-gold', 'text-brand-dark'));
    const clickedTab = document.getElementById(`tab${tabId}`);
    if(clickedTab) clickedTab.classList.add('active', 'border-brand-gold', 'text-brand-dark');
    
    document.querySelectorAll('.admin-view').forEach(v => {
        v.classList.add('hidden');
        v.style.opacity = '0';
    });
    
    // Reset search khi đổi Tab
    document.getElementById('adminLocalSearch').value = '';
    adminSearchQuery = '';
    
    // Call render specific to make sure data is fresh without filter
    if(tabId === 'Products') renderAdminProducts();
    if(tabId === 'Orders') renderAdminOrders();
    if(tabId === 'Users') renderAdminUsers();
    if(tabId === 'Info') renderAdminInfo();
    if(tabId === 'News') renderAdminNews();
    if(tabId === 'Contact') renderAdminContact();
    if(tabId === 'Admin') renderAdminAdmins();

    const targetView = document.getElementById(`view${tabId}`);
    if(targetView) { 
        targetView.classList.remove('hidden'); 
        if(tabId === 'Products') targetView.classList.add('grid'); 
        
        targetView.style.opacity = '0';
        targetView.style.transform = 'translateY(10px)';
        targetView.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        
        setTimeout(() => {
            targetView.style.opacity = '1';
            targetView.style.transform = 'translateY(0)';
        }, 10);
    }
}

function renderDashboard() {
    let totalRev = 0; let revByDate = {};
    globalOrders.forEach(o => {
        let rev = getNumericPrice(o.total); totalRev += rev;
        let dateOnly = (o.date || "").split(' ')[0] || "Unknown";
        if(!revByDate[dateOnly]) revByDate[dateOnly] = 0;
        revByDate[dateOnly] += rev;
    });

    document.getElementById('dashRevenue').innerText = formatCurrency(totalRev);
    document.getElementById('dashTotalOrders').innerText = globalOrders.length;
    document.getElementById('dashTotalProducts').innerText = globalProducts.length;

    const sortedDates = Object.keys(revByDate).sort(); const dataValues = sortedDates.map(d => revByDate[d]);
    const ctx = document.getElementById('revenueChart'); if(!ctx) return;
    if(revenueChartInstance) revenueChartInstance.destroy();
    
    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: sortedDates.length > 0 ? sortedDates : ['Chưa có dữ liệu'], datasets: [{ label: 'Doanh thu (VNĐ)', data: dataValues.length > 0 ? dataValues : [0], borderColor: '#cda568', backgroundColor: 'rgba(205, 165, 104, 0.2)', borderWidth: 2, fill: true, tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
}

window.deleteGenericData = async (sheetName, id) => {
    const isFullControl = (loggedInUser.type || "").toLowerCase().includes("xóa") || (loggedInUser.type || "").toLowerCase().includes("admin");
    if(!isFullControl) return window.showToast("Bạn không có quyền Xóa!", "error");
    if(!confirm(`Xác nhận xóa dữ liệu khỏi bảng ${sheetName}?`)) return;
    
    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'deleteData', data: { sheetName: sheetName, id: id } }) });
        const res = await response.json();
        if(res.success) { window.showToast("Đã xóa dữ liệu thành công!", "success"); fetchAllData(); } 
        else window.showToast("Lỗi: " + res.message, "error");
    } catch(e) { window.showToast("Lỗi mạng.", "error"); }
}

// CÁC HÀM RENDER RIÊNG BIỆT TỐI ƯU CỘT VÀ TÌM KIẾM CỤC BỘ
function renderAdminUsers() {
    const view = document.getElementById('viewUsers');
    if(!view) return;
    const q = adminSearchQuery;
    const filtered = globalUsers.filter(u => !q || (u.name||"").toLowerCase().includes(q) || (u.phone||"").toLowerCase().includes(q) || (u.email||"").toLowerCase().includes(q));
    
    let html = `<div class="overflow-x-auto border border-brand-border rounded custom-scrollbar"><table class="w-full text-left text-sm"><thead class="bg-brand-card text-gray-700"><tr><th class="px-4 py-3">Mã KH</th><th class="px-4 py-3">Tên Khách Hàng</th><th class="px-4 py-3">SĐT</th><th class="px-4 py-3">Email</th><th class="px-4 py-3">Địa chỉ</th><th class="px-4 py-3 text-center">Hành động</th></tr></thead><tbody class="divide-y divide-gray-200">`;
    if(filtered.length === 0) html += `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>`;
    filtered.forEach(u => {
        html += `<tr class="hover:bg-gray-50"><td class="px-4 py-3 text-xs font-mono">${u.ma_kh}</td><td class="px-4 py-3 font-bold">${u.name}</td><td class="px-4 py-3">${u.phone}</td><td class="px-4 py-3 text-gray-500">${u.email}</td><td class="px-4 py-3 truncate max-w-[200px] text-xs">${u.address}</td>
        <td class="px-4 py-3 text-center whitespace-nowrap">
            <button onclick="window.openUniversalEdit('Users', '${u.id}')" class="text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs mr-1 font-semibold border border-blue-200">Sửa</button>
            <button onclick="window.deleteGenericData('Users', '${u.id}')" class="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-semibold border border-red-200">Xóa</button>
        </td></tr>`;
    });
    view.innerHTML = `<div class="p-6">` + html + `</tbody></table></div></div>`;
}

function renderAdminNews() {
    const view = document.getElementById('viewNews');
    if(!view) return;
    const q = adminSearchQuery;
    const filtered = globalAllNews.filter(n => !q || (n.title||"").toLowerCase().includes(q) || (n.category||"").toLowerCase().includes(q));
    
    let html = `<div class="overflow-x-auto border border-brand-border rounded custom-scrollbar"><table class="w-full text-left text-sm"><thead class="bg-brand-card text-gray-700"><tr><th class="px-4 py-3 w-16">ID</th><th class="px-4 py-3">Phân loại</th><th class="px-4 py-3">Tiêu đề bài viết</th><th class="px-4 py-3">Ảnh</th><th class="px-4 py-3 text-center">Hành động</th></tr></thead><tbody class="divide-y divide-gray-200">`;
    if(filtered.length === 0) html += `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>`;
    filtered.forEach(n => {
        let imgHtml = n.image ? `<img src="${n.image}" class="w-10 h-10 object-cover rounded shadow-sm border border-gray-300">` : `<span class="text-xs text-gray-400 italic">Không có</span>`;
        html += `<tr class="hover:bg-gray-50"><td class="px-4 py-3">${n.id}</td><td class="px-4 py-3 text-xs bg-gray-100 rounded px-2">${n.category}</td><td class="px-4 py-3 font-bold truncate max-w-[300px]">${n.title}</td><td class="px-4 py-3">${imgHtml}</td>
        <td class="px-4 py-3 text-center whitespace-nowrap">
            <button onclick="window.openUniversalEdit('News', '${n.id}')" class="text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs mr-1 font-semibold border border-blue-200">Cập Nhật</button>
            <button onclick="window.deleteGenericData('News', '${n.id}')" class="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-semibold border border-red-200">Xóa</button>
        </td></tr>`;
    });
    view.innerHTML = `<div class="p-6">` + html + `</tbody></table></div></div>`;
}

function renderAdminContact() {
    const view = document.getElementById('viewContact');
    if(!view) return;
    const q = adminSearchQuery;
    const filtered = globalAllContacts.filter(c => !q || (c.key||"").toLowerCase().includes(q) || (c.value||"").toLowerCase().includes(q));
    
    let html = `<div class="overflow-x-auto border border-brand-border rounded custom-scrollbar"><table class="w-full text-left text-sm"><thead class="bg-brand-card text-gray-700"><tr><th class="px-4 py-3 w-40">Mục Thông Tin</th><th class="px-4 py-3">Nội Dung</th><th class="px-4 py-3 text-center w-32">Hành động</th></tr></thead><tbody class="divide-y divide-gray-200">`;
    if(filtered.length === 0) html += `<tr><td colspan="3" class="px-4 py-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>`;
    filtered.forEach(c => {
        html += `<tr class="hover:bg-gray-50"><td class="px-4 py-3 font-bold">${c.key}</td><td class="px-4 py-3 text-gray-700">${c.value}</td>
        <td class="px-4 py-3 text-center whitespace-nowrap">
            <button onclick="window.openUniversalEdit('Contact', '${c.id}')" class="text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs mr-1 font-semibold border border-blue-200">Cập Nhật</button>
            <button onclick="window.deleteGenericData('Contact', '${c.id}')" class="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-semibold border border-red-200">Xóa</button>
        </td></tr>`;
    });
    view.innerHTML = `<div class="p-6">` + html + `</tbody></table></div></div>`;
}

function renderAdminAdmins() {
    const view = document.getElementById('viewAdmin');
    if(!view) return;
    const q = adminSearchQuery;
    const filtered = globalAdmins.filter(a => !q || (a.username||"").toLowerCase().includes(q));
    
    let html = `<div class="overflow-x-auto border border-brand-border rounded custom-scrollbar"><table class="w-full text-left text-sm"><thead class="bg-brand-card text-gray-700"><tr><th class="px-4 py-3">Tên Đăng Nhập</th><th class="px-4 py-3 text-center w-32">Hành động</th></tr></thead><tbody class="divide-y divide-gray-200">`;
    if(filtered.length === 0) html += `<tr><td colspan="2" class="px-4 py-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>`;
    filtered.forEach(a => {
        html += `<tr class="hover:bg-gray-50"><td class="px-4 py-3 font-bold flex items-center gap-2"><div class="w-8 h-8 rounded-full bg-brand-dark text-brand-gold flex items-center justify-center font-bold text-xs">A</div> ${a.username}</td>
        <td class="px-4 py-3 text-center whitespace-nowrap">
            <button onclick="window.openUniversalEdit('Admin', '${a.id}')" class="text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs mr-1 font-semibold border border-blue-200">Sửa</button>
            <button onclick="window.deleteGenericData('Admin', '${a.id}')" class="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-semibold border border-red-200">Xóa</button>
        </td></tr>`;
    });
    view.innerHTML = `<div class="p-6">` + html + `</tbody></table></div></div>`;
}

function renderAdminInfo() {
    const view = document.getElementById('viewInfo');
    if(!view) return;
    const q = adminSearchQuery;
    const i = globalAbout;
    if(q && !((i.title||"").toLowerCase().includes(q))) {
        view.innerHTML = `<div class="p-6 text-center text-gray-500">Không có kết quả.</div>`; return;
    }
    
    let imgHtml = i.image ? `<img src="${i.image}" class="w-16 h-16 object-cover rounded shadow-sm border border-gray-300">` : `<span class="text-xs text-gray-400 italic">Không có</span>`;
    let html = `<div class="overflow-x-auto border border-brand-border rounded custom-scrollbar"><table class="w-full text-left text-sm min-w-[800px]"><thead class="bg-brand-card text-gray-700"><tr><th class="px-4 py-3 w-40">Tiêu đề</th><th class="px-4 py-3">Đoạn Văn (Nội dung)</th><th class="px-4 py-3">Dấu đầu dòng (Tính năng)</th><th class="px-4 py-3">Ảnh</th><th class="px-4 py-3 text-center w-24">Hành động</th></tr></thead><tbody class="divide-y divide-gray-200">`;
    html += `<tr class="hover:bg-gray-50"><td class="px-4 py-3 font-bold align-top">${i.title}</td>
    <td class="px-4 py-3 align-top whitespace-pre-wrap text-xs">${i.paragraphs.join('\n\n')}</td>
    <td class="px-4 py-3 align-top whitespace-pre-wrap text-xs">${i.bullets.join('\n')}</td>
    <td class="px-4 py-3 align-top">${imgHtml}</td>
    <td class="px-4 py-3 text-center align-top whitespace-nowrap">
        <button onclick="window.openUniversalEdit('Info', '1')" class="text-blue-500 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded text-xs font-semibold w-full shadow-sm border border-blue-200">Sửa</button>
    </td></tr>`;
    view.innerHTML = `<div class="p-6">` + html + `</tbody></table></div></div>`;
}

// ---------------- UNIVERSAL EDIT MODAL ----------------
let currentEditSheet = '';
let currentEditId = '';

window.openUniversalEdit = (sheetName, id) => {
    currentEditSheet = sheetName;
    currentEditId = id;
    let html = '';
    let title = "Cập Nhật";

    if (sheetName === 'Users') {
        const u = globalUsers.find(x => x.id == id); title = `Khách Hàng: ${u.name}`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Tên Khách Hàng</label><input type="text" id="ue_name" value="${u.name}" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Điện Thoại</label><input type="text" id="ue_phone" value="${u.phone}" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Email</label><input type="email" id="ue_email" value="${u.email}" class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Địa Chỉ</label><textarea id="ue_address" rows="2" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm resize-none">${u.address}</textarea></div>`;
    } else if (sheetName === 'Info') {
        const i = globalAbout; title = `Sửa Giới Thiệu`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Tiêu Đề</label><input type="text" id="ue_title" value="${i.title}" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Đoạn Văn (Xuống dòng để tạo đoạn mới)</label><textarea id="ue_paras" rows="6" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm whitespace-pre-wrap">${i.paragraphs.join('\n')}</textarea></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Dấu Đầu Dòng (Gõ xuống dòng để chia nhiều ý tính năng)</label><textarea id="ue_bullets" rows="4" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm whitespace-pre-wrap">${i.bullets.join('\n')}</textarea></div>`;
        html += `<div><label class="block text-xs font-bold text-gray-600 mb-1">Ảnh (Bỏ trống nếu giữ nguyên)</label><input type="file" id="ue_image" accept="image/*" class="w-full px-3 py-2 border border-gray-300 bg-white focus:outline-none rounded text-sm"></div>`;
    } else if (sheetName === 'News') {
        const n = globalAllNews.find(x => x.id == id); title = `Cập Nhật Tin Tức`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Phân Loại</label><input type="text" id="ue_category" value="${n.category}" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Tiêu Đề</label><input type="text" id="ue_title" value="${n.title}" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Nội dung / Mô tả</label><textarea id="ue_desc" rows="5" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm">${n.desc}</textarea></div>`;
        html += `<div><label class="block text-xs font-bold text-gray-600 mb-1">Ảnh (Bỏ trống nếu giữ nguyên)</label><input type="file" id="ue_image" accept="image/*" class="w-full px-3 py-2 border border-gray-300 bg-white focus:outline-none rounded text-sm"></div>`;
    } else if (sheetName === 'Contact') {
        const c = globalAllContacts.find(x => x.id == id); title = `Cập Nhật Liên Hệ`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Mục Thông Tin</label><input type="text" value="${c.key}" readonly class="border border-gray-200 bg-gray-50 rounded p-2 w-full text-sm text-gray-500 cursor-not-allowed"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Nội Dung</label><textarea id="ue_val" rows="3" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm resize-none">${c.value}</textarea></div>`;
    } else if (sheetName === 'Admin') {
        const a = globalAdmins.find(x => x.id == id); title = `Sửa Quản Trị Viên`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Tên Đăng Nhập Mới</label><input type="text" id="ue_username" value="${a.username}" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm font-bold text-brand-dark"></div>`;
        html += `<div class="bg-yellow-50 border border-yellow-200 p-3 rounded"><p class="text-[11px] text-yellow-800 leading-relaxed font-medium">⚠️ LƯU Ý HỆ THỐNG:<br>Mật khẩu sẽ tự động được làm mới và lưu với công thức <strong>Ten@123</strong><br>Ví dụ: Tên đăng nhập là <span class="font-mono bg-yellow-200 px-1">Triet Nguyen</span> -> Mật khẩu: <span class="font-mono bg-yellow-200 px-1">Trietnguyen@123</span></p></div>`;
    }

    document.getElementById('adminUniversalEditTitle').innerText = title;
    document.getElementById('adminUniversalEditFields').innerHTML = html;
    document.getElementById('adminUniversalEditModal').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('adminUniversalEditContent').classList.remove('scale-95');
}

window.closeUniversalEdit = () => {
    document.getElementById('adminUniversalEditModal').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('adminUniversalEditContent').classList.add('scale-95');
}

window.submitUniversalEdit = async (e) => {
    e.preventDefault();
    const isFullControl = (loggedInUser.type || "").toLowerCase().includes("sửa") || (loggedInUser.type || "").toLowerCase().includes("admin");
    if(!isFullControl) return window.showToast("Bạn không có quyền Cập nhật!", "error");

    const btn = e.target.querySelector('button[type="submit"]'); 
    const spinner = btn.querySelector('.spinner-icon');
    const textSpan = btn.querySelectorAll('span')[1];
    const oldText = textSpan.innerText;
    
    textSpan.innerText = "ĐANG LƯU DỮ LIỆU..."; btn.disabled = true; spinner.classList.remove('hidden');

    const updates = {};
    if (currentEditSheet === 'Users') {
        updates[3] = document.getElementById('ue_name').value;
        updates[4] = document.getElementById('ue_address').value;
        updates[5] = document.getElementById('ue_phone').value;
        updates[6] = document.getElementById('ue_email').value;
    } else if (currentEditSheet === 'Info') {
        updates[1] = document.getElementById('ue_title').value;
        updates[2] = document.getElementById('ue_paras').value;
        updates[3] = document.getElementById('ue_bullets').value;
    } else if (currentEditSheet === 'News') {
        updates[1] = document.getElementById('ue_category').value;
        updates[2] = document.getElementById('ue_title').value;
        updates[3] = document.getElementById('ue_desc').value;
    } else if (currentEditSheet === 'Contact') {
        updates[2] = document.getElementById('ue_val').value; 
    } else if (currentEditSheet === 'Admin') {
        updates[2] = document.getElementById('ue_username').value; 
    }

    // Xử lý nén ảnh đính kèm (cho Info và News)
    let base64Img = null;
    const fileInput = document.getElementById('ue_image');
    if (fileInput && fileInput.files.length > 0) {
        base64Img = await compressImage(fileInput.files[0]);
    }

    try {
        const data = { sheetName: currentEditSheet, id: currentEditId, updates: updates, image: base64Img };
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'editGenericData', data: data }) });
        const result = await response.json();
        if(result.success) { 
            window.showToast("Cập nhật dữ liệu thành công!", "success"); 
            window.closeUniversalEdit();
            fetchAllData(); 
        } else window.showToast("Lỗi Server: " + result.message, "error");
    } catch (error) { 
        window.showToast("Lỗi mạng.", "error"); 
    } finally { 
        textSpan.innerText = oldText; btn.disabled = false; spinner.classList.add('hidden');
    }
}


function renderAdminProducts() {
    const tbody = document.getElementById('adminTableBody');
    if(!tbody) return;
    
    const q = adminSearchQuery;
    const filtered = globalProducts.filter(p => !q || (p.name||"").toLowerCase().includes(q) || (p.period||"").toLowerCase().includes(q));
    
    document.getElementById('productCountBadge').innerText = filtered.length;
    tbody.innerHTML = '';
    if(filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>`; return; }
    
    filtered.forEach((p) => {
        let firstImage = (p.images && p.images.length > 0 && p.images[0].trim() !== '') ? p.images[0] : '';
        let thumbHTML = firstImage !== '' ? `<img src="${firstImage}" class="w-10 h-10 rounded-full object-cover border border-gray-300">` : `<div class="w-10 h-10 rounded-full bg-brand-bg text-brand-gold flex items-center justify-center">${p.symbol || '古'}</div>`;
        
        // TÍNH TOÁN TỒN KHO THỰC TẾ
        let soldQty = 0;
        globalOrders.forEach(o => {
            if(o.ma_sp === p.ma_sp) soldQty += parseInt(o.qty) || 0;
        });
        let initialQty = parseInt(p.qty) || 0;
        let stock = initialQty - soldQty;
        let stockColor = stock <= 0 ? 'text-red-600 font-bold' : (stock < 10 ? 'text-orange-600 font-bold' : 'text-blue-700 font-bold');

        tbody.innerHTML += `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3">${thumbHTML}</td>
            <td class="px-4 py-3 font-medium text-brand-dark">${p.name}</td>
            <td class="px-4 py-3 text-red-700 font-bold font-sans">${p.price}</td>
            <td class="px-4 py-3 text-center ${stockColor} font-sans text-lg">${stock}</td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
                <button onclick="window.openEditProduct('${p.id}')" class="text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs mr-1 font-semibold border border-blue-200">Sửa</button>
                <button onclick="window.deleteGenericData('Products', '${p.id}')" class="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-semibold border border-red-200">Xóa</button>
            </td>
        </tr>`;
    });
}

// CẬP NHẬT: Nén ảnh Canvas
const compressImage = (file, maxWidth = 800, quality = 0.7) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width, height = img.height;
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL(file.type, quality));
        };
    };
    reader.onerror = error => reject(error);
});

window.handleAddProduct = async (e) => {
    e.preventDefault();
    const isFullControl = (loggedInUser.type || "").toLowerCase().includes("thêm") || (loggedInUser.type || "").toLowerCase().includes("admin");
    if(!isFullControl) return window.showToast("Bạn không có quyền Thêm mới!", "error");
    if(SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) return window.showToast("Chưa điền SCRIPT_URL!", "error");

    const btn = e.target.querySelector('button'); 
    const spinner = btn.querySelector('.spinner-icon');
    const textSpan = btn.querySelectorAll('span')[1];
    const oldText = textSpan.innerText;
    
    textSpan.innerText = "ĐANG TẢI LÊN..."; 
    btn.disabled = true;
    spinner.classList.remove('hidden');

    try {
        const fileInput = document.getElementById('addImages'); let base64Images = [];
        if (fileInput.files.length > 0) { 
            for (let i = 0; i < fileInput.files.length; i++) {
                base64Images.push(await compressImage(fileInput.files[i])); 
            }
        }

        const productData = {
            name: document.getElementById('addName').value, 
            price: document.getElementById('addPrice').value, 
            qty: document.getElementById('addQty').value, 
            years: document.getElementById('addYears').value,
            period: document.getElementById('addPeriod').value, 
            symbol: document.getElementById('addSymbol').value || '古', 
            discount: document.getElementById('addDiscount').value || '', 
            desc: document.getElementById('addDesc').value, 
            images: base64Images
        };
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'addProduct', data: productData }) });
        const result = await response.json();
        if(result.success) { 
            e.target.reset(); 
            window.showToast("Đã thêm sản phẩm thành công!", "success"); 
            fetchAllData(); 
        } else window.showToast("Lỗi Server: " + result.message, "error");
    } catch (error) { 
        window.showToast("Lỗi mạng: " + error.message, "error"); 
    } finally { 
        textSpan.innerText = oldText; 
        btn.disabled = false; 
        spinner.classList.add('hidden');
    }
};

window.openEditProduct = (id) => {
    let product = globalProducts.find(p => p.id == id);
    if(!product) return;

    document.getElementById('editProductId').value = product.id;
    document.getElementById('editName').value = product.name;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editQty').value = product.qty || '';
    document.getElementById('editYears').value = product.years;
    document.getElementById('editPeriod').value = product.period;
    document.getElementById('editSymbol').value = product.symbol;
    document.getElementById('editDiscount').value = getDiscountPercent(product.discount) || '';
    document.getElementById('editDesc').value = product.desc;
    document.getElementById('editImages').value = ''; 

    document.getElementById('editProductModal').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('editProductContent').classList.remove('scale-95');
}

window.closeEditModal = () => {
    document.getElementById('editProductModal').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('editProductContent').classList.add('scale-95');
}

window.submitEditProduct = async (e) => {
    e.preventDefault();
    const isFullControl = (loggedInUser.type || "").toLowerCase().includes("sửa") || (loggedInUser.type || "").toLowerCase().includes("admin");
    if(!isFullControl) return window.showToast("Bạn không có quyền Cập nhật!", "error");

    const btn = e.target.querySelector('button'); 
    const spinner = btn.querySelector('.spinner-icon');
    const textSpan = btn.querySelectorAll('span')[1];
    const oldText = textSpan.innerText;
    
    textSpan.innerText = "ĐANG CẬP NHẬT..."; 
    btn.disabled = true;
    spinner.classList.remove('hidden');

    try {
        const fileInput = document.getElementById('editImages'); 
        let base64Images = [];
        if (fileInput.files.length > 0) { 
            for (let i = 0; i < fileInput.files.length; i++) {
                base64Images.push(await compressImage(fileInput.files[i])); 
            }
        }

        const productData = {
            id: document.getElementById('editProductId').value,
            name: document.getElementById('editName').value, 
            price: document.getElementById('editPrice').value, 
            qty: document.getElementById('editQty').value, 
            years: document.getElementById('editYears').value, 
            period: document.getElementById('editPeriod').value, 
            symbol: document.getElementById('editSymbol').value || '古', 
            discount: document.getElementById('editDiscount').value || '', 
            desc: document.getElementById('editDesc').value, 
            images: base64Images 
        };

        const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'editProduct', data: productData }) });
        const result = await response.json();
        if(result.success) { 
            window.showToast("Đã cập nhật sản phẩm!", "success"); 
            window.closeEditModal();
            fetchAllData(); 
        } else window.showToast("Lỗi Server: " + result.message, "error");
    } catch (error) { 
        window.showToast("Lỗi mạng: " + error.message, "error"); 
    } finally { 
        textSpan.innerText = oldText; 
        btn.disabled = false; 
        spinner.classList.add('hidden');
    }
}

// CẬP NHẬT: Trạng thái đơn hàng Dropdown
window.updateOrderStatus = async (id) => {
    const isFullControl = (loggedInUser.type || "").toLowerCase().includes("sửa") || (loggedInUser.type || "").toLowerCase().includes("admin");
    if(!isFullControl) return window.showToast("Bạn không có quyền Cập nhật trạng thái!", "error");
    
    const newStatus = document.getElementById(`status_${id}`).value;
    try {
        const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'updateOrderStatus', data: { id: id, status: newStatus } }) });
        const result = await res.json();
        if(result.success) {
            window.showToast("Cập nhật trạng thái đơn hàng thành công!", "success");
            fetchAllData(); 
        } else window.showToast("Lỗi Server: " + result.message, "error");
    } catch(e) { window.showToast("Lỗi mạng.", "error"); }
};

function renderAdminOrders() {
    const view = document.getElementById('viewOrders');
    if(!view) return;
    
    const q = adminSearchQuery;
    const filtered = globalOrders.filter(o => !q || (o.order_code||"").toLowerCase().includes(q) || (o.customer||"").toLowerCase().includes(q) || (o.phone||"").toLowerCase().includes(q));

    let html = `
    <div class="overflow-x-auto border border-brand-border custom-scrollbar"><table class="w-full text-left text-sm min-w-[700px]">
        <thead class="bg-brand-card text-gray-700 border-b border-brand-border">
            <tr><th class="px-4 py-3">Mã Đơn / Thời gian</th><th class="px-4 py-3">Khách & SĐT</th><th class="px-4 py-3">Sản phẩm</th><th class="px-4 py-3 font-sans">Tổng Tiền</th><th class="px-4 py-3 text-center">Trạng thái</th></tr>
        </thead><tbody class="divide-y divide-gray-200">
    `;
    if(filtered.length === 0) { html += `<tr><td colspan=\"5\" class=\"px-4 py-8 text-center text-gray-500\">Chưa có đơn hàng</td></tr>`; }
    filtered.forEach(o => {
        html += `
        <tr class="hover:bg-gray-50 transition">
            <td class="px-4 py-3"><strong class="block">${o.order_code}</strong><span class="text-xs text-gray-500">${o.date}</span></td>
            <td class="px-4 py-3"><strong>${o.customer}</strong><br><span class="text-xs font-sans text-gray-600">${o.phone}</span></td>
            <td class="px-4 py-3 text-xs">SL: ${o.qty} x ${o.product}</td>
            <td class="px-4 py-3 font-bold text-red-700 font-sans">${o.total}</td>
            <td class="px-4 py-3 text-center flex flex-col sm:flex-row gap-2 justify-center items-center h-full">
                <select id="status_${o.id}" class="text-[11px] border border-gray-300 rounded p-1 outline-none focus:border-brand-gold bg-white">
                    <option value="Chưa Giao Hàng" ${o.status === 'Chưa Giao Hàng' ? 'selected' : ''}>Chưa Giao Hàng</option>
                    <option value="Đang Giao Hàng" ${o.status === 'Đang Giao Hàng' ? 'selected' : ''}>Đang Giao Hàng</option>
                    <option value="Đã Giao Hàng" ${o.status === 'Đã Giao Hàng' ? 'selected' : ''}>Đã Giao Hàng</option>
                </select>
                <div class="flex gap-1">
                    <button onclick="window.updateOrderStatus('${o.id}')" class="text-blue-500 hover:text-white hover:bg-blue-500 border border-blue-500 px-2 py-1 rounded text-xs transition font-semibold whitespace-nowrap">Cập nhật</button>
                    <button onclick="window.deleteGenericData('Orders', '${o.id}')" class="text-red-500 hover:text-white hover:bg-red-500 border border-red-500 px-2 py-1 rounded text-xs transition font-semibold whitespace-nowrap">Xóa</button>
                </div>
            </td>
        </tr>`;
    });
    html += `</tbody></table></div>`;
    view.innerHTML = `<div class="p-6">` + html + `</div>`;
}