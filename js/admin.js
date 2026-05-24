// ============================================================================
// 📁 MODULE 8: ADMIN SYSTEM (admin.js)
// Bao gồm: Xác thực, Giao diện Dashboard, CMS Thêm/Sửa/Xóa và Quản lý Đơn hàng
// ============================================================================

// --- HỆ THỐNG QUẢN LÝ ẢNH CHUYÊN NGHIỆP ---
window.imageManagers = {
    add: { oldImages: [], newFiles: [], deletedImages: [], containerId: 'addImageTagsContainer', inputId: 'addImages' },
    edit: { oldImages: [], newFiles: [], deletedImages: [], containerId: 'editImageTagsContainer', inputId: 'editImages' },
    univ: { oldImages: [], newFiles: [], deletedImages: [], containerId: 'ueImageTagsContainer', inputId: 'ue_image' }
};

window.renderImageTags = (key) => {
    const state = window.imageManagers[key];
    const container = document.getElementById(state.containerId);
    if(!container) return;

    let html = `
    <div class="border-2 border-dashed border-gray-300 bg-[#fbfbfb] rounded-md p-4 mt-2 text-center relative group min-h-[120px] flex flex-col items-center justify-center transition-colors hover:bg-[#f4f4f4]">
        <div class="flex flex-wrap gap-2 justify-center w-full z-10 mb-4">`;

    // 1. Hiển thị các tag ảnh cũ đã lưu trên web
    state.oldImages.forEach((url, i) => {
        const urls = window.getSafeImgUrls(url);
        
        let onErrorScript = urls.fallback
            ? `if(!this.dataset.retried) { this.dataset.retried='true'; this.src='${urls.fallback}'; } else { this.src='https://placehold.co/40x40/ff0000/ffffff?text=L%E1%BB%96I'; this.nextElementSibling.innerHTML='<span class=\\'text-red-600 font-bold\\'>⚠️ LỖI</span>'; this.parentElement.classList.remove('bg-gray-100', 'border-gray-300', 'hover:bg-gray-200'); this.parentElement.classList.add('bg-red-50', 'border-red-500'); }`
            : `this.src='https://placehold.co/40x40/ff0000/ffffff?text=L%E1%BB%96I'; this.nextElementSibling.innerHTML='<span class=\\'text-red-600 font-bold\\'>⚠️ LỖI</span>'; this.parentElement.classList.remove('bg-gray-100', 'border-gray-300', 'hover:bg-gray-200'); this.parentElement.classList.add('bg-red-50', 'border-red-500');`;

        // Bóc tách tên file từ Hash URL hoặc dùng mã ID làm Fallback
        let displayId = "Ảnh đã lưu";
        if (url.includes('#')) {
            displayId = decodeURIComponent(url.split('#')[1]);
            displayId = displayId.replace(/^(TXC-P-[A-Z0-9]+-|Others-|GioiThieu-|TinTuc-)/, '');
        } else {
            const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) displayId = "Ảnh ..." + match[1].slice(-6); 
        }

        html += `<div class="flex items-center gap-1.5 bg-gray-100 border border-gray-300 px-2 py-1.5 rounded shadow-sm transition hover:bg-gray-200">
            <img src="${urls.primary}" class="w-8 h-8 object-contain bg-white rounded border border-gray-200" onerror="${onErrorScript}">
            <span class="text-[11px] text-gray-700 font-semibold truncate max-w-[120px]" title="${url}">${displayId}</span>
            <button type="button" onclick="window.removeImage('${key}', 'old', ${i})" class="text-red-500 hover:bg-red-100 w-5 h-5 rounded-full flex items-center justify-center font-bold transition" title="Xóa ảnh này khỏi hệ thống">×</button>
        </div>`;
    });

    // 2. Hiển thị các tag file chuẩn bị tải lên (Tạo Thumbnail thật cho ảnh)
    state.newFiles.forEach((file, i) => {
        const previewUrl = URL.createObjectURL(file);
        
        html += `<div class="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2 py-1.5 rounded shadow-sm transition hover:bg-blue-100">
            <img src="${previewUrl}" class="w-8 h-8 object-contain bg-white rounded border border-blue-200" onload="URL.revokeObjectURL(this.src)">
            <span class="text-[11px] text-blue-800 font-semibold truncate max-w-[120px]" title="${file.name}">${file.name}</span>
            <button type="button" onclick="window.removeImage('${key}', 'new', ${i})" class="text-red-500 hover:bg-red-100 w-5 h-5 rounded-full flex items-center justify-center font-bold transition" title="Hủy tải lên">×</button>
        </div>`;
    });

    // Nếu không có ảnh nào
    if(state.oldImages.length === 0 && state.newFiles.length === 0) {
        html += `<div class="text-gray-400 text-xs flex flex-col items-center pointer-events-none">
                    <svg class="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span>Chưa có tệp nào được chọn</span>
                 </div>`;
    }

    html += `   </div>
        <button type="button" onclick="document.getElementById('${state.inputId}').click()" class="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-full shadow-sm text-xs font-bold hover:border-brand-gold hover:text-brand-gold transition-colors z-10 relative flex items-center gap-2 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            Chọn ảnh từ máy tính/điện thoại
        </button>
    </div>`;

    container.innerHTML = html;
    
    const input = document.getElementById(state.inputId);
    if(input) input.style.display = 'none';
};

window.removeImage = (key, type, index) => {
    const state = window.imageManagers[key];
    if (type === 'old') {
        const removedUrl = state.oldImages.splice(index, 1)[0];
        state.deletedImages.push(removedUrl); // Đưa vào mảng chờ xóa
    } else {
        state.newFiles.splice(index, 1);
    }
    window.renderImageTags(key);
};

window.initImageManager = (key) => {
    const state = window.imageManagers[key];
    const input = document.getElementById(state.inputId);
    if(!input) return;
    
    if(!input.dataset.managerAttached) {
        let container = document.getElementById(state.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = state.containerId;
            input.parentNode.insertBefore(container, input.nextSibling); 
        }
        input.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                state.newFiles = state.newFiles.concat(files);
                window.renderImageTags(key);
            }
            e.target.value = ''; 
        });
        input.dataset.managerAttached = 'true';
    }
    window.renderImageTags(key);
}

// --- AUTH & CORE ---
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
            redirect: 'follow',
            body: JSON.stringify({ action: 'login', data: { username: u, password: p } }) 
        });
        const result = await response.json();
        if(result.success) {
            loggedInUser = result.user; 
            localStorage.setItem('tienxu_admin', JSON.stringify(result.user));
            if(result.token) localStorage.setItem('tienxu_admin_token', result.token);
            
            window.showToast("Đăng nhập thành công!", "success"); 
            window.closeLoginModal(); 
            updateAdminBtnState(); 
            window.toggleAdmin(true);
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

window.logOutAdmin = async (ask = true) => {
    if(!ask || await window.showConfirm("Xác nhận đăng xuất khỏi trang Quản trị?", "Đăng Xuất")) {
        const token = localStorage.getItem('tienxu_admin_token');
        if (token) {
            try { fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify({ action: 'logout', token: token }) }); } catch(e){}
        }
        loggedInUser = null; 
        localStorage.removeItem('tienxu_admin'); 
        localStorage.removeItem('tienxu_admin_token');
        isAdminActive = false;
        document.getElementById('adminSection').classList.add('hidden'); document.getElementById('publicContainer').classList.remove('hidden');
        updateAdminBtnState(); window.switchPage('home');
    }
}

window.toggleAdmin = async (forceOpen = false) => {
    if (!loggedInUser) return window.openLoginModal();
    
    if (!isAdminActive && !forceOpen) {
        const token = localStorage.getItem('tienxu_admin_token');
        if(token) {
            window.showToast("Đang xác thực quyền truy cập...", "info");
            const isValid = await window.verifyAdminSession(token);
            if(!isValid) {
                window.logOutAdmin(false); 
                window.showToast("Phiên đăng nhập hết hạn hoặc không hợp lệ!", "error");
                return window.openLoginModal();
            }
        } else {
            window.logOutAdmin(false);
            return window.openLoginModal();
        }
    }

    isAdminActive = !isAdminActive;
    if(isAdminActive || forceOpen) {
        isAdminActive = true;
        document.getElementById('publicContainer').classList.add('hidden'); document.getElementById('adminSection').classList.remove('hidden');
        // UPDATE TÊN ADMIN THÀNH MÀU ĐỎ ĐẬM, IN HOA
        document.getElementById('adminWelcomeName').innerHTML = `Quản lý bán hàng: <strong class="text-red-700 font-extrabold uppercase drop-shadow-sm ml-1">Admin ${loggedInUser.username}</strong>`;
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
    
    document.getElementById('adminLocalSearch').value = '';
    adminSearchQuery = '';
    
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

// --- RENDERING BẢNG ADMIN ---
function renderDashboard() {
    let totalRev = 0; let revByDate = {};
    
    globalOrders.forEach(o => {
        let rev = getNumericPrice(o.total); totalRev += rev;
        let dateOnly = extractDateForChart(o.rawDate || o.date);
        
        if(!revByDate[dateOnly]) revByDate[dateOnly] = 0;
        revByDate[dateOnly] += rev;
    });

    document.getElementById('dashRevenue').innerText = formatCurrency(totalRev);
    document.getElementById('dashTotalOrders').innerText = globalOrders.length;
    document.getElementById('dashTotalProducts').innerText = globalProducts.length;

    const sortedDates = Object.keys(revByDate).sort((a,b) => parseDate(a) - parseDate(b)); 
    const dataValues = sortedDates.map(d => revByDate[d]);
    
    const displayLabels = sortedDates.map(d => {
        if(d === 'Unknown') return d;
        let parts = d.split('-');
        if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return d;
    });

    const ctx = document.getElementById('revenueChart'); if(!ctx) return;
    if(revenueChartInstance) revenueChartInstance.destroy();
    
    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: displayLabels.length > 0 ? displayLabels : ['Chưa có dữ liệu'], datasets: [{ label: 'Doanh thu (VNĐ)', data: dataValues.length > 0 ? dataValues : [0], borderColor: '#cda568', backgroundColor: 'rgba(205, 165, 104, 0.2)', borderWidth: 2, fill: true, tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
}

function renderAdminUsers() {
    const view = document.getElementById('viewUsers');
    if(!view) return;
    const q = adminSearchQuery;
    const filtered = globalUsers.filter(u => !q || (u.name||"").toLowerCase().includes(q) || (u.phone||"").toLowerCase().includes(q) || (u.email||"").toLowerCase().includes(q));
    
    let html = `<div class="overflow-x-auto border border-brand-border rounded custom-scrollbar"><table class="w-full text-left text-sm"><thead class="bg-brand-card text-gray-700"><tr><th class="px-4 py-3 w-12 text-center">STT</th><th class="px-4 py-3">Tên Khách Hàng</th><th class="px-4 py-3">SĐT</th><th class="px-4 py-3">Email</th><th class="px-4 py-3">Địa chỉ</th><th class="px-4 py-3 text-center">Hành động</th></tr></thead><tbody class="divide-y divide-gray-200">`;
    if(filtered.length === 0) html += `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>`;
    filtered.forEach((u, index) => {
        let formattedPhone = u.phone;

        html += `<tr class="hover:bg-gray-50"><td class="px-4 py-3 text-center font-bold text-gray-500">${index + 1}</td><td class="px-4 py-3 font-bold">${u.name} <span class="text-[10px] text-gray-400 block">${u.ma_kh || ""}</span></td><td class="px-4 py-3">${formattedPhone}</td><td class="px-4 py-3 text-gray-500">${u.email}</td><td class="px-4 py-3 truncate max-w-[200px] text-xs">${u.address}</td>
        <td class="px-4 py-3 text-center whitespace-nowrap">
            <button onclick="window.openUniversalEdit('Users', '${u.id}')" class="text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs mr-1 font-semibold border border-blue-200">Sửa</button>
            <button onclick="window.deleteGenericData('Users', '${u.id}', this)" class="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-semibold border border-red-200">Xóa</button>
        </td></tr>`;
    });
    view.innerHTML = `<div class="p-6">` + html + `</tbody></table></div></div>`;
}

function renderAdminNews() {
    const view = document.getElementById('viewNews');
    if(!view) return;
    const q = adminSearchQuery;
    const filtered = globalAllNews.filter(n => !q || (n.title||"").toLowerCase().includes(q) || (n.category||"").toLowerCase().includes(q));
    
    let html = `<div class="overflow-x-auto border border-brand-border rounded custom-scrollbar"><table class="w-full text-left text-sm"><thead class="bg-brand-card text-gray-700"><tr><th class="px-4 py-3 w-12 text-center">STT</th><th class="px-4 py-3">Phân loại</th><th class="px-4 py-3">Tiêu đề bài viết</th><th class="px-4 py-3">Ảnh</th><th class="px-4 py-3 text-center">Hành động</th></tr></thead><tbody class="divide-y divide-gray-200">`;
    if(filtered.length === 0) html += `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>`;
    filtered.forEach((n, index) => {
        let firstImg = n.images && n.images.length > 0 ? n.images[0] : n.image;
        let imgHtml = window.buildSafeImage(firstImg, 'w-10 h-10 object-contain bg-white rounded shadow-sm border border-gray-300', 'LỖI');
        html += `<tr class="hover:bg-gray-50"><td class="px-4 py-3 text-center font-bold text-gray-500">${index + 1}</td><td class="px-4 py-3 text-xs bg-gray-100 rounded px-2">${n.category}</td><td class="px-4 py-3 font-bold truncate max-w-[300px]">${n.title}</td><td class="px-4 py-3">${imgHtml}</td>
        <td class="px-4 py-3 text-center whitespace-nowrap">
            <button onclick="window.openUniversalEdit('News', '${n.id}')" class="text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs mr-1 font-semibold border border-blue-200">Cập Nhật</button>
            <button onclick="window.deleteGenericData('News', '${n.id}', this)" class="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-semibold border border-red-200">Xóa</button>
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
            <button onclick="window.deleteGenericData('Contact', '${c.id}', this)" class="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-semibold border border-red-200">Xóa</button>
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
            <button onclick="window.deleteGenericData('Admin', '${a.id}', this)" class="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-semibold border border-red-200">Xóa</button>
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
    
    let firstImg = i.images && i.images.length > 0 ? i.images[0] : i.image;
    let imgHtml = window.buildSafeImage(firstImg, 'w-16 h-16 object-contain bg-white rounded shadow-sm border border-gray-300', 'LỖI', '64x64');
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

function renderAdminProducts() {
    const tbody = document.getElementById('adminTableBody');
    if(!tbody) return;
    
    const q = adminSearchQuery;
    const filtered = globalProducts.filter(p => !q || (p.name||"").toLowerCase().includes(q) || (p.period||"").toLowerCase().includes(q));
    
    document.getElementById('productCountBadge').innerText = filtered.length;
    tbody.innerHTML = '';
    
    const thead = tbody.previousElementSibling;
    thead.innerHTML = `<tr><th class="px-4 py-3 font-semibold w-12 text-center">STT</th><th class="px-4 py-3 font-semibold">Hình ảnh</th><th class="px-4 py-3 font-semibold">Tên SP</th><th class="px-4 py-3 font-semibold">Giá</th><th class="px-4 py-3 font-semibold text-center text-blue-800">Tồn Kho</th><th class="px-4 py-3 font-semibold text-center w-32">Hành động</th></tr>`;

    if(filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>`; return; }
    
    filtered.forEach((p, index) => {
        let firstImage = (p.images && p.images.length > 0 && p.images[0].trim() !== '') ? p.images[0] : '';
        let thumbHTML = firstImage !== '' ? window.buildSafeImage(firstImage, 'w-10 h-10 rounded-full object-contain bg-white border border-gray-300', 'LỖI') : `<div class="w-10 h-10 rounded-full bg-brand-bg text-brand-gold flex items-center justify-center">${p.symbol || '古'}</div>`;
        
        let stock = getProductStock(p);
        let stockColor = stock <= 0 ? 'text-red-600 font-bold' : (stock < 10 ? 'text-orange-600 font-bold' : 'text-blue-700 font-bold');

        tbody.innerHTML += `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-center font-bold text-gray-500">${index + 1}</td>
            <td class="px-4 py-3">${thumbHTML}</td>
            <td class="px-4 py-3 font-medium text-brand-dark">${p.name}</td>
            <td class="px-4 py-3 text-red-700 font-bold font-sans">${p.price}</td>
            <td class="px-4 py-3 text-center ${stockColor} font-sans text-lg">${stock}</td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
                <button onclick="window.openEditProduct('${p.id}')" class="text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs mr-1 font-semibold border border-blue-200">Sửa</button>
                <button onclick="window.deleteGenericData('Products', '${p.id}', this)" class="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-semibold border border-red-200">Xóa</button>
            </td>
        </tr>`;
    });

    // Kích hoạt Manager cho nút Thêm SP
    setTimeout(() => {
        window.imageManagers.add.oldImages = [];
        window.imageManagers.add.newFiles = [];
        window.initImageManager('add');
    }, 10);
}

function renderAdminOrders() {
    const view = document.getElementById('viewOrders');
    if(!view) return;
    
    const q = adminSearchQuery;
    const filtered = globalOrders.filter(o => !q || (o.order_code||"").toLowerCase().includes(q) || (o.customer||"").toLowerCase().includes(q) || (o.phone||"").toLowerCase().includes(q));

    let html = `
    <div class="overflow-x-auto border border-brand-border custom-scrollbar"><table class="w-full text-left text-sm min-w-[1100px]">
        <thead class="bg-brand-card text-gray-700 border-b border-brand-border">
            <tr>
                <th class="px-4 py-3 w-10 text-center">STT</th>
                <th class="px-4 py-3 w-44">Mã Đơn / Thời gian</th>
                <th class="px-4 py-3 w-[24rem]">Thông tin khách hàng</th>
                <th class="px-4 py-3">Sản phẩm</th>
                <th class="px-4 py-3 font-sans w-28">Tổng Tiền</th>
                <th class="px-4 py-3 text-center w-64">Trạng thái</th>
            </tr>
        </thead><tbody class="divide-y divide-gray-200">
    `;
    if(filtered.length === 0) { html += `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">Chưa có đơn hàng</td></tr>`; }
    filtered.forEach((o, index) => {
        let formattedPhone = o.phone;
        let displayDate = o.date; 

        let pNames = (o.product || "").toString().split('\n');
        let pQtys = (o.qty || "").toString().split(/,|\n/); 
        let pDetails = (o.detail || "").toString().split('\n');

        let productsHTML = pNames.map((name, i) => {
            let q = pQtys[i] ? pQtys[i].toString().trim() : 1;
            let d = pDetails[i] ? pDetails[i].toString().trim() : '';
            let nameStr = name.includes('SL:') ? name.trim() : `SL: ${q} x ${name.trim()}`;
            
            if (d) {
                return `<div class="mb-1.5"><span class="text-gray-800 font-medium">${nameStr}</span><br><span class="text-[10px] text-gray-500 block leading-tight">${d}</span></div>`;
            }
            return `<div class="mb-1.5"><span class="text-gray-800 font-medium">${nameStr}</span></div>`;
        }).join('');

        let methodValue = o.method || "COD"; 
        
        let paymentSelect = `
            <select id="payStatus_${o.id}" class="text-[11px] text-center border border-yellow-400 rounded p-1 outline-none focus:border-brand-gold bg-yellow-50 text-yellow-800 font-semibold w-full mb-1">
                <option value="COD" ${methodValue === 'COD' ? 'selected' : ''}>COD</option>
                <option value="BANK: Chưa nhận chuyển khoản" ${(methodValue === 'BANK: Chưa nhận chuyển khoản' || methodValue === 'BANK') ? 'selected' : ''}>Bank: Chưa nhận CK</option>
                <option value="BANK: Đã nhận chuyển khoản" ${methodValue === 'BANK: Đã nhận chuyển khoản' ? 'selected' : ''}>Bank: Đã nhận CK</option>
            </select>
        `;

        let deliverySelect = `
            <select id="status_${o.id}" class="text-[11px] text-center border border-gray-300 rounded p-1 outline-none focus:border-brand-gold bg-white w-full mb-2">
                <option value="Chưa Giao Hàng" ${o.status === 'Chưa Giao Hàng' || !o.status ? 'selected' : ''}>Chưa Giao Hàng</option>
                <option value="Đang Giao Hàng" ${o.status === 'Đang Giao Hàng' ? 'selected' : ''}>Đang Giao Hàng</option>
                <option value="Đã Giao Hàng" ${o.status === 'Đã Giao Hàng' ? 'selected' : ''}>Đã Giao Hàng</option>
            </select>
        `;

        html += `
        <tr class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 text-center font-bold text-gray-500 align-top">${index + 1}</td>
            <td class="px-4 py-3 align-top"><strong class="block text-brand-dark">${o.order_code}</strong><span class="text-xs text-gray-500 block mt-1">${displayDate}</span></td>
            <td class="px-4 py-3 align-top text-xs leading-relaxed">
                <strong class="text-sm text-brand-dark">${o.customer}</strong> <span class="text-[10px] bg-gray-100 px-1 rounded text-gray-500">${o.ma_kh || "Chưa có"}</span><br>
                <span class="font-sans text-[#8c5a2b] font-bold text-[13px] tracking-wide">${formattedPhone}</span><br>
                <span class="text-gray-500">${o.email || 'Không có Email'}</span><br>
                <span class="text-gray-600 mt-1 block" title="${o.address}">${o.address}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-800 align-top">${productsHTML}</td>
            <td class="px-4 py-3 font-bold text-red-700 font-sans align-top">${o.total}</td>
            <td class="px-4 py-3 text-center flex flex-col justify-center items-center h-full align-top">
                ${paymentSelect}
                ${deliverySelect}
                <div class="flex gap-1 w-full">
                    <button onclick="window.updateOrderStatus('${o.id}', this)" class="flex-1 text-blue-500 hover:text-white hover:bg-blue-500 border border-blue-500 px-2 py-1 rounded text-xs transition font-semibold whitespace-nowrap">Lưu</button>
                    <button onclick="window.deleteGenericData('Orders', '${o.id}', this)" class="flex-1 text-red-500 hover:text-white hover:bg-red-500 border border-red-500 px-2 py-1 rounded text-xs transition font-semibold whitespace-nowrap">Xóa</button>
                </div>
            </td>
        </tr>`;
    });
    html += `</tbody></table></div>`;
    view.innerHTML = `<div class="p-6">` + html + `</div>`;
}

// --- CMS & ACTIONS ---
window.deleteGenericData = async (sheetName, id, btn) => {
    const isFullControl = (loggedInUser.type || "").toLowerCase().includes("xóa") || (loggedInUser.type || "").toLowerCase().includes("admin");
    if(!isFullControl) return window.showToast("Bạn không có quyền Xóa!", "error");
    
    const isConfirmed = await window.showConfirm(`Xác nhận xóa dữ liệu khỏi bảng ${sheetName}? Hành động này sẽ không thể hoàn tác.`, "Cảnh Báo Xóa");
    if(!isConfirmed) return;
    
    let originalText = "";
    if (btn) {
        originalText = btn.innerText;
        btn.innerText = "Đang xóa...";
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    }

    try {
        const token = localStorage.getItem('tienxu_admin_token');
        const response = await fetch(SCRIPT_URL, { 
            method: 'POST', 
            redirect: 'follow',
            body: JSON.stringify({ action: 'deleteData', token: token, data: { sheetName: sheetName, id: id } }) 
        });
        const res = await response.json();
        if(res.success) { 
            window.showToast("Đã xóa dữ liệu thành công!", "success"); 
            localStorage.removeItem('tienxu_cached_webdata');
            fetchAllData(); 
        } 
        else window.showToast("Lỗi: " + res.message, "error");
    } catch(e) { window.showToast("Lỗi mạng.", "error"); }
    finally {
        if (btn) {
            btn.innerText = originalText;
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
}

window.openUniversalEdit = (sheetName, id) => {
    currentEditSheet = sheetName;
    currentEditId = id;
    let html = '';
    let title = "Cập Nhật";

    // Khởi tạo State cho Universal
    window.imageManagers.univ.oldImages = [];
    window.imageManagers.univ.newFiles = [];
    window.imageManagers.univ.deletedImages = [];

    if (sheetName === 'Users') {
        const u = globalUsers.find(x => x.id == id); title = `Khách Hàng: ${u.name}`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Tên Khách Hàng</label><input type="text" id="ue_name" value="${u.name}" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Điện Thoại</label><input type="text" id="ue_phone" value="${u.phone}" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Email</label><input type="email" id="ue_email" value="${u.email}" class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Địa Chỉ</label><textarea id="ue_address" rows="2" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm resize-none">${u.address}</textarea></div>`;
    } else if (sheetName === 'Info') {
        const i = globalAbout; title = `Sửa Giới Thiệu`;
        if (i.images && i.images.length > 0) window.imageManagers.univ.oldImages = [...i.images];
        else if (i.image) window.imageManagers.univ.oldImages.push(i.image);
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Tiêu Đề</label><input type="text" id="ue_title" value="${i.title}" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Đoạn Văn (Xuống dòng để tạo đoạn mới)</label><textarea id="ue_paras" rows="6" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm whitespace-pre-wrap">${i.paragraphs.join('\n')}</textarea></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Dấu Đầu Dòng (Gõ xuống dòng để chia nhiều ý tính năng)</label><textarea id="ue_bullets" rows="4" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm whitespace-pre-wrap">${i.bullets.join('\n')}</textarea></div>`;
        html += `<div><label class="block text-xs font-bold text-gray-600 mb-1">Quản Lý Ảnh</label><input type="file" id="ue_image" accept="image/*" multiple class="hidden"></div>`;
    } else if (sheetName === 'News') {
        const n = globalAllNews.find(x => x.id == id); title = `Cập Nhật Tin Tức`;
        if (n && n.images && n.images.length > 0) window.imageManagers.univ.oldImages = [...n.images];
        else if (n && n.image) window.imageManagers.univ.oldImages.push(n.image);
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Phân Loại</label><input type="text" id="ue_category" value="${n.category}" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Tiêu Đề</label><input type="text" id="ue_title" value="${n.title}" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 block mb-1">Nội dung / Mô tả</label><textarea id="ue_desc" rows="5" required class="border border-gray-300 rounded p-2 w-full focus:outline-none focus:border-brand-gold text-sm">${n.desc}</textarea></div>`;
        html += `<div><label class="block text-xs font-bold text-gray-600 mb-1">Quản Lý Ảnh</label><input type="file" id="ue_image" accept="image/*" multiple class="hidden"></div>`;
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
    
    // Kích hoạt Image Manager nếu là form có ảnh
    setTimeout(() => {
        if(document.getElementById('ue_image')) window.initImageManager('univ');
    }, 10);

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

    let base64NewImages = [];
    const univState = window.imageManagers.univ;
    if (univState.newFiles.length > 0) {
        for (let i = 0; i < univState.newFiles.length; i++) {
            base64NewImages.push(await compressImage(univState.newFiles[i])); 
        }
    }

    try {
        const token = localStorage.getItem('tienxu_admin_token');
        const data = { 
            sheetName: currentEditSheet, 
            id: currentEditId, 
            updates: updates, 
            newImages: base64NewImages,
            keptImages: univState.oldImages,
            deletedImages: univState.deletedImages
        };
        const response = await fetch(SCRIPT_URL, { 
            method: 'POST', 
            redirect: 'follow', 
            body: JSON.stringify({ action: 'editGenericData', token: token, data: data }) 
        });
        const result = await response.json();
        if(result.success) { 
            window.showToast("Cập nhật dữ liệu thành công!", "success"); 
            window.closeUniversalEdit();
            localStorage.removeItem('tienxu_cached_webdata');
            fetchAllData(); 
        } else window.showToast("Lỗi Server: " + result.message, "error");
    } catch (error) { 
        window.showToast("Lỗi mạng.", "error"); 
    } finally { 
        textSpan.innerText = oldText; btn.disabled = false; spinner.classList.add('hidden');
    }
}

window.handleAddProduct = async (e) => {
    e.preventDefault();
    const isFullControl = (loggedInUser.type || "").toLowerCase().includes("thêm") || (loggedInUser.type || "").toLowerCase().includes("admin");
    if(!isFullControl) return window.showToast("Bạn không có quyền Thêm mới!", "error");
    if(SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) return window.showToast("Chưa điền SCRIPT_URL!", "error");

    const btn = e.target.querySelector('button[type="submit"]'); 
    const spinner = btn.querySelector('.spinner-icon');
    const textSpan = btn.querySelectorAll('span')[1];
    const oldText = textSpan.innerText;
    
    textSpan.innerText = "ĐANG TẢI LÊN..."; 
    btn.disabled = true;
    spinner.classList.remove('hidden');

    try {
        let base64Images = [];
        const addState = window.imageManagers.add;
        if (addState.newFiles.length > 0) { 
            for (let i = 0; i < addState.newFiles.length; i++) {
                base64Images.push(await compressImage(addState.newFiles[i])); 
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
        const token = localStorage.getItem('tienxu_admin_token');
        const response = await fetch(SCRIPT_URL, { 
            method: 'POST', 
            redirect: 'follow', 
            body: JSON.stringify({ action: 'addProduct', token: token, data: productData }) 
        });
        const result = await response.json();
        if(result.success) { 
            e.target.reset(); 
            window.imageManagers.add.newFiles = [];
            window.renderImageTags('add');
            window.showToast("Đã thêm sản phẩm thành công!", "success"); 
            localStorage.removeItem('tienxu_cached_webdata');
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
    
    // Kích hoạt hệ thống Image Manager cho form Edit Product
    window.imageManagers.edit = {
        oldImages: [...(product.images || []).filter(img => img.trim() !== '')], 
        newFiles: [],
        deletedImages: [],
        containerId: 'editImageTagsContainer', 
        inputId: 'editImages'
    };
    window.initImageManager('edit');

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

    const btn = e.target.querySelector('button[type="submit"]'); 
    const spinner = btn.querySelector('.spinner-icon');
    const textSpan = btn.querySelectorAll('span')[1];
    const oldText = textSpan.innerText;
    
    textSpan.innerText = "ĐANG CẬP NHẬT..."; 
    btn.disabled = true;
    spinner.classList.remove('hidden');

    try {
        let base64NewImages = [];
        const editState = window.imageManagers.edit;
        if (editState.newFiles.length > 0) { 
            for (let i = 0; i < editState.newFiles.length; i++) {
                base64NewImages.push(await compressImage(editState.newFiles[i])); 
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
            keptImages: editState.oldImages,       
            deletedImages: editState.deletedImages, 
            newImages: base64NewImages                          
        };

        const token = localStorage.getItem('tienxu_admin_token');
        const response = await fetch(SCRIPT_URL, { 
            method: 'POST', 
            redirect: 'follow', 
            body: JSON.stringify({ action: 'editProduct', token: token, data: productData }) 
        });
        const result = await response.json();
        if(result.success) { 
            window.showToast("Đã cập nhật sản phẩm thành công!", "success"); 
            window.closeEditModal();
            localStorage.removeItem('tienxu_cached_webdata');
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

window.updateOrderStatus = async (id, btn) => {
    const isFullControl = (loggedInUser.type || "").toLowerCase().includes("sửa") || (loggedInUser.type || "").toLowerCase().includes("admin");
    if(!isFullControl) return window.showToast("Bạn không có quyền Cập nhật trạng thái!", "error");
    
    const newStatus = document.getElementById(`status_${id}`).value;
    const newPayStatus = document.getElementById(`payStatus_${id}`).value;

    let originalText = "";
    if (btn) {
        originalText = btn.innerText;
        btn.innerText = "Đang lưu...";
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    }

    try {
        const token = localStorage.getItem('tienxu_admin_token');
        
        const res = await fetch(SCRIPT_URL, { 
            method: 'POST', 
            redirect: 'follow', 
            body: JSON.stringify({ 
                action: 'updateOrderStatus', 
                token: token, 
                data: { id: id, status: newStatus, payment_status: newPayStatus } 
            }) 
        });
        
        const result = await res.json();
        if(result.success) {
            window.showToast("Cập nhật trạng thái thành công!", "success");
            localStorage.removeItem('tienxu_cached_webdata');
            fetchAllData(); 
        } else {
            window.showToast("Lỗi Server: " + result.message, "error");
        }
    } catch(e) { 
        window.showToast("Lỗi mạng: " + e.message, "error"); 
    } finally {
        if (btn) {
            btn.innerText = originalText;
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
};
