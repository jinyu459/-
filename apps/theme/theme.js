// ========== 1. 返回按钮 ==========
document.getElementById('backBtn').addEventListener('click', function() {
    if (typeof window.closeApp === 'function') {
        window.closeApp();
    } else {
        window.parent.postMessage('closeApp', '*');
    }
});

// ========== 2. 标签页切换 ==========
var tabItems = document.querySelectorAll('.tab-item');
var tabContents = document.querySelectorAll('.tab-content');
tabItems.forEach(function(item) {
    item.addEventListener('click', function() {
        tabItems.forEach(function(t) { t.classList.remove('active'); });
        tabContents.forEach(function(c) { c.classList.remove('active'); });
        this.classList.add('active');
        document.getElementById(this.getAttribute('data-target')).classList.add('active');
    });
});

// ========== 3. 四季主题 ==========
document.querySelectorAll('#tab-seasons .season-card').forEach(function(card) {
    card.addEventListener('click', function() {
        var season = this.getAttribute('data-season');
        if (window.parent && window.parent.dataHub && typeof window.parent.dataHub.set === 'function') {
            window.parent.dataHub.set('current_season', season);
        } else {
           if (window.parent && window.parent.dataHub) {
    window.parent.dataHub.set('current_season', season);
}
            window.parent.postMessage({ type: 'changeTheme', season: season }, '*');
        }
        alert('已切换至【' + this.innerText + '】季主题，返回桌面查看');
    });
});

// ========== 4. 字体 ==========
document.querySelectorAll('.font-card').forEach(function(card) {
    card.addEventListener('click', function() {
        var font = this.getAttribute('data-font');
        if (window.parent && window.parent.dataHub && typeof window.parent.dataHub.set === 'function') {
            window.parent.dataHub.set('current_font', font);
        } else {
            localStorage.setItem('current_font', font);
            window.parent.postMessage({ type: 'changeFont', font: font }, '*');
        }
        alert('已切换至【' + this.innerText + '】字体，返回桌面查看');
    });
});

// ========== 5. 壁纸 ==========
document.querySelectorAll('.wallpaper-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        var wallpaper = this.getAttribute('data-wallpaper');
        if (window.parent && window.parent.dataHub && typeof window.parent.dataHub.set === 'function') {
            window.parent.dataHub.set('wallpaper', wallpaper);
        } else {
            localStorage.setItem('wallpaper', wallpaper);
        }
        window.parent.postMessage({ type: 'changeWallpaper', wallpaper: wallpaper }, '*');
        alert('已切换至【' + this.innerText + '】壁纸，返回桌面查看');
    });
});

// ========== 6. 应用自定义：图标圆角 & 大小 ==========
var DEFAULT_RADIUS = 15;
var DEFAULT_SIZE   = 60;

var ICON_KEYS = ['chat', 'setting', 'music', 'theme', 'worldbook', 'online', 'farm', 'study'];
var DEFAULT_NAMES = { chat: '聊天', setting: '设置', music: '音乐', theme: '美化', worldbook: '世界书', online: '联机', farm: '农场', study: '学习' };

var rangeRadius = document.getElementById('rangeRadius');
var rangeSize   = document.getElementById('rangeSize');
var valRadius   = document.getElementById('valRadius');
var valSize     = document.getElementById('valSize');
var previewIcon = document.getElementById('previewIcon');

// —— 读取已有存储，回显到滑块 / 名称 / 图片预览 ——
function loadSavedCustom() {
    var savedRadius = DEFAULT_RADIUS;
    var savedSize   = DEFAULT_SIZE;

    if (window.parent && window.parent.dataHub && typeof window.parent.dataHub.get === 'function') {
        savedRadius = parseInt(window.parent.dataHub.get('icon_radius', DEFAULT_RADIUS), 10);
        savedSize   = parseInt(window.parent.dataHub.get('icon_size',   DEFAULT_SIZE),   10);
    } else {
        savedRadius = parseInt(localStorage.getItem('icon_radius') || DEFAULT_RADIUS, 10);
        savedSize   = parseInt(localStorage.getItem('icon_size')   || DEFAULT_SIZE,   10);
    }

    rangeRadius.value = savedRadius;
    rangeSize.value   = savedSize;
    refreshPreview();

    // —— 回显图标名称 ——
    ICON_KEYS.forEach(function(key) {
        var savedName = '';
        if (window.parent && window.parent.dataHub && typeof window.parent.dataHub.get === 'function') {
            savedName = window.parent.dataHub.get('name_' + key, '');
        } else {
            savedName = localStorage.getItem('name_' + key) || '';
        }
        var nameInput = document.getElementById('name_' + key);
        if (nameInput) {
            nameInput.value = savedName || DEFAULT_NAMES[key];
        }
    });

    // —— 回显图标图片预览 ——
    ICON_KEYS.forEach(function(key) {
        var imgData = null;
        if (window.parent && window.parent.dataHub && typeof window.parent.dataHub.get === 'function') {
            imgData = window.parent.dataHub.get('icon_' + key + '_image', null);
        } else {
            imgData = localStorage.getItem('icon_' + key + '_image') || null;
        }
        var preview = document.getElementById('preview_' + key);
        if (preview && imgData) {
            preview.style.backgroundImage = 'url(' + imgData + ')';
            preview.classList.add('has-image');
        }
    });
}

// —— 更新预览方块 ——
function refreshPreview() {
    var r = rangeRadius.value;
    var s = rangeSize.value;
    valRadius.textContent = r + 'px';
    valSize.textContent   = s + 'px';
    previewIcon.style.width        = s + 'px';
    previewIcon.style.height       = s + 'px';
    previewIcon.style.borderRadius = r + 'px';
    previewIcon.style.fontSize     = Math.max(11, Math.round(s * 0.22)) + 'px';
}

rangeRadius.addEventListener('input', refreshPreview);
rangeSize.addEventListener('input',   refreshPreview);

// ========== 7. 图标图片选择 ==========
function pickIconImage(key) {
    document.getElementById('fileInput_' + key).click();
}

function handleImageSelect(key, input) {
    if (!input.files || !input.files[0]) return;
    var file = input.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var dataUrl = e.target.result;

        // 立即保存到 dataHub
        if (window.parent && window.parent.dataHub && typeof window.parent.dataHub.set === 'function') {
            window.parent.dataHub.set('icon_' + key + '_image', dataUrl);
        } else {
            localStorage.setItem('icon_' + key + '_image', dataUrl);
        }

        // 更新预览
        var preview = document.getElementById('preview_' + key);
        if (preview) {
            preview.style.backgroundImage = 'url(' + dataUrl + ')';
            preview.classList.add('has-image');
        }

        // 通知父页面立即刷新
        window.parent.postMessage({ type: 'applyIconImages' }, '*');
    };
    reader.readAsDataURL(file);
}

function clearIconImage(key) {
    // 清除存储
    if (window.parent && window.parent.dataHub && typeof window.parent.dataHub.set === 'function') {
        window.parent.dataHub.set('icon_' + key + '_image', null);
    } else {
        localStorage.removeItem('icon_' + key + '_image');
    }

    // 清除预览
    var preview = document.getElementById('preview_' + key);
    if (preview) {
        preview.style.backgroundImage = '';
        preview.classList.remove('has-image');
    }

    // 重置 file input
    var fileInput = document.getElementById('fileInput_' + key);
    if (fileInput) fileInput.value = '';

    // 通知父页面
    window.parent.postMessage({ type: 'applyIconImages' }, '*');
}

// —— 保存（圆角 + 大小 + 图标名称）——
document.getElementById('saveBtn').addEventListener('click', function() {
    var r = rangeRadius.value;
    var s = rangeSize.value;

    if (window.parent && window.parent.dataHub && typeof window.parent.dataHub.set === 'function') {
        window.parent.dataHub.set('icon_radius', r);
        window.parent.dataHub.set('icon_size',   s);
    } else {
        localStorage.setItem('icon_radius', r);
        localStorage.setItem('icon_size',   s);
    }

    // 保存图标名称
    ICON_KEYS.forEach(function(key) {
        var nameVal = document.getElementById('name_' + key).value.trim();
        if (window.parent && window.parent.dataHub && typeof window.parent.dataHub.set === 'function') {
            window.parent.dataHub.set('name_' + key, nameVal || DEFAULT_NAMES[key]);
        } else {
            localStorage.setItem('name_' + key, nameVal || DEFAULT_NAMES[key]);
        }
    });

    // 通知父页面立即刷新
    window.parent.postMessage({ type: 'applyIconCustom', radius: r, size: s }, '*');
    window.parent.postMessage({ type: 'applyIconNames' }, '*');

    // 轻提示
    var toast = document.getElementById('saveToast');
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 1500);
});

// —— 恢复默认 ——
document.getElementById('resetBtn').addEventListener('click', function() {
    rangeRadius.value = DEFAULT_RADIUS;
    rangeSize.value   = DEFAULT_SIZE;
    refreshPreview();

    // 恢复图标名称
    ICON_KEYS.forEach(function(key) {
        var nameInput = document.getElementById('name_' + key);
        if (nameInput) nameInput.value = DEFAULT_NAMES[key];
    });

    // 清除图标图片
    ICON_KEYS.forEach(function(key) {
        clearIconImage(key);
    });
});

// 页面加载时回显
loadSavedCustom();
