// ============================================================================
// 📁 MODULE 8.2: ADMIN AUTH (admin-auth.js)
// Xác thực (đăng nhập/xuất), Toggle panel, Dashboard, Điều hướng Tab
// Phụ thuộc: utils.js (load sau utils.js để dùng chung hàm tiện ích)
// ============================================================================

function updateAdminBtnState() {
    const btn = document.querySelector('footer button[onclick="window.openLoginModal()"]');
    if(!btn) return;
    if(window.loggedInUser) { btn.innerHTML = `🧑‍💼 Chào, ${window.loggedInUser.username} | Quản Trị`; btn.onclick = window.toggleAdmin; } 
    else { btn.innerHTML = `🔑 Cổng Quản Trị`; btn.onclick = window.openLoginModal; }
}

window.openLoginModal = () => {
    // Ngầm tải dữ liệu mới nhất khi người dùng ấn Đăng nhập vào Quản trị
    if (typeof window.fetchAllDataBackground === 'function') window.fetchAllDataBackground();
    
    document.getElementById('loginModal').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('loginContent').classList.remove('scale-95');
    document.getElementById('loginUsername').value = ''; document.getElementById('loginPassword').value = '';
}

window.closeLoginModal = () => { document.getElementById('loginModal').classList.add('opacity-0', 'pointer-events-none'); document.getElementById('loginContent').classList.add('scale-95'); }

window.submitLogin = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const spinner = btn.querySelector('.spinner-icon');
    btn.disabled = true; spinner.classList.remove('hidden');

    const u = document.getElementById('loginUsername').value.trim(); 
    const p = document.getElementById('loginPassword').value.trim();
    
    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify({ action: 'login', data: { username: u, password: p } }) });
        const result = await response.json();
        if(result.success) {
            window.loggedInUser = result.user; 
            localStorage.setItem('tienxu_admin', JSON.stringify(result.user));
            if(result.token) localStorage.setItem('tienxu_admin_token', result.token);
            if(typeof window.showToast === 'function') window.showToast("Đăng nhập thành công!", "success"); 
            window.closeLoginModal(); updateAdminBtnState(); window.toggleAdmin(true);
        } else if(typeof window.showToast === 'function') window.showToast(result.message || "Sai Tên đăng nhập hoặc Mật khẩu!", "error");
    } catch(err) { if(typeof window.showToast === 'function') window.showToast("Lỗi kết nối máy chủ.", "error"); } 
    finally { btn.disabled = false; spinner.classList.add('hidden'); }
}

window.logOutAdmin = async (ask = true) => {
    if(!ask || (typeof window.showConfirm === 'function' && await window.showConfirm("Xác nhận đăng xuất khỏi trang Quản trị?", "Đăng Xuất"))) {
        const token = localStorage.getItem('tienxu_admin_token');
        if (token) try { fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify({ action: 'logout', token: token }) }); } catch(e){}
        window.loggedInUser = null; 
        localStorage.removeItem('tienxu_admin'); localStorage.removeItem('tienxu_admin_token');
        window.isAdminActive = false;
        document.getElementById('adminSection').classList.add('hidden'); document.getElementById('publicContainer').classList.remove('hidden');
        updateAdminBtnState(); if(typeof window.switchPage === 'function') window.switchPage('home');
    }
}

window.toggleAdmin = async (forceOpen = false) => {
    if (!window.loggedInUser) return window.openLoginModal();
    if (!window.isAdminActive && !forceOpen) {
        const token = localStorage.getItem('tienxu_admin_token');
        if(token) {
            if(typeof window.showToast === 'function') window.showToast("Đang xác thực quyền truy cập...", "info");
            const isValid = typeof window.verifyAdminSession === 'function' ? await window.verifyAdminSession(token) : false;
            if(!isValid) {
                window.logOutAdmin(false); if(typeof window.showToast === 'function') window.showToast("Phiên đăng nhập hết hạn!", "error"); return window.openLoginModal();
            }
        } else { window.logOutAdmin(false); return window.openLoginModal(); }
    }

    window.isAdminActive = !window.isAdminActive;
    if(window.isAdminActive || forceOpen) {
        window.isAdminActive = true;
        document.getElementById('adminWelcomeName').innerHTML = `Quản lý bán hàng: <strong class="text-red-700 font-extrabold uppercase drop-shadow-sm ml-1">${window.loggedInUser.username}</strong>`;
        
        // Load nhanh Giao diện bằng Cache để tăng tốc
        document.getElementById('publicContainer').classList.add('hidden'); 
        document.getElementById('adminSection').classList.remove('hidden');
        window.buildAdminInterface(); window.scrollTo({ top: 0, behavior: 'smooth' });

        // Gọi đồng bộ Background Update để lấy dữ liệu thay đổi trên Google Sheet
        if (typeof window.fetchAllDataBackground === 'function') {
            window.fetchAllDataBackground();
        }
    } else {
        document.getElementById('adminSection').classList.add('hidden'); document.getElementById('publicContainer').classList.remove('hidden');
        if(typeof window.switchPage === 'function') window.switchPage('home'); 
    }
};

window.buildAdminInterface = function() {
    if(!window.loggedInUser) return;
    const perms = (window.loggedInUser.permissions || "").toLowerCase().split(',').map(s=>s.trim());
    const tabsContainer = document.getElementById('adminTabsContainer');
    const contentContainer = document.getElementById('adminContentContainer');
    tabsContainer.innerHTML = ''; document.querySelectorAll('.admin-view').forEach(v => v.classList.add('hidden'));

    let firstTab = null;
    if(perms.includes('orders') || perms.includes('order') || perms.includes('admin')) {
        tabsContainer.innerHTML += `<div id="tabDashboard" onclick="window.switchAdminTab('Dashboard')" class="admin-tab whitespace-nowrap">📊 Báo Cáo</div>`;
        firstTab = 'Dashboard'; renderDashboard();
    }

    if((perms.includes('admin') || perms.includes('vouchers') || perms.includes('voucher')) && contentContainer) {
        if(!document.getElementById('viewVouchers')) {
            const vView = document.createElement('div');
            vView.id = 'viewVouchers'; vView.className = 'admin-view hidden';
            vView.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2"><h3 class="font-bold text-brand-dark mb-4 uppercase tracking-wider text-sm">Danh Sách Mã Giảm Giá</h3><div id="vouchersTableContainer"></div></div>
                <div class="lg:col-span-1 bg-brand-bg p-6 rounded border border-brand-border h-fit">
                    <h3 class="font-bold text-brand-dark mb-4 uppercase tracking-wider text-sm">Thêm Mã Mới</h3>
                    <form id="adminAddVoucherForm" onsubmit="window.handleAddVoucher(event)" class="space-y-4">
                        <div><label class="block text-xs font-bold text-gray-600 mb-1">Mã Voucher *</label><input type="text" id="addVCode" required class="w-full px-3 py-2 border border-brand-border outline-none rounded-sm uppercase font-bold text-red-600"></div>
                        <div class="grid grid-cols-2 gap-4">
                            <div><label class="block text-xs font-bold text-gray-600 mb-1">Loại *</label><select id="addVType" class="w-full px-3 py-2 border border-brand-border outline-none rounded-sm text-sm"><option value="cash">Tiền mặt (VNĐ)</option><option value="percent">Phần trăm (%)</option></select></div>
                            <div><label class="block text-xs font-bold text-gray-600 mb-1">Mức giảm *</label><input type="number" id="addVValue" required class="w-full px-3 py-2 border border-brand-border outline-none rounded-sm"></div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div><label class="block text-xs font-bold text-gray-600 mb-1">Đơn Tối Thiểu</label><input type="number" id="addVMin" value="0" class="w-full px-3 py-2 border border-brand-border outline-none rounded-sm"></div>
                            <div><label class="block text-xs font-bold text-gray-600 mb-1">Lượt Tối Đa</label><input type="number" id="addVMax" value="100" class="w-full px-3 py-2 border border-brand-border outline-none rounded-sm"></div>
                        </div>
                        <div><label class="block text-xs font-bold text-gray-600 mb-1">Thời Gian Bắt Đầu *</label><input type="datetime-local" id="addVStart" required class="w-full px-3 py-2 border border-brand-border outline-none rounded-sm text-sm"></div>
                        <div><label class="block text-xs font-bold text-gray-600 mb-1">Thời Gian Kết Thúc *</label><input type="datetime-local" id="addVEnd" required class="w-full px-3 py-2 border border-brand-border outline-none rounded-sm text-sm"></div>
                        <button type="submit" class="w-full bg-brand-btn text-brand-gold font-bold py-3 hover:bg-black transition-colors shadow mt-2 rounded-full uppercase text-xs flex items-center justify-center gap-2"><span class="spinner-icon hidden">...</span><span>+ THÊM MÃ GIẢM GIÁ</span></button>
                    </form>
                </div>
            </div>`;
            contentContainer.appendChild(vView);
        }
    }

    Object.keys(window.PERMISSION_MAP || {}).forEach(key => {
        const lowerKey = key.toLowerCase();
        if(perms.includes(lowerKey) || perms.includes(lowerKey.replace(/s$/,'')) || perms.includes('admin')) {
            const mapData = window.PERMISSION_MAP[key];
            
            tabsContainer.innerHTML += `<div id="tab${mapData.id}" onclick="window.switchAdminTab('${mapData.id}')" class="admin-tab whitespace-nowrap">${mapData.label}</div>`;
            if(!firstTab) firstTab = mapData.id;

            document.getElementById('adminLocalSearch').value = ''; window.adminSearchQuery = '';

            if(mapData.id === 'Products') renderAdminProducts();
            if(mapData.id === 'Orders') renderAdminOrders();
            if(mapData.id === 'Users') renderAdminUsers();
            if(mapData.id === 'Info') renderAdminInfo();
            if(mapData.id === 'News') renderAdminNews();
            if(mapData.id === 'Contact') renderAdminContact();
            if(mapData.id === 'Feedback') renderAdminFeedback();
            if(mapData.id === 'Admin') renderAdminAdmins();
            if(mapData.id === 'Vouchers') renderAdminVouchers();
        }
    });

    // Thêm Tab Lịch Sử cho Admin Cao Cấp (C1 / All)
    if((perms.includes('admin') || window.loggedInUser.role_code === 'C1') && contentContainer) {
        tabsContainer.innerHTML += `<div id="tabLogs" onclick="window.switchAdminTab('Logs')" class="admin-tab whitespace-nowrap">📜 Lịch Sử H.Động</div>`;
        if(!document.getElementById('viewLogs')) {
            const lView = document.createElement('div');
            lView.id = 'viewLogs'; lView.className = 'admin-view hidden';
            contentContainer.appendChild(lView);
        }
    }

    const addForm = document.getElementById('adminAddForm');
    if(addForm && !document.getElementById('addVouchersAllowed')) {
        const btnSubmit = addForm.querySelector('button[type="submit"]');
        if(btnSubmit) {
            const newFields = document.createElement('div');
            newFields.innerHTML = `
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div><label class="block text-xs font-bold text-gray-600 mb-1">Mã Giảm Giá SP Hỗ Trợ</label><input type="text" id="addVouchersAllowed" placeholder="VD: GIAM50K, TET2026" class="w-full px-3 py-2 border border-brand-border outline-none text-xs rounded-sm"></div>
                    <div><label class="block text-xs font-bold text-gray-600 mb-1">Phí Giao Hàng</label><input type="text" id="addShippingFee" placeholder="VD: 30000 hoặc 30.000đ" class="w-full px-3 py-2 border border-brand-border outline-none text-xs rounded-sm"></div>
                </div>
                <div class="mt-4 mb-4"><label class="block text-xs font-bold text-gray-600 mb-1">Thông Tin Khác</label><input type="text" id="addOtherInfo" class="w-full px-3 py-2 border border-brand-border outline-none text-xs rounded-sm"></div>
            `;
            addForm.insertBefore(newFields, btnSubmit);
        }
    }
    const editForm = document.getElementById('adminEditForm');
    if(editForm && !document.getElementById('editVouchersAllowed')) {
        const btnSubmit = editForm.querySelector('button[type="submit"]');
        if(btnSubmit) {
            const newFields = document.createElement('div');
            newFields.innerHTML = `
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div><label class="block text-xs font-bold text-gray-600 mb-1">Mã Giảm Giá SP Hỗ Trợ</label><input type="text" id="editVouchersAllowed" class="w-full px-3 py-2 border border-brand-border outline-none text-xs rounded-sm"></div>
                    <div><label class="block text-xs font-bold text-gray-600 mb-1">Phí Giao Hàng</label><input type="text" id="editShippingFee" class="w-full px-3 py-2 border border-brand-border outline-none text-xs rounded-sm"></div>
                </div>
                <div class="mt-4 mb-4"><label class="block text-xs font-bold text-gray-600 mb-1">Thông Tin Khác</label><input type="text" id="editOtherInfo" class="w-full px-3 py-2 border border-brand-border outline-none text-xs rounded-sm"></div>
            `;
            editForm.insertBefore(newFields, btnSubmit);
        }
    }

    if(firstTab) window.switchAdminTab(firstTab);
}

window.handleAdminSearch = () => {
    window.adminSearchQuery = document.getElementById('adminLocalSearch').value.toLowerCase().trim();
    const activeTab = document.querySelector('.admin-tab.active');
    if (!activeTab) return;
    const tabId = activeTab.id.replace('tab', '');
    
    if(tabId === 'Products') renderAdminProducts();
    if(tabId === 'Orders') renderAdminOrders();
    if(tabId === 'Users') renderAdminUsers();
    if(tabId === 'Info') renderAdminInfo();
    if(tabId === 'News') renderAdminNews();
    if(tabId === 'Contact') renderAdminContact();
    if(tabId === 'Feedback') renderAdminFeedback();
    if(tabId === 'Admin') renderAdminAdmins();
    if(tabId === 'Vouchers') renderAdminVouchers();
    if(tabId === 'Logs') renderAdminLogs();
}

window.switchAdminTab = (tabId) => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active', 'border-brand-gold', 'text-brand-dark'));
    const clickedTab = document.getElementById(`tab${tabId}`);
    if(clickedTab) clickedTab.classList.add('active', 'border-brand-gold', 'text-brand-dark');
    
    document.querySelectorAll('.admin-view').forEach(v => { v.classList.add('hidden'); v.style.opacity = '0'; });
    document.getElementById('adminLocalSearch').value = ''; window.adminSearchQuery = '';
    
    if(tabId === 'Products') renderAdminProducts();
    if(tabId === 'Orders') renderAdminOrders();
    if(tabId === 'Users') renderAdminUsers();
    if(tabId === 'Info') renderAdminInfo();
    if(tabId === 'News') renderAdminNews();
    if(tabId === 'Contact') renderAdminContact();
    if(tabId === 'Feedback') renderAdminFeedback();
    if(tabId === 'Admin') renderAdminAdmins();
    if(tabId === 'Vouchers') renderAdminVouchers();
    if(tabId === 'Logs') renderAdminLogs();

    const targetView = document.getElementById(`view${tabId}`);
    if(targetView) { 
        targetView.classList.remove('hidden'); 
        if(tabId === 'Products') targetView.classList.add('grid'); 
        targetView.style.opacity = '0'; targetView.style.transform = 'translateY(10px)';
        targetView.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        setTimeout(() => { targetView.style.opacity = '1'; targetView.style.transform = 'translateY(0)'; }, 10);
    }
}

function renderDashboard() {
    let totalRev = 0; let revByDate = {};
    (window.globalOrders || []).forEach(o => {
        let rev = typeof window.getNumericPrice === 'function' ? window.getNumericPrice(o.total) : 0; totalRev += rev;
        let dateOnly = typeof window.extractDateForChart === 'function' ? window.extractDateForChart(o.rawDate || o.date) : (o.date || 'Unknown');
        if(!revByDate[dateOnly]) revByDate[dateOnly] = 0;
        revByDate[dateOnly] += rev;
    });

    let formatCurr = typeof window.formatCurrency === 'function' ? window.formatCurrency : (v) => v + 'đ';
    document.getElementById('dashRevenue').innerText = formatCurr(totalRev);
    document.getElementById('dashTotalOrders').innerText = (window.globalOrders || []).length;
    document.getElementById('dashTotalProducts').innerText = (window.globalProducts || []).length;

    const sortedDates = Object.keys(revByDate).sort((a,b) => (typeof window.parseDate === 'function' ? window.parseDate(a) : 0) - (typeof window.parseDate === 'function' ? window.parseDate(b) : 0)); 
    const dataValues = sortedDates.map(d => revByDate[d]);
    const displayLabels = sortedDates.map(d => {
        if(d === 'Unknown') return d;
        let parts = d.split('-');
        if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return d;
    });

    const ctx = document.getElementById('revenueChart'); if(!ctx) return;
    if(window.revenueChartInstance) window.revenueChartInstance.destroy();
    
    window.revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: displayLabels.length > 0 ? displayLabels : ['Chưa có dữ liệu'], datasets: [{ label: 'Doanh thu (VNĐ)', data: dataValues.length > 0 ? dataValues : [0], borderColor: '#cda568', backgroundColor: 'rgba(205, 165, 104, 0.2)', borderWidth: 2, fill: true, tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
}