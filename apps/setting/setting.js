// ================= 数据管理工具 =================
const DataHubUtil = {
    // ... 保持原有代码不变 ...
    get: function(key, defaultValue) {
        try {
            if (window.parent && window.parent.dataHub) {
                if (typeof window.parent.dataHub.getData === 'function') {
                    return window.parent.dataHub.getData(key) || defaultValue;
                } else if (window.parent.dataHub[key] !== undefined) {
                    return window.parent.dataHub[key];
                }
            }
            let res = localStorage.getItem(key);
            return res ? JSON.parse(res) : defaultValue;
        } catch(e) {
            console.warn("DataHub 读取失败", e);
            return defaultValue;
        }
    },
    set: function(key, value) {
        try {
            if (window.parent && window.parent.dataHub) {
                if (typeof window.parent.dataHub.setData === 'function') {
                    window.parent.dataHub.setData(key, value);
                    return;
                } else {
                    window.parent.dataHub[key] = value;
                    return;
                }
            }
            localStorage.setItem(key, JSON.stringify(value));
        } catch(e) {
            console.error("DataHub 保存失败", e);
        }
    },
    getAll: function() {
        try {
            if (window.parent && window.parent.dataHub) {
                let data = {};
                for (let key in window.parent.dataHub) {
                    if (typeof window.parent.dataHub[key] !== 'function') {
                        data[key] = window.parent.dataHub[key];
                    }
                }
                return data;
            }
            let data = {};
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                try {
                    data[key] = JSON.parse(localStorage.getItem(key));
                } catch(e) {
                    data[key] = localStorage.getItem(key);
                }
            }
            return data;
        } catch(e) {
            console.warn("DataHub 读取全部失败", e);
            return {};
        }
    },
    remove: function(key) {
        try {
            if (window.parent && window.parent.dataHub) {
                if (typeof window.parent.dataHub.removeData === 'function') {
                    window.parent.dataHub.removeData(key);
                } else {
                    delete window.parent.dataHub[key];
                }
            }
            localStorage.removeItem(key);
        } catch(e) {
            console.error("DataHub 删除失败", e);
        }
    },
    clear: function() {
        try {
            if (window.parent && window.parent.dataHub) {
                if (typeof window.parent.dataHub.clearData === 'function') {
                    window.parent.dataHub.clearData();
                } else {
                    for (let key in window.parent.dataHub) {
                        if (typeof window.parent.dataHub[key] !== 'function') {
                            delete window.parent.dataHub[key];
                        }
                    }
                }
            }
            localStorage.clear();
        } catch(e) {
            console.error("DataHub 清空失败", e);
        }
    }
};

// ================= API 预设管理核心逻辑 =================
let currentPresets = [];
let activePresetId = null;
let editingId = null;

// 默认诗句常量
const DEFAULT_POEM = "海内存知己，天涯若比邻";

document.addEventListener('DOMContentLoaded', () => {
    // 初始化 API 预设
    currentPresets = DataHubUtil.get('apiPresets', []);
    activePresetId = DataHubUtil.get('activeApiPresetId', null);
    renderPresetsList();

    // 初始化一言设置 (使用 dock_poem 键名)
 let savedPoem = DEFAULT_POEM;
if (window.parent && window.parent.dataHub) {
    savedPoem = window.parent.dataHub.get('dock_poem', DEFAULT_POEM);
}
document.getElementById('dock-poem-input').value = savedPoem === DEFAULT_POEM ? '' : savedPoem;
document.getElementById('dock-poem-preview').textContent = savedPoem;

    // 备份导入监听
    document.getElementById('backup-import-input').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                for (let key in data) {
                    DataHubUtil.set(key, data[key]);
                }
                alert('导入成功！');
                
                // 重新加载数据
                currentPresets = DataHubUtil.get('apiPresets', []);
                activePresetId = DataHubUtil.get('activeApiPresetId', null);
                renderPresetsList();
                
                // 重新加载诗句
                const importedPoem = DataHubUtil.get('dock_poem', DEFAULT_POEM);
                document.getElementById('dock-poem-input').value = importedPoem === DEFAULT_POEM ? '' : importedPoem;
                document.getElementById('dock-poem-preview').textContent = importedPoem;
                
            } catch (error) {
                alert('导入失败：文件格式可能不正确');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });
});

// ... (保持中间 API 预设相关的函数不变 renderPresetsList, activatePreset, createNewApiPreset, editPreset, saveApiPreset, deletePreset, cancelApiEdit, testApiPreset, switchSettingsTab, goBack) ...

function renderPresetsList() {
    const listEl = document.getElementById('api-presets-list');
    listEl.innerHTML = '';
    
    if (currentPresets.length === 0) {
        listEl.innerHTML = '<li style="color: #999; margin: 10px 0;">暂无预设，请在下方新建。</li>';
        return;
    }

    currentPresets.forEach(preset => {
        const li = document.createElement('li');
        li.className = 'preset-item';
        if (preset.id === activePresetId) {
            li.classList.add('active-preset');
        }
        
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `<span class="preset-name">${preset.name}</span> <span class="active-badge">当前使用</span> <span style="color:#666; font-size:12px; margin-left:10px;">${preset.model}</span>`;
        
        const btnGroup = document.createElement('div');
        
        const activateBtn = document.createElement('button');
        activateBtn.className = 'jinyu-btn';
        activateBtn.style.margin = '0 5px 0 0';
        activateBtn.style.padding = '4px 10px';
        if (preset.id === activePresetId) {
            activateBtn.textContent = '已激活';
            activateBtn.disabled = true;
        } else {
            activateBtn.textContent = '激活';
            activateBtn.style.color = 'var(--primary-color)';
            activateBtn.style.borderColor = 'var(--primary-color)';
            activateBtn.onclick = () => activatePreset(preset.id);
        }
        
        const editBtn = document.createElement('button');
        editBtn.className = 'jinyu-btn';
        editBtn.style.margin = '0 5px 0 0';
        editBtn.style.padding = '4px 10px';
        editBtn.textContent = '编辑';
        editBtn.onclick = () => editPreset(preset.id);
        
        const delBtn = document.createElement('button');
        delBtn.className = 'jinyu-btn';
        delBtn.style.margin = '0';
        delBtn.style.padding = '4px 10px';
        delBtn.style.color = 'red';
        delBtn.style.borderColor = 'red';
        delBtn.textContent = '删除';
        delBtn.onclick = () => deletePreset(preset.id);
        
        btnGroup.appendChild(activateBtn);
        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(delBtn);
        
        li.appendChild(infoDiv);
        li.appendChild(btnGroup);
        listEl.appendChild(li);
    });
}

function activatePreset(id) {
    activePresetId = id;
    DataHubUtil.set('activeApiPresetId', id);
    
    const preset = currentPresets.find(p => p.id === id);
    DataHubUtil.set('activeApiPreset', preset);
    
    renderPresetsList();
}

function createNewApiPreset() {
    editingId = null;
    document.getElementById('api-form-title').textContent = '新建 API 预设';
    document.getElementById('api-name').value = '';
    document.getElementById('api-url').value = '';
    document.getElementById('api-key').value = '';
    document.getElementById('api-model').value = '';
    document.getElementById('api-temperature').value = '0.7';
}

function editPreset(id) {
    const preset = currentPresets.find(p => p.id === id);
    if (!preset) return;
    
    editingId = id;
    document.getElementById('api-form-title').textContent = '编辑 API 预设: ' + preset.name;
    document.getElementById('api-name').value = preset.name || '';
    document.getElementById('api-url').value = preset.url || '';
    document.getElementById('api-key').value = preset.key || '';
    document.getElementById('api-model').value = preset.model || '';
    document.getElementById('api-temperature').value = preset.temperature || '0.7';
}

function saveApiPreset() {
    const name = document.getElementById('api-name').value.trim();
    const url = document.getElementById('api-url').value.trim();
    const key = document.getElementById('api-key').value.trim();
    const model = document.getElementById('api-model').value.trim();
    const temperature = parseFloat(document.getElementById('api-temperature').value) || 0.7;

    if (!name) {
        alert('预设名称不能为空！');
        return;
    }

    const presetData = {
        id: editingId || Date.now().toString(), 
        name, url, key, model, temperature
    };

    let isUpdateActive = false;

    if (editingId) {
        const index = currentPresets.findIndex(p => p.id === editingId);
        if (index !== -1) currentPresets[index] = presetData;
        if (editingId === activePresetId) isUpdateActive = true;
    } else {
        currentPresets.push(presetData);
    }

    DataHubUtil.set('apiPresets', currentPresets);
    
    if (isUpdateActive) {
        DataHubUtil.set('activeApiPreset', presetData);
    }
    
    if (currentPresets.length === 1 && !activePresetId) {
        activatePreset(presetData.id);
    } else {
        renderPresetsList();
    }
    
    alert('保存成功！');
    
    editingId = presetData.id;
    document.getElementById('api-form-title').textContent = '编辑 API 预设: ' + name;
}

function deletePreset(id) {
    if(confirm('确定要删除这个 API 预设吗？')) {
        currentPresets = currentPresets.filter(p => p.id !== id);
        DataHubUtil.set('apiPresets', currentPresets);
        
        if (id === activePresetId) {
            activePresetId = null;
            DataHubUtil.set('activeApiPresetId', null);
            DataHubUtil.set('activeApiPreset', null);
        }
        
        renderPresetsList();
        
        if (editingId === id) {
            createNewApiPreset();
        }
    }
}

function cancelApiEdit() {
    createNewApiPreset();
}

function testApiPreset() {
    alert('测试连接功能尚未实现，敬请期待。');
}

function switchSettingsTab(tabId, element) {
    document.querySelectorAll('.settings-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
}

function goBack() {
    if (window.parent !== window) {
        window.parent.postMessage('closeApp', '*');
    } else if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// ================= 外观设置逻辑 (一言) =================
function saveDockPoem() { 
    const inputVal = document.getElementById('dock-poem-input').value.trim();
    const poemToSave = inputVal || DEFAULT_POEM;
    
    if (window.parent && window.parent.dataHub) {
        window.parent.dataHub.set('dock_poem', poemToSave);
    }
    document.getElementById('dock-poem-preview').textContent = poemToSave;
    alert('一言保存成功！');
}

function resetDockPoem() { 
    if (window.parent && window.parent.dataHub) {
        window.parent.dataHub.set('dock_poem', DEFAULT_POEM);
    }
    document.getElementById('dock-poem-input').value = '';
    document.getElementById('dock-poem-preview').textContent = DEFAULT_POEM;
    alert('已恢复默认一言！');
}

// ================= 导入导出逻辑 =================
function triggerBackupImport() { 
    document.getElementById('backup-import-input').click(); 
}

function exportBackup() { 
    const data = DataHubUtil.getAll();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `jinyu_backup_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ================= 危险操作逻辑 =================
function clearCache() { 
    if (confirm('确定要清除缓存吗？这会清理临时数据，但不会删除您的 API 预设和核心设置。')) {
        // 保留 dock_poem
        const keepKeys = ['apiPresets', 'activeApiPresetId', 'activeApiPreset', 'dock_poem'];
        const allData = DataHubUtil.getAll();
        
        for (let key in allData) {
            if (!keepKeys.includes(key)) {
                DataHubUtil.remove(key);
            }
        }
        alert('缓存已清除！');
    }
}

function resetApp() { 
    if (confirm('⚠️ 警告：此操作将清空所有数据（包括所有的 API 预设和您的个性化设置），并恢复到初始状态。\n\n确定要继续吗？')) {
        DataHubUtil.clear();
        
        currentPresets = [];
        activePresetId = null;
        editingId = null;
        
        renderPresetsList();
        createNewApiPreset();
        
        // 重置诗句 UI
        document.getElementById('dock-poem-input').value = '';
        document.getElementById('dock-poem-preview').textContent = DEFAULT_POEM;

        alert('应用已重置为初始状态！');
    }
}
