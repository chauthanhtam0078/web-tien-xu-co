// ============================================================================
// 📁 MODULE 4: PUBLIC UI & RENDERING (ui-public.js)
// Xử lý chuyển trang, hiển thị Sản phẩm, Tin tức, Giới thiệu, Liên hệ ra Web
// ============================================================================

window.currentProductPage = 1;
const PRODUCTS_PER_PAGE = 12;

window.formatTitleCase = (str) => {
    if(!str) return "";
    let formatted = str.trim().replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').replace(/\s*-\s*/g, '-').replace(/\s*\/\s*/g, '/');
    return formatted.toLowerCase().replace(/(?:^|[\s,\-\/\.])\S/g, match => match.toUpperCase());
};

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
    document.title = seo.title;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if(metaDesc) metaDesc.setAttribute("content", seo.desc);
    if(ogTitle) ogTitle.setAttribute("content", seo.title);
    if(ogDesc) ogDesc.setAttribute("content", seo.desc);

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

window.openNewsDetail = (id) => {
    let news = (window.globalAllNews || []).find(n => n.id == id);
    if (!news) return;

    document.getElementById('newsDetailCategory').innerText = news.category;
    document.getElementById('newsDetailTitle').innerText = news.title;
    document.getElementById('newsDetailDate').innerText = news.date;
    
    let formattedDesc = news.desc || '';
    if (!formattedDesc.includes('<') && formattedDesc.includes('\n')) formattedDesc = formattedDesc.replace(/\n/g, '<br>');
    const descEl = document.getElementById('newsDetailDesc');
    descEl.innerHTML = formattedDesc;
    descEl.classList.add('rich-text-display');

    const imgEl = document.getElementById('newsDetailImage');
    const svgEl = document.getElementById('newsDetailSvgFallback');
    
    if (news.image && news.image.trim() !== '') {
        const urls = window.getSafeImgUrls(news.image);
        imgEl.src = urls.primary;
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

    let cleanText = typeof window.stripHTMLForSearch === 'function' ? window.stripHTMLForSearch(formattedDesc) : formattedDesc;
    window.updateSEOMeta(`${news.title} | Tiền Xu Cổ`, cleanText.substring(0, 150) + '...', news.image);

    document.getElementById('newsModal').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('newsModalContent').classList.remove('scale-95');
    document.body.classList.add('modal-open');
};

window.closeNewsModal = () => {
    document.getElementById('newsModal').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('newsModalContent').classList.add('scale-95');
    document.body.classList.remove('modal-open');
    window.updateSEOMeta('Tin Tức & Kiến Thức Sưu Tầm', '', '');
};

window.renderNewsData = function() {
    const container = document.getElementById('newsContainer');
    if(!container) return;
    container.className = 'flex flex-wrap justify-center gap-8';
    let fallbackNewsSVG = `<div class="transform group-hover:scale-105 transition duration-500 ease-out flex items-center justify-center"><svg viewBox="0 0 120 120" class="w-28 h-28 drop-shadow-lg"><polygon points="60,5 98,20 115,58 98,95 60,115 22,95 5,58 22,20" fill="none" stroke="#cda568" stroke-width="2" opacity="0.5"/><polygon points="60,12 91,25 105,58 91,91 60,108 29,91 15,58 29,25" fill="none" stroke="#8c5a2b" stroke-width="1" opacity="0.6"/><circle cx="60" cy="60" r="38" fill="#1c1612" stroke="#cda568" stroke-width="3"/><circle cx="60" cy="60" r="30" fill="none" stroke="#cda568" stroke-width="1" stroke-dasharray="3 3" opacity="0.7"/><rect x="50" y="50" width="20" height="20" fill="#f8f5ee" stroke="#cda568" stroke-width="2"/><text x="60" y="44" font-size="12" font-family="serif" font-weight="bold" text-anchor="middle" fill="#cda568">越</text><text x="60" y="86" font-size="12" font-family="serif" font-weight="bold" text-anchor="middle" fill="#cda568">南</text><text x="36" y="64" font-size="12" font-family="serif" font-weight="bold" text-anchor="middle" fill="#cda568">文</text><text x="84" y="64" font-size="12" font-family="serif" font-weight="bold" text-anchor="middle" fill="#cda568">史</text></svg></div>`;

    const dataToRender = window.globalNews || [];
    container.innerHTML = dataToRender.map(n => {
        let urls = window.getSafeImgUrls(n.image);
        let cleanText = typeof window.stripHTMLForSearch === 'function' ? window.stripHTMLForSearch(n.desc) : n.desc;
        
        return `<div class="w-full md:w-[calc(33.333%_-_1.333rem)] xl:w-[calc(25%_-_1.5rem)] bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-md transition group cursor-pointer flex flex-col" onclick="window.openNewsDetail('${n.id}')">
            <div class="w-full aspect-video bg-[#f8f5ee] relative overflow-hidden flex items-center justify-center border-b border-brand-border">
                ${urls.primary ? `<img src="${urls.primary}" loading="lazy" onerror="if(!this.dataset.retried && '${urls.fallback}') { this.dataset.retried='true'; this.src='${urls.fallback}'; } else { this.style.display='none'; this.nextElementSibling.style.display='flex'; }" class="absolute inset-0 w-full h-full object-cover bg-white group-hover:scale-105 transition duration-500 z-10"><div class="absolute inset-0 hidden items-center justify-center z-0">${fallbackNewsSVG}</div>` : fallbackNewsSVG}
            </div>
            <div class="p-5 flex-grow text-center"><span class="text-xs text-[#d5a044] font-bold uppercase mb-2 block">${n.category}</span><h4 class="font-bold text-lg mb-2 group-hover:text-[#8c5a2b] transition">${n.title}</h4><p class="text-gray-600 text-sm line-clamp-3">${cleanText}</p></div>
        </div>`
    }).join('');
}

window.renderPublicGrid = function(appendMode = false) {
    const featuredGrid = document.getElementById('featuredProductGrid');
    const allGrid = document.getElementById('allProductGrid');
    if(!featuredGrid || !allGrid) return;
    
    if (!appendMode) {
        featuredGrid.innerHTML = ''; allGrid.innerHTML = '';
    }
    
    featuredGrid.className = 'flex flex-wrap justify-center gap-6';
    allGrid.className = 'flex flex-wrap justify-center gap-6';
    
    let rawData = window.filteredProducts ? window.filteredProducts : (window.globalProducts || []);
    let fullDataList = [...rawData];

    fullDataList.sort((a, b) => {
        const discountA = typeof window.getDiscountPercent === 'function' ? window.getDiscountPercent(a.discount) : 0;
        const discountB = typeof window.getDiscountPercent === 'function' ? window.getDiscountPercent(b.discount) : 0;
        return discountB - discountA; 
    });
    
    if (fullDataList.length === 0) {
        allGrid.innerHTML = `<p class="w-full text-center text-gray-500 italic py-10">Chưa có sản phẩm.</p>`; 
        return;
    }

    const startIndex = appendMode ? (window.currentProductPage - 1) * PRODUCTS_PER_PAGE : 0;
    const limitIndex = window.currentProductPage * PRODUCTS_PER_PAGE;
    const dataToRender = fullDataList.slice(startIndex, limitIndex);
    
    dataToRender.forEach((p, relativeIndex) => {
        const absoluteIndex = startIndex + relativeIndex;
        let firstImage = (p.images && p.images.length > 0 && p.images[0].trim() !== '') ? p.images[0] : '';
        let urls = window.getSafeImgUrls(firstImage);
        
        const finalPrice = typeof window.calculateFinalPrice === 'function' ? window.calculateFinalPrice(p.price, p.discount) : (parseInt(p.price.replace(/[^\d]/g, '')) || 0);
        const discountVal = typeof window.getDiscountPercent === 'function' ? window.getDiscountPercent(p.discount) : 0;
        let formatCurr = typeof window.formatCurrency === 'function' ? window.formatCurrency : (v) => v + 'đ';
        
        let badgeHTML = discountVal > 0 ? `<div class="absolute top-2 left-2 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xs shadow-md z-20">-${discountVal}%</div>` : '';
        let priceHTML = discountVal > 0 ? `<div class="text-[11px] text-gray-500 line-through mb-0.5 font-sans">${p.price}</div><div class="text-xl font-bold font-sans text-red-800 leading-none">${formatCurr(finalPrice)}</div>` : `<div class="text-xl font-bold font-sans text-red-800">${p.price}</div>`;
        const sym = p.symbol || '古';
        let fallbackSVG = `<svg viewBox="0 0 100 100" class="relative w-28 h-28 text-brand-gold opacity-80 drop-shadow-md group-hover:scale-105 transition-transform duration-500 z-0"><circle cx="50" cy="50" r="45" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="35" fill="transparent" stroke="currentColor" stroke-width="1"/><rect x="35" y="35" width="30" height="30" fill="transparent" stroke="currentColor" stroke-width="1"/><text x="50" y="55" font-size="16" text-anchor="middle" fill="#1c1612" font-weight="bold">${sym}</text></svg>`;

        let voucherBadge = (p.vouchers && p.vouchers.trim() !== '') ? `<div class="absolute bottom-2 left-2 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-sm z-20 shadow-sm flex items-center gap-1">🎟️ ${p.vouchers}</div>` : '';

        let imageHTML = urls.primary !== '' 
            ? `<img src="${urls.primary}" loading="lazy" onerror="if(!this.dataset.retried && '${urls.fallback}') { this.dataset.retried='true'; this.src='${urls.fallback}'; } else { this.style.display='none'; this.nextElementSibling.style.display='flex'; }" alt="${p.name}" class="absolute inset-0 w-full h-full object-cover bg-white group-hover:scale-105 transition-transform duration-500 z-10"><div class="absolute inset-0 hidden items-center justify-center z-0 group-hover:scale-105 transition-transform duration-500">${fallbackSVG}</div>` 
            : fallbackSVG;

        let cleanText = typeof window.stripHTMLForSearch === 'function' ? window.stripHTMLForSearch(p.desc) : p.desc;

        const cardHTML = `<div class="w-full sm:w-[calc(50%_-_0.75rem)] lg:w-[calc(25%_-_1.125rem)] 2xl:w-[calc(20%_-_1.2rem)] bg-white border border-brand-border rounded-sm shadow-sm hover:shadow-lg transition-shadow flex flex-col relative overflow-hidden group">
            <div class="cursor-pointer flex-grow flex flex-col" onclick="window.openProductDetail('${p.id || p.ma_sp || absoluteIndex}')">
                <div class="bg-brand-card h-48 relative flex justify-center items-center border-b border-brand-border overflow-hidden"><div class="absolute top-0 right-0 bg-brand-dark text-brand-gold text-xs px-2 py-1 font-mono z-20">${p.years}</div>${badgeHTML}${voucherBadge}${imageHTML}</div>
                <div class="p-5 flex-grow flex flex-col items-center text-center"><h4 class="font-serif font-bold text-lg mb-2 text-brand-dark h-14 line-clamp-2">${p.name}</h4><p class="text-sm text-gray-600 mb-4 line-clamp-2">${cleanText}</p><div class="dashed-line mt-auto w-full"></div></div>
            </div>
            <div class="px-5 pb-5 flex flex-col items-center gap-3"><div class="text-center">${priceHTML}<div class="text-xs text-gray-500 uppercase mt-1">${p.period}</div></div><button onclick="event.stopPropagation(); window.addToCart('${p.id || p.ma_sp || absoluteIndex}')" class="w-full justify-center bg-brand-btn text-brand-gold hover:text-white px-4 py-2 text-[13px] transition-colors rounded-full shadow-sm flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> Thêm Vào Giỏ</button></div>
        </div>`;
        
        allGrid.insertAdjacentHTML('beforeend', cardHTML);
        
        if(!appendMode && absoluteIndex < 4 && !window.filteredProducts) {
            featuredGrid.insertAdjacentHTML('beforeend', cardHTML);
        }
    });

    const loadMoreBtn = document.getElementById('loadMoreContainer');
    if (loadMoreBtn) {
        if (fullDataList.length > limitIndex) {
            loadMoreBtn.innerHTML = `
                <button onclick="window.loadMoreProducts()" class="border-2 border-brand-gold text-[#8c5a2b] font-bold py-2.5 px-10 hover:bg-brand-gold hover:text-white transition-colors uppercase text-sm tracking-wider rounded-full shadow-sm bg-white">
                    Hiển thị thêm sản phẩm ➔
                </button>`;
        } else {
            loadMoreBtn.innerHTML = '';
        }
    }
}

window.loadMoreProducts = function() {
    window.currentProductPage++;
    window.renderPublicGrid(true); 
};


window.renderAboutData = function() {
    const container = document.getElementById('aboutContainer');
    if (!container) return;
    const info = window.globalAbout || {};
    if (!info || Object.keys(info).length === 0) return;

    let firstImg = info.images && info.images.length > 0 ? info.images[0] : info.image;
    let imgHtml = '';
    
    if (firstImg && firstImg.trim() !== '') {
        let urls = window.getSafeImgUrls(firstImg);
        imgHtml = `<div class="relative w-full aspect-video rounded-sm overflow-hidden shadow-sm border border-brand-border">
            <img src="${urls.primary}" loading="lazy" class="w-full h-full object-cover" onerror="if(!this.dataset.retried && '${urls.fallback}') { this.dataset.retried='true'; this.src='${urls.fallback}'; } else { this.style.display='none'; }">
        </div>`;
    } else {
        imgHtml = `
        <div class="relative w-full aspect-[4/3] sm:aspect-video rounded-sm shadow-sm border border-brand-border bg-[#f8f5ee] flex flex-col items-center justify-center overflow-hidden p-8">
            <div class="absolute inset-0 opacity-40 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:15px_15px]"></div>
            <div class="relative z-10 flex items-center justify-center drop-shadow-xl">
                <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#4a3f35] border-[3px] border-[#cda568] flex items-center justify-center text-[#cda568] font-serif font-bold text-xl shadow-lg transform translate-x-4 z-0">寶</div>
                <div class="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#1c1612] border-[4px] border-[#cda568] flex items-center justify-center text-[#cda568] font-serif font-bold text-4xl shadow-2xl z-10">古</div>
                <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#4a3f35] border-[3px] border-[#cda568] flex items-center justify-center text-[#cda568] font-serif font-bold text-xl shadow-lg transform -translate-x-4 z-0">錢</div>
            </div>
        </div>`;
    }

    let parasHtml = (info.paragraphs || []).map(p => {
        let cleanP = p;
        if(!cleanP.includes('<')) cleanP = cleanP.replace(/\n/g, '<br>');
        return `<p class="text-gray-700 text-[15px] leading-relaxed mb-4 rich-text-display">${cleanP}</p>`;
    }).join('');

    let bulletsHtml = (info.bullets || []).map(b => `<li class="flex items-start gap-2 text-gray-700 text-[15px]">
        <svg class="w-5 h-5 text-[#8c5a2b] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        <span class="rich-text-display">${b}</span>
    </li>`).join('');

    container.innerHTML = `
        <div class="order-1 flex items-center justify-center">
            ${imgHtml}
        </div>
        <div class="order-2 flex flex-col justify-center pl-0 md:pl-6">
            <h3 class="text-xl md:text-2xl font-serif font-bold text-[#8c5a2b] mb-4">${info.title || 'Sứ Mệnh Bảo Tồn Lịch Sử'}</h3>
            ${parasHtml}
            <ul class="space-y-3 mt-2">${bulletsHtml}</ul>
        </div>
    `;
};

window.renderContactData = function() {
    const container = document.getElementById('contactContainer');
    if (!container) return;
    const contacts = window.globalAllContacts || [];
    if (contacts.length === 0) return;

    container.innerHTML = contacts.map(c => {
        let val = c.value;
        if(!val.includes('<')) val = val.replace(/\n/g, '<br>');
        
        let iconSvg = '';
        let k = c.key.toLowerCase();
        
        if (k.includes('địa chỉ') || k.includes('address')) {
            iconSvg = `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
        } else if (k.includes('điện thoại') || k.includes('phone') || k.includes('hotline') || k.includes('sđt')) {
            iconSvg = `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>`;
        } else if (k.includes('email') || k.includes('mail')) {
            iconSvg = `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>`;
        } else if (k.includes('zalo')) {
            iconSvg = `<span class="font-black text-[10px] tracking-tight">Zalo</span>`;
        } else if (k.includes('messenger') || k.includes('facebook') || k.includes('fb')) {
            iconSvg = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.902 1.446 5.44 3.665 7.123v3.313l3.35-1.841c.95.27 1.954.417 2.985.417 5.523 0 10-4.145 10-9.258S17.523 2 12 2zm1.09 12.392l-2.82-3.003-5.503 3.003 6.046-6.425 2.88 3.004 5.443-3.004-6.046 6.425z"/></svg>`;
        } else if (k.includes('ghi chú') || k.includes('note') || k.includes('mở cửa') || k.includes('hours')) {
            iconSvg = `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
        } else {
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
        }

        return `<li class="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <div class="w-8 h-8 rounded-full bg-[#efe8d7] flex items-center justify-center text-[#8c5a2b] flex-shrink-0 mt-1 shadow-sm">
                ${iconSvg}
            </div>
            <div><strong class="block text-[#1c1612] mb-0.5">${c.key}</strong><span class="text-gray-600 rich-text-display">${val}</span></div>
        </li>`;
    }).join('');
};

window.updateDynamicFooter = function() {
    const fbContact = (window.globalAllContacts || []).find(c => c.key.toLowerCase().includes('facebook') || c.key.toLowerCase() === 'fb');
    if (fbContact && fbContact.value) {
        let cleanText = typeof window.stripHTMLForSearch === 'function' ? window.stripHTMLForSearch(fbContact.value) : fbContact.value;
        const fbUrl = cleanText.trim();
        const fbName = fbUrl.replace(/^https?:\/\/(www\.)?facebook\.com\//, '').split('/')[0] || 'Fanpage Văn Minh Sử Hội';
        const actualUrl = fbUrl.startsWith('http') ? fbUrl : `https://${fbUrl}`;
        
        document.querySelectorAll('.fb-dynamic-link').forEach(el => el.href = actualUrl);
        document.querySelectorAll('.fb-dynamic-text').forEach(el => el.innerText = fbUrl);
        document.querySelectorAll('.fb-dynamic-name').forEach(el => el.innerText = fbName);
    }

    let online = window.globalVisitors ? window.globalVisitors.online : (Math.floor(Math.random() * 5) + 2);
    let today = window.globalVisitors ? window.globalVisitors.today : 0;
    let yesterday = window.globalVisitors ? window.globalVisitors.yesterday : 0;
    let total = window.globalVisitors ? window.globalVisitors.total : 0;

    const elOnline = document.getElementById('stat-online');
    const elToday = document.getElementById('stat-today');
    const elYesterday = document.getElementById('stat-yesterday');
    const elTotal = document.getElementById('stat-total');

    if(elOnline) elOnline.innerText = online;
    if(elToday) elToday.innerText = new Intl.NumberFormat('vi-VN').format(today);
    if(elYesterday) elYesterday.innerText = new Intl.NumberFormat('vi-VN').format(yesterday);
    if(elTotal) elTotal.innerText = new Intl.NumberFormat('vi-VN').format(total);
};

window.handleTrackOrder = function() {
    const inputEl = document.getElementById('trackingCodeInput');
    const resultEl = document.getElementById('trackingResult');
    if (!inputEl || !resultEl) return;

    const query = inputEl.value.trim().toLowerCase();
    if (query === "") {
        if (typeof window.showToast === 'function') window.showToast("Vui lòng nhập thông tin tra cứu!", "info");
        return;
    }

    resultEl.classList.remove('hidden');
    resultEl.innerHTML = `<div class="loader mb-3"></div><p class="text-sm text-gray-500 font-medium animate-pulse">Đang tìm kiếm đơn hàng...</p>`;

    setTimeout(() => {
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
    }, 600);
};

// ==========================================
// CỔNG THÀNH VIÊN - KHÁCH HÀNG
// ==========================================

window.handleCustomerIconClick = function() {
    if (window.loggedCustomer) {
        window.switchPage('profile');
    } else {
        window.openCustomerModal();
    }
};

window.openCustomerModal = function() {
    document.getElementById('customerLoginModal').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('customerLoginContent').classList.remove('scale-95');
    window.switchCustomerTab('login');
};

window.closeCustomerModal = function() {
    document.getElementById('customerLoginModal').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('customerLoginContent').classList.add('scale-95');
};

window.switchCustomerTab = function(tab) {
    const loginForm = document.getElementById('customerLoginForm');
    const registerForm = document.getElementById('customerRegisterForm');
    const loginBtn = document.getElementById('tabBtnCustomerLogin');
    const registerBtn = document.getElementById('tabBtnCustomerRegister');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginBtn.className = 'flex-1 py-3 font-bold text-brand-dark border-b-2 border-brand-gold bg-white';
        registerBtn.className = 'flex-1 py-3 font-bold text-gray-500 border-b-2 border-transparent bg-gray-50 hover:bg-white transition';
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        registerBtn.className = 'flex-1 py-3 font-bold text-brand-dark border-b-2 border-brand-gold bg-white';
        loginBtn.className = 'flex-1 py-3 font-bold text-gray-500 border-b-2 border-transparent bg-gray-50 hover:bg-white transition';
    }
};

window.submitCustomerLogin = async function(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const spinner = btn.querySelector('.spinner-icon');
    btn.disabled = true; spinner.classList.remove('hidden');

    const phone = document.getElementById('cusLoginPhone').value.trim();
    const password = document.getElementById('cusLoginPassword').value.trim();

    try {
        const response = await fetch(SCRIPT_URL, { 
            method: 'POST', 
            redirect: 'follow', 
            body: JSON.stringify({ action: 'customerLogin', data: { phone, password } }) 
        });
        const result = await response.json();
        
        if (result.success) {
            window.loggedCustomer = result.user;
            localStorage.setItem('tienxu_customer', JSON.stringify(result.user));
            window.showToast("Đăng nhập thành công!", "success");
            window.closeCustomerModal();
            window.switchPage('profile');
        } else {
            window.showToast(result.message || "Sai số điện thoại hoặc mật khẩu!", "error");
        }
    } catch(err) {
        window.showToast("Lỗi kết nối máy chủ.", "error");
    } finally {
        btn.disabled = false; spinner.classList.add('hidden');
    }
};

window.submitCustomerRegister = async function(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const spinner = btn.querySelector('.spinner-icon');
    btn.disabled = true; spinner.classList.remove('hidden');

    const data = {
        name: window.formatTitleCase(document.getElementById('cusRegName').value),
        phone: document.getElementById('cusRegPhone').value.trim(),
        email: document.getElementById('cusRegEmail').value.trim(),
        password: document.getElementById('cusRegPassword').value.trim(),
        address: '' 
    };

    try {
        const response = await fetch(SCRIPT_URL, { 
            method: 'POST', 
            redirect: 'follow', 
            body: JSON.stringify({ action: 'customerRegister', data: data }) 
        });
        const result = await response.json();
        
        if (result.success) {
            window.loggedCustomer = result.user;
            localStorage.setItem('tienxu_customer', JSON.stringify(result.user));
            window.showToast("Đăng ký thành công!", "success");
            window.closeCustomerModal();
            window.switchPage('profile');
        } else {
            window.showToast(result.message || "Số điện thoại đã được đăng ký!", "error");
        }
    } catch(err) {
        window.showToast("Lỗi kết nối máy chủ.", "error");
    } finally {
        btn.disabled = false; spinner.classList.add('hidden');
    }
};

window.logoutCustomer = function() {
    window.loggedCustomer = null;
    localStorage.removeItem('tienxu_customer');
    window.showToast("Đã đăng xuất", "success");
    window.switchPage('home');
};

// CÁC HÀM CẬP NHẬT PROFILE NHIỀU EMAIL/ADDRESS
window.openProfileEditModal = function() {
    if (!window.loggedCustomer) return;
    
    document.getElementById('profileEmailList').innerHTML = '';
    document.getElementById('profileAddressList').innerHTML = '';
    
    const emails = window.loggedCustomer.email ? window.loggedCustomer.email.split('\n-----\n').filter(Boolean) : [];
    const addresses = window.loggedCustomer.address ? window.loggedCustomer.address.split('\n-----\n').filter(Boolean) : [];

    if (emails.length === 0) window.addProfileInput('email');
    else emails.forEach(e => window.addProfileInput('email', e));

    if (addresses.length === 0) window.addProfileInput('address');
    else addresses.forEach(a => window.addProfileInput('address', a));

    document.getElementById('profileEditModal').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('profileEditContent').classList.remove('scale-95');
    document.body.classList.add('modal-open');
};

window.closeProfileEditModal = function() {
    document.getElementById('profileEditModal').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('profileEditContent').classList.add('scale-95');
    document.body.classList.remove('modal-open');
};

window.addProfileInput = function(type, value = '') {
    const container = document.getElementById(type === 'email' ? 'profileEmailList' : 'profileAddressList');
    const div = document.createElement('div');
    div.className = "flex items-center gap-2 mb-2";
    const inputHtml = type === 'email' 
        ? `<input type="email" placeholder="Nhập email..." value="${value}" class="profile-email-input w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-brand-gold outline-none">`
        : `<textarea placeholder="Nhập địa chỉ..." rows="2" class="profile-address-input w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-brand-gold outline-none resize-none">${value}</textarea>`;
    
    div.innerHTML = `
        ${inputHtml}
        <button type="button" onclick="this.parentElement.remove()" class="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-200 px-2 py-2 rounded transition" title="Xóa">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
    `;
    container.appendChild(div);
};

window.submitProfileEdit = async function(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const spinner = btn.querySelector('.spinner-icon');
    const textSpan = btn.querySelectorAll('span')[1];
    const oldText = textSpan.innerText;
    
    textSpan.innerText = "ĐANG LƯU..."; btn.disabled = true; spinner.classList.remove('hidden');

    const emailInputs = document.querySelectorAll('.profile-email-input');
    let emails = [];
    emailInputs.forEach(input => { if(input.value.trim()) emails.push(input.value.trim().toLowerCase()); });
    emails = [...new Set(emails)];

    const addressInputs = document.querySelectorAll('.profile-address-input');
    let addresses = [];
    addressInputs.forEach(input => { if(input.value.trim()) addresses.push(window.formatTitleCase(input.value)); });
    addresses = [...new Set(addresses)];

    const data = {
        phone: window.loggedCustomer.phone,
        email: emails.join('\n-----\n'),
        address: addresses.join('\n-----\n')
    };

    try {
        const response = await fetch(SCRIPT_URL, { 
            method: 'POST', 
            redirect: 'follow', 
            body: JSON.stringify({ action: 'updateCustomerProfile', data: data }) 
        });
        const result = await response.json();
        
        if (result.success) {
            window.loggedCustomer = result.user;
            localStorage.setItem('tienxu_customer', JSON.stringify(result.user));
            window.showToast("Cập nhật thông tin thành công!", "success");
            window.closeProfileEditModal();
            window.renderProfilePage();
        } else {
            window.showToast(result.message || "Có lỗi xảy ra!", "error");
        }
    } catch(err) {
        window.showToast("Lỗi kết nối máy chủ.", "error");
    } finally {
        textSpan.innerText = oldText; btn.disabled = false; spinner.classList.add('hidden');
    }
};

window.renderProfilePage = function() {
    if (!window.loggedCustomer) return;
    
    document.getElementById('profileName').innerText = window.loggedCustomer.name;
    document.getElementById('profileAvatar').innerText = window.loggedCustomer.name.charAt(0).toUpperCase();
    document.getElementById('profilePhone').innerText = window.loggedCustomer.phone;
    
    let emailHtml = window.loggedCustomer.email ? window.loggedCustomer.email.split('\n-----\n').filter(Boolean).map(e => `<span class="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">${e}</span>`).join('') : "Chưa cập nhật";
    let addressHtml = window.loggedCustomer.address ? window.loggedCustomer.address.split('\n-----\n').filter(Boolean).map(a => `<span class="bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">${a}</span>`).join('') : "Chưa cập nhật";

    document.getElementById('profileEmail').innerHTML = emailHtml;
    document.getElementById('profileAddress').innerHTML = addressHtml;

    const ordersContainer = document.getElementById('profileOrdersContainer');
    ordersContainer.innerHTML = '<div class="loader mx-auto"></div><p class="text-center mt-2 text-sm text-gray-500">Đang tải lịch sử...</p>';

    setTimeout(() => {
        const queryPhone = window.loggedCustomer.phone;
        const matchedOrders = (window.globalOrders || []).filter(o => o.phone === queryPhone);

        if (matchedOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="bg-gray-50 border border-gray-200 text-gray-500 rounded-md p-8 w-full text-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    <p class="font-bold">Bạn chưa có đơn hàng nào.</p>
                    <button onclick="window.switchPage('products')" class="mt-4 bg-brand-dark text-brand-gold px-6 py-2 rounded-full text-sm font-bold">Khám phá Sản phẩm</button>
                </div>`;
            return;
        }

        let resultHtml = "";
        matchedOrders.forEach(o => {
            let statusColor = o.status === 'Đã Giao Hàng' ? 'text-green-700 bg-green-50 border-green-200' : (o.status === 'Đang Giao Hàng' ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-orange-700 bg-orange-50 border-orange-200');
            let rawMethod = o.method || '';
            let displayMethod = rawMethod;
            let payColor = rawMethod.includes('Đã nhận') ? 'text-green-600' : 'text-red-600';
            if (rawMethod.toUpperCase().includes('BANK')) { displayMethod = 'Chuyển Khoản'; } 
            else if (rawMethod.toUpperCase() === 'COD') { displayMethod = 'COD'; payColor = 'text-gray-600'; }

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
        ordersContainer.innerHTML = resultHtml;
    }, 500);
};