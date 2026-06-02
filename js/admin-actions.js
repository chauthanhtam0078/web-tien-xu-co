// ============================================================================
// 📁 MODULE 8.4: ADMIN ACTIONS (admin-actions.js)
// Xử lý các thao tác CRUD và form submission (Async / Cập nhật)
// ============================================================================

window.handleAddNews = async (e) => {
    if (typeof window.syncAllRichText === 'function') window.syncAllRichText();
    e.preventDefault();
    const isFullControl = (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("thêm") || (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("admin");
    if(!isFullControl) return typeof window.showToast === 'function' && window.showToast("Bạn không có quyền Thêm mới!", "error");

    const btn = e.target.querySelector('button[type="submit"]');
    const spinner = btn.querySelector('.spinner-icon'); const textSpan = btn.querySelectorAll('span')[1];
    const oldText = textSpan.innerText; textSpan.innerText = "ĐANG TẢI LÊN..."; btn.disabled = true; spinner.classList.remove('hidden');

    try {
        let images = [];
        if (window.imageManagers && window.imageManagers.addNews && window.imageManagers.addNews.newFiles.length > 0) {
            for (let i = 0; i < window.imageManagers.addNews.newFiles.length; i++) {
                const file = window.imageManagers.addNews.newFiles[i];
                if (typeof window.fileToBase64 === 'function') images.push({ name: file.name, data: await window.fileToBase64(file) });
            }
        }

        const newsData = {
            category: document.getElementById('addNewsCategory').value,
            title: document.getElementById('addNewsTitle').value,
            desc: window.cleanWordHTML(document.getElementById('addNewsDesc').value),
            images: images
        };
        const response = await fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify({ action: 'addNews', token: localStorage.getItem('tienxu_admin_token'), data: newsData }) });
        const result = await response.json();
        if(result.success) {
            e.target.reset();
            if (document.getElementById('addNewsDesc') && document.getElementById('addNewsDesc').nextElementSibling && document.getElementById('addNewsDesc').nextElementSibling.querySelector('.rich-text-content')) {
                document.getElementById('addNewsDesc').nextElementSibling.querySelector('.rich-text-content').innerHTML = '';
            }
            if (window.imageManagers && window.imageManagers.addNews) window.imageManagers.addNews.newFiles = [];
            if (typeof window.renderImageTags === 'function') window.renderImageTags('addNews');
            if (typeof window.showToast === 'function') window.showToast("Đã thêm tin tức!", "success");
            
            if (typeof window.fetchAllDataBackground === 'function') window.fetchAllDataBackground();
        } else if(typeof window.showToast === 'function') window.showToast("Lỗi: " + result.message, "error");
    } catch (error) { if(typeof window.showToast === 'function') window.showToast("Lỗi mạng", "error"); }
    finally { textSpan.innerText = oldText; btn.disabled = false; spinner.classList.add('hidden'); }
};

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
            e.target.reset(); 
            if(typeof window.fetchAllDataBackground === 'function') window.fetchAllDataBackground();
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
            e.target.reset(); 
            if(typeof window.fetchAllDataBackground === 'function') window.fetchAllDataBackground();
        } else if(typeof window.showToast === 'function') window.showToast("Lỗi: " + result.message, "error");
    } catch(err) { if(typeof window.showToast === 'function') window.showToast("Lỗi mạng", "error"); }
    finally { textSpan.innerText = oldText; btn.disabled = false; spinner.classList.add('hidden'); }
};

window.deleteGenericData = async (sheetName, id, btn) => {
    const isFullControl = (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("xóa") || (window.loggedInUser && window.loggedInUser.type ? window.loggedInUser.type : "").toLowerCase().includes("admin");
    if(!isFullControl) return typeof window.showToast === 'function' && window.showToast("Bạn không có quyền Xóa!", "error");
    
    // Đảm bảo tất cả hành động xóa từ các bảng chung đều phải gọi Confirm Box an toàn
    const isConfirmed = typeof window.showConfirm === 'function' ? await window.showConfirm(`Xác nhận xóa dữ liệu khỏi bảng ${sheetName}? Hành động này sẽ không thể hoàn tác.`, "Cảnh Báo Xóa") : confirm(`Xác nhận xóa dữ liệu khỏi bảng ${sheetName}? Hành động này sẽ không thể hoàn tác.`);
    if(!isConfirmed) return;
    
    let originalText = "";
    if (btn) { originalText = btn.innerText; btn.innerText = "Đang xóa..."; btn.disabled = true; btn.classList.add('opacity-50', 'cursor-not-allowed'); }

    try {
        const token = localStorage.getItem('tienxu_admin_token');
        const response = await fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify({ action: 'deleteData', token: token, data: { sheetName: sheetName, id: id } }) });
        const res = await response.json();
        if(res.success) { 
            if(typeof window.showToast === 'function') window.showToast("Đã xóa dữ liệu thành công!", "success"); 
            if(typeof window.fetchAllDataBackground === 'function') window.fetchAllDataBackground();
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
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Email (Các email cách nhau bởi \\n)</label><textarea id="ue_email" rows="3" class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none">${u.email}</textarea></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Địa Chỉ (Các địa chỉ cách nhau bởi \\n)</label><textarea id="ue_address" rows="3" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none resize-none">${u.address}</textarea></div>`;
        
        html += `<div class="grid grid-cols-3 gap-4 mt-2">
                    <div><label class="text-xs font-bold text-gray-600 mb-1 block">Tổng Đơn</label><input type="number" id="ue_orders_count" value="${u.orders_count || 0}" class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none"></div>
                    <div><label class="text-xs font-bold text-gray-600 mb-1 block">Cấp Độ</label><input type="text" id="ue_level" value="${u.level || ''}" class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none"></div>
                    <div><label class="text-xs font-bold text-gray-600 mb-1 block">Ưu Đãi</label><input type="text" id="ue_voucher" value="${u.voucher || ''}" class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none"></div>
                 </div>`;
    } else if (sheetName === 'Info') {
        const i = window.globalAbout || {}; title = `Sửa Giới Thiệu`;
        if (window.imageManagers && window.imageManagers.univ) {
            if (i.images && i.images.length > 0) window.imageManagers.univ.oldImages = [...i.images];
            else if (i.image) window.imageManagers.univ.oldImages.push(i.image);
        }
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Tiêu Đề</label><input type="text" id="ue_title" value="${i.title || ''}" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Đoạn Văn</label><textarea id="ue_paras" rows="6" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none">${(i.paragraphs || []).join('\n')}</textarea></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Dấu Đầu Dòng</label><textarea id="ue_bullets" rows="4" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none">${(i.bullets || []).join('\n')}</textarea></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Quản Lý Ảnh</label><input type="file" id="ue_image" accept="image/*" multiple class="w-full px-3 py-2 border border-brand-border bg-white focus:ring-1 focus:ring-brand-gold outline-none text-xs rounded-sm"></div>`;
    } else if (sheetName === 'News') {
        const n = (window.globalAllNews || []).find(x => x.id == id); title = `Cập Nhật Tin Tức`;
        if (window.imageManagers && window.imageManagers.univ && n) {
            if (n.images && n.images.length > 0) window.imageManagers.univ.oldImages = [...n.images];
            else if (n.image) window.imageManagers.univ.oldImages.push(n.image);
        }
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Phân Loại</label><input type="text" id="ue_category" value="${n ? n.category : ''}" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Tiêu Đề</label><input type="text" id="ue_title" value="${n ? n.title : ''}" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none"></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Nội dung</label><textarea id="ue_desc" rows="5" required class="w-full px-3 py-2 border rounded-sm focus:border-brand-gold outline-none">${n ? n.desc : ''}</textarea></div>`;
        html += `<div><label class="text-xs font-bold text-gray-600 mb-1 block">Quản Lý Ảnh</label><input type="file" id="ue_image" accept="image/*" multiple class="w-full px-3 py-2 border border-brand-border bg-white focus:ring-1 focus:ring-brand-gold outline-none text-xs rounded-sm"></div>`;
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
        updates[3] = document.getElementById('ue_name').value; 
        updates[4] = document.getElementById('ue_address').value; 
        updates[5] = document.getElementById('ue_phone').value; 
        updates[6] = document.getElementById('ue_email').value;
        updates[8] = document.getElementById('ue_orders_count').value;
        updates[9] = document.getElementById('ue_level').value;
        updates[10] = document.getElementById('ue_voucher').value;
    } else if (currentEditSheet === 'Info') {
        updates[1] = document.getElementById('ue_title').value; updates[2] = window.cleanWordHTML(document.getElementById('ue_paras').value); updates[3] = window.cleanWordHTML(document.getElementById('ue_bullets').value);
    } else if (currentEditSheet === 'News') {
        updates[1] = document.getElementById('ue_category').value; updates[2] = document.getElementById('ue_title').value; updates[3] = window.cleanWordHTML(document.getElementById('ue_desc').value);
    } else if (currentEditSheet === 'Contact') {
        updates[2] = window.cleanWordHTML(document.getElementById('ue_val').value); 
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

    let newImages = [];
    if (window.imageManagers && window.imageManagers.univ && window.imageManagers.univ.newFiles.length > 0) {
        for (let i = 0; i < window.imageManagers.univ.newFiles.length; i++) { 
            const file = window.imageManagers.univ.newFiles[i];
            if (typeof window.fileToBase64 === 'function') newImages.push({ name: file.name, data: await window.fileToBase64(file) }); 
        }
    }

    try {
        const data = { 
            sheetName: currentEditSheet, 
            id: currentEditId, 
            updates: updates, 
            newImages: newImages, 
            keptImages: (window.imageManagers && window.imageManagers.univ) ? window.imageManagers.univ.oldImages : [], 
            deletedImages: (window.imageManagers && window.imageManagers.univ) ? window.imageManagers.univ.deletedImages : [] 
        };
        const response = await fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify({ action: 'editGenericData', token: localStorage.getItem('tienxu_admin_token'), data: data }) });
        const result = await response.json();
        if(result.success) { 
            if(typeof window.showToast === 'function') window.showToast("Cập nhật dữ liệu thành công!", "success"); 
            window.closeUniversalEdit(); 
            if(typeof window.fetchAllDataBackground === 'function') window.fetchAllDataBackground();
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
        let images = [];
        if (window.imageManagers && window.imageManagers.add && window.imageManagers.add.newFiles.length > 0) { 
            for (let i = 0; i < window.imageManagers.add.newFiles.length; i++) { 
                const file = window.imageManagers.add.newFiles[i];
                if (typeof window.fileToBase64 === 'function') images.push({ name: file.name, data: await window.fileToBase64(file) }); 
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
            desc: window.cleanWordHTML(document.getElementById('addDesc').value), 
            vouchers: document.getElementById('addVouchersAllowed') ? document.getElementById('addVouchersAllowed').value : '',
            shipping: document.getElementById('addShippingFee') ? document.getElementById('addShippingFee').value : '',
            other: document.getElementById('addOtherInfo') ? document.getElementById('addOtherInfo').value : '',
            images: images 
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
            if(typeof window.fetchAllDataBackground === 'function') window.fetchAllDataBackground(); 
        } 
        else if(typeof window.showToast === 'function') window.showToast("Lỗi: " + result.message, "error");
    } catch (error) { if(typeof window.showToast === 'function') window.showToast("Lỗi mạng", "error"); } 
    finally { textSpan.innerText = oldText; btn.disabled = false; spinner.classList.add('hidden'); }
};

window.handleFeedbackStatusChange = async (feedbackId, newStatus) => {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify({
                action: 'updateFeedbackStatus',
                token: localStorage.getItem('tienxu_admin_token'),
                data: { id: feedbackId, status: newStatus }
            })
        });
        const result = await response.json();
        if(result.success) {
            if(typeof window.showToast === 'function') window.showToast('Cập nhật trạng thái thành công!', 'success');
            if(typeof window.fetchAllDataBackground === 'function') window.fetchAllDataBackground();
        } else {
            if(typeof window.showToast === 'function') window.showToast(result.message || 'Lỗi cập nhật!', 'error');
        }
    } catch (error) {
        if(typeof window.showToast === 'function') window.showToast('Lỗi mạng', 'error');
    }
};

window.handleDeleteFeedback = async (feedbackId) => {
    const isConfirmed = typeof window.showConfirm === 'function' ? await window.showConfirm('Bạn chắc chắn muốn xóa phản ánh này?', 'Cảnh Báo Xóa') : confirm('Bạn chắc chắn muốn xóa phản ánh này?');
    if(!isConfirmed) return;
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify({
                action: 'deleteFeedback',
                token: localStorage.getItem('tienxu_admin_token'),
                data: { id: feedbackId }
            })
        });
        const result = await response.json();
        if(result.success) {
            if(typeof window.showToast === 'function') window.showToast('Xóa phản ánh thành công!', 'success');
            if(typeof window.fetchAllDataBackground === 'function') window.fetchAllDataBackground();
        } else {
            if(typeof window.showToast === 'function') window.showToast(result.message || 'Lỗi xóa!', 'error');
        }
    } catch (error) {
        if(typeof window.showToast === 'function') window.showToast('Lỗi mạng', 'error');
    }
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
        let newImages = [];
        if (window.imageManagers && window.imageManagers.edit && window.imageManagers.edit.newFiles.length > 0) { 
            for (let i = 0; i < window.imageManagers.edit.newFiles.length; i++) { 
                const file = window.imageManagers.edit.newFiles[i];
                if (typeof window.fileToBase64 === 'function') newImages.push({ name: file.name, data: await window.fileToBase64(file) }); 
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
            desc: window.cleanWordHTML(document.getElementById('editDesc').value), 
            vouchers: document.getElementById('editVouchersAllowed') ? document.getElementById('editVouchersAllowed').value : '',
            shipping: document.getElementById('editShippingFee') ? document.getElementById('editShippingFee').value : '',
            other: document.getElementById('editOtherInfo') ? document.getElementById('editOtherInfo').value : '',
            keptImages: (window.imageManagers && window.imageManagers.edit) ? window.imageManagers.edit.oldImages : [], 
            deletedImages: (window.imageManagers && window.imageManagers.edit) ? window.imageManagers.edit.deletedImages : [], 
            newImages: newImages 
        };
        const response = await fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify({ action: 'editProduct', token: localStorage.getItem('tienxu_admin_token'), data: productData }) });
        const result = await response.json();
        if(result.success) { 
            if(typeof window.showToast === 'function') window.showToast("Đã cập nhật thành công!", "success"); 
            window.closeEditModal(); 
            if(typeof window.fetchAllDataBackground === 'function') window.fetchAllDataBackground(); 
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
            if(typeof window.fetchAllDataBackground === 'function') window.fetchAllDataBackground(); 
        } 
        else if(typeof window.showToast === 'function') window.showToast("Lỗi: " + result.message, "error");
    } catch(e) { if(typeof window.showToast === 'function') window.showToast("Lỗi mạng", "error"); } 
    finally { if (btn) { btn.innerText = originalText; btn.disabled = false; btn.classList.remove('opacity-50', 'cursor-not-allowed'); } }
};