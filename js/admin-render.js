// ============================================================================
// 📁 MODULE 8.3: ADMIN RENDER (admin-render.js)
// Hiển thị dữ liệu CMS (Read-only)
// ============================================================================

window.adminPagination = { Products: 1, Orders: 1, Users: 1, Logs: 1 };
const ITEMS_PER_PAGE = 20; // Số lượng Item mỗi trang trong Admin

function renderAdminLogs() {
    const view = document.getElementById('viewLogs');
    if(!view) return;
    const q = window.adminSearchQuery;
    const filtered = (window.globalLogs || []).filter(l => !q || (l.user||"").toLowerCase().includes(q) || (l.action||"").toLowerCase().includes(q) || (l.detail||"").toLowerCase().includes(q));

    let totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    let currentPage = window.adminPagination.Logs || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageData = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    let thead = `<th class="px-4 py-3 w-12 text-center">STT</th><th class="px-4 py-3 w-40">Thời gian</th><th class="px-4 py-3 w-32">Người thao tác</th><th class="px-4 py-3 w-48">Hành động</th><th class="px-4 py-3">Chi tiết</th>`;
    let tbody = '';
    
    pageData.forEach((l, index) => {
        let actualIndex = startIdx + index + 1;
        tbody += `<tr class="hover:bg-gray-50 align-top">
            <td class="px-4 py-3 text-center font-bold text-gray-500">${actualIndex}</td>
            <td class="px-4 py-3 text-sm text-gray-600">${l.time}</td>
            <td class="px-4 py-3 font-bold text-brand-dark">${l.user}</td>
            <td class="px-4 py-3 text-sm"><span class="bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">${l.action}</span></td>
            <td class="px-4 py-3 text-sm text-gray-600 leading-relaxed">${l.detail}</td>
        </tr>`;
    });
    
    let tableHtml = window.wrapAdminTable(thead, tbody, 5);
    let paginationHtml = window.buildPaginationUI('Logs', currentPage, totalPages);
    
    view.innerHTML = `<div><h3 class="font-bold text-brand-dark mb-4 uppercase tracking-wider text-sm flex justify-between"><span>Lịch Sử Hoạt Động Của Quản Trị Viên</span><span class="bg-brand-gold text-white px-2 py-0.5 rounded text-xs">${filtered.length} bản ghi</span></h3>${tableHtml}${paginationHtml}</div>`;
}

function renderAdminUsers() {
    const view = document.getElementById('viewUsers');
    if(!view) return;
    const q = window.adminSearchQuery;
    const filtered = (window.globalUsers || []).filter(u => !q || (u.name||"").toLowerCase().includes(q) || (u.phone||"").toLowerCase().includes(q) || (u.email||"").toLowerCase().includes(q));
    
    let totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    let currentPage = window.adminPagination.Users || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageData = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    let thead = `<th class="px-4 py-3 w-12 text-center">STT</th><th class="px-4 py-3">Tên Khách Hàng</th><th class="px-4 py-3">SĐT</th><th class="px-4 py-3">Email</th><th class="px-4 py-3">Địa chỉ</th><th class="px-4 py-3 text-center">Thống Kê</th><th class="px-4 py-3 text-center">Hành động</th>`;
    let tbody = '';
    
    pageData.forEach((u, index) => {
        let actualIndex = startIdx + index + 1;
        let emailHtml = u.email ? u.email.split('\n').map(e => `<span class="block mb-1 bg-gray-100 px-1 rounded">${e}</span>`).join('') : '';
        let addressHtml = u.address ? u.address.split('\n').map(a => `<span class="block mb-1 bg-gray-100 px-1 rounded">${a}</span>`).join('') : '';
        
        let statsHtml = `<span class="block text-xs">Đơn: <strong class="text-brand-dark">${u.orders_count || 0}</strong></span>
                         <span class="block text-xs">Cấp: <strong class="text-blue-600">${u.level || 'Chưa có'}</strong></span>
                         <span class="block text-xs">Mã: <strong class="text-red-600">${u.voucher || 'Không'}</strong></span>`;

        tbody += `<tr class="hover:bg-gray-50 align-top"><td class="px-4 py-3 text-center font-bold text-gray-500">${actualIndex}</td><td class="px-4 py-3 font-bold">${u.name} <span class="text-[10px] text-gray-400 block">${u.ma_kh || ""}</span></td><td class="px-4 py-3">${u.phone}</td><td class="px-4 py-3 text-gray-500 text-xs">${emailHtml}</td><td class="px-4 py-3 truncate max-w-[200px] text-xs whitespace-normal">${addressHtml}</td><td class="px-4 py-3 whitespace-nowrap">${statsHtml}</td><td class="px-4 py-3 text-center whitespace-nowrap">${window.buildActionButtons('Users', u.id)}</td></tr>`;
    });
    
    let tableHtml = window.wrapAdminTable(thead, tbody, 7);
    let paginationHtml = window.buildPaginationUI('Users', currentPage, totalPages);
    
    view.innerHTML = `<div>${tableHtml}${paginationHtml}</div>`;
}

function renderAdminNews() {
    const view = document.getElementById('viewNews');
    if(!view) return;
    const q = window.adminSearchQuery;
    const filtered = (window.globalAllNews || []).filter(n => !q || (n.title||"").toLowerCase().includes(q) || (n.category||"").toLowerCase().includes(q));
    // Render list and add-new form side-by-side
    let thead = `<th class="px-4 py-3 w-12 text-center">STT</th><th class="px-4 py-3">Phân loại</th><th class="px-4 py-3">Tiêu đề</th><th class="px-4 py-3">Ảnh</th><th class="px-4 py-3 text-center">Hành động</th>`;
    let tbody = '';
    filtered.forEach((n, index) => {
        let firstImg = n.images && n.images.length > 0 ? n.images[0] : n.image;
        let imgHtml = typeof window.buildSafeImage === 'function' ? window.buildSafeImage(firstImg, 'w-10 h-10 object-contain bg-white rounded shadow-sm border border-gray-300', 'LỖI') : `<img src="${firstImg}" class="w-10 h-10 object-contain bg-white rounded">`;
        tbody += `<tr class="hover:bg-gray-50"><td class="px-4 py-3 text-center font-bold text-gray-500">${index + 1}</td><td class="px-4 py-3 text-xs bg-gray-100 rounded px-2">${n.category}</td><td class="px-4 py-3 font-bold truncate max-w-[300px]">${n.title}</td><td class="px-4 py-3">${imgHtml}</td><td class="px-4 py-3 text-center whitespace-nowrap">${window.buildActionButtons('News', n.id, 'Cập Nhật')}</td></tr>`;
    });

    const listHtml = `<div><h3 class="font-bold text-brand-dark mb-4 uppercase tracking-wider text-sm">Danh Sách Tin Tức</h3>${window.wrapAdminTable(thead, tbody, 5)}</div>`;

    const addFormHtml = `
        <div class="bg-brand-bg p-6 rounded border border-brand-border h-fit">
            <h3 class="font-bold text-brand-dark mb-4 uppercase tracking-wider text-sm">Thêm Tin Mới</h3>
            <form id="adminAddNewsForm" onsubmit="window.handleAddNews(event)" class="space-y-4">
                <div><label class="block text-xs font-bold text-gray-600 mb-1">Phân Loại *</label><input type="text" id="addNewsCategory" required class="w-full px-3 py-2 border border-brand-border outline-none rounded-sm"></div>
                <div><label class="block text-xs font-bold text-gray-600 mb-1">Tiêu Đề *</label><input type="text" id="addNewsTitle" required class="w-full px-3 py-2 border border-brand-border outline-none rounded-sm font-bold"></div>
                <div><label class="block text-xs font-bold text-gray-600 mb-1">Nội Dung</label><textarea id="addNewsDesc" rows="5" class="w-full px-3 py-2 border border-brand-border outline-none rounded-sm"></textarea></div>
                <div><label class="block text-xs font-bold text-gray-600 mb-1">Quản Lý Ảnh</label><input type="file" id="addNewsImages" accept="image/*" multiple class="w-full px-3 py-2 border border-brand-border bg-white outline-none text-xs rounded-sm"></div>
            </form>
            <div id="addNewsImageTagsContainer"></div>
            <button form="adminAddNewsForm" type="submit" class="w-full bg-brand-btn text-brand-gold font-bold py-3 hover:bg-black transition-colors shadow mt-2 rounded-full uppercase text-xs flex items-center justify-center gap-2"><span class="spinner-icon hidden">...</span><span>+ THÊM TIN TỨC</span></button>
        </div>`;

    view.innerHTML = `<div class="grid grid-cols-1 lg:grid-cols-3 gap-8"><div class="lg:col-span-2">${listHtml}</div><div class="lg:col-span-1">${addFormHtml}</div></div>`;

    setTimeout(() => { if(typeof window.initImageManager === 'function') window.initImageManager('addNews'); if(document.getElementById('addNewsDesc') && typeof window.initRichTextEditor === 'function') window.initRichTextEditor('addNewsDesc'); }, 10);
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
    view.innerHTML = `<div>${window.wrapAdminTable(thead, tbody, 3)}</div>`;
}

function renderAdminFeedback() {
    const view = document.getElementById('viewFeedback');
    if(!view) return;
    const q = window.adminSearchQuery;
    const filtered = (window.globalAllFeedback || []).filter(f => !q || (f.name||"").toLowerCase().includes(q) || (f.phone||"").toLowerCase().includes(q) || (f.content||"").toLowerCase().includes(q));
    
    let thead = `<th class="px-4 py-3 w-12 text-center">STT</th><th class="px-4 py-3 w-32">Tên Khách Hàng</th><th class="px-4 py-3 w-24">Số Điện Thoại</th><th class="px-4 py-3">Nội Dung Tư Vấn</th><th class="px-4 py-3 w-32">Thời Gian Gửi</th><th class="px-4 py-3 w-32">Trạng Thái</th><th class="px-4 py-3 text-center w-20">Hành động</th>`;
    let tbody = '';
    filtered.forEach((f, idx) => {
        const statusClass = f.status === 'Chưa Xử Lý' ? 'bg-red-50 text-red-700' : f.status === 'Đang Xử Lý' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700';
        tbody += `<tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-center font-bold">${idx + 1}</td>
            <td class="px-4 py-3 font-semibold">${f.name || 'N/A'}</td>
            <td class="px-4 py-3 text-sm">${f.phone || 'N/A'}</td>
            <td class="px-4 py-3 text-gray-700 text-sm max-w-[200px] truncate" title="${f.content || ''}">${f.content || 'N/A'}</td>
            <td class="px-4 py-3 text-sm whitespace-nowrap">${f.sentTime || 'N/A'}</td>
            <td class="px-4 py-3">
                <select onchange="window.handleFeedbackStatusChange('${f.id}', this.value)" class="${statusClass} px-3 py-1 border border-current rounded text-sm font-semibold cursor-pointer focus:outline-none">
                    <option value="Chưa Xử Lý" ${f.status === 'Chưa Xử Lý' ? 'selected' : ''}>Chưa Xử Lý</option>
                    <option value="Đang Xử Lý" ${f.status === 'Đang Xử Lý' ? 'selected' : ''}>Đang Xử Lý</option>
                    <option value="Đã Xử Lý" ${f.status === 'Đã Xử Lý' ? 'selected' : ''}>Đã Xử Lý</option>
                </select>
            </td>
            <td class="px-4 py-3 text-center whitespace-nowrap">
                <button onclick="window.handleDeleteFeedback('${f.id}')" class="text-red-600 hover:text-red-800 font-bold text-lg" title="Xóa"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
    view.innerHTML = `<div>${window.wrapAdminTable(thead, tbody, 7)}</div>`;
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
    <div>
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
    if(q && !((i.title||"").toLowerCase().includes(q))) { view.innerHTML = `<div  text-center text-gray-500">Không có kết quả.</div>`; return; }
    
    let firstImg = i.images && i.images.length > 0 ? i.images[0] : i.image;
    let imgHtml = typeof window.buildSafeImage === 'function' ? window.buildSafeImage(firstImg, 'w-16 h-16 object-contain bg-white rounded shadow-sm border border-gray-300', 'LỖI', '64x64') : `<img src="${firstImg}" class="w-16 h-16 object-contain bg-white rounded">`;
    let tmp = document.createElement("DIV"); tmp.innerHTML = (i.paragraphs||[]).join(' '); let cleanParas = tmp.textContent || tmp.innerText || "";
    
    let thead = `<th class="px-4 py-3 w-40">Tiêu đề</th><th class="px-4 py-3">Đoạn Văn (Nội dung)</th><th class="px-4 py-3">Dấu đầu dòng (Tính năng)</th><th class="px-4 py-3">Ảnh</th><th class="px-4 py-3 text-center w-24">Hành động</th>`;
    let tbody = `<tr class="hover:bg-gray-50"><td class="px-4 py-3 font-bold align-top">${i.title || ''}</td><td class="px-4 py-3 align-top text-xs truncate max-w-[200px]">${cleanParas}</td><td class="px-4 py-3 align-top text-xs truncate max-w-[150px]">${(i.bullets||[]).join(', ')}</td><td class="px-4 py-3 align-top">${imgHtml}</td><td class="px-4 py-3 text-center align-top whitespace-nowrap"><button onclick="window.openUniversalEdit('Info', '1')" class="text-blue-500 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded text-xs font-semibold w-full shadow-sm border border-blue-200">Sửa</button></td></tr>`;
    view.innerHTML = `<div>${window.wrapAdminTable(thead, tbody, 5, 'w-full text-left text-sm min-w-[800px]')}</div>`;
}

function renderAdminProducts() {
    const view = document.getElementById('viewProducts');
    if(!view) return;
    
    const q = window.adminSearchQuery;
    const filtered = (window.globalProducts || []).filter(p => !q || (p.name||"").toLowerCase().includes(q) || (p.period||"").toLowerCase().includes(q));
    
    let totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    let currentPage = window.adminPagination.Products || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageData = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    let thead = `<th class="px-4 py-3 font-semibold w-12 text-center">STT</th><th class="px-4 py-3 font-semibold">Hình ảnh</th><th class="px-4 py-3 font-semibold">Tên SP</th><th class="px-4 py-3 font-semibold">Giá</th><th class="px-4 py-3 font-semibold text-center text-blue-800">Tồn Kho</th><th class="px-4 py-3 font-semibold text-center w-32">Hành động</th>`;
    let tbody = '';
    
    pageData.forEach((p, index) => {
        let actualIndex = startIdx + index + 1;
        let firstImage = (p.images && p.images.length > 0 && p.images[0].trim() !== '') ? p.images[0] : '';
        let thumbHTML = firstImage !== '' ? (typeof window.buildSafeImage === 'function' ? window.buildSafeImage(firstImage, 'w-10 h-10 rounded-full object-contain bg-white border border-gray-300', 'LỖI') : `<img src="${firstImage}" class="w-10 h-10 rounded-full object-contain bg-white">`) : `<div class="w-10 h-10 rounded-full bg-brand-bg text-brand-gold flex items-center justify-center">${p.symbol || '古'}</div>`;
        let stock = typeof window.getProductStock === 'function' ? window.getProductStock(p) : 0;
        let stockColor = stock <= 0 ? 'text-red-600 font-bold' : (stock < 10 ? 'text-orange-600 font-bold' : 'text-blue-700 font-bold');

        tbody += `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-center font-bold text-gray-500 align-top">${actualIndex}</td>
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

    let countBadge = document.getElementById('productCountBadge');
    if (countBadge) countBadge.innerText = filtered.length;

    let tableHtml = window.wrapAdminTable(thead, tbody, 6, 'w-full text-left text-sm min-w-[600px]');
    let paginationHtml = window.buildPaginationUI('Products', currentPage, totalPages);
    
    // Tìm container chứa Table và Pagination để gán HTML (dựa trên layout HTML admin)
    const tableContainer = view.querySelector('.lg\\:col-span-3');
    if (tableContainer) {
        tableContainer.innerHTML = `<h3 class="font-bold text-brand-dark mb-4 uppercase tracking-wider text-sm flex justify-between"><span>Kho Hàng Hiện Tại</span><span id="productCountBadge" class="bg-brand-gold text-white px-2 py-0.5 rounded text-xs">${filtered.length}</span></h3>${tableHtml}${paginationHtml}`;
    }

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

    let totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    let currentPage = window.adminPagination.Orders || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageData = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    let thead = `<th class="px-4 py-3 w-10 text-center">STT</th><th class="px-4 py-3 w-44">Mã Đơn / Thời gian</th><th class="px-4 py-3 w-[24rem]">Thông tin khách hàng</th><th class="px-4 py-3">Sản phẩm</th><th class="px-4 py-3 font-sans w-28">Tổng Tiền</th><th class="px-4 py-3 text-center w-64">Trạng thái</th>`;
    let tbody = '';
    
    pageData.forEach((o, index) => {
        let actualIndex = startIdx + index + 1;
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
            <td class="px-4 py-3 text-center font-bold text-gray-500 align-top">${actualIndex}</td>
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
    
    let tableHtml = window.wrapAdminTable(thead, tbody, 6, 'w-full text-left text-sm min-w-[1100px]');
    let paginationHtml = window.buildPaginationUI('Orders', currentPage, totalPages);
    
    view.innerHTML = `<div>${tableHtml}${paginationHtml}</div>`;
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

window.changeAdminPage = (tabId, page) => {
    window.adminPagination[tabId] = page;
    if(tabId === 'Products') renderAdminProducts();
    if(tabId === 'Orders') renderAdminOrders();
    if(tabId === 'Users') renderAdminUsers();
    if(tabId === 'Logs') renderAdminLogs();
};