// ============================================================================
// 📁 MODULE 4.2: UI PAGES (ui-pages.js)
// Điều hướng trang (switchPage, SEO động) + Tra cứu đơn hàng
// ============================================================================

window.switchPage = (pageId, pushState = true) => {
    if (typeof isAdminActive !== 'undefined' && isAdminActive) { 
        isAdminActive = false; 
        document.getElementById('adminSection').classList.add('hidden'); 
        document.getElementById('publicContainer').classList.remove('hidden'); 
    }
    
    if (pushState) history.pushState({page: pageId}, '', `?page=${pageId}`);
    
    const seoData = {
        'home': { title: 'Tiền Xu Cổ Việt Nam - Trang Chủ', desc: 'Sưu tầm tiền xu cổ Việt Nam chính hãng, mang lại giá trị sưu tầm và phong thủy cao nhất.' },
        'about': { title: 'Giới Thiệu - Văn Minh Việt Sử Hội', desc: 'Sứ mệnh bảo tồn lịch sử qua từng đồng tiền cổ Việt Nam.' },
        'products': { title: 'Tất Cả Sản Phẩm - Tiền Xu Cổ', desc: 'Khám phá bộ sưu tập tiền cổ đa dạng các triều đại phong kiến Việt Nam.' },
        'news': { title: 'Tin Tức & Kiến Thức Sưu Tầm', desc: 'Cập nhật kiến thức lịch sử, phong thủy, và cách nhận biết tiền cổ thật giả.' },
        'tracking': { title: 'Tra Cứu Đơn Hàng', desc: 'Kiểm tra trạng thái vận chuyển đơn hàng tiền xu cổ của bạn.' },
        'contact': { title: 'Liên Hệ Với Chúng Tôi', desc: 'Hotline/Zalo hỗ trợ tư vấn tiền xu cổ 24/7.' },
        'search': { title: 'Kết Quả Tìm Kiếm', desc: 'Kết quả tìm kiếm sản phẩm và bài viết.' },
        'profile': { title: 'Tài Khoản Của Tôi', desc: 'Quản lý thông tin và lịch sử đơn hàng của bạn.' }
    };
    
    const seo = seoData[pageId] || seoData['home'];
    window.updatePageMetadata(seo.title, seo.desc);

    if (typeof fbq === 'function') fbq('track', 'ViewContent', { page_name: pageId });
    if (typeof gtag === 'function') gtag('event', 'page_view', { page_title: seo.title, page_location: window.location.href });

    if(pageId !== 'products' && pageId !== 'search') {
        document.getElementById('searchInput').value = '';
        window.filteredProducts = null;
        window.currentProductPage = 1; 
        if (pageId !== 'profile') window.renderPublicGrid(); 
    }

    if (pageId === 'products') {
        window.currentProductPage = 1; 
        window.renderPublicGrid();
    }

    if (pageId === 'profile') {
        if (!window.loggedCustomer) {
            window.switchPage('home');
            window.openCustomerModal();
            return;
        }
        window.renderProfilePage();
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

window.handleTrackOrder = async function() {
    const inputEl = document.getElementById('trackingCodeInput');
    const resultEl = document.getElementById('trackingResult');
    if (!inputEl || !resultEl) return;

    const query = inputEl.value.trim().toLowerCase();
    if (query === "") {
        if (typeof window.showToast === 'function') window.showToast("Vui lòng nhập thông tin tra cứu!", "info");
        return;
    }

    resultEl.classList.remove('hidden');
    resultEl.innerHTML = `<div class="loader mb-3"></div><p class="text-sm text-gray-500 font-medium animate-pulse">Đang đồng bộ dữ liệu mới nhất...</p>`;

    // Force fetch new data before processing tracking
    if (typeof window.fetchAllData === 'function') {
        await window.fetchAllData(true);
    }

    const orders = window.globalOrders || [];
    const matchedOrders = orders.filter(o => 
        (o.order_code && o.order_code.toLowerCase().includes(query)) ||
        (o.phone && o.phone.toLowerCase().includes(query)) ||
        (o.customer && o.customer.toLowerCase().includes(query))
    );

    if (matchedOrders.length === 0) {
        resultEl.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-600 rounded-md p-6 w-full text-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p class="font-bold text-lg mb-1">Không tìm thấy đơn hàng</p>
                <p class="text-sm opacity-80">Chúng tôi không tìm thấy đơn hàng nào khớp với thông tin "${query}". Vui lòng kiểm tra lại SĐT hoặc Mã đơn hàng.</p>
            </div>`;
        return;
    }

    let resultHtml = `<h4 class="font-bold text-[#8c5a2b] mb-4 uppercase tracking-wider text-sm w-full text-left border-b border-[#d8ccb8] pb-2">Tìm thấy ${matchedOrders.length} đơn hàng</h4><div class="w-full space-y-5">`;
    
    matchedOrders.forEach(o => {
        let statusColor = o.status === 'Đã Giao Hàng' ? 'text-green-700 bg-green-50 border-green-200' : (o.status === 'Đang Giao Hàng' ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-orange-700 bg-orange-50 border-orange-200');
        
        let rawMethod = o.method || '';
        let displayMethod = rawMethod;
        let payColor = rawMethod.includes('Đã nhận') ? 'text-green-600' : 'text-red-600';

        if (rawMethod.toUpperCase().includes('BANK')) {
            displayMethod = 'Chuyển Khoản';
        } else if (rawMethod.toUpperCase() === 'COD') {
            displayMethod = 'Thanh Toán Khi Giao Hàng';
            payColor = 'text-gray-600';
        }

        let pNames = (o.product || "").toString().split('\n');
        let pQtys = (o.qty || "").toString().split(/,|\n/); 
        let separator = (o.detail || "").includes('\n-----\n') ? '\n-----\n' : '\n';
        let pDetails = (o.detail || "").toString().split(separator);

        let fallbackShip = '0đ';

        // XÂY DỰNG CHI TIẾT TỪNG SẢN PHẨM
        let productsHTML = pNames.map((name, i) => {
            let q = pQtys[i] ? parseInt(pQtys[i].toString().trim()) || 1 : 1;
            let d = pDetails[i] ? pDetails[i].toString().trim() : '';
            let nameStr = name.includes('SL:') ? name.trim() : `SL: ${q} x ${name.trim()}`;
            
            let productBoxes = '';
            if (d) {
                let lines = d.split(/<br\s*\/?>|\n/);
                let giaGoc = '';
                let chietKhauVoucher = [];
                
                lines.forEach(line => {
                    let trimmed = line.trim();
                    if (trimmed.includes('Giá gốc:')) giaGoc = trimmed.split('Giá gốc:')[1].trim();
                    else if (trimmed.includes('Chiết khấu')) chietKhauVoucher.push({ label: trimmed.split(':')[0].trim(), val: trimmed.split(':')[1].trim(), color: 'text-orange-600' });
                    else if (trimmed.includes('Voucher')) chietKhauVoucher.push({ label: trimmed.split(':')[0].trim(), val: trimmed.split(':')[1].trim(), color: 'text-green-600' });
                    else if (trimmed.includes('Ship:')) fallbackShip = trimmed.split('Ship:')[1].trim(); 
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
            }
            return `<div class="mb-5 last:mb-2"><span class="text-brand-dark font-bold text-[13px]">${nameStr}</span>${productBoxes}</div>`;
        }).join('');

        // XÂY DỰNG KHUNG CHUNG DƯỚI CÙNG CHO PHÍ SHIP VÀ GHI CHÚ
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
        
        resultHtml += `
        <div class="bg-white border border-[#d8ccb8] p-5 md:p-6 rounded-md text-left shadow-sm relative hover:shadow-md transition-shadow">
            <div class="absolute top-5 right-5 text-[11px] font-bold px-3 py-1.5 rounded border ${statusColor} shadow-sm uppercase tracking-wider">${o.status || 'Chưa Giao Hàng'}</div>
            <div class="mb-6 border-b border-gray-100 pb-5 pr-36">
                <p class="text-brand-dark font-bold text-xl mb-1">${o.order_code}</p>
                <p class="text-sm text-gray-500 font-mono flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> ${o.date}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
                <div class="bg-gray-50 p-4 rounded border border-gray-100 h-full">
                    <p class="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">Người nhận</p>
                    <p class="font-bold text-gray-800 text-base mb-1">${o.customer}</p>
                    <p class="font-bold text-[#8c5a2b] font-sans text-base mb-2">${o.phone}</p>
                    <p class="text-gray-600 leading-relaxed">${o.address}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded border border-gray-100 h-full flex flex-col justify-center">
                    <p class="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">Thanh toán</p>
                    <p class="font-bold text-red-700 font-sans text-2xl mb-2">${o.total}</p>
                    <p class="text-[13px] font-bold ${payColor}">${displayMethod}</p>
                </div>
            </div>
            <div class="border-t border-gray-100 pt-5">
                <p class="text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> Chi tiết sản phẩm</p>
                <div class="text-[14px] bg-[#f8f5ee] p-4 md:p-5 rounded border border-[#d8ccb8] shadow-inner">${productsHTML}</div>
            </div>
        </div>`;
    });
    resultHtml += `</div>`;
    resultEl.innerHTML = resultHtml;
};