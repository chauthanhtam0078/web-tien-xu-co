// ============================================================================
// 📁 MODULE 3: API & DATA FETCHING (api.js)
// Giao tiếp với Google Apps Script, chuẩn hóa dữ liệu vào biến Global
// ============================================================================

// --- 1. CƠ CHẾ RETRY (Chống nghẽn mạng Google) ---
async function fetchWithRetry(url, options = {}, retries = 3, backoff = 2000) {
    const fetchOptions = {
        ...options,
        method: options.method || 'GET',
        redirect: 'follow'
    };

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, fetchOptions);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.warn(`Fetch lần ${i + 1} thất bại: ${error.message}`);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, backoff));
        }
    }
}

// --- 2. HÀM XÁC THỰC TOKEN BẢO MẬT ---
window.verifyAdminSession = async (token) => {
    try {
        const data = await fetchWithRetry(`${SCRIPT_URL}?action=verifyToken&token=${token}`, { method: 'GET' }, 2, 1000);
        return data && data.isValid; 
    } catch (error) {
        console.error("Lỗi xác thực Token:", error);
        return false;
    }
}

// ----------------------------------------------------------------------------
// HÀM HÓA GIẢI LINK GOOGLE DRIVE (Bypass hoàn toàn lỗi ẩn danh / chặn Cookie)
// ----------------------------------------------------------------------------
function fixDriveUrl(urlStr) {
    if (!urlStr) return urlStr;
    // Bóc tách ID của ảnh từ link Google Drive
    const match = urlStr.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        // Trả về link từ Server ngầm lh3 của Google (Load cực nhanh, không hỏi Cookie)
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return urlStr;
}

function applyDataToGlobals(data) {
    if (data.products) { 
        globalProducts = data.products.map(p => {
            const rawQty = p.qty ?? p.so_luong ?? p.so_luong_sp ?? p['Số Lượng'] ?? p['Số lượng'] ?? p.quantity ?? 0;
            return {
                ...p,
                qty: parseInt(rawQty) || 0,
                // Chạy hàm sửa link tự động cho tất cả hình ảnh
                images: (p.images || []).map(img => fixDriveUrl(img))
            };
        }); 
        globalProducts.sort((a, b) => {
            const discA = getDiscountPercent(a.discount);
            const discB = getDiscountPercent(b.discount);
            if (discB !== discA) return discB - discA; 
            return (b.timestamp || 0) - (a.timestamp || 0); 
        });
    }
    
    // Tự động sửa link cho ảnh Tin tức và Giới thiệu
    if (data.news) {
        globalNews = data.news.map(n => ({ ...n, image: fixDriveUrl(n.image) }));
    }
    if (data.allNews) {
        globalAllNews = data.allNews.map(n => ({ ...n, image: fixDriveUrl(n.image) }));
    }
    if (data.about && data.about.title) {
        globalAbout = { ...data.about, image: fixDriveUrl(data.about.image) };
    }
    
    if (data.contact && data.contact.address) globalContact = data.contact;
    if (data.allContacts) globalAllContacts = data.allContacts;
    if (data.admins) globalAdmins = data.admins;
    
    // CHUẨN HÓA DỮ LIỆU ĐIỆN THOẠI & EMAIL KHÁCH HÀNG
    if (data.users) {
        globalUsers = data.users.map(u => ({
            ...u,
            phone: formatPhoneNumber(u.phone)
        }));
    } else {
        globalUsers = [];
    }
    
    // CHUẨN HÓA ĐỊNH DẠNG NGÀY GIỜ ĐƠN HÀNG
    if (data.orders) { 
        globalOrders = data.orders.map(o => ({
            ...o,
            phone: formatPhoneNumber(o.phone),
            date: formatDateString(o.date),
            rawDate: o.date
        }));
        globalOrders.sort((a,b) => { 
            return parseDate(b.rawDate || b.date) - parseDate(a.rawDate || a.date); 
        }); 
    } else {
        globalOrders = [];
    }
}

async function fetchAllData() {
    if(SCRIPT_URL.includes('AKfycbyc9b2iKk') || SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) {
        window.showToast("CẢNH BÁO: Chưa thay SCRIPT_URL!", "error");
        finishLoading(); return;
    }

    const cachedData = localStorage.getItem('tienxu_cached_webdata');
    if (cachedData) {
        try { applyDataToGlobals(JSON.parse(cachedData)); finishLoading(); } catch(e) { console.error("Lỗi nạp cache:", e); }
    }

    try {
        const data = await fetchWithRetry(SCRIPT_URL + '?action=getAllData');
        localStorage.setItem('tienxu_cached_webdata', JSON.stringify(data));
        applyDataToGlobals(data);
        finishLoading(); 
        
        if(isAdminActive) buildAdminInterface(); 
    } catch (error) {
        console.error("Lỗi fetch Live API:", error);
        if (!cachedData) {
            document.getElementById('loadingIndicator').innerHTML = `<p class="text-red-500 text-center font-bold">Lỗi kết nối cơ sở dữ liệu. Vui lòng tải lại trang.</p>`;
        }
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