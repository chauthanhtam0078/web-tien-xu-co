// ============================================================================
// 📁 MODULE 2: UTILITIES (utils.js)
// Các hàm chức năng phụ trợ, tính toán, nén ảnh dùng chung cho toàn hệ thống
// ============================================================================

// Hàm tạo mã khách hàng ngẫu nhiên (Dùng cho đơn hàng mới)
function generateClientCode(prefix) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + code;
}

// Hàm cập nhật mã QR khi tên khách hàng thay đổi
function updateQRCode(customerName) {
    const qrImg = document.getElementById('qrCodeImg');
    if (qrImg) {
        const cleanName = (customerName || '').trim();
        const infoText = cleanName ? `${cleanName} thanh toan don hang ${currentOrderCode}` : `Thanh toan don hang ${currentOrderCode}`;
        qrImg.src = `https://img.vietqr.io/image/tcb-0916694438-compact2.jpg?amount=${currentOrderTotal}&addInfo=${encodeURIComponent(infoText)}`;
    }
}

// Hàm định dạng số điện thoại chuẩn Việt Nam
function formatPhoneNumber(phone) {
    if (!phone) return '';
    let p = String(phone).trim();
    return p.startsWith('0') ? p : '0' + p;
}

// Hàm định dạng ngày tháng từ ISO hoặc chuỗi phổ thông sang định dạng dễ đọc
function formatDateString(isoString) {
    if (!isoString) return '';
    let d = String(isoString);
    if (d.includes('T')) {
        const dateObj = new Date(d);
        if (!isNaN(dateObj)) {
            return dateObj.toLocaleDateString('vi-VN') + ' ' + dateObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
        }
    }
    return d;
}

// Hàm trích xuất ngày tháng theo định dạng YYYY-MM-DD để dùng cho biểu đồ hoặc lọc dữ liệu
function extractDateForChart(isoString) {
    if (!isoString) return 'Unknown';
    let d = String(isoString);
    if (d.includes('T')) return d.split('T')[0];
    if (d.includes(' ')) {
        let parts = d.split(' ')[0].split('/');
        if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
        return d.split(' ')[0];
    }
    return d;
}

// Hàm phân tích cú pháp ngày tháng từ nhiều định dạng khác nhau, trả về đối tượng Date
function parseDate(dateStr) {
    if (!dateStr) return new Date(0);
    let s = String(dateStr).trim();
    if (s.includes('T')) {
        const d = new Date(s);
        if (!isNaN(d)) return d;
    }
    const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const year = parseInt(match[3], 10);
        const hour = parseInt(match[4] || 0, 10);
        const minute = parseInt(match[5] || 0, 10);
        const second = parseInt(match[6] || 0, 10);
        return new Date(year, month, day, hour, minute, second);
    }
    const d = new Date(s);
    return isNaN(d) ? new Date(0) : d;
}

// Hàm tính toán giá sau khi áp dụng khuyến mãi (Dùng chung cho cả Web & Admin)
function getNumericPrice(priceStr) { return parseInt((priceStr||'').toString().replace(/[^\d]/g, '')) || 0; }

// Hàm định dạng tiền tệ chuẩn Việt Nam (Dùng chung cho cả Web & Admin)
function formatCurrency(num) { return new Intl.NumberFormat('vi-VN').format(num) + 'đ'; }

// Hàm tính phần trăm giảm giá từ chuỗi mô tả khuyến mãi (Dùng chung cho cả Web & Admin)
function getDiscountPercent(discountStr) {
    if (!discountStr) return 0;
    let str = discountStr.toString().trim();
    if (str.endsWith('%')) return parseInt(str.replace(/[^\d]/g, '')) || 0;
    let val = parseFloat(str);
    if (!isNaN(val)) return (val > 0 && val < 1) ? Math.round(val * 100) : Math.round(val);
    return 0;
}

// Hàm tính giá cuối cùng sau khi áp dụng khuyến mãi (Dùng chung cho cả Web & Admin)
function calculateFinalPrice(priceStr, discountStr) {
    const price = getNumericPrice(priceStr);
    const discount = getDiscountPercent(discountStr);
    return (discount > 0 && discount <= 100) ? price - (price * discount / 100) : price;
}

// Hàm lấy số lượng tồn kho của sản phẩm (Dùng chung cho cả Web & Admin)
function getProductStock(product) {
    if (!product) return 0;
    let soldQty = 0;
    globalOrders.forEach(o => {
        let maSps = (o.ma_sp || "").toString().split(/,|\n/).map(s => s.trim());
        let qtys = (o.qty || "").toString().split(/,|\n/).map(s => s.trim());
        for (let i = 0; i < maSps.length; i++) {
            let cleanProductMaSp = (product.ma_sp || product.id || "").toString().trim();
            if (maSps[i] === cleanProductMaSp) {
                soldQty += parseInt(qtys[i]) || 0;
            }
        }
    });
    let initialQty = parseInt(product.qty ?? product.so_luong ?? product['Số Lượng'] ?? product['Số lượng'] ?? 0) || 0;
    return Math.max(0, initialQty - soldQty);
}

// Hàm hiển thị hộp thoại xác nhận với giao diện tùy chỉnh và trả về Promise (Dùng chung cho cả Web & Admin)
window.showConfirm = (message, title = 'Xác nhận') => {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 opacity-0 pointer-events-auto';
        
        const box = document.createElement('div');
        box.className = 'bg-[#f8f5ee] rounded-xl shadow-2xl max-w-sm w-full border border-[#d8ccb8] transform scale-90 transition-transform duration-300 overflow-hidden';
        
        box.innerHTML = `
            <div class="p-6 text-center">
                <div class="w-16 h-16 rounded-full bg-[#efe8d7] border-2 border-red-600 mx-auto flex items-center justify-center mb-4 text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 class="text-lg font-serif font-bold text-[#1c1612] mb-2">${title}</h3>
                <p class="text-sm text-gray-600 mb-6 leading-relaxed">${message}</p>
                <div class="flex gap-3">
                    <button id="btnConfirmCancel" class="w-1/2 bg-gray-200 text-gray-700 py-2.5 rounded-full font-bold hover:bg-gray-300 transition text-xs uppercase tracking-wider">Hủy</button>
                    <button id="btnConfirmOk" class="w-1/2 bg-red-600 text-white py-2.5 rounded-full font-bold hover:bg-red-700 transition text-xs uppercase tracking-wider">Đồng ý</button>
                </div>
            </div>
        `;
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        
        setTimeout(() => { overlay.classList.remove('opacity-0'); box.classList.remove('scale-90'); }, 10);

        box.querySelector('#btnConfirmCancel').onclick = () => {
            overlay.classList.add('opacity-0'); box.classList.add('scale-90');
            setTimeout(() => { overlay.remove(); resolve(false); }, 300);
        };

        box.querySelector('#btnConfirmOk').onclick = () => {
            overlay.classList.add('opacity-0'); box.classList.add('scale-90');
            setTimeout(() => { overlay.remove(); resolve(true); }, 300);
        };
    });
};

// Hàm render thẻ img an toàn (Dùng chung cho cả Web & Admin)
window.buildSafeImage = (url, classes, fallbackText = 'LỖI', fallbackSize = '40x40') => {
    const urls = window.getSafeImgUrls(url);
    if (!urls.primary) return `<span class="text-xs text-gray-400 italic">Không có</span>`;

    if (urls.fallback) {
        return `<img src="${urls.primary}" class="${classes}"
                onerror="if(!this.dataset.retried) { this.dataset.retried='true'; this.src='${urls.fallback}'; } else { this.src='https://placehold.co/${fallbackSize}/ff0000/ffffff?text=${fallbackText}'; }">`;
    }
    return `<img src="${urls.primary}" class="${classes}" onerror="this.src='https://placehold.co/${fallbackSize}/ff0000/ffffff?text=${fallbackText}';">`;
};

// Hàm nén ảnh để trả về thêm tên gốc của hình ảnh (Dùng định tuyến trên thư mục Drive)
window.compressImage = (file, maxWidth = 800, quality = 0.7) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({ name: file.name, data: reader.result });
    reader.onerror = error => reject(error);
});

// --- HÀM BÓC TÁCH MÃ HTML ---
window.stripHTMLForSearch = (html) => {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html || "";
    return tmp.textContent || tmp.innerText || "";
};

// --- HÀM HIỂN THỊ TOAST THÔNG BÁO NHANH ---
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

// --- HÀM HIỂN THỊ ALERT & CONFIRM TÙY CHỈNH ---
window.showAlert = (message, title = 'Thông báo') => {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 opacity-0 pointer-events-auto';
        
        const box = document.createElement('div');
        box.className = 'bg-[#f8f5ee] rounded-xl shadow-2xl max-w-sm w-full border border-[#d8ccb8] transform scale-90 transition-transform duration-300 overflow-hidden';
        
        box.innerHTML = `
            <div class="p-6 text-center">
                <div class="w-16 h-16 rounded-full bg-[#efe8d7] border-2 border-[#cda568] mx-auto flex items-center justify-center mb-4 text-[#1c1612]">
                    <span class="font-serif text-2xl font-bold">古</span>
                </div>
                <h3 class="text-lg font-serif font-bold text-[#1c1612] mb-2">${title}</h3>
                <p class="text-sm text-gray-600 mb-6 leading-relaxed">${message}</p>
                <button id="btnAlertOk" class="w-full bg-[#1c1612] text-[#cda568] py-2.5 rounded-full font-bold hover:bg-[#cda568] hover:text-white transition uppercase text-xs tracking-wider">Xác Nhận</button>
            </div>
        `;
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        
        setTimeout(() => { overlay.classList.remove('opacity-0'); box.classList.remove('scale-90'); }, 10);

        box.querySelector('#btnAlertOk').onclick = () => {
            overlay.classList.add('opacity-0'); box.classList.add('scale-90');
            setTimeout(() => { overlay.remove(); resolve(true); }, 300);
        };
    });
};

// --- HÀM BẢO VỆ ẢNH KÉP (CHỐNG GOOGLE DRIVE CHẶN LINK DÙNG CHUNG) ---
window.getSafeImgUrls = (url) => {
    if (!url) return { primary: '', fallback: '' };
    const cleanUrl = url.split('#')[0];
    const match = cleanUrl.match(/id=([a-zA-Z0-9_-]+)/) || cleanUrl.match(/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        const id = match[1];
        return {
            // Lh3 load ảnh ngay lập tức sau khi up, không bị lỗi Cookie hay chờ tạo Thumbnail
            primary: `https://lh3.googleusercontent.com/d/${id}`, 
            // Thumbnail làm dự phòng cho ảnh cũ
            fallback: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`
        };
    }
    return { primary: cleanUrl, fallback: '' };
};