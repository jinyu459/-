// ============ 系统数据与时间逻辑 ============
const sysData = {
    isModern: true,
    showIconNames: localStorage.getItem('show_icon_names') !== 'false',
    shichen: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    ke: ['初', '一', '二', '三'],
    showToast: function(msg) {
        const toast = document.getElementById('toast');
        if(!toast) return;
        toast.innerText = msg;
        toast.style.opacity = '1';
        setTimeout(() => toast.style.opacity = '0', 2000);
    },
    toggleTimeMode: function() {
        this.isModern = !this.isModern;
        this.updateTime();
        this.showToast(this.isModern ? '已切换至现世定刻' : '已切换至古法纪时');
    },
    toggleIconNames: function() {
        this.showIconNames = !this.showIconNames;
        localStorage.setItem('show_icon_names', this.showIconNames);
        this.applyIconNamesState();
        this.showToast(this.showIconNames ? '已显示图标名称' : '已隐藏图标名称');
    },
    applyIconNamesState: function() {
        const desktop = document.getElementById('desktop');
        if(!desktop) return;
        if (this.showIconNames) {
            desktop.classList.remove('hide-names');
        } else {
            desktop.classList.add('hide-names');
        }
    },
    updateTime: function() {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const display = document.getElementById('timeDisplay');
        if(!display) return;
        
        if (this.isModern) {
            display.innerText = `${h < 10 ? '0'+h : h}:${m < 10 ? '0'+m : m}`;
        } else {
            const adjustedHour = (h + 1) % 24;
            display.innerText = `${this.shichen[Math.floor(adjustedHour / 2)]}时 · ${this.ke[Math.floor(m / 15)]}刻`;
        }
    },
updateDockPoem: function() {
    const defaultPoem = "海内存知己，天涯若比邻";
    let poem = defaultPoem;
    
    if (window.dataHub && typeof window.dataHub.get === 'function') {
        poem = window.dataHub.get('dock_poem', defaultPoem);
    } else {
        poem = localStorage.getItem('dock_poem') || defaultPoem;
    }

    const poemEl = document.getElementById('poem-text') || document.querySelector('.dock-text');
    
    if (poemEl) {
        poemEl.innerText = poem;
    } else {
        console.warn("⚠️ 未找到诗句元素！请检查 index.html 中是否有 <span id='poem-text'></span>");
    }
},
    updateTheme: function() {
        let season = 'spring'; 
        if (window.dataHub && typeof window.dataHub.get === 'function') {
            season = window.dataHub.get('current_season', 'spring');
        } else {
            season = localStorage.getItem('current_season') || 'spring';
        }
        document.documentElement.setAttribute('data-theme', season);
    },
    applyFont: function() {
        let font = 'default';
        
        if (window.dataHub && typeof window.dataHub.get === 'function') {
            font = window.dataHub.get('current_font', 'default');
        } else {
            font = localStorage.getItem('current_font') || 'default';
        }
        
        document.body.setAttribute('data-font', font);
    },
    applyWallpaper: function() {
        let wallpaper = 'default';
        
        if (window.dataHub && typeof window.dataHub.get === 'function') {
            wallpaper = window.dataHub.get('wallpaper', 'default');
        } else {
            wallpaper = localStorage.getItem('wallpaper') || 'default';
        }
        
        const screenArea = document.querySelector('.screen-area');
        if (screenArea) {
            screenArea.classList.remove('wallpaper-default', 'wallpaper-mountain', 'wallpaper-flower');
            screenArea.classList.add('wallpaper-' + wallpaper);
        }
    },

    // ============ 应用图标自定义样式（圆角 & 大小） ============
    applyIconCustom: function() {
        const DEFAULT_RADIUS = 15;
        const DEFAULT_SIZE   = 60;

        let radius = DEFAULT_RADIUS;
        let size   = DEFAULT_SIZE;

        if (window.dataHub && typeof window.dataHub.get === 'function') {
            radius = parseInt(window.dataHub.get('icon_radius', DEFAULT_RADIUS), 10);
            size   = parseInt(window.dataHub.get('icon_size',   DEFAULT_SIZE),   10);
        } else {
            radius = parseInt(localStorage.getItem('icon_radius') || DEFAULT_RADIUS, 10);
            size   = parseInt(localStorage.getItem('icon_size')   || DEFAULT_SIZE,   10);
        }

        if (isNaN(radius) || radius < 0)  radius = DEFAULT_RADIUS;
        if (isNaN(size)   || size < 40)   size   = DEFAULT_SIZE;

        document.documentElement.style.setProperty('--icon-radius', radius + 'px');
        document.documentElement.style.setProperty('--icon-size',   size   + 'px');

        console.log(`✅ 图标自定义已应用 → 圆角: ${radius}px, 大小: ${size}px`);
    },
    // ============ 新增：应用图标自定义图片 ============
    applyIconImages: function() {
        var icons = ['chat', 'setting', 'music', 'theme', 'worldbook', 'online', 'farm', 'study'];
        icons.forEach(function(name) {
            var imgData = null;

            if (window.dataHub && typeof window.dataHub.get === 'function') {
                imgData = window.dataHub.get('icon_' + name + '_image', null);
            } else {
                imgData = localStorage.getItem('icon_' + name + '_image') || null;
            }

            var iconEl = document.getElementById('icon-' + name);
            if (!iconEl) return;
            var iconBox = iconEl.querySelector('.icon-box');
            if (!iconBox) return;

            if (imgData) {
                // ① url() 内加双引号，防止 data URL 中的特殊字符导致解析失败
                iconBox.style.backgroundImage = 'url("' + imgData + '")';
                // ② 内联设置尺寸属性，彻底覆盖任何 CSS 规则（解决优先级问题）
                iconBox.style.backgroundSize = 'cover';
                iconBox.style.backgroundPosition = 'center';
                iconBox.style.backgroundRepeat = 'no-repeat';
                iconBox.classList.add('has-custom-image');
            } else {
                iconBox.style.backgroundImage = '';
                iconBox.style.backgroundSize = '';
                iconBox.style.backgroundPosition = '';
                iconBox.style.backgroundRepeat = '';
                iconBox.classList.remove('has-custom-image');
            }
        });

        console.log('✅ 图标图片已刷新');
    },


    // ============ 应用图标自定义名称 ============
    applyIconNames: function() {
        var defaults = {
            chat: '聊天', setting: '设置', music: '音乐',
            theme: '美化', worldbook: '世界书', online: '联机',
            farm: '农场', study: '学习'
        };
        var keys = Object.keys(defaults);

        keys.forEach(function(name) {
            var customName = null;

            if (window.dataHub && typeof window.dataHub.get === 'function') {
                customName = window.dataHub.get('name_' + name, null);
            } else {
                customName = localStorage.getItem('name_' + name) || null;
            }

            var iconEl = document.getElementById('icon-' + name);
            if (!iconEl) return;
            var nameEl = iconEl.querySelector('.icon-name');
            if (!nameEl) return;

            nameEl.textContent = (customName && customName !== '') ? customName : defaults[name];
        });

        console.log('✅ 图标名称已刷新');
    },

    init: function() {
        this.updateTime();
        this.applyIconNamesState();
        this.updateDockPoem(); 
        this.updateTheme();    
        this.applyFont();      
        this.applyWallpaper();
        this.applyIconCustom();
        this.applyIconImages();   // ← 新增：初始化时加载图标图片
        this.applyIconNames();    // ← 新增：初始化时加载图标名称
        setInterval(() => this.updateTime(), 1000 * 30);
    }
}

// ============ 基础交互逻辑 ============
let currentScreen = 0; 
function toggleScreen() {
    currentScreen = currentScreen === 0 ? 1 : 0;
    const desktop = document.getElementById('desktop');
    if(desktop) desktop.style.transform = `translateX(-${currentScreen * 50}%)`;
}

function openApp(appUrl) {
    const appLayer = document.getElementById('app-layer');
    const appFrame = document.getElementById('app-frame');
    const dock = document.getElementById('dock');
    
    if(appFrame) appFrame.src = appUrl;
    if(appLayer) {
        appLayer.style.display = 'block';
        void appLayer.offsetWidth; 
        appLayer.classList.add('active');
    }
    if(dock) dock.style.display = 'none';
}

function closeApp() {
    const appLayer = document.getElementById('app-layer');
    const dock = document.getElementById('dock');
    
    if(appLayer) appLayer.classList.remove('active');
    if(dock) dock.style.display = 'flex';
    
    // 每次关闭应用（从设置返回主屏）时，重新读取并更新
    sysData.updateDockPoem();
    sysData.updateTheme(); 
    sysData.applyFont();
    sysData.applyWallpaper();
    sysData.applyIconCustom();
    sysData.applyIconImages();   // ← 新增：返回桌面时刷新图标图片
    sysData.applyIconNames();    // ← 新增：返回桌面时刷新图标名称
    
    setTimeout(() => {
        if(appLayer) appLayer.style.display = 'none';
        const appFrame = document.getElementById('app-frame');
        if(appFrame) appFrame.src = "";
    }, 300);
}

window.addEventListener('message', function(event) {
    if (event.data === 'closeApp') {
        closeApp();
    } else if (event.data && event.data.type === 'changeWallpaper') {
        if (window.dataHub) {
            window.dataHub.set('wallpaper', event.data.wallpaper);
        } else {
            localStorage.setItem('wallpaper', event.data.wallpaper);
        }
        if (typeof sysData !== 'undefined' && typeof sysData.applyWallpaper === 'function') {
            sysData.applyWallpaper();
        }
    }
    // 监听图标自定义的实时消息（圆角 & 大小）
    else if (event.data && event.data.type === 'applyIconCustom') {
        const r = event.data.radius;
        const s = event.data.size;

        if (window.dataHub && typeof window.dataHub.set === 'function') {
            window.dataHub.set('icon_radius', r);
            window.dataHub.set('icon_size',   s);
        } else {
            localStorage.setItem('icon_radius', r);
            localStorage.setItem('icon_size',   s);
        }

        if (typeof sysData !== 'undefined' && typeof sysData.applyIconCustom === 'function') {
            sysData.applyIconCustom();
        }
    }
    // ============ 新增：监听图标图片更新消息 ============
    else if (event.data && event.data.type === 'applyIconImages') {
        if (typeof sysData !== 'undefined' && typeof sysData.applyIconImages === 'function') {
            sysData.applyIconImages();
        }
    }
    // ============ 新增：监听图标名称更新消息 ============
    else if (event.data && event.data.type === 'applyIconNames') {
        if (typeof sysData !== 'undefined' && typeof sysData.applyIconNames === 'function') {
            sysData.applyIconNames();
        }
    }
});

// ============ DOM 加载完毕后初始化 ============
document.addEventListener('DOMContentLoaded', () => {
    sysData.init();
});
