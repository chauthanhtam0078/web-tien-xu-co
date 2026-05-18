// =========================================================
// 🛑 DÁN ĐƯỜNG LINK WEB APP (GOOGLE APPS SCRIPT) VÀO ĐÂY:
// =========================================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyc9b2iKk-tBqDkXU537Nof0aQdI7tC9i8yH1g2Z3X4c5V6b7N8m9Q0w1E2r3T4Y5U6I7o8p/exec'; // <-- Thay bằng link của bạn

// State quản lý
let productsData = [];
let isAdminActive = false;
let hasAdminPrivilege = false;

// Dữ liệu mẫu (nếu Google Sheet chưa có gì)
const defaultProducts = [
    { id: "mock1", name: "Đồng Xu Khải Định 1 Đồng", price: "850.000đ", period: "Triều Nguyễn", years: "1916-1925", desc: "Tiền xu bằng đồng thời vua Khải Định, còn rõ nét chữ Hán và hoa văn rồng phụng cổ điển.", symbol: "宣", color: "text-brand-gold", images: [] },
    { id: "mock2", name: "Bạch Kim Bảo Đại 5 Xu", price: "1.200.000đ", period: "Triều Nguyễn", years: "1925-1945", desc: "Xu bạch kim thời vua Bảo Đại, kích thước nhỏ, bề mặt còn lưu dấu ấn đúc tiền triều đình.", symbol: "統", color: "text-gray-500", images: [] },
    { id: "mock3", name: "Đồng Tiền Tự Đức Thông Bảo", price: "650.000đ", period: "Triều Nguyễn", years: "1848-1883", desc: "Tiền xu đồng thời Tự Đức, bốn chữ 'Tự Đức Thông Bảo' xung quanh lỗ vuông trung tâm.", symbol: "嗣", color: "text-amber-700", images: [] },
    { id: "mock4", name: "Đồng Xu Minh Mạng Thông Bảo", price: "980.000đ", period: "Triều Nguyễn", years: "1820-1841", desc: "Xu đồng thời Minh Mạng, một trong những triều đại hưng thịnh nhất, chất lượng đúc cao.", symbol: "明", color: "text-gray-600", images: [] }
];

// ================= KHỞI TẠO & LẮNG NGHE SỰ KIỆN =================
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();

    // Lắng nghe Form Giới Thiệu
    const aboutForm = document.getElementById('aboutForm');
    if(aboutForm) {
        aboutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if(SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) return alert("Vui lòng dán Link Google Script vào code!");
            const btn = e.target.querySelector('button');
            const oldText = btn.innerText;
            btn.innerText = '💾 Đang lưu...'; btn.disabled = true;

            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'updateAbout',
                        data: {
                            title: document.getElementById('aboutTitle').value,
                            content: document.getElementById('aboutContent').value
                        }
                    })
                });
                const result = await response.json();
                if(result.success) alert('✅ Cập nhật Giới thiệu thành công!');
                else alert('❌ Lỗi: ' + result.message);
            } catch (error) {
                alert('❌ Lỗi mạng: ' + error.message);
            } finally {
                btn.innerText = oldText; btn.disabled = false;
            }
        });
    }

    // Lắng nghe Form Tin Tức
    const newsForm = document.getElementById('newsForm');
    if(newsForm) {
        newsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if(SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) return alert("Vui lòng dán Link Google Script vào code!");
            const btn = e.target.querySelector('button');
            const oldText = btn.innerText;
            btn.innerText = '📝 Đang lưu...'; btn.disabled = true;

            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'addNews',
                        data: {
                            title: document.getElementById('newsTitle').value,
                            content: document.getElementById('newsContent').value
                        }
                    })
                });
                const result = await response.json();
                if(result.success) {
                    alert('✅ Thêm bài viết tin tức thành công!');
                    e.target.reset();
                } else {
                    alert('❌ Lỗi: ' + result.message);
                }
            } catch (error) {
                alert('❌ Lỗi mạng: ' + error.message);
            } finally {
                btn.innerText = oldText; btn.disabled = false;
            }
        });
    }

    // Lắng nghe Form Liên Hệ
    const contactForm = document.getElementById('contactForm');
    if(contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if(SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) return alert("Vui lòng dán Link Google Script vào code!");
            const btn = e.target.querySelector('button');
            const oldText = btn.innerText;
            btn.innerText = '💾 Đang lưu...'; btn.disabled = true;

            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'updateContact',
                        data: {
                            address: document.getElementById('contactAddress').value,
                            phone: document.getElementById('contactPhone').value,
                            email: document.getElementById('contactEmail').value,
                            zalo: document.getElementById('contactZalo').value,
                            messenger: document.getElementById('contactMessenger').value,
                            notes: document.getElementById('contactNotes').value
                        }
                    })
                });
                const result = await response.json();
                if(result.success) alert('✅ Cập nhật thông tin liên hệ thành công!');
                else alert('❌ Lỗi: ' + result.message);
            } catch (error) {
                alert('❌ Lỗi mạng: ' + error.message);
            } finally {
                btn.innerText = oldText; btn.disabled = false;
            }
        });
    }
});

// Hàm Đăng nhập Admin giả lập (Bảo mật cơ bản cho Local/Static Web)
window.handleAuth = () => {
    if (hasAdminPrivilege) {
        if(confirm("Bạn muốn đăng xuất khỏi quyền Admin?")) {
            hasAdminPrivilege = false;
            isAdminActive = false;
            window.location.reload();
        }
    } else {
        const pass = prompt("Nhập mật khẩu Admin (Mặc định test: 123456):");
        if (pass === "123456") {
            hasAdminPrivilege = true;
            alert("Đăng nhập Admin thành công!");
            document.getElementById('adminControlBox').innerHTML = `
                <button onclick="window.toggleAdmin()" id="toggleAdminBtn" class="text-xs text-brand-gold border border-brand-gold px-3 py-1 hover:bg-brand-gold hover:text-[#1a1a1a] transition-colors rounded">
                    🔧 Vào Quản Trị
                </button>
                <button onclick="window.handleAuth()" class="text-xs text-gray-500 hover:text-red-400 underline transition-colors">
                    Đăng xuất
                </button>
            `;
        } else if (pass !== null) {
            alert("Sai mật khẩu!");
        }
    }
};

// ================= KẾT NỐI GOOGLE SHEETS API =================

// Lấy dữ liệu Sản phẩm từ Sheets
async function fetchProducts() {
    if(SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) {
        console.warn("Chưa cấu hình Google Script URL, hiển thị dữ liệu mẫu.");
        productsData = [...defaultProducts];
        finishLoading();
        return;
    }

    try {
        const response = await fetch(SCRIPT_URL + '?action=getProducts');
        const data = await response.json();
        
        productsData = data.length > 0 ? data : [...defaultProducts];
        productsData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); // Mới nhất lên đầu
    } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
        productsData = [...defaultProducts]; // Lỗi thì show mẫu
    }
    finishLoading();
}

function finishLoading() {
    document.getElementById('loadingIndicator').classList.add('hidden');
    if (!isAdminActive) document.getElementById('publicContainer').classList.remove('hidden');
    renderPublicGrid();
    renderAdminTable();
}

// Tiện ích chuyển File Ảnh sang Base64 để gửi qua Google Apps Script
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// Thêm Sản Phẩm (Đẩy Base64 Ảnh lên Google Drive)
window.handleAddProduct = async (e) => {
    e.preventDefault();
    if(!hasAdminPrivilege) return alert("Bạn không có quyền!");
    if(SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) return alert("Hãy điền URL Google Script vào code JS trước!");

    const btn = e.target.querySelector('button');
    const oldText = btn.innerText;
    btn.innerText = "⏳ Đang tải ảnh lên Drive và lưu..."; btn.disabled = true;

    try {
        const fileInput = document.getElementById('addImages');
        let base64Images = [];

        // Chuyển tất cả ảnh được chọn sang dạng chuỗi Base64
        if (fileInput.files.length > 0) {
            for (let i = 0; i < fileInput.files.length; i++) {
                const b64 = await fileToBase64(fileInput.files[i]);
                base64Images.push(b64);
            }
        }

        const productData = {
            name: document.getElementById('addName').value,
            price: document.getElementById('addPrice').value,
            years: document.getElementById('addYears').value,
            period: document.getElementById('addPeriod').value,
            symbol: document.getElementById('addSymbol').value || '古',
            desc: document.getElementById('addDesc').value,
            images: base64Images
        };

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'addProduct', data: productData })
        });
        
        const result = await response.json();
        if(result.success) {
            e.target.reset(); 
            alert("✅ Đã thêm sản phẩm! Vui lòng F5 trang để cập nhật dữ liệu từ Sheets.");
            window.location.reload();
        } else {
            alert("❌ Lỗi Server: " + result.message);
        }
    } catch (error) {
        console.error(error);
        alert("❌ Lỗi: " + error.message);
    } finally {
        btn.innerText = oldText; btn.disabled = false;
    }
};

// Khách Đặt Hàng (Đẩy Đơn hàng lên Sheet Orders)
window.submitOrder = async (event) => {
    event.preventDefault();
    if(SCRIPT_URL.includes('DÁN_ĐƯỜNG_LINK')) return alert("Tính năng đặt hàng đang bảo trì (Chưa cấu hình API).");

    const btn = event.target.querySelector('button[type="submit"]');
    btn.innerText = "ĐANG GỬI..."; btn.disabled = true;

    const orderData = {
        product_name: document.getElementById('hiddenProductName').value,
        customer_name: event.target.customer_name.value,
        phone: event.target.phone.value,
        address: event.target.address.value
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'addOrder', data: orderData })
        });
        const result = await response.json();
        if(result.success) {
            alert("✅ Cảm ơn! Bạn đã đặt mua thành công. Đơn hàng đã ghi nhận vào Google Sheets.");
            window.closeModal();
            event.target.reset();
        } else {
            alert("❌ Có lỗi xảy ra: " + result.message);
        }
    } catch (error) {
        console.error("Lỗi đặt hàng:", error);
        alert("❌ Có lỗi mạng, vui lòng thử lại.");
    } finally {
        btn.innerText = "ĐẶT HÀNG NGAY"; btn.disabled = false;
    }
}


// ================= CÁC HÀM XỬ LÝ GIAO DIỆN (UI LOGIC) =================

window.switchPage = (pageId) => {
    if (isAdminActive) {
        isAdminActive = false;
        document.getElementById('adminSection').classList.add('hidden');
        document.getElementById('publicContainer').classList.remove('hidden');
    }

    document.querySelectorAll('.page-view').forEach(el => el.classList.add('hidden'));
    const viewEl = document.getElementById(`view-${pageId}`);
    if(viewEl) viewEl.classList.remove('hidden');
    window.scrollTo(0, 0);

    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('bg-[#d5a044]', 'text-white', 'px-3', 'rounded-sm', 'hover:text-white');
        el.classList.add('text-[#8c5a2b]', 'hover:text-[#d5a044]');
    });
    const activeNav = document.getElementById(`nav-${pageId}`);
    if(activeNav) {
        activeNav.classList.remove('text-[#8c5a2b]', 'hover:text-[#d5a044]');
        activeNav.classList.add('bg-[#d5a044]', 'text-white', 'px-3', 'rounded-sm', 'hover:text-white');
    }
};

window.toggleAdmin = () => {
    if (!hasAdminPrivilege) {
        alert("Vui lòng đăng nhập quyền Admin ở cuối trang!");
        return;
    }
    isAdminActive = !isAdminActive;
    const pubContainer = document.getElementById('publicContainer');
    const admView = document.getElementById('adminSection');
    const toggleBtn = document.getElementById('toggleAdminBtn');
    
    if(isAdminActive) {
        pubContainer.classList.add('hidden');
        admView.classList.remove('hidden');
        if(toggleBtn) toggleBtn.innerHTML = '👁️ Xem Trang Web'; 
        window.scrollTo(0, 0);
    } else {
        admView.classList.add('hidden');
        pubContainer.classList.remove('hidden');
        if(toggleBtn) toggleBtn.innerHTML = '🔧 Vào Quản Trị'; 
        window.switchPage('home'); 
    }
};

window.switchTab = (tabName) => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`)?.classList.add('active');
    
    ['viewProducts', 'viewOrders', 'viewUsers', 'viewAboutNews', 'viewContact'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });

    const targetView = document.getElementById(`view${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if(targetView) {
        targetView.classList.remove('hidden');
        if(tabName === 'products') targetView.classList.add('grid');
    }
};

function renderPublicGrid() {
    const featuredGrid = document.getElementById('featuredProductGrid');
    const allGrid = document.getElementById('allProductGrid');
    
    if(!featuredGrid || !allGrid) return;
    featuredGrid.innerHTML = ''; 
    allGrid.innerHTML = '';
    
    if (productsData.length === 0) {
        featuredGrid.innerHTML = `<p class="col-span-full text-center text-gray-500 italic py-10">Chưa có sản phẩm.</p>`;
        allGrid.innerHTML = `<p class="col-span-full text-center text-gray-500 italic py-10">Chưa có sản phẩm.</p>`;
        return;
    }

    productsData.forEach((p, index) => {
        let imageHTML = '';
        let firstImage = (p.images && p.images.length > 0 && p.images[0].trim() !== '') ? p.images[0] : '';

        if (firstImage !== '') {
            imageHTML = `<img src="${firstImage}" alt="${p.name}" class="w-32 h-32 object-cover rounded-full drop-shadow-lg border-2 border-brand-gold border-opacity-40 bg-white group-hover:scale-105 transition-transform duration-500">`;
        } else {
            const sym = p.symbol || '古';
            imageHTML = `
            <svg viewBox="0 0 100 100" class="w-28 h-28 text-brand-gold opacity-80 drop-shadow-md group-hover:scale-105 transition-transform duration-500">
                <circle cx="50" cy="50" r="45" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/>
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="currentColor" stroke-width="1"/>
                <rect x="35" y="35" width="30" height="30" fill="transparent" stroke="currentColor" stroke-width="1"/>
                <text x="50" y="55" font-size="16" text-anchor="middle" fill="#1c1612" font-weight="bold">${sym}</text>
            </svg>`;
        }

        const cardHTML = `
        <div class="bg-white border border-brand-border rounded-sm shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full relative overflow-hidden group">
            <div class="cursor-pointer flex-grow flex flex-col" onclick="window.openProductDetail('${p.id}')">
                <div class="bg-brand-card h-48 relative flex justify-center items-center p-6 border-b border-brand-border">
                    <div class="absolute top-0 right-0 bg-brand-dark text-brand-gold text-xs px-2 py-1 font-mono z-10">${p.years}</div>
                    ${p.images && p.images.length > 1 ? `<div class="absolute bottom-2 left-2 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-sm z-10 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> ${p.images.length} ảnh</div>` : ''}
                    ${imageHTML}
                </div>
                <div class="p-5 flex-grow flex flex-col">
                    <h4 class="font-serif font-bold text-lg mb-2 text-brand-dark h-14 line-clamp-2 group-hover:text-[#8c5a2b] transition-colors">${p.name}</h4>
                    <p class="text-sm text-gray-600 mb-4 flex-grow line-clamp-2">${p.desc}</p>
                    <div class="dashed-line mt-auto"></div>
                </div>
            </div>
            <div class="px-5 pb-5 flex justify-between items-end">
                <div>
                    <div class="text-xl font-bold font-serif text-red-800">${p.price}</div>
                    <div class="text-xs text-gray-500 uppercase mt-1">${p.period}</div>
                </div>
                <button onclick="event.stopPropagation(); window.openModal('${p.name}', '${p.price}')" class="bg-brand-btn text-brand-gold hover:text-white px-4 py-2 text-sm transition-colors border border-brand-btn relative z-10">
                    Đặt Mua
                </button>
            </div>
        </div>
        `;
        
        allGrid.innerHTML += cardHTML;
        if(index < 4) featuredGrid.innerHTML += cardHTML;
    });
}

function renderAdminTable() {
    const tbody = document.getElementById('adminTableBody');
    if(!tbody) return;
    document.getElementById('productCountBadge').innerText = productsData.length;
    tbody.innerHTML = '';
    
    if(productsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>`;
        return;
    }

    productsData.forEach((p) => {
        let thumbHTML = '';
        let firstImage = (p.images && p.images.length > 0 && p.images[0].trim() !== '') ? p.images[0] : '';

        if (firstImage !== '') {
            thumbHTML = `<div class="relative w-10 h-10"><img src="${firstImage}" class="w-10 h-10 rounded-full object-cover border border-gray-300 drop-shadow-sm bg-white">
                         ${p.images && p.images.length > 1 ? `<span class="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] px-1 rounded-full">+${p.images.length-1}</span>` : ''}</div>`;
        } else {
            const sym = p.symbol || '古';
            thumbHTML = `
            <div class="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-brand-bg text-brand-gold">
                <span class="font-serif font-bold text-sm">${sym}</span>
            </div>`;
        }

        tbody.innerHTML += `
        <tr class="hover:bg-gray-50 transition border-b border-gray-100">
            <td class="px-4 py-3">${thumbHTML}</td>
            <td class="px-4 py-3 font-medium text-brand-dark">${p.name}</td>
            <td class="px-4 py-3 text-red-700 font-bold">${p.price}</td>
            <td class="px-4 py-3 text-center">
                <button onclick="alert('Tính năng xóa cần viết thêm hàm Xóa trong file Google Apps Script')" class="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs border border-transparent hover:border-red-200 transition">
                    Xóa
                </button>
            </td>
        </tr>
        `;
    });
}

// Logic Modal Chi tiết Sản phẩm
let currentDetailImages = [];
let currentDetailIndex = 0;
let currentDetailProduct = null;

window.openProductDetail = (id) => {
    let product = productsData.find(p => p.id === id);
    if(!product) return;
    currentDetailProduct = product;

    currentDetailImages = product.images && product.images.length > 0 ? product.images : [];
    currentDetailIndex = 0;
    
    document.getElementById('detailTitle').innerText = product.name;
    document.getElementById('detailPrice').innerText = product.price;
    document.getElementById('detailPeriod').innerText = product.period;
    document.getElementById('detailYears').innerText = product.years;
    document.getElementById('detailDesc').innerText = product.desc;

    updateDetailImageDisplay();

    const detailModal = document.getElementById('detailModal');
    detailModal.classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('detailModalContent').classList.remove('scale-95');
    document.body.classList.add('modal-open');
};

function updateDetailImageDisplay() {
    const imgEl = document.getElementById('detailMainImage');
    const svgEl = document.getElementById('detailSvgFallback');
    const prevBtn = document.getElementById('detailPrevBtn');
    const nextBtn = document.getElementById('detailNextBtn');
    const counter = document.getElementById('detailImageCounter');

    if (currentDetailImages.length > 0 && currentDetailImages[0].trim() !== '') {
        imgEl.src = currentDetailImages[currentDetailIndex];
        imgEl.classList.remove('hidden');
        svgEl.classList.add('hidden');
        
        if (currentDetailImages.length > 1) {
            prevBtn.classList.remove('hidden'); nextBtn.classList.remove('hidden'); counter.classList.remove('hidden');
            counter.innerText = `${currentDetailIndex + 1}/${currentDetailImages.length}`;
        } else {
            prevBtn.classList.add('hidden'); nextBtn.classList.add('hidden'); counter.classList.add('hidden');
        }
    } else {
        imgEl.classList.add('hidden'); prevBtn.classList.add('hidden'); nextBtn.classList.add('hidden'); counter.classList.add('hidden');
        svgEl.classList.remove('hidden');
        const sym = currentDetailProduct.symbol || '古';
        svgEl.innerHTML = `<svg viewBox="0 0 100 100" class="w-2/3 h-2/3 text-brand-gold opacity-80 drop-shadow-xl">
            <circle cx="50" cy="50" r="45" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/>
            <circle cx="50" cy="50" r="35" fill="transparent" stroke="currentColor" stroke-width="1"/>
            <rect x="35" y="35" width="30" height="30" fill="transparent" stroke="currentColor" stroke-width="1"/>
            <text x="50" y="55" font-size="16" text-anchor="middle" fill="#1c1612" font-weight="bold">${sym}</text>
        </svg>`;
    }
}

window.detailNextImage = () => {
    if (currentDetailImages.length <= 1) return;
    currentDetailIndex = (currentDetailIndex + 1) % currentDetailImages.length;
    updateDetailImageDisplay();
};
window.detailPrevImage = () => {
    if (currentDetailImages.length <= 1) return;
    currentDetailIndex = (currentDetailIndex - 1 + currentDetailImages.length) % currentDetailImages.length;
    updateDetailImageDisplay();
};
window.closeDetailModal = () => {
    const detailModal = document.getElementById('detailModal');
    detailModal.classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('detailModalContent').classList.add('scale-95');
    document.body.classList.remove('modal-open');
};
window.openOrderFromDetail = () => {
    window.closeDetailModal();
    setTimeout(() => { window.openModal(currentDetailProduct.name, currentDetailProduct.price); }, 300);
};

// Modal Mua Hàng
const modal = document.getElementById('orderModal');
const modalContent = document.getElementById('modalContent');
window.openModal = (productName, productPrice) => {
    document.getElementById('modalProductName').innerText = productName;
    document.getElementById('modalProductPrice').innerText = productPrice;
    document.getElementById('hiddenProductName').value = productName;
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-95');
    modalContent.classList.add('scale-100');
    document.body.classList.add('modal-open');
}
window.closeModal = () => {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    document.body.classList.remove('modal-open');
    setTimeout(() => document.getElementById('orderForm').reset(), 300);
}
