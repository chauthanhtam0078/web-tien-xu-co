// ============================================================================
// 📁 MODULE 6: CART & CHECKOUT (cart.js)
// Giỏ hàng, tính toán tổng tiền và gửi Đơn hàng
// ============================================================================

window.cart = window.cart || [];
window.currentVoucher = null; 

window.getLatestProductData = (cartItem) => {
    let latest = (window.globalProducts || []).find(p => p.id == cartItem.id || p.ma_sp == cartItem.ma_sp);
    return latest ? { ...cartItem, ...latest, quantity: cartItem.quantity } : cartItem;
};

window.checkVoucherEligible = (item, vCode) => {
    if(!item || !vCode) return false;
    let latestItem = window.getLatestProductData(item);
    let allowed = (latestItem.vouchers || latestItem.voucher || "").toString().toUpperCase().replace(/\s+/g, '');
    let target = vCode.toString().toUpperCase().replace(/\s+/g, '');
    return allowed.includes(target) || allowed === 'ALL' || allowed === '*';
};

window.toggleCartModal = () => {
    const modal = document.getElementById('cartModal');
    const content = document.getElementById('cartContent');
    
    if (modal.classList.contains('opacity-0')) {
        window.renderCartItems();
        modal.classList.remove('opacity-0', 'pointer-events-none');
        content.classList.remove('translate-x-full');
        document.body.classList.add('overflow-hidden');
    } else {
        modal.classList.add('opacity-0', 'pointer-events-none');
        content.classList.add('translate-x-full');
        document.body.classList.remove('overflow-hidden');
    }
};

window.saveCart = () => {
    localStorage.setItem('tienxu_cart', JSON.stringify(window.cart));
};

window.updateCartBadge = () => {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const totalItems = window.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
        badge.innerText = totalItems;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
};

window.addToCart = (id) => {
    let productsArray = window.globalProducts || [];
    let product = productsArray.find(p => p.id == id || p.ma_sp == id);
    if (!product && !isNaN(id)) product = productsArray[parseInt(id)];
    if (!product) return;

    const existingItem = window.cart.find(item => item.id == product.id || item.ma_sp == product.ma_sp);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        window.cart.push({ ...product, quantity: 1 });
    }

    window.saveCart();
    window.updateCartBadge();
    window.showToast(`Đã thêm ${product.name} vào giỏ hàng!`, "success");
};

window.removeFromCart = (index) => {
    window.cart.splice(index, 1);
    window.saveCart();
    window.updateCartBadge();
    window.renderCartItems();
    if (document.getElementById('orderModal') && !document.getElementById('orderModal').classList.contains('opacity-0')) {
        window.renderOrderSummary();
    }
};

window.updateQuantity = (index, change) => {
    if (window.cart[index].quantity + change > 0) {
        window.cart[index].quantity += change;
        window.saveCart();
        window.updateCartBadge();
        window.renderCartItems();
        if (document.getElementById('orderModal') && !document.getElementById('orderModal').classList.contains('opacity-0')) {
            window.renderOrderSummary();
        }
    } else if (window.cart[index].quantity + change === 0) {
        window.removeFromCart(index);
    }
};

window.renderCartItems = () => {
    const container = document.getElementById('cartItemsContainer');
    const priceEl = document.getElementById('cartTotalPrice');
    if (!container || !priceEl) return;

    container.innerHTML = '';
    let total = 0;

    if (window.cart.length === 0) {
        container.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-gray-400 mt-10"><svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg><p>Giỏ hàng của bạn đang trống</p></div>';
        priceEl.innerText = '0đ';
        return;
    }

    window.cart.forEach((cartItem, index) => {
        let item = window.getLatestProductData(cartItem);

        const finalPrice = typeof window.calculateFinalPrice === 'function' ? window.calculateFinalPrice(item.price, item.discount) : (parseInt(item.price.replace(/[^\d]/g, '')) || 0);
        let formatCurr = typeof window.formatCurrency === 'function' ? window.formatCurrency : (v) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ';
        total += finalPrice * item.quantity;
        
        let firstImg = item.images && item.images.length > 0 ? item.images[0] : '';
        let safeUrls = window.getSafeImgUrls(firstImg);
        
        let imgHtml = safeUrls.primary !== '' ? 
            `<img src="${safeUrls.primary}" onerror="window.handleSafeImageLoadError(this, '${safeUrls.fallback}')" class="w-16 h-16 object-cover bg-[#f8f5ee] rounded border border-brand-border">
             <div class="w-16 h-16 rounded border border-brand-border bg-[#f8f5ee] hidden items-center justify-center text-xl font-bold text-brand-gold">${item.symbol || '古'}</div>` : 
            `<div class="w-16 h-16 rounded border border-brand-border bg-[#f8f5ee] flex items-center justify-center text-xl font-bold text-brand-gold">${item.symbol || '古'}</div>`;

        let html = `
        <div class="flex items-center gap-4 bg-white p-3 rounded shadow-sm border border-gray-100 relative group">
            ${imgHtml}
            <div class="flex-grow">
                <h4 class="font-bold text-brand-dark text-sm pr-6 line-clamp-2">${item.name}</h4>
                <div class="text-red-700 font-bold font-sans mt-1">${formatCurr(finalPrice)}</div>
                <div class="flex items-center gap-3 mt-2">
                    <div class="flex items-center border border-gray-300 rounded">
                        <button onclick="window.updateQuantity(${index}, -1)" class="px-2 py-0.5 text-gray-500 hover:bg-gray-100 transition">-</button>
                        <span class="px-3 py-0.5 text-sm font-semibold border-x border-gray-300 min-w-[30px] text-center">${item.quantity}</span>
                        <button onclick="window.updateQuantity(${index}, 1)" class="px-2 py-0.5 text-gray-500 hover:bg-gray-100 transition">+</button>
                    </div>
                </div>
            </div>
            <button onclick="window.removeFromCart(${index})" class="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors p-1" title="Xóa">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        </div>`;
        container.innerHTML += html;
    });

    let formatCurr = typeof window.formatCurrency === 'function' ? window.formatCurrency : (v) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ';
    priceEl.innerText = formatCurr(total);
};

window.renderOrderSummary = () => {
    const container = document.getElementById('orderSummaryItems');
    const priceEl = document.getElementById('modalProductPrice');
    if (!container || !priceEl) return;
    
    container.innerHTML = '';
    let origTotal = 0; let prodDiscount = 0; let maxShipping = 0;
    let formatCurr = typeof window.formatCurrency === 'function' ? window.formatCurrency : (v) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ';
    
    window.cart.forEach((cartItem) => {
        let item = window.getLatestProductData(cartItem); 
        let p = parseInt(item.price.toString().replace(/[^\d]/g, '')) || 0;
        const finalP = typeof window.calculateFinalPrice === 'function' ? window.calculateFinalPrice(item.price, item.discount) : p;
        let qty = item.quantity;
        
        origTotal += p * qty;
        prodDiscount += (p - finalP) * qty;

        let ship = parseInt((item.shipping || '0').toString().replace(/[^\d]/g, '')) || 0;
        if (ship > maxShipping) maxShipping = ship;
        
        let formattedPrice = formatCurr(finalP);
        let qtyLabel = `<span class="text-xs bg-gray-200 text-gray-700 px-1.5 rounded-sm">x${qty}</span>`;
        
        let firstImg = item.images && item.images.length > 0 ? item.images[0] : '';
        let safeUrls = window.getSafeImgUrls(firstImg);
        
        let imgHtml = safeUrls.primary !== '' ? 
            `<img src="${safeUrls.primary}" onerror="window.handleSafeImageLoadError(this, '${safeUrls.fallback}')" class="w-10 h-10 object-cover bg-white rounded border border-gray-200">
             <div class="w-10 h-10 rounded border border-gray-200 bg-white hidden items-center justify-center text-xs font-bold text-brand-gold">${item.symbol || '古'}</div>` : 
            `<div class="w-10 h-10 rounded border border-gray-200 bg-white flex items-center justify-center text-xs font-bold text-brand-gold">${item.symbol || '古'}</div>`;
        
        let html = `
        <div class="flex items-center justify-between gap-3 bg-white p-2 rounded-sm border border-gray-100 mb-2">
            <div class="flex items-center gap-3 flex-grow min-w-0">
                ${imgHtml}
                <div class="min-w-0 flex-grow">
                    <p class="font-bold text-brand-dark text-sm truncate">${item.name}</p>
                    <p class="text-xs text-gray-500 font-sans mt-0.5">${formattedPrice} ${qtyLabel}</p>
                </div>
            </div>
            <div class="text-sm font-bold text-red-700 font-sans whitespace-nowrap pl-2">
                ${formatCurr(finalP * qty)}
            </div>
        </div>`;
        container.innerHTML += html;
    });

    let voucherDiscount = 0;
    if (window.currentVoucher) {
        let eligibleTotal = 0;
        window.cart.forEach(cartItem => {
            let item = window.getLatestProductData(cartItem);
            if (window.checkVoucherEligible(item, window.currentVoucher.code)) {
                let fPrice = typeof window.calculateFinalPrice === 'function' ? window.calculateFinalPrice(item.price, item.discount) : (parseInt(item.price.toString().replace(/[^\d]/g, '')) || 0);
                eligibleTotal += fPrice * item.quantity;
            }
        });

        if (eligibleTotal > 0) {
            if (window.currentVoucher.type === 'percent') voucherDiscount = eligibleTotal * (window.currentVoucher.value / 100);
            else voucherDiscount = window.currentVoucher.value;
            if (voucherDiscount > eligibleTotal) voucherDiscount = eligibleTotal;
        } else {
            window.currentVoucher = null;
            if(document.getElementById('voucherMessage')) {
                document.getElementById('voucherMessage').innerText = "Mã không áp dụng cho sản phẩm trong giỏ.";
                document.getElementById('voucherMessage').className = "text-[11px] mt-1.5 font-medium text-red-500 block";
            }
        }
    }

    let finalSubTotal = origTotal - prodDiscount - voucherDiscount;
    // FREE SHIP LOGIC: >= 500k -> 0đ Ship
    if (finalSubTotal >= 500000) {
        maxShipping = 0;
    }

    let finalTotal = finalSubTotal + maxShipping;
    if (finalTotal < 0) finalTotal = 0;

    const priceContainer = priceEl.parentElement;
    priceContainer.innerHTML = `
        <div class="text-xs text-gray-500 font-medium mb-1 flex justify-between gap-4"><span>Tạm tính:</span> <span>${formatCurr(origTotal)}</span></div>
        ${prodDiscount > 0 ? `<div class="text-xs text-orange-600 font-medium mb-1 flex justify-between gap-4"><span>Chiết khấu SP:</span> <span>-${formatCurr(prodDiscount)}</span></div>` : ''}
        ${voucherDiscount > 0 ? `<div class="text-xs text-green-600 font-bold mb-1 flex justify-between gap-4"><span>Mã ${window.currentVoucher.code}:</span> <span>-${formatCurr(voucherDiscount)}</span></div>` : ''}
        <div class="text-xs text-blue-600 font-medium mb-1 flex justify-between gap-4 border-b border-gray-200 pb-2"><span>Phí giao hàng:</span> <span>+${formatCurr(maxShipping)}</span></div>
        <div id="modalProductPrice" class="text-2xl font-sans font-bold text-red-800 mt-2 text-right">${formatCurr(finalTotal)}</div>
    `;
};

window.applyVoucher = () => {
    const codeInput = document.getElementById('voucherCodeInput');
    const msgEl = document.getElementById('voucherMessage');
    const code = codeInput.value.trim().toUpperCase();

    if (!code) {
        window.currentVoucher = null;
        msgEl.innerText = "Đã hủy mã giảm giá.";
        msgEl.className = "text-[11px] mt-1.5 font-medium text-gray-500 block";
        window.renderOrderSummary();
        return;
    }

    let vArray = window.globalVouchers || [];
    if (vArray.length === 0) {
        msgEl.innerText = "Hệ thống hiện không có mã giảm giá nào.";
        msgEl.className = "text-[11px] mt-1.5 font-medium text-red-500 block";
        return;
    }

    const voucher = vArray.find(v => v.code === code);
    if (!voucher) {
        msgEl.innerText = "Mã giảm giá không tồn tại hoặc sai.";
        msgEl.className = "text-[11px] mt-1.5 font-medium text-red-500 block";
        return;
    }

    if (voucher.max_usage > 0 && voucher.used >= voucher.max_usage) {
        msgEl.innerText = "Mã giảm giá này đã hết lượt sử dụng.";
        msgEl.className = "text-[11px] mt-1.5 font-medium text-red-500 block";
        return;
    }

    let eligibleTotal = 0;
    window.cart.forEach(cartItem => {
        let item = window.getLatestProductData(cartItem);
        if (window.checkVoucherEligible(item, voucher.code)) {
            let fPrice = typeof window.calculateFinalPrice === 'function' ? window.calculateFinalPrice(item.price, item.discount) : parseInt(item.price.toString().replace(/[^\d]/g, '')) || 0;
            eligibleTotal += fPrice * item.quantity;
        }
    });

    let formatCurr = typeof window.formatCurrency === 'function' ? window.formatCurrency : (v) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ';

    if (eligibleTotal === 0) {
        msgEl.innerText = "Mã giảm giá không áp dụng cho các sản phẩm trong giỏ.";
        msgEl.className = "text-[11px] mt-1.5 font-medium text-red-500 block";
        return;
    }

    if (voucher.min_order > 0 && eligibleTotal < voucher.min_order) {
        msgEl.innerText = `Sản phẩm hỗ trợ cần đạt tối thiểu ${formatCurr(voucher.min_order)}.`;
        msgEl.className = "text-[11px] mt-1.5 font-medium text-red-500 block";
        return;
    }

    window.currentVoucher = voucher;
    msgEl.innerText = `Đã áp dụng mã thành công!`;
    msgEl.className = "text-[11px] mt-1.5 font-medium text-green-600 block";
    window.renderOrderSummary();
    if(typeof window.showToast === 'function') window.showToast("Áp dụng mã giảm giá thành công!", "success");
};

window.checkoutCart = () => {
    if (window.cart.length === 0) {
        if(typeof window.showToast === 'function') window.showToast("Giỏ hàng đang trống!", "error");
        return;
    }
    window.toggleCartModal();
    window.renderOrderSummary();
    
    window.currentVoucher = null;
    if(document.getElementById('voucherCodeInput')) document.getElementById('voucherCodeInput').value = '';
    if(document.getElementById('voucherMessage')) document.getElementById('voucherMessage').classList.add('hidden');

    // AUTO-FILL DATA TỪ TÀI KHOẢN KHÁCH HÀNG (CÓ LISTBOX CHỌN NHIỀU EMAIL/ADDRESS & AUTO VOUCHER)
    const emailContainer = document.getElementById('checkoutEmailContainer');
    const addressContainer = document.getElementById('checkoutAddressContainer');
    const form = document.getElementById('orderForm');
    
    if (window.loggedCustomer && form) {
        form.querySelector('input[name="customer_name"]').value = window.loggedCustomer.name || '';
        form.querySelector('input[name="phone"]').value = window.loggedCustomer.phone || '';
        
        // Auto apply voucher nếu có
        if (window.loggedCustomer.voucher && window.loggedCustomer.voucher.trim() !== '') {
            document.getElementById('voucherCodeInput').value = window.loggedCustomer.voucher.trim();
            window.applyVoucher();
        }

        // Render Listbox cho Email
        const emails = window.loggedCustomer.email ? window.loggedCustomer.email.split('\n').filter(Boolean) : [];
        if (emails.length > 1) {
            let options = emails.map(e => `<option value="${e}">${e}</option>`).join('');
            emailContainer.innerHTML = `<select name="email" class="w-full px-4 py-2 text-sm border border-brand-border focus:ring-1 focus:ring-brand-gold outline-none rounded-sm bg-white"><option value="">-- Chọn Email (Hoặc để trống) --</option>${options}</select>`;
        } else {
            emailContainer.innerHTML = `<input type="email" name="email" value="${emails[0]||''}" placeholder="Email (Tuỳ chọn)" class="w-full px-4 py-2 text-sm border border-brand-border focus:ring-1 focus:ring-brand-gold outline-none rounded-sm" onkeydown="if(event.key==='Enter')event.preventDefault();">`;
        }

        // Render Listbox cho Địa Chỉ
        const addresses = window.loggedCustomer.address ? window.loggedCustomer.address.split('\n').filter(Boolean) : [];
        if (addresses.length > 1) {
            let options = addresses.map(a => `<option value="${a}">${a}</option>`).join('');
            addressContainer.innerHTML = `<select name="address" required class="w-full px-4 py-2 text-sm border border-brand-border focus:ring-1 focus:ring-brand-gold outline-none rounded-sm bg-white">${options}</select>`;
        } else {
            addressContainer.innerHTML = `<textarea name="address" required rows="2" placeholder="Địa chỉ giao hàng chi tiết *" class="w-full px-4 py-2 text-sm border border-brand-border focus:ring-1 focus:ring-brand-gold resize-none outline-none rounded-sm" onkeydown="if(event.key==='Enter')event.preventDefault();">${addresses[0]||''}</textarea>`;
        }
    } else {
        // Reset về input trắng nếu không đăng nhập
        if(form) {
            form.querySelector('input[name="customer_name"]').value = '';
            form.querySelector('input[name="phone"]').value = '';
        }
        emailContainer.innerHTML = `<input type="email" name="email" placeholder="Email (Tuỳ chọn)" class="w-full px-4 py-2 text-sm border border-brand-border focus:ring-1 focus:ring-brand-gold outline-none rounded-sm" onkeydown="if(event.key==='Enter')event.preventDefault();">`;
        addressContainer.innerHTML = `<textarea name="address" required rows="2" placeholder="Địa chỉ giao hàng chi tiết *" class="w-full px-4 py-2 text-sm border border-brand-border focus:ring-1 focus:ring-brand-gold resize-none outline-none rounded-sm" onkeydown="if(event.key==='Enter')event.preventDefault();"></textarea>`;
    }

    window.renderOrderSummary();

    document.getElementById('orderModal').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('modalContent').classList.remove('scale-95');
    document.body.classList.add('modal-open');
    setTimeout(() => { document.querySelector('input[name="customer_name"]').focus(); }, 300);
};

window.closeModal = () => {
    document.getElementById('orderModal').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('modalContent').classList.add('scale-95');
    document.body.classList.remove('modal-open');
};

window.togglePaymentInfo = () => {
    const method = document.querySelector('input[name="payment_method"]:checked').value;
    const bankInfo = document.getElementById('bankInfoArea');
    if (method === 'BANK') bankInfo.classList.remove('hidden');
    else bankInfo.classList.add('hidden');
};

window.submitOrder = async (event) => {
    event.preventDefault();
    if(window.cart.length === 0) return typeof window.showToast === 'function' && window.showToast("Giỏ hàng đang trống!", "error");
    
    const formData = new FormData(event.target);
    const phone = formData.get('phone').trim();
    const email = formData.get('email') ? formData.get('email').trim() : "";
    
    const err = window.validateInput(phone, email);
    if(err) return typeof window.showToast === 'function' && window.showToast(err, "error");

    const btn = document.getElementById('submitOrderBtn');
    const spinner = btn.querySelector('.spinner-icon');
    const btnText = btn.querySelector('.btn-text');

    btn.disabled = true; spinner.classList.remove('hidden'); btnText.innerText = 'ĐANG XỬ LÝ...';

    let origTotal = 0; let prodDiscount = 0; let maxShipping = 0;
    let formatCurr = typeof window.formatCurrency === 'function' ? window.formatCurrency : (v) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ';
    
    window.cart.forEach((cartItem) => {
        let item = window.getLatestProductData(cartItem);
        let p = parseInt(item.price.toString().replace(/[^\d]/g, '')) || 0;
        const finalP = typeof window.calculateFinalPrice === 'function' ? window.calculateFinalPrice(item.price, item.discount) : p;
        let qty = item.quantity;
        origTotal += p * qty;
        prodDiscount += (p - finalP) * qty;
        let ship = parseInt((item.shipping || '0').toString().replace(/[^\d]/g, '')) || 0;
        if (ship > maxShipping) maxShipping = ship;
    });

    let voucherDiscount = 0;
    if (window.currentVoucher) {
        let eligibleTotal = 0;
        window.cart.forEach(cartItem => {
            let item = window.getLatestProductData(cartItem);
            if (window.checkVoucherEligible(item, window.currentVoucher.code)) {
                let fPrice = typeof window.calculateFinalPrice === 'function' ? window.calculateFinalPrice(item.price, item.discount) : parseInt(item.price.toString().replace(/[^\d]/g, '')) || 0;
                eligibleTotal += fPrice * item.quantity;
            }
        });
        if (window.currentVoucher.type === 'percent') voucherDiscount = eligibleTotal * (window.currentVoucher.value / 100);
        else voucherDiscount = window.currentVoucher.value;
        if (voucherDiscount > eligibleTotal) voucherDiscount = eligibleTotal;
    }

    let finalSubTotal = origTotal - prodDiscount - voucherDiscount;
    // FREE SHIP LOGIC: >= 500k -> 0đ Ship
    if (finalSubTotal >= 500000) {
        maxShipping = 0;
    }
    
    let finalTotal = finalSubTotal + maxShipping;
    if (finalTotal < 0) finalTotal = 0;

    const orderData = {
        ma_kh: window.loggedCustomer ? window.loggedCustomer.ma_kh : "",
        customer_name: formData.get('customer_name'),
        phone: phone,
        email: email,
        address: formData.get('address'),
        notes: formData.get('notes'),
        payment_method: formData.get('payment_method'),
        items: window.cart.map(cartItem => {
            let item = window.getLatestProductData(cartItem);
            return {
                ma_sp: item.ma_sp || item.id,
                name: item.name,
                price: item.price,
                discount: item.discount || 0,
                quantity: item.quantity,
                vouchers: item.vouchers || "",
                shipping: item.shipping || "0đ"
            }
        }),
        original_total: origTotal,
        product_discount: prodDiscount,
        voucher_code: window.currentVoucher ? window.currentVoucher.code : "",
        voucher_discount: voucherDiscount,
        shipping_fee: maxShipping,
        final_total: finalTotal
    };

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify({ action: 'addOrder', data: orderData }) });
        const result = await response.json();
        
        if (result.success) {
            let detailList = [];
            window.cart.forEach(cartItem => {
                let item = window.getLatestProductData(cartItem);
                let q = item.quantity;
                let priceNum = parseInt(item.price.toString().replace(/[^\d]/g, '')) || 0;
                let discountNum = typeof window.getDiscountPercent === 'function' ? window.getDiscountPercent(item.discount) : 0;
                let totalBase = priceNum * q;
                
                let detailString = `${q} x ${item.name}\nGiá gốc: ${formatCurr(totalBase)}`;
                if (discountNum > 0) {
                    let totalDiscount = totalBase * discountNum / 100;
                    detailString += `\nChiết khấu (${discountNum}%): -${formatCurr(totalDiscount)}`;
                }
                detailList.push(detailString);
            });

            if (window.currentVoucher && voucherDiscount > 0) {
                let vString = `\nVoucher (${window.currentVoucher.code}): -${formatCurr(voucherDiscount)}`;
                for(let i = detailList.length - 1; i >= 0; i--) {
                    let item = window.getLatestProductData(window.cart[i]);
                    if (window.checkVoucherEligible(item, window.currentVoucher.code)) {
                        detailList[i] += vString;
                        break;
                    }
                }
            }

            if (!window.globalOrders) window.globalOrders = [];
            window.globalOrders.unshift({
                order_code: "Đang cập nhật...",
                date: "Vừa xong",
                ma_kh: window.loggedCustomer ? window.loggedCustomer.ma_kh : "",
                customer: orderData.customer_name,
                phone: orderData.phone,
                address: orderData.address,
                email: orderData.email,
                product: window.cart.map(cartItem => window.getLatestProductData(cartItem).name).join('\n'),
                qty: window.cart.map(cartItem => cartItem.quantity).join('\n'),
                detail: detailList.join('\n-----\n'),
                total: formatCurr(orderData.final_total),
                method: orderData.payment_method === 'BANK' ? 'BANK: Chưa nhận chuyển khoản' : 'COD',
                status: 'Chưa Giao Hàng',
                notes: orderData.notes,
                note1: window.currentVoucher ? window.currentVoucher.code : "",
                note2: maxShipping > 0 ? formatCurr(maxShipping) : "0đ",
                note3: ""
            });

            window.cart = []; 
            window.currentVoucher = null;
            window.saveCart(); window.updateCartBadge();
            event.target.reset(); 
            if(document.getElementById('voucherCodeInput')) document.getElementById('voucherCodeInput').value = '';
            if(document.getElementById('voucherMessage')) document.getElementById('voucherMessage').classList.add('hidden');
            window.closeModal();
            if(typeof window.showToast === 'function') window.showToast("🎉 Đặt hàng thành công! Chúng tôi sẽ liên hệ sớm nhất.", "success");
            
            setTimeout(() => { 
                if(typeof window.switchPage === 'function') window.switchPage('tracking'); 
                document.getElementById('trackingCodeInput').value = orderData.phone; 
                if(typeof window.handleTrackOrder === 'function') window.handleTrackOrder(); 
            }, 1000);

            localStorage.removeItem('tienxu_cached_webdata');
            if(typeof window.fetchAllData === 'function') setTimeout(window.fetchAllData, 2500); 
        } else { 
            if(typeof window.showToast === 'function') window.showToast(result.message || "Lỗi từ máy chủ!", "error"); 
        }
    } catch (error) { if(typeof window.showToast === 'function') window.showToast("Lỗi mạng, vui lòng thử lại sau.", "error"); } 
    finally { btn.disabled = false; spinner.classList.add('hidden'); btnText.innerText = 'ĐẶT HÀNG NGAY'; }
};