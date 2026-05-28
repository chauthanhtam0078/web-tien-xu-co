// ============================================================================
// 📁 MODULE 7: PRODUCT DETAIL (product.js)
// Xử lý Modal Xem chi tiết sản phẩm
// TÍCH HỢP: Tự động đổi thẻ Meta SEO và Render Trình Soạn thảo Rich Text
// ============================================================================

window.updateSEOMeta = (title, desc, image) => {
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", desc);
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute("content", image);
};

let currentDetailImages = [];
let currentDetailIndex = 0;
let currentDetailProduct = null;

window.openProductDetail = (id) => {
    let productsArray = window.globalProducts || [];
    let product = productsArray.find(p => p.id == id || p.ma_sp == id);
    if(!product && !isNaN(id)) product = productsArray[parseInt(id)]; 
    if(!product) return;
    
    currentDetailProduct = product;
    currentDetailImages = product.images && product.images.length > 0 ? product.images : [];
    currentDetailIndex = 0;
    
    document.getElementById('detailTitle').innerText = product.name;
    const finalPrice = typeof window.calculateFinalPrice === 'function' ? window.calculateFinalPrice(product.price, product.discount) : (parseInt(product.price.replace(/[^\d]/g, '')) || 0);
    const discountVal = typeof window.getDiscountPercent === 'function' ? window.getDiscountPercent(product.discount) : 0;
    let formatCurr = typeof window.formatCurrency === 'function' ? window.formatCurrency : (v) => v + 'đ';

    const detailPriceEl = document.getElementById('detailPrice');
    if (detailPriceEl) {
        detailPriceEl.classList.remove('font-serif'); detailPriceEl.classList.add('font-sans');
        detailPriceEl.innerHTML = discountVal > 0 ? `<span class="text-sm text-gray-500 line-through mr-2 font-sans font-normal">${product.price}</span>${formatCurr(finalPrice)}` : product.price;
    }
    document.getElementById('detailPeriod').innerText = product.period;
    document.getElementById('detailYears').innerText = product.years;
    
    const voucherContainer = document.getElementById('detailVoucherContainer');
    const voucherCodeEl = document.getElementById('detailVoucherCode');
    if (voucherContainer && voucherCodeEl) {
        if (product.vouchers && product.vouchers.trim() !== '') {
            voucherCodeEl.innerText = product.vouchers;
            voucherContainer.classList.remove('hidden');
            voucherContainer.classList.add('flex');
        } else {
            voucherContainer.classList.add('hidden');
            voucherContainer.classList.remove('flex');
        }
    }
    
    // --- RENDER DỮ LIỆU TỪ TRÌNH SOẠN THẢO RICH TEXT ---
    let formattedDesc = product.desc || '';
    if (!formattedDesc.includes('<') && formattedDesc.includes('\n')) {
        formattedDesc = formattedDesc.replace(/\n/g, '<br>');
    }
    const descEl = document.getElementById('detailDesc');
    descEl.innerHTML = formattedDesc;
    descEl.classList.add('rich-text-display'); // Thêm class để nhận CSS bọc HTML

    updateDetailImageDisplay();
    
    // Tạo 1 đoạn mô tả rút gọn để nhét vào thẻ Meta SEO
    let cleanText = typeof window.stripHTMLForSearch === 'function' ? window.stripHTMLForSearch(formattedDesc) : formattedDesc;
    
    const seoImg = currentDetailImages.length > 0 ? currentDetailImages[0] : '';
    window.updateSEOMeta(`${product.name} | Tiền Xu Cổ`, cleanText.substring(0, 150) + '...', seoImg);

    document.getElementById('detailModal').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('detailModalContent').classList.remove('scale-95');
    document.body.classList.add('modal-open');
};

function updateDetailImageDisplay() {
    const imgEl = document.getElementById('detailMainImage'), svgEl = document.getElementById('detailSvgFallback');
    const prevBtn = document.getElementById('detailPrevBtn'), nextBtn = document.getElementById('detailNextBtn');
    const counter = document.getElementById('detailImageCounter');

    if (currentDetailImages.length > 0 && currentDetailImages[0].trim() !== '') {
        const safeUrls = typeof window.getSafeImgUrls === 'function' ? window.getSafeImgUrls(currentDetailImages[currentDetailIndex]) : {primary: currentDetailImages[currentDetailIndex], fallback: ''};
        
        imgEl.src = safeUrls.primary;
        imgEl.onerror = function() {
            if (!this.dataset.retried && safeUrls.fallback) {
                this.dataset.retried = 'true';
                this.src = safeUrls.fallback;
            } else {
                this.classList.add('hidden');
                svgEl.classList.remove('hidden');
            }
        };

        imgEl.classList.remove('hidden'); svgEl.classList.add('hidden');
        if (currentDetailImages.length > 1) {
            prevBtn.classList.remove('hidden'); nextBtn.classList.remove('hidden'); counter.classList.remove('hidden');
            counter.innerText = `${currentDetailIndex + 1}/${currentDetailImages.length}`;
        } else { prevBtn.classList.add('hidden'); nextBtn.classList.add('hidden'); counter.classList.add('hidden'); }
    } else {
        imgEl.classList.add('hidden'); prevBtn.classList.add('hidden'); nextBtn.classList.add('hidden'); counter.classList.add('hidden');
        svgEl.classList.remove('hidden');
        svgEl.innerHTML = `<svg viewBox="0 0 100 100" class="w-2/3 h-2/3 text-brand-gold opacity-80 drop-shadow-xl"><circle cx="50" cy="50" r="45" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="35" fill="transparent" stroke="currentColor" stroke-width="1"/><rect x="35" y="35" width="30" height="30" fill="transparent" stroke="currentColor" stroke-width="1"/><text x="50" y="55" font-size="16" text-anchor="middle" fill="#1c1612" font-weight="bold">${currentDetailProduct.symbol || '古'}</text></svg>`;
    }
}

window.detailNextImage = () => { if (currentDetailImages.length <= 1) return; currentDetailIndex = (currentDetailIndex + 1) % currentDetailImages.length; updateDetailImageDisplay(); };
window.detailPrevImage = () => { if (currentDetailImages.length <= 1) return; currentDetailIndex = (currentDetailIndex - 1 + currentDetailImages.length) % currentDetailImages.length; updateDetailImageDisplay(); };
window.closeDetailModal = () => { document.getElementById('detailModal').classList.add('opacity-0', 'pointer-events-none'); document.getElementById('detailModalContent').classList.add('scale-95'); document.body.classList.remove('modal-open'); window.updateSEOMeta('Tất Cả Sản Phẩm - Tiền Xu Cổ', '', ''); };
window.addToCartFromDetail = () => { if (currentDetailProduct) window.addToCart(currentDetailProduct.id || currentDetailProduct.ma_sp); window.closeDetailModal(); };