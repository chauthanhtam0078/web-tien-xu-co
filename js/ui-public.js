// ============================================================================
// 📁 MODULE 4: PUBLIC UI & RENDERING (ui-public.js)
// Điều hướng trang và render các View cho khách hàng
// ============================================================================

window.switchPage = (pageId, pushState = true) => {
    if (isAdminActive) { 
        isAdminActive = false; 
        document.getElementById('adminSection').classList.add('hidden'); 
        document.getElementById('publicContainer').classList.remove('hidden'); 
    }
    
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

function renderAboutData() {
    const container = document.getElementById('aboutContainer');
    if(!container) return;
    let pHTML = globalAbout.paragraphs.map(p => p.trim() ? `<p class="text-gray-700 mb-4 leading-relaxed text-sm">${p}</p>` : '').join('');
    let liHTML = globalAbout.bullets.map(li => li.trim() ? `<li>${li}</li>` : '').join('');
    
    let fallbackAboutSVG = `<div class="w-full h-full absolute inset-0 bg-[#efe8d7] overflow-hidden flex items-center justify-center z-0">
            <div class="absolute inset-0 opacity-10 bg-[linear-gradient(#cda568_1px,transparent_1px),linear-gradient(90deg,#cda568_1px,transparent_1px)] bg-[size:15px_15px]"></div>
            <div class="relative flex items-center justify-center gap-2">
                <div class="w-20 h-20 rounded-full border-[3px] border-[#cda568] bg-[#1c1612] flex items-center justify-center text-[#cda568] opacity-80 transform -rotate-12 translate-x-4 shadow-md"><span class="font-serif text-2xl font-bold">寶</span></div>
                <div class="w-32 h-32 rounded-full border-[4px] border-[#cda568] bg-[#1c1612] flex items-center justify-center text-[#cda568] z-10 shadow-2xl"><span class="font-serif text-5xl font-bold">古</span></div>
                <div class="w-24 h-24 rounded-full border-[3px] border-[#cda568] bg-[#1c1612] flex items-center justify-center text-[#cda568] opacity-90 transform rotate-12 -translate-x-4 shadow-lg"><span class="font-serif text-3xl font-bold">錢</span></div>
            </div>
        </div>`;

    let urls = window.getSafeImgUrls(globalAbout.image);
    let imageOrGraphic = urls.primary !== '' ?
        `<div class="relative w-full aspect-video shadow-lg rounded-sm border border-brand-border overflow-hidden bg-white min-h-[300px]">
            <img src="${urls.primary}" onerror="if(!this.dataset.retried && '${urls.fallback}') { this.dataset.retried='true'; this.src='${urls.fallback}'; } else { this.style.display='none'; this.nextElementSibling.style.display='flex'; }" class="absolute inset-0 w-full h-full object-contain bg-white p-2 z-10">
            <div class="absolute inset-0 hidden items-center justify-center z-0">${fallbackAboutSVG}</div>
        </div>` : 
        `<div class="relative w-full aspect-video shadow-lg rounded-sm border border-brand-border overflow-hidden min-h-[300px]">
            ${fallbackAboutSVG}
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
    
    container.className = 'flex flex-wrap justify-center gap-8';
    
    let fallbackNewsSVG = `<div class="transform group-hover:scale-105 transition duration-500 ease-out flex items-center justify-center">
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
                </div>`;

    container.innerHTML = globalNews.map(n => {
        let urls = window.getSafeImgUrls(n.image);
        return `
        <div class="w-full md:w-[calc(33.333%_-_1.333rem)] xl:w-[calc(25%_-_1.5rem)] bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-md transition group cursor-pointer flex flex-col" onclick="window.openNewsDetail('${n.id}')">
            <div class="w-full aspect-video bg-[#f8f5ee] relative overflow-hidden flex items-center justify-center border-b border-brand-border">
                ${urls.primary ? `<img src="${urls.primary}" onerror="if(!this.dataset.retried && '${urls.fallback}') { this.dataset.retried='true'; this.src='${urls.fallback}'; } else { this.style.display='none'; this.nextElementSibling.style.display='flex'; }" class="absolute inset-0 w-full h-full object-cover bg-white group-hover:scale-105 transition duration-500 z-10"><div class="absolute inset-0 hidden items-center justify-center z-0">${fallbackNewsSVG}</div>` : fallbackNewsSVG}
            </div>
            <div class="p-5 flex-grow text-center"><span class="text-xs text-[#d5a044] font-bold uppercase mb-2 block">${n.category}</span><h4 class="font-bold text-lg mb-2 group-hover:text-[#8c5a2b] transition">${n.title}</h4><p class="text-gray-600 text-sm line-clamp-3">${n.desc}</p></div>
        </div>`
    }).join('');
}

window.openNewsDetail = (id) => {
    const n = globalAllNews.find(x => x.id == id);
    if (!n) return;
    
    document.getElementById('newsDetailTitle').innerText = n.title;
    document.getElementById('newsDetailCategory').innerText = n.category;
    document.getElementById('newsDetailDesc').innerText = n.desc;
    document.getElementById('newsDetailDate').innerText = n.date ? formatDateString(n.date) : '';
    
    const imgEl = document.getElementById('newsDetailImage');
    const svgEl = document.getElementById('newsDetailSvgFallback');
    
    if (n.image && n.image.trim() !== '') {
        let urls = window.getSafeImgUrls(n.image);
        imgEl.src = urls.primary;
        imgEl.dataset.retried = ""; // Reset trạng thái retry
        imgEl.onerror = function() {
            if (!this.dataset.retried && urls.fallback) {
                this.dataset.retried = 'true';
                this.src = urls.fallback;
            } else {
                this.classList.add('hidden');
                svgEl.classList.remove('hidden');
            }
        };
        imgEl.classList.remove('hidden');
        svgEl.classList.add('hidden');
    } else {
        imgEl.classList.add('hidden');
        svgEl.classList.remove('hidden');
    }
    
    document.getElementById('newsModal').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('newsModalContent').classList.remove('scale-95');
    document.body.classList.add('modal-open');
};

window.closeNewsModal = () => {
    document.getElementById('newsModal').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('newsModalContent').classList.add('scale-95');
    document.body.classList.remove('modal-open');
};

function renderContactData() {
    const c = document.getElementById('contactContainer');
    if(c) c.innerHTML = `
        <li class="flex items-start gap-3"><span class="text-xl">📍</span><div><strong>Địa chỉ:</strong><br>${globalContact.address}</div></li>
        <li class="flex items-start gap-3"><span class="text-xl">📞</span><div><strong>Hotline/Zalo:</strong><br><span class="text-[#eeb135] font-bold text-lg">${globalContact.phone}</span></div></li>
        <li class="flex items-start gap-3"><span class="text-xl">✉️</span><div><strong>Email:</strong><br>${globalContact.email}</div></li>
        <li class="mt-4 italic text-xs text-gray-500">${globalContact.notes}</li>
    `;
    updateDynamicFooter(); 
}

function updateDynamicFooter() {
    const fbContact = globalAllContacts.find(c => c.key.toLowerCase().includes('facebook') || c.key.toLowerCase() === 'fb');
    if (fbContact && fbContact.value) {
        const fbUrl = fbContact.value.trim();
        const fbName = fbUrl.replace(/^https?:\/\/(www\.)?facebook\.com\//, '').split('/')[0] || 'Fanpage Văn Minh Sử Hội';
        const actualUrl = fbUrl.startsWith('http') ? fbUrl : `https://${fbUrl}`;
        
        document.querySelectorAll('.fb-dynamic-link').forEach(el => el.href = actualUrl);
        document.querySelectorAll('.fb-dynamic-text').forEach(el => el.innerText = fbUrl);
        document.querySelectorAll('.fb-dynamic-name').forEach(el => el.innerText = fbName);
    }

    if (!localStorage.getItem('tienxu_stat_reset_v4')) {
        localStorage.setItem('tienxu_stat_total', '1');
        localStorage.setItem('tienxu_stat_today', '1');
        localStorage.setItem('tienxu_stat_yesterday', '0');
        localStorage.setItem('tienxu_stat_date', new Date().toDateString());
        localStorage.setItem('tienxu_stat_reset_v4', 'true');
        sessionStorage.setItem('tienxu_visited', 'true');
    }

    let total = parseInt(localStorage.getItem('tienxu_stat_total')) || 1;
    let today = parseInt(localStorage.getItem('tienxu_stat_today')) || 1;
    let yesterday = parseInt(localStorage.getItem('tienxu_stat_yesterday')) || 0;
    
    let dateStr = new Date().toDateString();
    let savedDate = localStorage.getItem('tienxu_stat_date');

    if (savedDate !== dateStr) {
        yesterday = today;
        today = 1;
        localStorage.setItem('tienxu_stat_date', dateStr);
        localStorage.setItem('tienxu_stat_yesterday', yesterday);
        sessionStorage.removeItem('tienxu_visited'); 
    }
    
    if(!sessionStorage.getItem('tienxu_visited')) {
        today++;
        total++;
        sessionStorage.setItem('tienxu_visited', 'true');
        localStorage.setItem('tienxu_stat_today', today);
        localStorage.setItem('tienxu_stat_total', total);
    }

    let online = Math.floor(Math.random() * 5) + 2;

    const elOnline = document.getElementById('stat-online');
    const elToday = document.getElementById('stat-today');
    const elYesterday = document.getElementById('stat-yesterday');
    const elTotal = document.getElementById('stat-total');

    if(elOnline) elOnline.innerText = online;
    if(elToday) elToday.innerText = new Intl.NumberFormat('vi-VN').format(today);
    if(elYesterday) elYesterday.innerText = new Intl.NumberFormat('vi-VN').format(yesterday);
    if(elTotal) elTotal.innerText = new Intl.NumberFormat('vi-VN').format(total);
}

window.handleTrackOrder = () => {
    const query = document.getElementById('trackingCodeInput').value.trim().toLowerCase();
    const resultDiv = document.getElementById('trackingResult');
    
    if (!query) {
        window.showToast("Vui lòng nhập thông tin để tra cứu (Tên, SĐT hoặc Mã đơn)!", "error");
        return;
    }

    resultDiv.innerHTML = `<div class="loader mb-2"></div><p class="text-sm text-gray-500 mt-2">Hệ thống đang xử lý và tra cứu thông tin...</p>`;
    resultDiv.classList.remove('hidden');

    setTimeout(() => {
        const matchedOrders = globalOrders.filter(o => 
            (o.order_code && o.order_code.toLowerCase().includes(query)) ||
            (o.phone && o.phone.toLowerCase().includes(query)) ||
            (o.customer && o.customer.toLowerCase().includes(query)) ||
            (o.ma_kh && o.ma_kh.toLowerCase().includes(query))
        );

        if (matchedOrders.length === 0) {
            resultDiv.innerHTML = `<p class="text-red-600 font-medium">Không tìm thấy đơn hàng nào khớp với <b class="font-sans">${query}</b>. Vui lòng kiểm tra lại thông tin.</p>`;
            return;
        }

        let html = `<div class="w-full text-left mb-4 border-b border-brand-border pb-2"><span class="font-bold text-gray-700 text-lg">Tìm thấy ${matchedOrders.length} đơn hàng:</span></div>`;
        html += `<div class="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 w-full">`;

        matchedOrders.forEach(order => {
            let statusBadge = "bg-gray-100 text-gray-700 border-gray-300";
            let displayStatus = order.status || 'Chưa Giao Hàng';
            
            if (displayStatus === "Đang Giao Hàng") statusBadge = "bg-blue-100 text-blue-700 border-blue-300";
            else if (displayStatus === "Đã Giao Hàng") statusBadge = "bg-green-100 text-green-700 border-green-300";

            let methodText = order.method || "COD";
            
            if (methodText.toUpperCase().includes("BANK")) {
                if (methodText.toLowerCase().includes("đã nhận")) {
                    methodText = "BANK (Đã chuyển khoản)";
                } else {
                    methodText = "BANK (Chưa chuyển khoản)";
                }
            }
            
            let methodBadge = methodText.includes("Đã chuyển khoản") ? "text-green-600" : (methodText.includes("BANK") ? "text-yellow-600" : "text-gray-800 font-bold");

            let pNames = (order.product || "").toString().split('\n');
            let pQtys = (order.qty || "").toString().split(/,|\n/); 
            let pDetails = (order.detail || "").toString().split('\n');

            let productsHTML = pNames.map((name, i) => {
                let q = pQtys[i] ? pQtys[i].toString().trim() : 1;
                let d = pDetails[i] ? pDetails[i].toString().trim() : '';
                let nameStr = name.includes('SL:') ? name.trim() : `SL: ${q} x ${name.trim()}`;
                
                if (d) {
                    return `<div class="mb-2"><span class="text-gray-800 font-medium">${nameStr}</span><br><span class="text-[11px] text-gray-500 block pl-2 border-l-2 border-brand-gold ml-1 mt-0.5">${d}</span></div>`;
                }
                return `<div class="mb-2"><span class="text-gray-800 font-medium">${nameStr}</span></div>`;
            }).join('');

            let codNoteHTML = methodText === "COD" ? `<span class="text-gray-500 italic text-xs">* Vui lòng chuẩn bị số tiền khi shipper gọi điện.</span>` : `<span></span>`;

            html += `
                <div class="text-left w-full bg-white border border-brand-border p-5 rounded-sm shadow-sm transition-all relative">
                    <div class="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
                        <h4 class="font-bold text-brand-dark font-sans text-lg">${order.order_code}</h4>
                        <span class="px-3 py-1 rounded text-xs font-bold border ${statusBadge}">${displayStatus}</span>
                    </div>
                    <div class="space-y-2 text-sm text-gray-700">
                        <p><strong class="w-24 inline-block">Khách hàng:</strong> ${order.customer} <span class="text-[10px] text-gray-400">(${order.ma_kh || 'Chưa có'})</span></p>
                        <p><strong class="w-24 inline-block">SĐT:</strong> <span class="font-sans">${order.phone}</span></p>
                        <p><strong class="w-24 inline-block">Ngày đặt:</strong> <span class="font-sans">${order.date}</span></p>
                        <p><strong class="w-24 inline-block">Thanh toán:</strong> <span class="font-bold ${methodBadge}">${methodText}</span></p>
                        <p><strong class="w-24 inline-block">Địa chỉ:</strong> <span class="text-xs break-words">${order.address || 'Không có'}</span></p>
                        <div class="mt-3 pt-3 border-t border-gray-100">
                            <strong class="block mb-2">Sản phẩm đã mua:</strong>
                            <div class="text-xs bg-gray-50 p-3 rounded text-gray-600 leading-relaxed">${productsHTML}</div>
                        </div>
                        <div class="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            ${codNoteHTML}
                            <div class="flex items-center gap-2 ml-auto">
                                <strong>Tổng tiền:</strong> 
                                <span class="text-red-700 font-bold text-xl font-sans">${order.total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        resultDiv.innerHTML = html;
    }, 600);
};

// CẬP NHẬT: XỬ LÝ LỖI ẢNH (GRACEFUL FALLBACK) CHO KHUNG HIỂN THỊ SP
function renderPublicGrid() {
    const featuredGrid = document.getElementById('featuredProductGrid');
    const allGrid = document.getElementById('allProductGrid');
    if(!featuredGrid || !allGrid) return;
    
    featuredGrid.innerHTML = ''; 
    allGrid.innerHTML = '';
    
    featuredGrid.className = 'flex flex-wrap justify-center gap-6';
    allGrid.className = 'flex flex-wrap justify-center gap-6';
    
    const dataToRender = filteredProducts !== null ? filteredProducts : globalProducts;
    if (dataToRender.length === 0) {
        allGrid.innerHTML = `<p class="w-full text-center text-gray-500 italic py-10">Chưa có sản phẩm.</p>`; 
        return;
    }
    dataToRender.forEach((p, index) => {
        let firstImage = (p.images && p.images.length > 0 && p.images[0].trim() !== '') ? p.images[0] : '';
        let urls = window.getSafeImgUrls(firstImage);
        
        const finalPrice = calculateFinalPrice(p.price, p.discount);
        const discountVal = getDiscountPercent(p.discount);
        let badgeHTML = discountVal > 0 ? `<div class="absolute top-2 left-2 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xs shadow-md z-20">-${discountVal}%</div>` : '';
        let priceHTML = discountVal > 0 ? `<div class="text-[11px] text-gray-500 line-through mb-0.5 font-sans">${p.price}</div><div class="text-xl font-bold font-sans text-red-800 leading-none">${formatCurrency(finalPrice)}</div>` : `<div class="text-xl font-bold font-sans text-red-800">${p.price}</div>`;
        
        const sym = p.symbol || '古';
        
        let fallbackSVG = `<svg viewBox="0 0 100 100" class="relative w-28 h-28 text-brand-gold opacity-80 drop-shadow-md group-hover:scale-105 transition-transform duration-500 z-0">
                <circle cx="50" cy="50" r="45" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/>
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="currentColor" stroke-width="1"/>
                <rect x="35" y="35" width="30" height="30" fill="transparent" stroke="currentColor" stroke-width="1"/>
                <text x="50" y="55" font-size="16" text-anchor="middle" fill="#1c1612" font-weight="bold">${sym}</text>
            </svg>`;

        let imageHTML = urls.primary !== '' 
            ? `<img src="${urls.primary}" onerror="if(!this.dataset.retried && '${urls.fallback}') { this.dataset.retried='true'; this.src='${urls.fallback}'; } else { this.style.display='none'; this.nextElementSibling.style.display='flex'; }" alt="${p.name}" class="absolute inset-0 w-full h-full object-cover bg-white group-hover:scale-105 transition-transform duration-500 z-10">
               <div class="absolute inset-0 hidden items-center justify-center z-0 group-hover:scale-105 transition-transform duration-500">${fallbackSVG}</div>` 
            : fallbackSVG;

        const cardHTML = `
        <div class="w-full sm:w-[calc(50%_-_0.75rem)] lg:w-[calc(25%_-_1.125rem)] 2xl:w-[calc(20%_-_1.2rem)] bg-white border border-brand-border rounded-sm shadow-sm hover:shadow-lg transition-shadow flex flex-col relative overflow-hidden group">
            <div class="cursor-pointer flex-grow flex flex-col" onclick="window.openProductDetail('${p.id || index}')">
                <div class="bg-brand-card h-48 relative flex justify-center items-center border-b border-brand-border overflow-hidden">
                    <div class="absolute top-0 right-0 bg-brand-dark text-brand-gold text-xs px-2 py-1 font-mono z-20">${p.years}</div>
                    ${badgeHTML} 
                    ${imageHTML}
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