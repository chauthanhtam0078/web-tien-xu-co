
// ============================================================================
// 📁 MODULE 8.1: ADMIN AUTH (admin-utils.js)
// Tiện ích dùng chung: Image Manager, Rich Text Editor, ...
// ============================================================================
window.imageManagers = {
    add: { oldImages: [], newFiles: [], deletedImages: [], containerId: 'addImageTagsContainer', inputId: 'addImages' },
    addNews: { oldImages: [], newFiles: [], deletedImages: [], containerId: 'addNewsImageTagsContainer', inputId: 'addNewsImages' },
    edit: { oldImages: [], newFiles: [], deletedImages: [], containerId: 'editImageTagsContainer', inputId: 'editImages' },
    univ: { oldImages: [], newFiles: [], deletedImages: [], containerId: 'ueImageTagsContainer', inputId: 'ue_image' }
};

window.wrapAdminTable = (theadHtml, tbodyHtml, colSpan, customTableClass = "w-full text-left text-sm") => {
    let html = `<div class="overflow-x-auto border border-brand-border rounded custom-scrollbar"><table class="${customTableClass}"><thead class="bg-brand-card text-gray-700"><tr>${theadHtml}</tr></thead><tbody class="divide-y divide-gray-200">`;
    if(!tbodyHtml) html += `<tr><td colspan="${colSpan}" class="px-4 py-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>`;
    else html += tbodyHtml;
    html += `</tbody></table></div>`;
    return html;
};

window.buildActionButtons = (sheetName, id, editTxt = "Sửa", delTxt = "Xóa", customEditFn = null) => {
    let editClick = customEditFn ? customEditFn : `window.openUniversalEdit('${sheetName}', '${id}')`;
    let editBtn = `<button onclick="${editClick}" class="text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs mr-1 font-semibold border border-blue-200">${editTxt}</button>`;
    let delBtn = `<button onclick="window.deleteGenericData('${sheetName}', '${id}', this)" class="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-semibold border border-red-200">${delTxt}</button>`;
    return editBtn + delBtn;
};

window.initRichTextEditor = (textareaId) => {
    const textarea = document.getElementById(textareaId);
    if (!textarea || textarea.dataset.rteAttached) return;

    if(textarea.nextElementSibling && textarea.nextElementSibling.classList.contains('rte-wrapper')) {
        textarea.nextElementSibling.remove();
    }

    const container = document.createElement('div');
    container.className = 'rte-wrapper border border-brand-border rounded-sm overflow-hidden flex flex-col mt-1 bg-white shadow-inner';

    const toolbar = document.createElement('div');
    toolbar.className = 'bg-gray-50 border-b border-gray-200 px-2 py-1.5 flex flex-wrap gap-1 items-center sticky top-0 z-10';
    toolbar.innerHTML = `
        <button type="button" onclick="document.execCommand('bold', false, null); return false;" class="px-2 py-1 text-sm hover:bg-gray-200 font-black rounded" title="In đậm (Ctrl+B)">B</button>
        <button type="button" onclick="document.execCommand('italic', false, null); return false;" class="px-2 py-1 text-sm hover:bg-gray-200 italic font-serif rounded" title="In nghiêng (Ctrl+I)">I</button>
        <button type="button" onclick="document.execCommand('underline', false, null); return false;" class="px-2 py-1 text-sm hover:bg-gray-200 underline rounded" title="Gạch chân (Ctrl+U)">U</button>
        <span class="w-px h-4 bg-gray-300 mx-1"></span>
        <button type="button" onclick="document.execCommand('insertUnorderedList', false, null); return false;" class="px-2 py-1 text-sm hover:bg-gray-200 rounded flex items-center gap-1" title="Danh sách có dấu chấm"><span>•</span> D.Sách</button>
        <span class="w-px h-4 bg-gray-300 mx-1"></span>
        <div class="flex items-center gap-1 bg-white border border-gray-200 px-1 rounded" title="Màu chữ">
            <span class="text-[11px] text-gray-500 font-bold">Màu:</span>
            <input type="color" onchange="document.execCommand('foreColor', false, this.value); return false;" class="w-5 h-5 p-0 border-0 cursor-pointer rounded bg-transparent">
        </div>
        <span class="w-px h-4 bg-gray-300 mx-1"></span>
        <button type="button" onclick="const url = prompt('Nhập đường link (URL):'); if(url) document.execCommand('createLink', false, url); return false;" class="px-2 py-1 text-sm hover:bg-gray-200 text-blue-600 underline rounded" title="Chèn Link">🔗 Link</button>
        <button type="button" onclick="document.execCommand('unlink', false, null); return false;" class="px-2 py-1 text-sm hover:bg-gray-200 text-red-500 rounded" title="Xóa Link">🚫</button>
    `;

    const editor = document.createElement('div');
    editor.className = 'p-4 min-h-[120px] max-h-[400px] overflow-y-auto bg-white outline-none text-sm rich-text-content custom-scrollbar leading-relaxed text-gray-700';
    editor.contentEditable = true;
    
    let val = textarea.value || '';
    if(val && !val.includes('<') && val.includes('\n')) val = val.replace(/\n/g, '<br>');
    editor.innerHTML = val;

    const syncData = () => { textarea.value = editor.innerHTML; };
    editor.addEventListener('input', syncData);
    editor.addEventListener('blur', syncData);
    editor.addEventListener('keyup', syncData);

    textarea.style.display = 'none';
    textarea.dataset.rteAttached = 'true';

    container.appendChild(toolbar);
    container.appendChild(editor);
    textarea.parentNode.insertBefore(container, textarea.nextSibling);
};

window.syncAllRichText = () => {
    document.querySelectorAll('.rich-text-content').forEach(editor => {
        const wrapper = editor.parentElement;
        if(wrapper && wrapper.previousElementSibling && wrapper.previousElementSibling.tagName === 'TEXTAREA') {
            wrapper.previousElementSibling.value = editor.innerHTML;
        }
    });
};

window.renderImageTags = (key) => {
    const state = window.imageManagers[key];
    const container = document.getElementById(state.containerId);
    if(!container) return;

    let html = `<div class="border-2 border-dashed border-gray-300 bg-[#fbfbfb] rounded-md p-4 mt-2 text-center relative group min-h-[120px] flex flex-col items-center justify-center transition-colors hover:bg-[#f4f4f4]"><div class="flex flex-wrap gap-2 justify-center w-full z-10 mb-4">`;

    state.oldImages.forEach((url, i) => {
        const urls = window.getSafeImgUrls(url);
        let onErrorScript = urls.fallback ? `if(!this.dataset.retried) { this.dataset.retried='true'; this.src='${urls.fallback}'; } else { this.src='https://placehold.co/40x40/ff0000/ffffff?text=L%E1%BB%96I'; this.parentElement.classList.add('bg-red-50', 'border-red-500'); }` : `this.src='https://placehold.co/40x40/ff0000/ffffff?text=L%E1%BB%96I'; this.parentElement.classList.add('bg-red-50', 'border-red-500');`;
        let displayId = "Ảnh đã lưu";
        if (url.includes('#')) {
            displayId = decodeURIComponent(url.split('#')[1]).replace(/^(TXC-P-[A-Z0-9]+-|Others-|GioiThieu-|TinTuc-)/, '');
        } else {
            const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) displayId = "Ảnh ..." + match[1].slice(-6); 
        }

        html += `<div class="flex items-center gap-1.5 bg-gray-100 border border-gray-300 px-2 py-1.5 rounded shadow-sm transition hover:bg-gray-200">
            <img src="${urls.primary}" class="w-8 h-8 object-contain bg-white rounded border border-gray-200" onerror="${onErrorScript}">
            <span class="text-[11px] text-gray-700 font-semibold truncate max-w-[120px]" title="${url}">${displayId}</span>
            <button type="button" onclick="window.removeImage('${key}', 'old', ${i})" class="text-red-500 hover:bg-red-100 w-5 h-5 rounded-full flex items-center justify-center font-bold transition">×</button>
        </div>`;
    });

    state.newFiles.forEach((file, i) => {
        const previewUrl = URL.createObjectURL(file);
        html += `<div class="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2 py-1.5 rounded shadow-sm transition hover:bg-blue-100">
            <img src="${previewUrl}" class="w-8 h-8 object-contain bg-white rounded border border-blue-200" onload="window.URL.revokeObjectURL(this.src)">
            <span class="text-[11px] text-blue-800 font-semibold truncate max-w-[120px]" title="${file.name}">${file.name}</span>
            <button type="button" onclick="window.removeImage('${key}', 'new', ${i})" class="text-red-500 hover:bg-red-100 w-5 h-5 rounded-full flex items-center justify-center font-bold transition">×</button>
        </div>`;
    });

    if(state.oldImages.length === 0 && state.newFiles.length === 0) {
        html += `<div class="text-gray-400 text-xs flex flex-col items-center pointer-events-none"><svg class="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span>Chưa có tệp nào được chọn</span></div>`;
    }

    html += `</div><button type="button" onclick="document.getElementById('${state.inputId}').click()" class="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-full shadow-sm text-xs font-bold hover:border-brand-gold hover:text-brand-gold transition-colors z-10 relative flex items-center gap-2 mx-auto"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>Chọn ảnh từ máy tính/điện thoại</button></div>`;

    container.innerHTML = html;
    const input = document.getElementById(state.inputId);
    if(input) input.style.display = 'none';
};

window.removeImage = (key, type, index) => {
    const state = window.imageManagers[key];
    if (type === 'old') state.deletedImages.push(state.oldImages.splice(index, 1)[0]);
    else state.newFiles.splice(index, 1);
    window.renderImageTags(key);
};

window.initImageManager = (key) => {
    const state = window.imageManagers[key];
    const input = document.getElementById(state.inputId);
    if(!input) return;
    if(!input.dataset.managerAttached) {
        let container = document.getElementById(state.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = state.containerId;
            input.parentNode.insertBefore(container, input.nextSibling); 
        }
        input.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) { state.newFiles = state.newFiles.concat(files); window.renderImageTags(key); }
            e.target.value = ''; 
        });
        input.dataset.managerAttached = 'true';
    }
    window.renderImageTags(key);
}

window.cleanWordHTML = function(html) {
    if (!html) return '';
    let str = String(html);
    str = str.replace(/<!--[\s\S]*?-->/g, ''); // Xóa comments ẩn của Word
    str = str.replace(/<\/?o:p[^>]*>/g, ''); // Xóa thẻ <o:p>
    str = str.replace(/\s+(class|style|lang|dir)="[^"]*"/gi, ''); // Xóa attributes rác
    str = str.replace(/\s+(class|style|lang|dir)='[^']*'/gi, ''); // Xóa attributes rác (nháy đơn)
    str = str.replace(/<\/?span[^>]*>/gi, ''); // Gỡ bỏ thẻ span, chỉ giữ lại text
    str = str.replace(/<p>(\s|&nbsp;|<br>)*<\/p>/gi, ''); // Xóa các đoạn văn rỗng
    return str.trim();
};

window.buildPaginationUI = (tabId, currentPage, totalPages) => {
    if(totalPages <= 1) return '';
    let btnHtml = '';
    for(let i = 1; i <= totalPages; i++) {
        if(i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            btnHtml += `<button onclick="window.changeAdminPage('${tabId}', ${i})" class="px-3 py-1 border ${i === currentPage ? 'bg-brand-gold text-white border-brand-gold shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'} rounded-sm text-sm font-semibold mx-0.5 transition-colors">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            btnHtml += `<span class="px-2 text-gray-400">...</span>`;
        }
    }
    return `<div class="mt-4 flex justify-between items-center bg-gray-50 border border-brand-border p-3 rounded-sm">
                <span class="text-xs text-gray-500 font-medium">Trang ${currentPage} / ${totalPages}</span>
                <div class="flex items-center">${btnHtml}</div>
            </div>`;
}