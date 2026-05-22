// ============================================================================
// 📁 MODULE 5: SEARCH (search.js)
// Tính năng lọc tìm kiếm sản phẩm và bài viết tin tức (Đã gắn Popup Tin Tức)
// ============================================================================
window.executeSearch = () => {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    if(query === "") {
        window.showToast("Vui lòng nhập từ khóa tìm kiếm!", "info");
        return;
    }

    const matchedProducts = globalProducts.filter(p => 
        (p.name && p.name.toLowerCase().includes(query)) || 
        (p.desc && p.desc.toLowerCase().includes(query)) ||
        (p.period && p.period.toLowerCase().includes(query))
    );

    const matchedNews = globalNews.filter(n => 
        (n.title && n.title.toLowerCase().includes(query)) ||
        (n.desc && n.desc.toLowerCase().includes(query)) ||
        (n.category && n.category.toLowerCase().includes(query))
    );

    renderSearchResults(query, matchedProducts, matchedNews);
    window.switchPage('search');
};

function renderSearchResults(query, matchedProducts, matchedNews) {
    document.getElementById('searchCountDesc').innerText = `Tìm thấy ${matchedProducts.length} sản phẩm và ${matchedNews.length} bài viết cho từ khóa "${query}"`;
    const productGrid = document.getElementById('searchProductGrid');
    const newsGrid = document.getElementById('searchNewsGrid');

    if (productGrid) productGrid.className = 'flex flex-wrap justify-center gap-6 mb-12';
    if (newsGrid) newsGrid.className = 'flex flex-wrap justify-center gap-8';

    if (matchedProducts.length === 0) {
        productGrid.innerHTML = `<p class="w-full text-center text-gray-500 italic py-4">Không tìm thấy sản phẩm nào.</p>`;
    } else {
        productGrid.innerHTML = '';
        matchedProducts.forEach((p, index) => {
            let firstImage = (p.images && p.images.length > 0 && p.images[0].trim() !== '') ? p.images[0] : '';
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

            let imageHTML = firstImage !== '' 
                ? `<img src="${firstImage}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" alt="${p.name}" class="absolute inset-0 w-full h-full object-cover bg-white group-hover:scale-105 transition-transform duration-500 z-10">
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
            productGrid.innerHTML += cardHTML;
        });
    }

    if (matchedNews.length === 0) {
        newsGrid.innerHTML = `<p class="w-full text-center text-gray-500 italic py-4">Không tìm thấy bài viết nào.</p>`;
    } else {
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
                    
        newsGrid.innerHTML = matchedNews.map(n => `
            <div class="w-full md:w-[calc(33.333%_-_1.333rem)] xl:w-[calc(25%_-_1.5rem)] bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-md transition group cursor-pointer flex flex-col" onclick="window.openNewsDetail('${n.id}')">
                <div class="w-full aspect-video bg-[#f8f5ee] relative overflow-hidden flex items-center justify-center border-b border-brand-border">
                    ${n.image ? `<img src="${n.image}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="w-full h-full object-cover group-hover:scale-105 transition duration-500 absolute inset-0 z-10"><div class="absolute inset-0 hidden items-center justify-center z-0">${fallbackNewsSVG}</div>` : fallbackNewsSVG}
                </div>
                <div class="p-5 flex-grow text-center"><span class="text-xs text-[#d5a044] font-bold uppercase mb-2 block">${n.category}</span><h4 class="font-bold text-lg mb-2 group-hover:text-[#8c5a2b] transition">${n.title}</h4><p class="text-gray-600 text-sm line-clamp-3">${n.desc}</p></div>
            </div>`).join('');
    }
}