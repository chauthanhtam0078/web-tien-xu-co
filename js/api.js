// ============================================================================
// 📁 MODULE 3: API SERVICES (api.js)
// Giao tiếp với Google Apps Script, chuẩn hóa dữ liệu vào biến Global
// ============================================================================

// --- 1. CƠ CHẾ RETRY (Chống nghẽn mạng Google) ---
window.fetchWithRetry = async function(url, options = {}, retries = 3, backoff = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, backoff * (i + 1)));
        }
    }
};

// --- 2. HÀM XÁC THỰC TOKEN BẢO MẬT ---
window.verifyAdminSession = async function(token) {
    if (!token) return false;
    try {
        // Dùng fetch thông thường hoặc fetchWithRetry đều được
        const response = await fetch(SCRIPT_URL + '?action=verifyToken&token=' + token);
        const data = await response.json();
        return data.isValid === true;
    } catch (e) {
        return false;
    }
};

// --- 3. HÀM HÓA GIẢI LINK GOOGLE DRIVE (Bypass hoàn toàn lỗi ẩn danh / chặn Cookie) ---
window.fixDriveUrl = function(urlStr) {
    if (!urlStr) return urlStr;
    const cleanUrl = urlStr.split('#')[0];
    const match = cleanUrl.match(/id=([a-zA-Z0-9_-]+)/) || cleanUrl.match(/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        // Trả về định dạng thumbnail chống nghẽn
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
    return urlStr;
};

// --- 4. ÁP DỤNG DỮ LIỆU VÀO GLOBAL STATE ---
window.applyDataToGlobals = function(data) {
    if (data.products) {
        window.globalProducts = data.products.map(p => {
            p.priceNumeric = typeof window.getNumericPrice === 'function' ? window.getNumericPrice(p.price) : 0;
            return p;
        }).sort((a, b) => b.timestamp - a.timestamp);
    }
    
    if (data.news) {
        window.globalNews = [...data.news].sort((a,b) => b.id - a.id).slice(0, 4);
        window.globalAllNews = data.news;
    }
    
    if (data.about) window.globalAbout = data.about;
    if (data.allContacts) window.globalAllContacts = data.allContacts;
    if (data.contact && data.contact.address) window.globalContact = data.contact;
    if (data.admins) window.globalAdmins = data.admins;
    
    if (data.vouchers) window.globalVouchers = data.vouchers; 
    else window.globalVouchers = [];
    
    if (data.visitors) window.globalVisitors = data.visitors;
    
    if (data.users) {
        window.globalUsers = data.users.map(u => ({ ...u, phone: String(u.phone).padStart(10, '0') }));
    }
    
    if (data.orders) {
        window.globalOrders = data.orders.map(o => ({
            ...o,
            phone: String(o.phone).padStart(10, '0'),
            rawDate: o.date
        })).sort((a, b) => {
            let da = typeof window.parseDate === 'function' ? window.parseDate(a.rawDate) : 0;
            let db = typeof window.parseDate === 'function' ? window.parseDate(b.rawDate) : 0;
            return db - da;
        });
    }

    // ĐỒNG BỘ NGƯỢC LẠI DATA CHO CÁC FILE CŨ (GIẢI CỨU TÍNH NĂNG TRUY CẬP BIẾN)
    try { globalProducts = window.globalProducts; } catch(e){}
    try { globalOrders = window.globalOrders; } catch(e){}
    try { globalNews = window.globalNews; } catch(e){}
    try { globalAllNews = window.globalAllNews; } catch(e){}
    try { globalAbout = window.globalAbout; } catch(e){}
    try { globalContact = window.globalContact; } catch(e){}
    try { globalAllContacts = window.globalAllContacts; } catch(e){}
    try { globalUsers = window.globalUsers; } catch(e){}
    try { globalAdmins = window.globalAdmins; } catch(e){}
};

// --- 5. TẢI DỮ LIỆU TỪ SERVER VÀ RENDER ---
window.fetchAllData = async function() {
    // Kiểm tra cấu hình API
    if (typeof SCRIPT_URL === 'undefined' || SCRIPT_URL.includes('AKfycbyc9b2iKk') || SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) {
        console.warn("Chưa cấu hình SCRIPT_URL");
        return;
    }

    const cached = localStorage.getItem('tienxu_cached_webdata');
    if (cached) {
        try {
            window.applyDataToGlobals(JSON.parse(cached));
            window.finishLoading();
        } catch(e) {
            console.log("Dữ liệu đệm lỗi, tiến hành tải mới hoàn toàn.");
        }
    } else {
        let loadingEl = document.getElementById('loadingIndicator');
        let publicEl = document.getElementById('publicContainer');
        if(loadingEl) loadingEl.classList.remove('hidden');
        if(publicEl) publicEl.classList.add('hidden');
    }

    try {
        const response = await window.fetchWithRetry(SCRIPT_URL + '?action=getAllData');
        const data = await response.json();
        
        localStorage.setItem('tienxu_cached_webdata', JSON.stringify(data));
        window.applyDataToGlobals(data);
        
        window.finishLoading();

    } catch (error) {
        console.error("Lỗi fetch data từ server:", error);
    }
};

// --- 6. HÀM KẾT THÚC TẢI VÀ RENDER GIAO DIỆN ---
window.finishLoading = function() {
    let loadingEl = document.getElementById('loadingIndicator');
    let publicEl = document.getElementById('publicContainer');
    
    if(loadingEl) loadingEl.classList.add('hidden');
    
    // Nếu không phải trang admin đang mở thì hiện public content
    if(publicEl && !(typeof isAdminActive !== 'undefined' && isAdminActive)) {
        publicEl.classList.remove('hidden');
    }

    if (typeof window.renderPublicGrid === 'function') window.renderPublicGrid(); 
    if (typeof window.renderAboutData === 'function') window.renderAboutData();
    if (typeof window.renderNewsData === 'function') window.renderNewsData(); 
    if (typeof window.renderContactData === 'function') window.renderContactData();
    if (typeof window.updateDynamicFooter === 'function') window.updateDynamicFooter();
    if (typeof window.buildAdminInterface === 'function' && typeof isAdminActive !== 'undefined' && isAdminActive) {
        window.buildAdminInterface();
    }
    if (typeof window.updateAdminBtnState === 'function') window.updateAdminBtnState();
};

// --- 7. HÀM GHI NHẬN LƯỢT TRUY CẬP VÀO SERVER ---
window.recordVisitorOnServer = async function() {
    if (sessionStorage.getItem('tienxu_server_visited')) return;
    try {
        const response = await window.fetchWithRetry(SCRIPT_URL, { 
            method: 'POST', 
            redirect: 'follow', 
            body: JSON.stringify({ action: 'recordVisit' }) 
        });
        const result = await response.json();
        if(result.success && result.visitors) {
            window.globalVisitors = result.visitors;
            if(typeof window.updateDynamicFooter === 'function') window.updateDynamicFooter();
            sessionStorage.setItem('tienxu_server_visited', 'true');
        }
    } catch(e) { 
        console.log('Lỗi ghi nhận truy cập trên server.'); 
    }
};