// ===== EarthMC — 国家详情页 JS =====

const dom = id => document.getElementById(id);

// 获取地址栏国家名
const URLString = window.location.search;
const URL = new URLSearchParams(URLString);
const nName = URL.get('search');
if (nName) dom('nName').value = nName;

const searchButton = dom('searchButton');

// 布尔映射
const boolHTML = v => v ? '<span class="yes">是</span>' : '<span class="no">否</span>';

// 显示加载
if (typeof showLoading === 'function') showLoading();

// 卡片头部颜色（使用青色）
const cardIcon = dom('cardIcon');
if (cardIcon) {
    cardIcon.style.background = 'rgba(6,182,212,0.12)';
    cardIcon.style.border = '2px solid #06b6d4';
    cardIcon.style.color = '#06b6d4';
}

// 隐藏结果直到有数据
const mainArea = dom('mainArea');
if (mainArea) mainArea.style.opacity = '0';

fetch('/api/v4/nations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: [nName] })
})
.then(r => r.json())
.then(data => {
    const n = data[0];

    // === 卡片头部 ===
    dom('name').textContent = n.name;
    dom('uuid').textContent = 'UUID: ' + n.uuid;

    // 国家颜色
    const colorEl = dom('dynmapColour');
    if (colorEl && n.dynmapColour) {
        colorEl.style.backgroundColor = '#' + n.dynmapColour;
    }

    dom('king').innerHTML = `<a href="player.html?search=${n.king.name}">${n.king.name}</a> — 国王`;

    // === 统计图标行 ===
    dom('numTowns').textContent = n.stats.numTowns;
    dom('numResidents').textContent = n.stats.numResidents;
    dom('numTownBlocks').textContent = n.stats.numTownBlocks;

    // === 公告板 ===
    dom('boardText').innerHTML = n.board || '（无公告）';

    // === 基础信息 ===
    dom('kingRow').innerHTML = `<a href="player.html?search=${n.king.name}">${n.king.name}</a>`;
    dom('capital').innerHTML = `<a href="town.html?search=${n.capital.name}">${n.capital.name}</a>`;
    dom('registered').textContent = formatDate(n.timestamps.registered);
    dom('wiki').innerHTML = n.wiki
        ? `<a href="${n.wiki}" target="_blank">${n.wiki}</a>` : '—';

    // === 状态 ===
    dom('isPublic').innerHTML = boolHTML(n.status.isPublic);
    dom('isOpen').innerHTML = boolHTML(n.status.isOpen);
    dom('isNeutral').innerHTML = boolHTML(n.status.isNeutral);

    // === 统计数据 ===
    dom('numTownBlocksDetail').textContent = n.stats.numTownBlocks;
    dom('numResidentsDetail').textContent = n.stats.numResidents;
    dom('numAllies').textContent = n.stats.numAllies;
    dom('numEnemies').textContent = n.stats.numEnemies;
    dom('balance').textContent = formatBalance(n.stats.balance);

    // === 坐标 ===
    const sx = Math.floor(n.coordinates.spawn.x);
    const sy = Math.floor(n.coordinates.spawn.y);
    const sz = Math.floor(n.coordinates.spawn.z);
    dom('spawn-x').textContent = sx;
    dom('spawn-y').textContent = sy;
    dom('spawn-z').textContent = sz;
    dom('mapLink').href = `https://map.earthmc.net/?world=minecraft_overworld&zoom=5&x=${sx}&z=${sz}`;

    // === 职位 ===
    const rankIds = ['Chancellor', 'Colonist', 'Diplomat'];
    rankIds.forEach(id => {
        const el = dom(id);
        if (el) {
            const arr = n.ranks[id];
            el.textContent = (arr && arr.length) ? arr.join(', ') : '—';
        }
    });

    // === 城镇表格 ===
    const townsBody = dom('townsTable').querySelector('tbody');
    if (n.towns && n.towns.length) {
        n.towns.forEach(item => {
            townsBody.insertAdjacentHTML('beforeend',
                `<tr><td><a href="town.html?search=${item.name}">${item.name}</a></td><td>${item.uuid}</td></tr>`);
        });
    } else {
        townsBody.innerHTML = '<tr class="empty-row"><td colspan="2">无城镇</td></tr>';
    }

    // === 盟友表格 ===
    const alliesBody = dom('alliesTable').querySelector('tbody');
    if (n.allies && n.allies.length) {
        n.allies.forEach(item => {
            alliesBody.insertAdjacentHTML('beforeend',
                `<tr><td><a href="nation.html?search=${item.name}">${item.name}</a></td><td>${item.uuid}</td></tr>`);
        });
    } else {
        alliesBody.innerHTML = '<tr class="empty-row"><td colspan="2">无盟友</td></tr>';
    }

    // === 敌国表格 ===
    const enemiesBody = dom('enemiesTable').querySelector('tbody');
    if (n.enemies && n.enemies.length) {
        n.enemies.forEach(item => {
            enemiesBody.insertAdjacentHTML('beforeend',
                `<tr><td><a href="nation.html?search=${item.name}">${item.name}</a></td><td>${item.uuid}</td></tr>`);
        });
    } else {
        enemiesBody.innerHTML = '<tr class="empty-row"><td colspan="2">无敌国</td></tr>';
    }

    // 渐入显示
    if (mainArea) {
        mainArea.style.opacity = '1';
        mainArea.classList.add('fade-in');
    }

    searchButton.textContent = '查询国家信息';
    if (typeof hideLoading === 'function') hideLoading();
})
.catch(err => {
    console.error(err);
    alert('没有查询到该国家信息');
    searchButton.textContent = '查询国家信息';
    searchButton.disabled = false;
    if (typeof hideLoading === 'function') hideLoading();
});

// === 查询单一国家 ===
function search() {
    const input = dom('nName');
    const name = input.value.trim();
    if (!name) {
        input.classList.add('input-shake');
        setTimeout(() => input.classList.remove('input-shake'), 150);
        alert('请输入国家名称');
        return;
    }
    const btn = dom('searchButton');
    btn.textContent = '跳转中...';
    btn.disabled = true;
    setTimeout(() => { window.location.href = `nation.html?search=${encodeURIComponent(name)}`; }, 200);
}

// === 工具函数 ===
function formatDate(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatBalance(val) {
    if (val == null) return '—';
    return Number(val).toLocaleString('en-US') + ' 金锭';
}
