// ============================================================================
// 📁 MODULE 4.3: UI CUSTOMER (ui-customer.js)
// Cổng Thành Viên: Đăng nhập/Đăng ký/Đăng xuất, Sửa profile,
// Form liên hệ/phản ánh
// ============================================================================

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
    
    const phone = document.getElementById('cusRegPhone').value.trim();
    const email = document.getElementById('cusRegEmail').value.trim();
    const pass = document.getElementById('cusRegPassword_reg').value.trim();
    const passConfirm = document.getElementById('cusRegPasswordConfirm').value.trim();
    
    if (pass !== passConfirm) {
        window.showToast("Mật khẩu nhập lại không khớp!", "error");
        return;
    }
    
    const err = window.validateInput(phone, email);
    if(err) {
        window.showToast(err, "error");
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    const spinner = btn.querySelector('.spinner-icon');
    btn.disabled = true; spinner.classList.remove('hidden');

    const data = {
        name: window.formatTitleCase(document.getElementById('cusRegName').value),
        phone: phone,
        email: email,
        password: pass,
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
    
    const emails = window.loggedCustomer.email ? window.loggedCustomer.email.split('\n').filter(Boolean) : [];
    const addresses = window.loggedCustomer.address ? window.loggedCustomer.address.split('\n').filter(Boolean) : [];

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
        ? `<input type="email" placeholder="Nhập email..." value="${value}" class="profile-email-input w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-brand-gold outline-none" onkeydown="if(event.key==='Enter')event.preventDefault();">`
        : `<input type="text" placeholder="Nhập địa chỉ..." value="${value}" class="profile-address-input w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-brand-gold outline-none" onkeydown="if(event.key==='Enter')event.preventDefault();">`;
    
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
    
    const emailInputs = document.querySelectorAll('.profile-email-input');
    let emails = []; let hasEmailError = false;
    emailInputs.forEach(input => { 
        let val = input.value.trim().toLowerCase();
        if(val) {
            if(!val.includes('@')) hasEmailError = true;
            emails.push(val); 
        }
    });
    if(hasEmailError) { window.showToast("Có Email không hợp lệ!", "error"); return; }
    emails = [...new Set(emails)];

    const addressInputs = document.querySelectorAll('.profile-address-input');
    let addresses = [];
    addressInputs.forEach(input => { if(input.value.trim()) addresses.push(window.formatTitleCase(input.value)); });
    addresses = [...new Set(addresses)];

    const btn = e.target.querySelector('button[type="submit"]');
    const spinner = btn.querySelector('.spinner-icon');
    const textSpan = btn.querySelectorAll('span')[1];
    const oldText = textSpan.innerText;
    
    textSpan.innerText = "ĐANG LƯU..."; btn.disabled = true; spinner.classList.remove('hidden');

    const data = {
        phone: window.loggedCustomer.phone,
        email: emails.join('\n'),
        address: addresses.join('\n')
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

window.handleContactFormSubmit = async function(e) {
    e.preventDefault();
    const form = document.getElementById('contactForm');
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const content = document.getElementById('contactContent').value.trim();
    
    if (!name || !phone || !content) {
        window.showToast('Vui lòng điền đầy đủ thông tin!', 'warning');
        return;
    }
    
    const btn = form.querySelector('button[type="submit"]');
    const oldText = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'Đang gửi...';
    
    try {
        const now = new Date();
        const feedbackData = {
            name: name,
            phone: phone,
            content: content,
            sentTime: now.toLocaleString('vi-VN'),
            status: 'Chưa Xử Lý'
        };
        
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify({ action: 'addFeedback', data: feedbackData })
        });
        
        const result = await response.json();
        if (result.success) {
            window.showToast('Gửi phản ánh thành công! Chúng tôi sẽ phản hồi sớm nhất.', 'success');
            form.reset();
        } else {
            window.showToast(result.message || 'Có lỗi xảy ra!', 'error');
        }
    } catch (err) {
        window.showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerText = oldText;
    }
};