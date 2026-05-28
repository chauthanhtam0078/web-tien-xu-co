// ============================================================================
// 📁 MODULE 8: ADMIN SYSTEM (admin.js)
// Bao gồm: Xác thực, Giao diện Dashboard, CMS Thêm/Sửa/Xóa và Quản lý Đơn hàng
// TÍCH HỢP: Rich Text Editor (Trình soạn thảo văn bản đa dạng)
// ============================================================================

window.imageManagers = {
    add: { oldImages: [], newFiles: [], deletedImages: [], containerId: 'addImageTagsContainer', inputId: 'addImages' },
    edit: { oldImages: [], newFiles: [], deletedImages: [], containerId: 'editImageTagsContainer', inputId: 'editImages' },
    univ: { oldImages: [], newFiles: [], deletedImages: [], containerId: 'ueImageTagsContainer', inputId: 'ue_image' }
};

// --- [HÀM DÙNG CHUNG] TỐI ƯU HÓA HTML BẢNG QUẢN TRỊ ---
window.wrapAdminTable = (theadHtml, tbodyHtml, colSpan, customTableClass = "w-full text-left text-sm") => {
    let html = `<div class="overflow-x-auto border border-brand-border rounded custom-scrollbar"><table class="${customTableClass}"><thead class="bg-brand-card text-gray-700"><tr>${theadHtml}</tr></thead><tbody class="divide-y divide-gray-200">`;
    if(!tbodyHtml) html += `<tr><td colspan="${colSpan}" class="px-4 py-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>`;
    else html += tbodyHtml;
    html += `</tbody></table></div>`;
    return html;
};

// --- [HÀM DÙNG CHUNG] TỐI ƯU HÓA CỤM NÚT SỬA/XÓA ---
window.buildActionButtons = (sheetName, id, editTxt = "Sửa", delTxt = "Xóa", customEditFn = null) => {
    let editClick = customEditFn ? customEditFn : `window.openUniversalEdit('${sheetName}', '${id}')`;
    let editBtn = `<button onclick="${editClick}" class="text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs mr-1 font-semibold border border-blue-200">${editTxt}</button>`;
    let delBtn = `<button onclick="window.deleteGenericData('${sheetName}', '${id}', this)" class="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-semibold border border-red-200">${delTxt}</button>`;
    return editBtn + delBtn;
};

window.initRichTextEditor = (textareaId) => {
    const textarea = document.getElementById(textareaId);
    if (!textarea || textarea.dataset.rteAttached) return;
    
    if (!document.getElementById('rte-global-styles')) {
        const style = document.createElement('style');
        style.id = 'rte-global-styles';
        style.innerHTML = `
            .rich-text-content b, .rich-text-content strong, .rich-text-display b, .rich-text-display strong { font-weight: 900 !important; }
            .rich-text-content i, .rich-text-content em, .rich-text-display i, .rich-text-display em { font-style: italic !important; }
            .rich-text-content u, .rich-text-display u { text-decoration: underline !important; }
            .rich-text-content ul, .rich-text-display ul { list-style-type: disc !important; margin-left: 1.5rem !important; margin-bottom: 0.5rem !important; }
            .rich-text-content ol, .rich-text-display ol { list-style-type: decimal !important; margin-left: 1.5rem !important; margin-bottom: 0.5rem !important; }
            .rich-text-content a, .rich-text-display a { color: #d5a044 !important; text-decoration: underline !important; cursor: pointer !important; font-weight: bold !important;}
        `;
        document.head.appendChild(style);
    }

    if(textarea.nextElementSibling && textarea.nextElementSibling.classList.contains('rte-wrapper')) {
        textarea.nextElementSibling.remove();
    }

    const container = document.createElement('div');
    container.className = 'rte-wrapper border border-brand-border rounded-sm overflow-hidden flex flex-col mt-1 bg-white shadow-inner';

    const toolbar = document.createElement('div');
    toolbar.className = 'bg-gray-50 border-b border-gray-200 px-2 py-1.5 flex flex-wrap gap-1 items-center sticky top-0 z-10';
    toolbar.innerHTML = `
        <button type="button" onclick="document.execCommand('bold', false, null); return false;" class="px-2 py-1 text-sm hover:bg-gray-200 font-black rounded" title="In đậm (Ctrl+B)">B</button>
        <button type="button" onclick="document.execCommand('italic', false, null); return false;" class="px-2 py-1 text-sm hover:bg-gray-200 italic font-serif rounded" title="In nghiêng (Ctrl+I)">I</button>
        <button type="button" onclick="document.execCommand('underline', false, null); return false;" class="px-2 py-1 text-sm hover:bg-gray-200 underline rounded" title="Gạch chân (Ctrl+U)">U</button>
        <span class="w-px h-4 bg-gray-300 mx-1"></span>
        <button type="button" onclick="document.execCommand('insertUnorderedList', false, null); return false;" class="px-2 py-1 text-sm hover:bg-gray-200 rounded flex items-center gap-1" title="Danh sách có dấu chấm"><span>•</span> D.Sách</button>
        <span class="w-px h-4 bg-gray-300 mx-1"></span>
        <div class="flex items-center gap-1 bg-white border border-gray-200 px-1 rounded" title="Màu chữ">
            <span class="text-[11px] text-gray-500 font-bold">Màu:</span>
            <input type="color" onchange="document.execCommand('foreColor', false, this.value); return false;" class="w-5 h-5 p-0 border-0 cursor-pointer rounded bg-transparent">
        </div>
        <span class="w-px h-4 bg-gray-300 mx-1"></span>
        <button type="button" onclick="const url = prompt('Nhập đường link (URL):'); if(url) document.execCommand('createLink', false, url); return false;" class="px-2 py-1 text-sm hover:bg-gray-200 text-blue-600 underline rounded" title="Chèn Link">🔗 Link</button>
        <button type="button" onclick="document.execCommand('unlink', false, null); return false;" class="px-2 py-1 text-sm hover:bg-gray-200 text-red-500 rounded" title="Xóa Link">🚫</button>
    `;

    const editor = document.createElement('div');
    editor.className = 'p-4 min-h-[120px] max-h-[400px] overflow-y-auto bg-white outline-none text-sm rich-text-content custom-scrollbar leading-relaxed text-gray-700';
    editor.contentEditable = true;
    
    let val = textarea.value || '';
    if(val && !val.includes('<') && val.includes('\n')) val = val.replace(/\n/g, '<br>');
    editor.innerHTML = val;

    const syncData = () => { textarea.value = editor.innerHTML; };
    editor.addEventListener('input', syncData);
    editor.addEventListener('blur', syncData);
    editor.addEventListener('keyup', syncData);

    textarea.style.display = 'none';
    textarea.dataset.rteAttached = 'true';

    container.appendChild(toolbar);
    container.appendChild(editor);
    textarea.parentNode.insertBefore(container, textarea.nextSibling);
};

window.syncAllRichText = () => {
    document.querySelectorAll('.rich-text-content').forEach(editor => {
        const wrapper = editor.parentElement;
        if(wrapper && wrapper.previousElementSibling && wrapper.previousElementSibling.tagName === 'TEXTAREA') {
            wrapper.previousElementSibling.value = editor.innerHTML;
        }
    });
};

window.renderImageTags = (key) => {
    const state = window.imageManagers[key];
    const container = document.getElementById(state.containerId);
    if(!container) return;

    let html = `<div class="border-2 border-dashed border-gray-300 bg-[#fbfbfb] rounded-md p-4 mt-2 text-center relative group min-h-[120px] flex flex-col items-center justify-center transition-colors hover:bg-[#f4f4f4]"><div class="flex flex-wrap gap-2 justify-center w-full z-10 mb-4">`;

    state.oldImages.forEach((url, i) => {
        const urls = window.getSafeImgUrls(url);
        let onErrorScript = urls.fallback ? `if(!this.dataset.retried) { this.dataset.retried='true'; this.src='${urls.fallback}'; } else { this.src='https://placehold.co/40x40/ff0000/ffffff?text=L%E1%BB%96I'; this.parentElement.classList.add('bg-red-50', 'border-red-500'); }` : `this.src='https://placehold.co/40x40/ff0000/ffffff?text=L%E1%BB%96I'; this.parentElement.classList.add('bg-red-50', 'border-red-500');`;
        let displayId = "Ảnh đã lưu";
        if (url.includes('#')) {
            displayId = decodeURIComponent(url.split('#')[1]).replace(/^(TXC-P-[A-Z0-9]+-|Others-|GioiThieu-|TinTuc-)/, '');
        } else {
            const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) displayId = "Ảnh ..." + match[1].slice(-6); 
        }

        html += `<div class="flex items-center gap-1.5 bg-gray-100 border border-gray-300 px-2 py-1.5 rounded shadow-sm transition hover:bg-gray-200">
            <img src="${urls.primary}" class="w-8 h-8 object-contain bg-white rounded border border-gray-200" onerror="${onErrorScript}">
            <span class="text-[11px] text-gray-700 font-semibold truncate max-w-[120px]" title="${url}">${displayId}</span>
            <button type="button" onclick="window.removeImage('${key}', 'old', ${i})" class="text-red-500 hover:bg-red-100 w-5 h-5 rounded-full flex items-center justify-center font-bold transition">×</button>
        </div>`;
    });

    state.newFiles.forEach((file, i) => {
        const previewUrl = URL.createObjectURL(file);
        html += `<div class="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2 py-1.5 rounded shadow-sm transition hover:bg-blue-100">
            <img src="${previewUrl}" class="w-8 h-8 object-contain bg-white rounded border border-blue-200" onload="URL.revokeObjectURL(this.src)">
            <span class="text-[11px] text-blue-800 font-semibold truncate max-w-[120px]" title="${file.name}">${file.name}</span>
            <button type="button" onclick="window.removeImage('${key}', 'new', ${i})" class="text-red-500 hover:bg-red-100 w-5 h-5 rounded-full flex items-center justify-center font-bold transition">×</button>
        </div>`;
    });

    if(state.oldImages.length === 0 && state.newFiles.length === 0) {
        html += `<div class="text-gray-400 text-xs flex flex-col items-center pointer-events-none"><svg class="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span>Chưa có tệp nào được chọn</span></div>`;
    }

    html += `</div><button type="button" onclick="document.getElementById('${state.inputId}').click()" class="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-full shadow-sm text-xs font-bold hover:border-brand-gold hover:text-brand-gold transition-colors z-10 relative flex items-center gap-2 mx-auto"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>Chọn ảnh từ máy tính/điện thoại</button></div>`;

    container.innerHTML = html;
    const input = document.getElementById(state.inputId);
    if(input) input.style.display = 'none';
};

window.removeImage = (key, type, index) => {
    const state = window.imageManagers[key];
    if (type === 'old') state.deletedImages.push(state.oldImages.splice(index, 1)[0]);
    else state.newFiles.splice(index, 1);
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
            if (files.length > 0) { state.newFiles = state.newFiles.concat(files); window.renderImageTags(key); }
            e.target.value = ''; 
        });
        input.dataset.managerAttached = 'true';
    }
    window.renderImageTags(key);
}

function updateAdminBtnState() {
    const btn = document.querySelector('footer button[onclick="window.openLoginModal()"]');
    if(!btn) return;
    if(window.loggedInUser) { btn.innerHTML = `🧑‍💼 Chào, ${window.loggedInUser.username} | Quản Trị`; btn.onclick = window.toggleAdmin; } 
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
        document.getElementById('publicContainer').classList.add('hidden'); document.getElementById('adminSection').classList.remove('hidden');
        document.getElementById('adminWelcomeName').innerHTML = `Quản lý bán hàng: <strong class="text-red-700 font-extrabold uppercase drop-shadow-sm ml-1">${window.loggedInUser.username}</strong>`;
        window.buildAdminInterface(); window.scrollTo({ top: 0, behavior: 'smooth' });
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
            if(mapData.id === 'Admin') renderAdminAdmins();
            if(mapData.id === 'Vouchers') renderAdminVouchers();
        }
    });

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
    if(tabId === 'Admin') renderAdminAdmins();
    if(tabId === 'Vouchers') renderAdminVouchers();
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
    if(tabId === 'Admin') renderAdminAdmins();
    if(tabId === 'Vouchers') renderAdminVouchers();

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

function renderAdminUsers() {
    const view = document.getElementById('viewUsers');
    if(!view) return;
    const q = window.adminSearchQuery;
    const filtered = (window.globalUsers || []).filter(u => !q || (u.name||"").toLowerCase().includes(q) || (u.phone||"").toLowerCase().includes(q) || (u.email||"").toLowerCase().includes(q));
    
    let thead = `<th class="px-4 py-3 w-12 text-center">STT</th><th class="px-4 py-3">Tên Khách Hàng</th><th class="px-4 py-3">SĐT</th><th class="px-4 py-3">Email</th><th class="px-4 py-3">Địa chỉ</th><th class="px-4 py-3 text-center">Hành động</th>`;
    let tbody = '';
    filtered.forEach((u, index) => {
        let emailHtml = u.email ? u.email.split('\n-----\n').map(e => `<span class="block mb-1 bg-gray-100 px-1 rounded">${e}</span>`).join('') : '';
        let addressHtml = u.address ? u.address.split('\n-----\n').map(a => `<span class="block mb-1 bg-gray-100 px-1 rounded">${a}</span>`).join('') : '';
        
        tbody += `<tr class="hover:bg-gray-50 align-top"><td class="px-4 py-3 text-center font-bold text-gray-500">${index + 1}</td><td class="px-4 py-3 font-bold">${u.name} <span class="text-[10px] text-gray-400 block">${u.ma_kh || ""}</span></td><td class="px-4 py-3">${u.phone}</td><td class="px-4 py-3 text-gray-500 text-xs">${emailHtml}</td><td class="px-4 py-3 truncate max-w-[200px] text-xs whitespace-normal">${addressHtml}</td><td class="px-4 py-3 text-center whitespace-nowrap">${window.buildActionButtons('Users', u.id)}</td></tr>`;
    });
    view.innerHTML = `<div class="p-6">${window.wrapAdminTable(thead, tbody, 6)}</div>`;
}

function renderAdminNews() {
    const view = document.getElementById('viewNews');
    if(!view) return;
    const q = window.adminSearchQuery;
    const filtered = (window.globalAllNews || []).filter(n => !q || (n.title||"").toLowerCase().includes(q) || (n.category||"").toLowerCase().includes(q));
    
    let thead = `<th class="px-4 py-3 w-12 text-center">STT</th><th class="px-4 py-3">Phân loại</th><th class="px-4 py-3">Tiêu đề bài viết</th><th class="px-4 py-3">Ảnh</th><th class="px-4 py-3 text-center">Hành động</th>`;
    let tbody = '';
    filtered.forEach((n, index) => {
        let firstImg = n.images && n.images.length > 0 ? n.images[0] : n.image;
        let imgHtml = typeof window.buildSafeImage === 'function' ? window.buildSafeImage(firstImg, 'w-10 h-10 object-contain bg-white rounded shadow-sm border border-gray-300', 'LỖI') : `<img src="${firstImg}" class="w-10 h-10 object-contain bg-white rounded">`;
        tbody += `<tr class="hover:bg-gray-50"><td class="px-4 py-3 text-center font-bold text-gray-500">${index + 1}</td><td class="px-4 py-3 text-xs bg-gray-100 rounded px-2">${n.category}</td><td class="px-4 py-3 font-bold truncate max-w-[300px]">${n.title}</td><td class="px-4 py-3">${imgHtml}</td><td class="px-4 py-3 text-center whitespace-nowrap">${window.buildActionButtons('News', n.id, 'Cập Nhật')}</td></tr>`;
    });
    view.innerHTML = `<div class="p-6">${window.wrapAdminTable(thead, tbody, 5)}</div>`;
}

function renderAdminContact() {
    const view = document.getElementById('viewContact');
    if(!view) return;
    const q = window.adminSearchQuery;
    const filtered = (window.globalAllContacts || []).filter(c => !q || (c.key||"").toLowerCase().includes(q) || (c.value||"").toLowerCase().includes(q));
    
    let thead = `<th class="px-4 py-3 w-40">Mục Thông Tin</th><th class="px-4 py-3">Nội Dung</th><th class="px-4 py-3 text-center w-32">Hành động</th>`;
    let tbody = '';
    filtered.forEach(c => {
        let tmp = document.createElement("DIV"); tmp.innerHTML = c.value; let cleanText = tmp.textContent || tmp.innerText || "";
        tbody += `<tr class="hover:bg-gray-50"><td class="px-4 py-3 font-bold">${c.key}</td><td class="px-4 py-3 text-gray-700 truncate max-w-[300px]">${cleanText}</td><td class="px-4 py-3 text-center whitespace-nowrap">${window.buildActionButtons('Contact', c.id, 'Cập Nhật')}</td></tr>`;
    });
    view.innerHTML = `<div class="p-6">${window.wrapAdminTable(thead, tbody, 3)}</div>`;
}

function renderAdminAdmins() {
    const view = document.getElementById('viewAdmin');
    if(!view) return;
    const q = window.adminSearchQuery;
    const filtered = (window.globalAdmins || []).filter(a => !q || (a.username||"").toLowerCase().includes(q));
    const isC1 = window.loggedInUser && window.loggedInUser.role_code === 'C1';
    
    let thead = `<th class="px-4 py-3 w-12 text-center">ID</th><th class="px-4 py-3">Tên Đăng Nhập</th>${isC1 ? `<th class="px-4 py-3">Mật Khẩu</th>` : ``}<th class="px-4 py-3">Quyền Hạn</th><th class="px-4 py-3 text-center w-32">Hành động</th>`;
    let tbody = '';
    
    filtered.forEach(a => {
        let roleBadge = a.role_code === 'C1' ? 'bg-red-100 text-red-700' : (a.role_code === 'C2' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700');
        tbody += `<tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-center font-bold text-gray-500">${a.id}</td>
            <td class="px-4 py-3 font-bold flex items-center gap-2"><div class="w-8 h-8 rounded-full bg-brand-dark text-brand-gold flex items-center justify-center font-bold text-xs">${a.username.charAt(0).toUpperCase()}</div> ${a.username}</td>
            ${isC1 ? `<td class="px-4 py-3 font-mono text-gray-600">${a.password || '***'}</td>` : ``}
            <td class="px-4 py-3"><span class="px-2 py-1 rounded text-xs font-bold ${roleBadge}">${a.role_code} (${a.role_name || ''})</span></td>
            <td class="px-4 py-3 text-center whitespace-nowrap">${window.buildActionButtons('Admin', a.id)}</td>
        </tr>`;
    });

    view.innerHTML = `
    <div class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
                <h3 class="font-bold text-brand-dark mb-4 uppercase tracking-wider text-sm">Danh Sách Quản Trị Viên</h3>
                ${window.wrapAdminTable(thead, tbody, isC1 ? 5 : 4)}
            </div>
            <div class="lg:col-span-1 bg-brand-bg p-6 rounded border border-brand-border h-fit">
                <h3 class="font-bold text-brand-dark mb-4 uppercase tracking-wider text-sm">Thêm Người Quản Lý Mới</h3>
                <form id="adminAddAdminForm" onsubmit="window.handleAddAdmin(event)" class="space-y-4">
                    <div><label class="block text-xs font-bold text-gray-600 mb-1">Tên Đăng Nhập *</label><input type="text" id="addAdminUsername" required placeholder="VD: Tam Chau" class="w-full px-3 py-2 border border-brand-border outline-none rounded-sm focus:border-brand-gold"></div>
                    <div><label class="block text-xs font-bold text-gray-600 mb-1">Mật Khẩu *</label><input type="text" id="addAdminPassword" required placeholder="VD: Tamchau@123" class="w-full px-3 py-2 border border-brand-border outline-none rounded-sm focus:border-brand-gold"></div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1">Quyền Hạn *</label>
                        <select id="addAdminRole" class="w-full px-3 py-2 border border-brand-border outline-none rounded-sm focus:border-brand-gold">
                            <option value="C1">C1 (Cao Cấp)</option>
                            <option value="C2" selected>C2 (Quản Lý)</option>
                            <option value="C3">C3 (Nhân Viên)</option>
                        </select>
                    </div>
                    <button type="submit" class="w-full bg-brand-btn text-brand-gold font-bold py-3 hover:bg-black transition-colors shadow mt-2 rounded-full uppercase text-xs tracking-wider flex items-center justify-center gap-2"><span class="spinner-icon hidden"><svg class="animate-spin h-4 w-4 text-brand-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></span><span>+ THÊM QUẢN LÝ</span></button>
                </form>
            </div>
        </div>
    </div>`;
}

function renderAdminInfo() {
    const view = document.getElementById('viewInfo');
    if(!view) return;
    const q = window.adminSearchQuery;
    const i = window.globalAbout || {};
    if(q && !((i.title||"").toLowerCase().includes(q))) { view.innerHTML = `<div class="p-6 text-center text-gray-500">Không có kết quả.</div>`; return; }
    
    let firstImg = i.images && i.images.length > 0 ? i.images[0] : i.image;
    let imgHtml = typeof window.buildSafeImage === 'function' ? window.buildSafeImage(firstImg, 'w-16 h-16 object-contain bg-white rounded shadow-sm border border-gray-300', 'LỖI', '64x64') : `<img src="${firstImg}" class="w-16 h-16 object-contain bg-white rounded">`;
    let tmp = document.createElement("DIV"); tmp.innerHTML = (i.paragraphs||[]).join(' '); let cleanParas = tmp.textContent || tmp.innerText || "";
    
    let thead = `<th class="px-4 py-3 w-40">Tiêu đề</th><th class="px-4 py-3">Đoạn Văn (Nội dung)</th><th class="px-4 py-3">Dấu đầu dòng (Tính năng)</th><th class="px-4 py-3">Ảnh</th><th class="px-4 py-3 text-center w-24">Hành động</th>`;
    let tbody = `<tr class="hover:bg-gray-50"><td class="px-4 py-3 font-bold align-top">${i.title || ''}</td><td class="px-4 py-3 align-top text-xs truncate max-w-[200px]">${cleanParas}</td><td class="px-4 py-3 align-top text-xs truncate max-w-[150px]">${(i.bullets||[]).join(', ')}</td><td class="px-4 py-3 align-top">${imgHtml}</td><td class="px-4 py-3 text-center align-top whitespace-nowrap"><button onclick="window.openUniversalEdit('Info', '1')" class="text-blue-500 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded text-xs font-semibold w-full shadow-sm border border-blue-200">Sửa</button></td></tr>`;
    view.innerHTML = `<div class="p-6">${window.wrapAdminTable(thead, tbody, 5, 'w-full text-left text-sm min-w-[800px]')}</div>`;
}

function renderAdminProducts() {
    const tbody = document.getElementById('adminTableBody');
    if(!tbody) return;
    
    const q = window.adminSearchQuery;
    const filtered = (window.globalProducts || []).filter(p => !q || (p.name||"").toLowerCase().includes(q) || (p.period||"").toLowerCase().includes(q));
    
    let countBadge = document.getElementById('productCountBadge');
    if (countBadge) countBadge.innerText = filtered.length;
    tbody.innerHTML = '';
    
    const thead = tbody.previousElementSibling;
    if (thead) thead.innerHTML = `<tr><th class="px-4 py-3 font-semibold w-12 text-center">STT</th><th class="px-4 py-3 font-semibold">Hình ảnh</th><th class="px-4 py-3 font-semibold">Tên SP</th><th class="px-4 py-3 font-semibold">Giá</th><th class="px-4 py-3 font-semibold text-center text-blue-800">Tồn Kho</th><th class="px-4 py-3 font-semibold text-center w-32">Hành động</th></tr>`;

    if(filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>`; return; }
    
    filtered.forEach((p, index) => {
        let firstImage = (p.images && p.images.length > 0 && p.images[0].trim() !== '') ? p.images[0] : '';
        let thumbHTML = firstImage !== '' ? (typeof window.buildSafeImage === 'function' ? window.buildSafeImage(firstImage, 'w-10 h-10 rounded-full object-contain bg-white border border-gray-300', 'LỖI') : `<img src="${firstImage}" class="w-10 h-10 rounded-full object-contain bg-white">`) : `<div class="w-10 h-10 rounded-full bg-brand-bg text-brand-gold flex items-center justify-center">${p.symbol || '古'}</div>`;
        let stock = typeof window.getProductStock === 'function' ? window.getProductStock(p) : 0;
        let stockColor = stock <= 0 ? 'text-red-600 font-bold' : (stock < 10 ? 'text-orange-600 font-bold' : 'text-blue-700 font-bold');

        tbody.innerHTML += `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-center font-bold text-gray-500 align-top">${index + 1}</td>
            <td class="px-4 py-3 align-top">${thumbHTML}</td>
            <td class="px-4 py-3 font-medium text-brand-dark align-top">
                ${p.name}
                <div class="text-[10px] text-gray-500 font-normal mt-1 leading-relaxed bg-gray-50 p-1 rounded border border-gray-200">
                    🎟️ Voucher: <span class="font-bold">${p.vouchers || 'Không hỗ trợ'}</span><br>
                    🚚 Ship: <span class="font-bold">${p.shipping || '0đ'}</span>
                </div>
            </td>
            <td class="px-4 py-3 text-red-700 font-bold font-sans align-top">${p.price}</td>
            <td class="px-4 py-3 text-center ${stockColor} font-sans text-lg align-top">${stock}</td>
            <td class="px-4 py-3 text-center whitespace-nowrap align-top">${window.buildActionButtons('Products', p.id, 'Sửa', 'Xóa', `window.openEditProduct('${p.id}')`)}</td>
        </tr>`;
    });

    setTimeout(() => { 
        if (window.imageManagers && window.imageManagers.add) {
            window.imageManagers.add.oldImages = []; window.imageManagers.add.newFiles = []; 
            if(typeof window.initImageManager === 'function') window.initImageManager('add'); 
        }
        if(document.getElementById('addDesc') && typeof window.initRichTextEditor === 'function') window.initRichTextEditor('addDesc');
    }, 10);
}

function renderAdminOrders() {
    const view = document.getElementById('viewOrders');
    if(!view) return;
    
    const q = window.adminSearchQuery;
    const filtered = (window.globalOrders || []).filter(o => !q || (o.order_code||"").toLowerCase().includes(q) || (o.customer||"").toLowerCase().includes(q) || (o.phone||"").toLowerCase().includes(q));

    let thead = `<th class="px-4 py-3 w-10 text-center">STT</th><th class="px-4 py-3 w-44">Mã Đơn / Thời gian</th><th class="px-4 py-3 w-[24rem]">Thông tin khách hàng</th><th class="px-4 py-3">Sản phẩm</th><th class="px-4 py-3 font-sans w-28">Tổng Tiền</th><th class="px-4 py-3 text-center w-64">Trạng thái</th>`;
    let tbody = '';
    
    filtered.forEach((o, index) => {
        let pNames = (o.product || "").toString().split('\n');
        let pQtys = (o.qty || "").toString().split(/,|\n/); 
        
        let separator = (o.detail || "").includes('\n-----\n') ? '\n-----\n' : '\n';
        let pDetails = (o.detail || "").toString().split(separator);

        let fallbackShip = '0đ';

        let productsHTML = pNames.map((name, i) => {
            let q = pQtys[i] ? parseInt(pQtys[i].toString().trim()) || 1 : 1;
            let d = pDetails[i] ? pDetails[i].toString().trim() : '';
            let nameStr = name.includes('SL:') ? name.trim() : `SL: ${q} x ${name.trim()}`;
            
            let productBoxes = '';
            if (d) {
                let lines = d.split(/<br\s*\/?>|\n/);
                let giaGoc = '';
                let chietKhauVoucher = [];
                let otherLines = [];
                
                lines.forEach(line => {
                    let trimmed = line.trim();
                    if (!trimmed) return;
                    
                    if (trimmed.includes('Giá gốc:')) {
                        giaGoc = trimmed.split('Giá gốc:')[1].trim();
                    }
                    else if (trimmed.includes('Chiết khấu')) {
                        chietKhauVoucher.push({ label: trimmed.split(':')[0].trim(), val: trimmed.split(':')[1].trim(), color: 'text-orange-600' });
                    }
                    else if (trimmed.includes('Voucher')) {
                        chietKhauVoucher.push({ label: trimmed.split(':')[0].trim(), val: trimmed.split(':')[1].trim(), color: 'text-green-600' });
                    }
                    else if (trimmed.includes('Ship:')) {
                        fallbackShip = trimmed.split('Ship:')[1].trim(); 
                    }
                    else {
                        const isNameRepetition = trimmed.toLowerCase().includes(name.toLowerCase().replace('sl:', '').trim()) || /^\d+\s*x\s*/.test(trimmed);
                        if (!isNameRepetition) {
                            otherLines.push(trimmed);
                        }
                    }
                });

                if (giaGoc) {
                    productBoxes += `<div class="text-[12px] bg-white border border-gray-200 rounded p-2.5 mt-2 shadow-sm flex justify-between items-center"><span class="text-gray-500">Giá gốc:</span> <strong class="font-sans text-gray-800">${giaGoc}</strong></div>`;
                }

                if (chietKhauVoucher.length > 0) {
                    productBoxes += `<div class="text-[12px] bg-white border border-gray-200 rounded p-2.5 mt-1.5 shadow-sm space-y-1.5">`;
                    chietKhauVoucher.forEach(cv => {
                        productBoxes += `<div class="flex justify-between items-center"><span class="text-gray-500">${cv.label}:</span> <strong class="font-sans ${cv.color}">${cv.val}</strong></div>`;
                    });
                    productBoxes += `</div>`;
                }
                
                if (otherLines.length > 0) {
                    productBoxes += `<div class="text-[12px] bg-white border border-gray-200 rounded p-2 mt-2 shadow-sm">${otherLines.join('<br>')}</div>`;
                }
            }
            return `<div class="mb-5 last:mb-2"><span class="text-brand-dark font-bold text-[13px]">${nameStr}</span>${productBoxes}</div>`;
        }).join('');

        let finalShip = (o.note2 && o.note2.trim() !== '') ? o.note2 : fallbackShip;
        
        let globalBoxes = `<div class="text-[12px] bg-[#f0f9ff] border border-[#bae6fd] rounded p-2.5 mt-4 shadow-sm flex justify-between items-center">
            <span class="text-blue-800 font-bold uppercase tracking-wider text-[11px]">Phí Giao Hàng:</span> <strong class="font-sans text-blue-700">${finalShip}</strong>
        </div>`;

        if (o.notes) {
            globalBoxes += `<div class="text-[12px] bg-[#fffbeb] border border-[#fde68a] rounded p-3 mt-1.5 shadow-sm">
                <span class="text-yellow-800 font-bold uppercase tracking-wider text-[11px] block mb-1">📝 Ghi Chú Đơn Hàng:</span> 
                <span class="text-gray-700 italic leading-relaxed">${o.notes}</span>
            </div>`;
        }

        productsHTML += `<div class="border-t border-gray-200 border-dashed pt-1">${globalBoxes}</div>`;

        let methodValue = o.method || "COD"; 
        let paymentSelect = `<select id="payStatus_${o.id}" class="text-[11px] text-center border border-yellow-400 rounded p-1 outline-none focus:border-brand-gold bg-yellow-50 text-yellow-800 font-semibold w-full mb-1">
            <option value="COD" ${methodValue === 'COD' ? 'selected' : ''}>COD</option><option value="BANK: Chưa nhận chuyển khoản" ${(methodValue === 'BANK: Chưa nhận chuyển khoản' || methodValue === 'BANK') ? 'selected' : ''}>Bank: Chưa nhận CK</option><option value="BANK: Đã nhận chuyển khoản" ${methodValue === 'BANK: Đã nhận chuyển khoản' ? 'selected' : ''}>Bank: Đã nhận CK</option>
        </select>`;

        let deliverySelect = `<select id="status_${o.id}" class="text-[11px] text-center border border-gray-300 rounded p-1 outline-none focus:border-brand-gold bg-white w-full mb-2">
            <option value="Chưa Giao Hàng" ${o.status === 'Chưa Giao Hàng' || !o.status ? 'selected' : ''}>Chưa Giao Hàng</option><option value="Đang Giao Hàng" ${o.status === 'Đang Giao Hàng' ? 'selected' : ''}>Đang Giao Hàng</option><option value="Đã Giao Hàng" ${o.status === 'Đã Giao Hàng' ? 'selected' : ''}>Đã Giao Hàng</option>
        </select>`;

        tbody += `
        <tr class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 text-center font-bold text-gray-500 align-top">${index + 1}</td>
            <td class="px-4 py-3 align-top"><strong class="block text-brand-dark">${o.order_code}</strong><span class="text-xs text-gray-500 block mt-1">${o.date}</span></td>
            <td class="px-4 py-3 align-top text-xs leading-relaxed">
                <strong class="text-sm text-brand-dark">${o.customer}</strong> <span class="text-[10px] bg-gray-100 px-1 rounded text-gray-500">${o.ma_kh || "Chưa có"}</span><br>
                <span class="font-sans text-[#8c5a2b] font-bold text-[13px] tracking-wide">${o.phone}</span><br>
                <span class="text-gray-500">${o.email || 'Không có Email'}</span><br>
                <span class="text-gray-600 mt-1 block" title="${o.address}">${o.address}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-800 align-top">${productsHTML}</td>
            <td class="px-4 py-3 font-bold text-red-700 font-sans text-base align-top text-right">${o.total}</td>
            <td class="px-4 py-3 text-center flex flex-col justify-center items-center h-full align-top">${paymentSelect}${deliverySelect}<div class="flex gap-1 w-full"><button onclick="window.updateOrderStatus('${o.id}', this)" class="flex-1 text-blue-500 hover:text-white hover:bg-blue-500 border border-blue-500 px-2 py-1 rounded text-xs transition font-semibold whitespace-nowrap">Lưu</button><button onclick="window.deleteGenericData('Orders', '${o.id}', this)" class="flex-1 text-red-500 hover:text-white hover:bg-red-500 border border-red-500 px-2 py-1 rounded text-xs transition font-semibold whitespace-nowrap">Xóa</button></div></td>
        </tr>`;
    });
    view.innerHTML = `<div class="p-6">${window.wrapAdminTable(thead, tbody, 6, 'w-full text-left text-sm min-w-[1100px]')}</div>`;
}

function renderAdminVouchers() {
    const view = document.getElementById('viewVouchers');
    if(!view) return;
    const q = window.adminSearchQuery;
    const filtered = (window.globalVouchers || []).filter(v => !q || v.code.toLowerCase().includes(q));
    
    let thead = `<th class="px-4 py-3 w-10 text-center">ID</th><th class="px-4 py-3">Mã Voucher</th><th class="px-4 py-3">Mức Giảm</th><th class="px-4 py-3">Điều Kiện</th><th class="px-4 py-3 text-center">Hiệu Lực</th><th class="px-4 py-3 text-center">Đã Dùng</th><th class="px-4 py-3 text-center w-32">Hành động</th>`;
    let tbody = '';
    
    filtered.forEach((v, index) => {
        let formatCurr = typeof window.formatCurrency === 'function' ? window.formatCurrency : (val) => val + 'đ';
        let valStr = v.type === 'percent' ? v.value + '%' : formatCurr(v.value);
        let minStr = v.min_order > 0 ? `Đơn từ ${formatCurr(v.min_order)}` : `Mọi đơn hàng`;
        let usageStr = `${v.used} / ${v.max_usage > 0 ? v.max_usage : '∞'}`;
        let expiryStr = v.expiry ? v.expiry.replace(' - ', '<br>') : '<span class="text-green-600">Không giới hạn</span>';
        
        let now = Date.now();
        let statusColor = "text-gray-500";
        if(v.expiry) {
            try {
                let [sStr, eStr] = v.expiry.split(' - ');
                const parseD = (s) => { let [dP, tP] = s.trim().split(' '); let [d,m,y] = dP.split('/'); return new Date(`${y}-${m}-${d}T${tP}`).getTime(); };
                if (now < parseD(sStr)) statusColor = "text-yellow-600 font-bold";
                else if (now > parseD(eStr)) statusColor = "text-red-500 font-bold line-through";
                else statusColor = "text-green-600 font-bold";
            } catch(e) {}
        }

        tbody += `<tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-center font-bold text-gray-500">${v.id}</td>
            <td class="px-4 py-3 font-bold text-red-600 font-mono text-base">${v.code}</td>
            <td class="px-4 py-3 font-bold text-brand-dark">${valStr}</td>
            <td class="px-4 py-3 text-xs text-gray-600">${minStr}</td>
            <td class="px-4 py-3 text-center text-[11px] ${statusColor} leading-relaxed">${expiryStr}</td>
            <td class="px-4 py-3 text-center font-bold text-brand-dark">${usageStr}</td>
            <td class="px-4 py-3 text-center whitespace-nowrap">${window.buildActionButtons('Vouchers', v.id)}</td>
        </tr>`;
    });
    
    const container = document.getElementById('vouchersTableContainer');
    if(container) container.innerHTML = window.wrapAdminTable(thead, tbody, 7);
}

window.handleAddVoucher = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const oldText = btn.innerHTML; btn.innerHTML = "ĐANG LƯU..."; btn.disabled = true;

    const formatD = (val) => {
        const dObj = new Date(val);
        return `${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth()+1).padStart(2,'0')}/${dObj.getFullYear()} ${String(dObj.getHours()).padStart(2,'0')}:${String(dObj.getMinutes()).padStart(2,'0')}:00`;
    };

    const data = {
        code: document.getElementById('addVCode').value.toUpperCase().replace(/\s+/g,''),
        type: document.getElementById('addVType').value,
        value: document.getElementById('addVValue').value,
        min_order: document.getElementById('addVMin').value || 0,
        max_usage: document.getElementById('addVMax').value || 0,
        expiry: `${formatD(document.getElementById('addVStart').value)} - ${formatD(document.getElementById('addVEnd').value)}`
    };

    try {
        const res = await fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify({action: 'addVoucher', data: data, token: localStorage.getItem('tienxu_admin_token')}) });
        const result = await res.json();
        if(result.success) {
            if(typeof window.showToast === 'function') window.showToast("Thêm mã giảm giá thành công!", "success");
            e.target.reset(); localStorage.removeItem('tienxu_cached_webdata'); 
            if(typeof window.fetchAllData === 'function') window.fetchAllData();
        } else if(typeof window.showToast === 'function') window.showToast("Lỗi: " + result.message, "error");
    } catch(err) { if(typeof window.showToast === 'function') window.showToast("Lỗi mạng", "error"); }
    finally { btn.innerHTML = oldText; btn.disabled = false; }
};

window.handleAddAdmin = async (e) => {
    e.preventDefault();
    const isFullControl = (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("thêm") || (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("admin");
    if(!isFullControl) return typeof window.showToast === 'function' && window.showToast("Bạn không có quyền Thêm mới!", "error");

    const btn = e.target.querySelector('button[type="submit"]'); 
    const spinner = btn.querySelector('.spinner-icon'); const textSpan = btn.querySelectorAll('span')[1];
    const oldText = textSpan.innerText; textSpan.innerText = "ĐANG LƯU..."; btn.disabled = true; spinner.classList.remove('hidden');

    const data = {
        username: document.getElementById('addAdminUsername').value.trim(),
        password: document.getElementById('addAdminPassword').value.trim(),
        role: document.getElementById('addAdminRole').value
    };

    try {
        const res = await fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify({action: 'addAdmin', data: data, token: localStorage.getItem('tienxu_admin_token')}) });
        const result = await res.json();
        if(result.success) {
            if(typeof window.showToast === 'function') window.showToast("Thêm Quản Lý mới thành công!", "success");
            e.target.reset(); localStorage.removeItem('tienxu_cached_webdata'); 
            if(typeof window.fetchAllData === 'function') window.fetchAllData();
        } else if(typeof window.showToast === 'function') window.showToast("Lỗi: " + result.message, "error");
    } catch(err) { if(typeof window.showToast === 'function') window.showToast("Lỗi mạng", "error"); }
    finally { textSpan.innerText = oldText; btn.disabled = false; spinner.classList.add('hidden'); }
};

window.deleteGenericData = async (sheetName, id, btn) => {
    const isFullControl = (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("xóa") || (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("admin");
    if(!isFullControl) return typeof window.showToast === 'function' && window.showToast("Bạn không có quyền Xóa!", "error");
    const isConfirmed = typeof window.showConfirm === 'function' ? await window.showConfirm(`Xác nhận xóa dữ liệu khỏi bảng ${sheetName}? Hành động này sẽ không thể hoàn tác.`, "Cảnh Báo Xóa") : true;
    if(!isConfirmed) return;
    
    let originalText = "";
    if (btn) { originalText = btn.innerText; btn.innerText = "Đang xóa..."; btn.disabled = true; btn.classList.add('opacity-50', 'cursor-not-allowed'); }

    try {
        const token = localStorage.getItem('tienxu_admin_token');
        const response = await fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify({ action: 'deleteData', token: token, data: { sheetName: sheetName, id: id } }) });
        const res = await response.json();
        if(res.success) { 
            if(typeof window.showToast === 'function') window.showToast("Đã xóa dữ liệu thành công!", "success"); 
            localStorage.removeItem('tienxu_cached_webdata'); 
            if(typeof window.fetchAllData === 'function') window.fetchAllData(); 
        } 
        else if(typeof window.showToast === 'function') window.showToast("Lỗi: " + res.message, "error");
    } catch(e) { if(typeof window.showToast === 'function') window.showToast("Lỗi mạng.", "error"); }
    finally { if (btn) { btn.innerText = originalText; btn.disabled = false; btn.classList.remove('opacity-50', 'cursor-not-allowed'); } }
}

window.openUniversalEdit = (sheetName, id) => {
    window.currentEditSheet = sheetName; window.currentEditId = id; let html = ''; let title = "Cập Nhật";
    if (window.imageManagers && window.imageManagers.univ) {
        window.imageManagers.univ.oldImages = []; window.imageManagers.univ.newFiles = []; window.imageManagers.univ.deletedImages = [];
    }

    if (sheetName === 'Users') {
        const u = (window.globalUsers || []).find(x => x.id == id); title = `Khách Hàng: ${u.name}`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Tên Khách Hàng</label><input type="text" id="ue_name" value="${u.name}" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">SĐT</label><input type="text" id="ue_phone" value="${u.phone}" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Email (Các email cách nhau bởi \\n-----\\n)</label><textarea id="ue_email" rows="3" class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none">${u.email}</textarea></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Địa Chỉ (Các địa chỉ cách nhau bởi \\n-----\\n)</label><textarea id="ue_address" rows="3" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none resize-none">${u.address}</textarea></div>`;
    } else if (sheetName === 'Info') {
        const i = window.globalAbout || {}; title = `Sửa Giới Thiệu`;
        if (window.imageManagers && window.imageManagers.univ) {
            if (i.images && i.images.length > 0) window.imageManagers.univ.oldImages = [...i.images];
            else if (i.image) window.imageManagers.univ.oldImages.push(i.image);
        }
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Tiêu Đề</label><input type="text" id="ue_title" value="${i.title || ''}" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Đoạn Văn</label><textarea id="ue_paras" rows="6" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none">${(i.paragraphs || []).join('\n')}</textarea></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Dấu Đầu Dòng</label><textarea id="ue_bullets" rows="4" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none">${(i.bullets || []).join('\n')}</textarea></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Quản Lý Ảnh</label><input type="file" id="ue_image" accept="image/*" multiple class="hidden"></div>`;
    } else if (sheetName === 'News') {
        const n = (window.globalAllNews || []).find(x => x.id == id); title = `Cập Nhật Tin Tức`;
        if (window.imageManagers && window.imageManagers.univ && n) {
            if (n.images && n.images.length > 0) window.imageManagers.univ.oldImages = [...n.images];
            else if (n.image) window.imageManagers.univ.oldImages.push(n.image);
        }
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Phân Loại</label><input type="text" id="ue_category" value="${n ? n.category : ''}" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Tiêu Đề</label><input type="text" id="ue_title" value="${n ? n.title : ''}" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Nội dung</label><textarea id="ue_desc" rows="5" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none">${n ? n.desc : ''}</textarea></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Quản Lý Ảnh</label><input type="file" id="ue_image" accept="image/*" multiple class="hidden"></div>`;
    } else if (sheetName === 'Contact') {
        const c = (window.globalAllContacts || []).find(x => x.id == id); title = `Cập Nhật Liên Hệ`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Mục</label><input type="text" value="${c ? c.key : ''}" readonly class="w-full px-3 py-2 border bg-gray-50 rounded-sm outline-none cursor-not-allowed"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Nội Dung</label><textarea id="ue_val" rows="3" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none">${c ? c.value : ''}</textarea></div>`;
    } else if (sheetName === 'Admin') {
        const a = (window.globalAdmins || []).find(x => x.id == id); title = `Sửa Quản Trị Viên`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Tên Đăng Nhập Mới</label><input type="text" id="ue_username" value="${a ? a.username : ''}" required class="w-full px-3 py-2 border rounded-sm font-bold text-brand-dark focus:border-brand-gold outline-none"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Mật Khẩu</label><input type="text" id="ue_admin_password" value="${a ? (a.password || '') : ''}" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Quyền Hạn</label><select id="ue_role" class="w-full px-3 py-2 border rounded-sm outline-none focus:border-brand-gold"><option value="C1" ${a && a.role_code==='C1'?'selected':''}>C1 (Cao Cấp)</option><option value="C2" ${a && a.role_code==='C2'?'selected':''}>C2 (Quản Lý)</option><option value="C3" ${a && a.role_code==='C3'?'selected':''}>C3 (Nhân Viên)</option></select></div>`;
    } else if (sheetName === 'Vouchers') {
        const v = (window.globalVouchers || []).find(x => x.id == id); title = `Sửa Mã Giảm Giá`;
        let [sStr, eStr] = v && v.expiry ? v.expiry.split(' - ') : ["", ""];
        const pToLocal = (str) => { if(!str) return ""; try { let [dPart, tPart] = str.split(' '); let [d,m,y] = dPart.split('/'); return `${y}-${m}-${d}T${tPart}`; } catch(e) { return ""; } };
        
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Mã Voucher</label><input type="text" id="ue_vCode" value="${v ? v.code : ''}" required class="w-full px-3 py-2 border rounded-sm font-bold text-red-600 uppercase outline-none"></div>`;
        html += `<div class="grid grid-cols-2 gap-4"><div><label class="text-xs font-bold text-gray-600 mb-1 block">Loại</label><select id="ue_vType" class="w-full px-3 py-2 border rounded-sm outline-none"><option value="cash" ${v && v.type==='cash'?'selected':''}>Tiền mặt</option><option value="percent" ${v && v.type==='percent'?'selected':''}>Phần trăm</option></select></div>
                 <div><label class="text-xs font-bold text-gray-600 mb-1 block">Mức giảm</label><input type="number" id="ue_vValue" value="${v ? v.value : ''}" required class="w-full px-3 py-2 border rounded-sm outline-none"></div></div>`;
        html += `<div class="grid grid-cols-2 gap-4"><div><label class="text-xs font-bold text-gray-600 mb-1 block">Đơn Tối Thiểu</label><input type="number" id="ue_vMin" value="${v ? v.min_order : ''}" class="w-full px-3 py-2 border rounded-sm outline-none"></div>
                 <div><label class="text-xs font-bold text-gray-600 mb-1 block">Lượt Tối Đa</label><input type="number" id="ue_vMax" value="${v ? v.max_usage : ''}" class="w-full px-3 py-2 border rounded-sm outline-none"></div></div>`;
        html += `<div class="grid grid-cols-2 gap-4"><div><label class="text-xs font-bold text-gray-600 mb-1 block">Bắt đầu</label><input type="datetime-local" id="ue_vStart" value="${pToLocal(sStr)}" required class="w-full px-3 py-2 border rounded-sm outline-none text-sm"></div>
                 <div><label class="text-xs font-bold text-gray-600 mb-1 block">Kết thúc</label><input type="datetime-local" id="ue_vEnd" value="${pToLocal(eStr)}" required class="w-full px-3 py-2 border rounded-sm outline-none text-sm"></div></div>`;
    }

    const titleEl = document.getElementById('adminUniversalEditTitle');
    const fieldsEl = document.getElementById('adminUniversalEditFields');
    if (titleEl) titleEl.innerText = title;
    if (fieldsEl) fieldsEl.innerHTML = html;
    
    setTimeout(() => { 
        if(document.getElementById('ue_image') && typeof window.initImageManager === 'function') window.initImageManager('univ'); 
        if(document.getElementById('ue_desc') && typeof window.initRichTextEditor === 'function') window.initRichTextEditor('ue_desc');
        if(document.getElementById('ue_paras') && typeof window.initRichTextEditor === 'function') window.initRichTextEditor('ue_paras');
        if(document.getElementById('ue_val') && sheetName === 'Contact' && typeof window.initRichTextEditor === 'function') window.initRichTextEditor('ue_val');
    }, 10);

    const modal = document.getElementById('adminUniversalEditModal');
    const content = document.getElementById('adminUniversalEditContent');
    if (modal) modal.classList.remove('opacity-0', 'pointer-events-none');
    if (content) content.classList.remove('scale-95');
}

window.closeUniversalEdit = () => {
    const modal = document.getElementById('adminUniversalEditModal');
    const content = document.getElementById('adminUniversalEditContent');
    if (modal) modal.classList.add('opacity-0', 'pointer-events-none');
    if (content) content.classList.add('scale-95');
}

window.submitUniversalEdit = async (e) => {
    if (typeof window.syncAllRichText === 'function') window.syncAllRichText();
    e.preventDefault();
    const isFullControl = (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("sửa") || (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("admin");
    if(!isFullControl) return typeof window.showToast === 'function' && window.showToast("Bạn không có quyền Cập nhật!", "error");

    const btn = e.target.querySelector('button[type="submit"]'); 
    const spinner = btn.querySelector('.spinner-icon'); const textSpan = btn.querySelectorAll('span')[1];
    const oldText = textSpan.innerText; textSpan.innerText = "ĐANG LƯU..."; btn.disabled = true; spinner.classList.remove('hidden');

    const updates = {};
    const currentEditSheet = window.currentEditSheet;
    const currentEditId = window.currentEditId;

    if (currentEditSheet === 'Users') {
        updates[3] = document.getElementById('ue_name').value; updates[4] = document.getElementById('ue_address').value; updates[5] = document.getElementById('ue_phone').value; updates[6] = document.getElementById('ue_email').value;
    } else if (currentEditSheet === 'Info') {
        updates[1] = document.getElementById('ue_title').value; updates[2] = document.getElementById('ue_paras').value; updates[3] = document.getElementById('ue_bullets').value;
    } else if (currentEditSheet === 'News') {
        updates[1] = document.getElementById('ue_category').value; updates[2] = document.getElementById('ue_title').value; updates[3] = document.getElementById('ue_desc').value;
    } else if (currentEditSheet === 'Contact') {
        updates[2] = document.getElementById('ue_val').value; 
    } else if (currentEditSheet === 'Admin') {
        updates[2] = document.getElementById('ue_username').value; 
        updates[3] = document.getElementById('ue_admin_password').value; 
        updates[4] = document.getElementById('ue_role').value;
    } else if (currentEditSheet === 'Vouchers') {
        updates[2] = document.getElementById('ue_vCode').value.toUpperCase().replace(/\s+/g,'');
        updates[3] = document.getElementById('ue_vType').value;
        updates[4] = document.getElementById('ue_vValue').value;
        updates[5] = document.getElementById('ue_vMin').value || 0;
        updates[6] = document.getElementById('ue_vMax').value || 0;
        const formatD = (val) => { const dObj = new Date(val); return `${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth()+1).padStart(2,'0')}/${dObj.getFullYear()} ${String(dObj.getHours()).padStart(2,'0')}:${String(dObj.getMinutes()).padStart(2,'0')}:00`; };
        updates[8] = `${formatD(document.getElementById('ue_vStart').value)} - ${formatD(document.getElementById('ue_vEnd').value)}`;
    }

    let base64NewImages = [];
    if (window.imageManagers && window.imageManagers.univ && window.imageManagers.univ.newFiles.length > 0) {
        for (let i = 0; i < window.imageManagers.univ.newFiles.length; i++) { 
            if(typeof window.compressImage === 'function') base64NewImages.push(await window.compressImage(window.imageManagers.univ.newFiles[i])); 
        }
    }

    try {
        const data = { 
            sheetName: currentEditSheet, 
            id: currentEditId, 
            updates: updates, 
            newImages: base64NewImages, 
            keptImages: (window.imageManagers && window.imageManagers.univ) ? window.imageManagers.univ.oldImages : [], 
            deletedImages: (window.imageManagers && window.imageManagers.univ) ? window.imageManagers.univ.deletedImages : [] 
        };
        const response = await fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify({ action: 'editGenericData', token: localStorage.getItem('tienxu_admin_token'), data: data }) });
        const result = await response.json();
        if(result.success) { 
            if(typeof window.showToast === 'function') window.showToast("Cập nhật dữ liệu thành công!", "success"); 
            window.closeUniversalEdit(); 
            localStorage.removeItem('tienxu_cached_webdata'); 
            if(typeof window.fetchAllData === 'function') window.fetchAllData(); 
        } 
        else if(typeof window.showToast === 'function') window.showToast("Lỗi: " + result.message, "error");
    } catch (error) { if(typeof window.showToast === 'function') window.showToast("Lỗi mạng.", "error"); } 
    finally { textSpan.innerText = oldText; btn.disabled = false; spinner.classList.add('hidden'); }
}

window.handleAddProduct = async (e) => {
    if (typeof window.syncAllRichText === 'function') window.syncAllRichText();
    e.preventDefault();
    const isFullControl = (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("thêm") || (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("admin");
    if(!isFullControl) return typeof window.showToast === 'function' && window.showToast("Bạn không có quyền Thêm mới!", "error");
    
    const btn = e.target.querySelector('button[type="submit"]'); 
    const spinner = btn.querySelector('.spinner-icon'); const textSpan = btn.querySelectorAll('span')[1];
    const oldText = textSpan.innerText; textSpan.innerText = "ĐANG TẢI LÊN..."; btn.disabled = true; spinner.classList.remove('hidden');

    try {
        let base64Images = [];
        if (window.imageManagers && window.imageManagers.add && window.imageManagers.add.newFiles.length > 0) { 
            for (let i = 0; i < window.imageManagers.add.newFiles.length; i++) { 
                if(typeof window.compressImage === 'function') base64Images.push(await window.compressImage(window.imageManagers.add.newFiles[i])); 
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
            vouchers: document.getElementById('addVouchersAllowed') ? document.getElementById('addVouchersAllowed').value : '',
            shipping: document.getElementById('addShippingFee') ? document.getElementById('addShippingFee').value : '',
            other: document.getElementById('addOtherInfo') ? document.getElementById('addOtherInfo').value : '',
            images: base64Images 
        };
        const response = await fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify({ action: 'addProduct', token: localStorage.getItem('tienxu_admin_token'), data: productData }) });
        const result = await response.json();
        if(result.success) { 
            e.target.reset(); 
            if (document.getElementById('addDesc') && document.getElementById('addDesc').nextElementSibling && document.getElementById('addDesc').nextElementSibling.querySelector('.rich-text-content')) {
                 document.getElementById('addDesc').nextElementSibling.querySelector('.rich-text-content').innerHTML = '';
            }
            if (window.imageManagers && window.imageManagers.add) window.imageManagers.add.newFiles = []; 
            if (typeof window.renderImageTags === 'function') window.renderImageTags('add'); 
            if (typeof window.showToast === 'function') window.showToast("Đã thêm thành công!", "success"); 
            localStorage.removeItem('tienxu_cached_webdata'); 
            if(typeof window.fetchAllData === 'function') window.fetchAllData(); 
        } 
        else if(typeof window.showToast === 'function') window.showToast("Lỗi: " + result.message, "error");
    } catch (error) { if(typeof window.showToast === 'function') window.showToast("Lỗi mạng", "error"); } 
    finally { textSpan.innerText = oldText; btn.disabled = false; spinner.classList.add('hidden'); }
};

window.openEditProduct = (id) => {
    let product = (window.globalProducts || []).find(p => p.id == id); 
    if(!product) return;
    
    document.getElementById('editProductId').value = product.id; document.getElementById('editName').value = product.name; document.getElementById('editPrice').value = product.price; document.getElementById('editQty').value = product.qty || ''; document.getElementById('editYears').value = product.years; document.getElementById('editPeriod').value = product.period; document.getElementById('editSymbol').value = product.symbol; 
    document.getElementById('editDiscount').value = typeof window.getDiscountPercent === 'function' ? window.getDiscountPercent(product.discount) : (product.discount || ''); 
    document.getElementById('editDesc').value = product.desc;
    
    if(document.getElementById('editVouchersAllowed')) document.getElementById('editVouchersAllowed').value = product.vouchers || '';
    if(document.getElementById('editShippingFee')) document.getElementById('editShippingFee').value = product.shipping || '';
    if(document.getElementById('editOtherInfo')) document.getElementById('editOtherInfo').value = product.other || '';
    
    if (window.imageManagers) {
        window.imageManagers.edit = { oldImages: [...(product.images || []).filter(img => img.trim() !== '')], newFiles: [], deletedImages: [], containerId: 'editImageTagsContainer', inputId: 'editImages' };
    }
    if (typeof window.initImageManager === 'function') window.initImageManager('edit');
    
    const modal = document.getElementById('editProductModal');
    const content = document.getElementById('editProductContent');
    if (modal) modal.classList.remove('opacity-0', 'pointer-events-none'); 
    if (content) content.classList.remove('scale-95');

    setTimeout(() => { 
        const textarea = document.getElementById('editDesc');
        if(textarea && textarea.dataset.rteAttached && textarea.nextElementSibling && textarea.nextElementSibling.querySelector('.rich-text-content')) {
            let v = product.desc || '';
            if(v && !v.includes('<') && v.includes('\n')) v = v.replace(/\n/g, '<br>');
            textarea.nextElementSibling.querySelector('.rich-text-content').innerHTML = v;
        } else if (typeof window.initRichTextEditor === 'function') {
            window.initRichTextEditor('editDesc');
        }
    }, 10);
}

window.closeEditModal = () => { 
    const modal = document.getElementById('editProductModal');
    const content = document.getElementById('editProductContent');
    if (modal) modal.classList.add('opacity-0', 'pointer-events-none'); 
    if (content) content.classList.add('scale-95'); 
}

window.submitEditProduct = async (e) => {
    if (typeof window.syncAllRichText === 'function') window.syncAllRichText();
    e.preventDefault();
    const isFullControl = (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("sửa") || (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("admin");
    if(!isFullControl) return typeof window.showToast === 'function' && window.showToast("Bạn không có quyền Cập nhật!", "error");

    const btn = e.target.querySelector('button[type="submit"]'); 
    const spinner = btn.querySelector('.spinner-icon'); const textSpan = btn.querySelectorAll('span')[1];
    const oldText = textSpan.innerText; textSpan.innerText = "ĐANG CẬP NHẬT..."; btn.disabled = true; spinner.classList.remove('hidden');

    try {
        let base64NewImages = [];
        if (window.imageManagers && window.imageManagers.edit && window.imageManagers.edit.newFiles.length > 0) { 
            for (let i = 0; i < window.imageManagers.edit.newFiles.length; i++) { 
                if (typeof window.compressImage === 'function') base64NewImages.push(await window.compressImage(window.imageManagers.edit.newFiles[i])); 
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
            vouchers: document.getElementById('editVouchersAllowed') ? document.getElementById('editVouchersAllowed').value : '',
            shipping: document.getElementById('editShippingFee') ? document.getElementById('editShippingFee').value : '',
            other: document.getElementById('editOtherInfo') ? document.getElementById('editOtherInfo').value : '',
            keptImages: (window.imageManagers && window.imageManagers.edit) ? window.imageManagers.edit.oldImages : [], 
            deletedImages: (window.imageManagers && window.imageManagers.edit) ? window.imageManagers.edit.deletedImages : [], 
            newImages: base64NewImages 
        };
        const response = await fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify({ action: 'editProduct', token: localStorage.getItem('tienxu_admin_token'), data: productData }) });
        const result = await response.json();
        if(result.success) { 
            if(typeof window.showToast === 'function') window.showToast("Đã cập nhật thành công!", "success"); 
            window.closeEditModal(); 
            localStorage.removeItem('tienxu_cached_webdata'); 
            if(typeof window.fetchAllData === 'function') window.fetchAllData(); 
        } 
        else if(typeof window.showToast === 'function') window.showToast("Lỗi: " + result.message, "error");
    } catch (error) { if(typeof window.showToast === 'function') window.showToast("Lỗi mạng", "error"); } 
    finally { textSpan.innerText = oldText; btn.disabled = false; spinner.classList.add('hidden'); }
}

window.updateOrderStatus = async (id, btn) => {
    const isFullControl = (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("sửa") || (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("admin");
    if(!isFullControl) return typeof window.showToast === 'function' && window.showToast("Bạn không có quyền Cập nhật!", "error");
    
    const statusEl = document.getElementById(`status_${id}`);
    const payStatusEl = document.getElementById(`payStatus_${id}`);
    const newStatus = statusEl ? statusEl.value : '';
    const newPayStatus = payStatusEl ? payStatusEl.value : '';
    
    let originalText = "";
    if (btn) { originalText = btn.innerText; btn.innerText = "Đang lưu..."; btn.disabled = true; btn.classList.add('opacity-50', 'cursor-not-allowed'); }

    try {
        const res = await fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify({ action: 'updateOrderStatus', token: localStorage.getItem('tienxu_admin_token'), data: { id: id, status: newStatus, payment_status: newPayStatus } }) });
        const result = await res.json();
        if(result.success) { 
            if(typeof window.showToast === 'function') window.showToast("Cập nhật thành công!", "success"); 
            localStorage.removeItem('tienxu_cached_webdata'); 
            if(typeof window.fetchAllData === 'function') window.fetchAllData(); 
        } 
        else if(typeof window.showToast === 'function') window.showToast("Lỗi: " + result.message, "error");
    } catch(e) { if(typeof window.showToast === 'function') window.showToast("Lỗi mạng", "error"); } 
    finally { if (btn) { btn.innerText = originalText; btn.disabled = false; btn.classList.remove('opacity-50', 'cursor-not-allowed'); } }
};
