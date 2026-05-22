// ============================================================================
// 📁 MODULE 6: CART & CHECKOUT (cart.js)
// Thao tác giỏ hàng và gửi dữ liệu thanh toán
// ============================================================================
window.addToCart = (productId) => {
    let product = globalProducts.find(p => p.id == productId || p.ma_sp == productId);
    if (!product && !isNaN(productId)) product = globalProducts[parseInt(productId)];
    if (!product) return;

    const stock = getProductStock(product);
    const existingItem = cart.find(item => item.id == product.id);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;

    if (currentQtyInCart + 1 > stock) {
        window.showToast(stock <= 0 ? `Sản phẩm ${product.name} đã hết hàng!` : `Chỉ còn ${stock} sản phẩm trong kho!`, 'error');
        return;
    }

    if (existingItem) existingItem.quantity += 1; else cart.push({ ...product, quantity: 1 });
    saveCart(); updateCartBadge(); window.toggleCartModal(true);
    window.showToast(`Đã thêm ${product.name} vào giỏ`, 'success');
};

window.removeFromCart = (productId) => { 
    cart = cart.filter(item => item.id != productId); 
    saveCart(); updateCartBadge(); renderCartItems(); 
};

window.changeCartQuantity = (productId, delta) => {
    const item = cart.find(item => item.id == productId);
    if (item) {
        if (delta > 0) {
            let product = globalProducts.find(p => p.id == productId);
            const stock = getProductStock(product);
            if (item.quantity + delta > stock) {
                window.showToast(`Chỉ còn ${stock} sản phẩm trong kho!`, 'error');
                return;
            }
        }
        item.quantity += delta; 
        if (item.quantity <= 0) window.removeFromCart(productId); 
        else { saveCart(); renderCartItems(); } 
    }
};

function saveCart() { localStorage.setItem('tienxu_cart', JSON.stringify(cart)); }
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if(badge) { badge.innerText = totalItems; totalItems > 0 ? badge.classList.remove('hidden') : badge.classList.add('hidden'); }
}
window.toggleCartModal = (forceOpen = false) => {
    const modal = document.getElementById('cartModal'), content = document.getElementById('cartContent');
    if (forceOpen === true || modal.classList.contains('opacity-0')) {
        renderCartItems(); modal.classList.remove('opacity-0', 'pointer-events-none'); content.classList.remove('translate-x-full'); document.body.classList.add('modal-open');
    } else {
        modal.classList.add('opacity-0', 'pointer-events-none'); content.classList.add('translate-x-full'); document.body.classList.remove('modal-open');
    }
};

function renderCartItems() {
    const container = document.getElementById('cartItemsContainer'), totalEl = document.getElementById('cartTotalPrice');
    if(cart.length === 0) {
        container.innerHTML = `<div class="text-center py-10 text-gray-500"><p>Giỏ hàng đang trống.</p></div>`;
        if(totalEl) totalEl.innerText = "0đ"; return;
    }
    let html = '', totalPrice = 0;
    cart.forEach(item => {
        const finalPrice = calculateFinalPrice(item.price, item.discount); totalPrice += finalPrice * item.quantity;
        const discountVal = getDiscountPercent(item.discount);
        let imgUrl = (item.images && item.images.length > 0) ? item.images[0] : 'https://placehold.co/100x100/efe8d7/1c1612?text=Xu';
        html += `
            <div class="flex gap-4 p-3 bg-white border border-gray-100 rounded-sm shadow-sm relative">
                <img src="${imgUrl}" class="w-20 h-20 object-cover rounded-sm border border-gray-200">
                <div class="flex-grow flex flex-col justify-center">
                    <h4 class="font-serif font-bold text-sm line-clamp-2 pr-6">${item.name}</h4>
                    ${discountVal > 0 ? `<p class="text-[10px] text-gray-500 line-through mb-0 mt-1 font-sans">${item.price}</p>` : ''}
                    <p class="text-red-700 font-bold text-sm font-sans ${discountVal > 0 ? 'mt-0' : 'mt-1'}">${formatCurrency(finalPrice)}</p>
                    <div class="flex items-center gap-3 mt-2">
                        <div class="flex items-center border border-gray-300 rounded-full overflow-hidden">
                            <button onclick="window.changeCartQuantity('${item.id}', -1)" class="px-3 py-1 bg-gray-50 hover:bg-gray-200 font-bold">-</button>
                            <span class="px-3 py-1 text-xs font-medium border-x border-gray-300 font-sans">${item.quantity}</span>
                            <button onclick="window.changeCartQuantity('${item.id}', 1)" class="px-3 py-1 bg-gray-50 hover:bg-gray-200 font-bold">+</button>
                        </div>
                    </div>
                </div>
                <button onclick="window.removeFromCart('${item.id}')" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1">✖</button>
            </div>`;
    });
    container.innerHTML = html;
    if (totalEl) { totalEl.classList.add('font-sans'); totalEl.innerText = formatCurrency(totalPrice); }
}

window.checkoutCart = () => {
    if (cart.length === 0) return;
    window.toggleCartModal(false);
    let totalPrice = cart.reduce((sum, item) => sum + (calculateFinalPrice(item.price, item.discount) * item.quantity), 0);
    let summaryNames = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');
    setTimeout(() => { window.openModal(summaryNames, formatCurrency(totalPrice), totalPrice); }, 300);
};

window.openModal = (productSummaryNames, formattedPriceString, numericTotal) => {
    currentOrderCode = generateClientCode('TXC-O-'); currentOrderTotal = numericTotal; 
    const summaryContainer = document.getElementById('orderSummaryItems');
    if (summaryContainer) {
        summaryContainer.innerHTML = cart.map(item => {
            const finalPrice = calculateFinalPrice(item.price, item.discount);
            let imgUrl = (item.images && item.images.length > 0) ? item.images[0] : 'https://placehold.co/100/efe8d7/1c1612';
            return `<div class="flex gap-3 items-center bg-white p-3 rounded-sm shadow-sm"><img src="${imgUrl}" class="w-12 h-12 object-cover rounded-sm border border-gray-200"><div class="flex-grow"><h5 class="text-xs font-bold line-clamp-1">${item.name}</h5><p class="text-[11px] text-gray-500 mt-0.5">SL: ${item.quantity} <span class="text-red-600 font-sans ml-1 font-bold">x ${formatCurrency(finalPrice)}</span></p></div></div>`;
        }).join('');
    }
    const modalPriceEl = document.getElementById('modalProductPrice');
    if (modalPriceEl) { modalPriceEl.classList.add('font-sans'); modalPriceEl.innerText = formattedPriceString; }
    document.getElementById('hiddenProductName').value = productSummaryNames;
    updateQRCode(''); document.getElementById('orderForm').reset(); window.togglePaymentInfo();
    document.getElementById('orderModal').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('modalContent').classList.remove('scale-95'); document.body.classList.add('modal-open');
}

window.closeModal = () => {
    document.getElementById('orderModal').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('modalContent').classList.add('scale-95'); document.body.classList.remove('modal-open');
}

window.togglePaymentInfo = () => {
    const method = document.querySelector('input[name="payment_method"]:checked')?.value;
    const btnText = document.querySelector('#submitOrderBtn .btn-text');
    if(method === 'BANK') { 
        document.getElementById('bankInfoArea').classList.remove('hidden'); 
        if(btnText) btnText.innerText = "TÔI ĐÃ CHUYỂN KHOẢN & ĐẶT HÀNG"; 
    } else { 
        document.getElementById('bankInfoArea').classList.add('hidden'); 
        if(btnText) btnText.innerText = "ĐẶT HÀNG NGAY"; 
    }
};

window.submitOrder = async (event) => {
    event.preventDefault();
    if(SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) return window.showToast("Bản xem trước: Chưa kết nối API!", "error");
    
    const btn = document.getElementById('submitOrderBtn'); 
    const spinner = btn.querySelector('.spinner-icon');
    const textSpan = btn.querySelector('.btn-text');
    const oldText = textSpan.innerText;
    
    textSpan.innerText = "ĐANG XỬ LÝ..."; 
    btn.disabled = true;
    spinner.classList.remove('hidden');

    const orderData = {
        order_code: currentOrderCode, customer_name: event.target.customer_name.value, phone: event.target.phone.value,
        email: event.target.email.value || "", address: event.target.address.value, notes: event.target.notes.value || "",
        payment_method: document.querySelector('input[name="payment_method"]:checked').value,
        items: cart.map(item => ({ id: item.id, ma_sp: item.ma_sp || "", name: item.name, quantity: item.quantity, price: item.price, discount: item.discount || "" }))
    };

    try {
        const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'addOrder', data: orderData }) });
        const result = await response.json();
        if(result.success) {
            window.showToast(orderData.payment_method === 'BANK' ? "Cảm ơn! Hệ thống đã ghi nhận mã thanh toán của bạn." : "Cảm ơn! Đơn hàng COD của bạn đã được ghi nhận.", "success");
            cart = []; saveCart(); updateCartBadge(); window.closeModal();
            fetchAllData(); 
        } else {
            window.showToast("Lỗi: " + result.message, "error");
        }
    } catch (error) { 
        window.showToast("Lỗi mạng, vui lòng thử lại.", "error"); 
    } finally { 
        textSpan.innerText = oldText; 
        btn.disabled = false;
        spinner.classList.add('hidden');
    }
}
