// ===== EarthMC — 城镇详情页 JS =====

const dom = id => document.getElementById(id);

// 获取地址栏城镇名
const URLString = window.location.search;
const URL = new URLSearchParams(URLString);
const townName = URL.get('search');
if (townName) dom('tName').value = townName;

const searchButton = dom('searchButton');

// 布尔映射
const boolHTML = v => v ? '<span class="yes">是</span>' : '<span class="no">否</span>';

// 显示加载
if (typeof showLoading === 'function') showLoading();

// 卡片头部颜色（使用主色）
const cardIcon = dom('cardIcon');
if (cardIcon) {
    cardIcon.style.background = 'rgba(99,102,241,0.12)';
    cardIcon.style.border = '2px solid #6366f1';
    cardIcon.style.color = '#6366f1';
}

// 隐藏结果直到有数据
const mainArea = dom('mainArea');
if (mainArea) mainArea.style.opacity = '0';

fetch('/api/v4/towns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: [townName] })
})
.then(r => r.json())
.then(data => {
    const t = data[0];

    // === 卡片头部 ===
    dom('name').textContent = t.name;
    dom('uuid').textContent = 'UUID: ' + t.uuid;

    const pubDot = dom('isPublicDot');
    const pubLabel = dom('isPublicLabel');
    if (pubDot && pubLabel) {
        if (t.status.isPublic) {
            pubDot.className = 'online-dot public';
            pubLabel.textContent = '公开城镇';
        } else {
            pubDot.className = 'online-dot offline';
            pubLabel.textContent = '私有城镇';
        }
    }

    // === 统计图标行 ===
    dom('numTownBlocks').innerHTML = `${t.stats.numTownBlocks}<small style="font-size:0.7em;color:var(--text-muted)"> / ${t.stats.maxTownBlocks}</small>`;
    dom('numResidents').textContent = t.stats.numResidents;
    dom('balance').textContent = formatBalance(t.stats.balance);

    // === 公告板 ===
    dom('boardText').innerHTML = t.board || '（无公告）';

    // === 基础信息 ===
    dom('founder').innerHTML = `<a href="player.html?search=${t.founder}">${t.founder}</a>`;
    dom('mayor').innerHTML = `<a href="player.html?search=${t.mayor.name}">${t.mayor.name}</a>`;
    dom('nation').innerHTML = t.nation
        ? `<a href="nation.html?search=${t.nation.name}">${t.nation.name}</a>` : '无';
    dom('registered').textContent = formatDate(t.timestamps.registered);
    dom('joinedNationAt').textContent = t.timestamps.joinedNationAt ? formatDate(t.timestamps.joinedNationAt) : '—';
    dom('wiki').innerHTML = t.wiki
        ? `<a href="${t.wiki}" target="_blank">${t.wiki}</a>` : '—';

    // === 状态 ===
    dom('isOpen').innerHTML = boolHTML(t.status.isOpen);
    dom('isNeutral').innerHTML = boolHTML(t.status.isNeutral);
    dom('Capital').innerHTML = boolHTML(t.status.isCapital);
    dom('isOverClaimed').innerHTML = boolHTML(t.status.isOverClaimed);
    dom('hasOverclaimShield').innerHTML = boolHTML(t.status.hasOverclaimShield);
    dom('isRuined').innerHTML = boolHTML(t.status.isRuined);
    dom('isForSale').innerHTML = boolHTML(t.status.isForSale);

    if (t.stats.forSalePrice == null) {
        const row = dom('forSalePriceRow');
        if (row) row.style.display = 'none';
    } else {
        dom('forSalePrice').innerHTML = `<span class="yes">${t.stats.forSalePrice} 金锭</span>`;
    }

    dom('canOutsidersSpawn').innerHTML = boolHTML(t.status.canOutsidersSpawn);

    // === 统计数据 ===
    dom('numTownBlocksDetail').textContent = t.stats.numTownBlocks;
    dom('maxTownBlocks').textContent = t.stats.maxTownBlocks;
    dom('numResidentsDetail').textContent = t.stats.numResidents;
    dom('numTrusted').textContent = t.stats.numTrusted || 0;
    dom('numOutlaws').textContent = t.stats.numOutlaws || 0;

    // === 权限标签 ===
    const flagStatus = v => v ? 'yes' : 'no';
    const flagLabel = v => v ? '开' : '关';
    dom('pvp').className = `flag-status ${flagStatus(t.perms.flags.pvp)}`;
    dom('pvp').textContent = flagLabel(t.perms.flags.pvp);
    dom('explosion').className = `flag-status ${flagStatus(t.perms.flags.explosion)}`;
    dom('explosion').textContent = flagLabel(t.perms.flags.explosion);
    dom('fire').className = `flag-status ${flagStatus(t.perms.flags.fire)}`;
    dom('fire').textContent = flagLabel(t.perms.flags.fire);
    dom('mobs').className = `flag-status ${flagStatus(t.perms.flags.mobs)}`;
    dom('mobs').textContent = flagLabel(t.perms.flags.mobs);

    // === 坐标 ===
    const sx = Math.floor(t.coordinates.spawn.x);
    const sy = Math.floor(t.coordinates.spawn.y);
    const sz = Math.floor(t.coordinates.spawn.z);
    dom('spawn-x').textContent = sx;
    dom('spawn-y').textContent = sy;
    dom('spawn-z').textContent = sz;
    dom('mapLink').href = `https://map.earthmc.net/?world=minecraft_overworld&zoom=5&x=${sx}&z=${sz}`;
    dom('homeBlock').textContent = `(${t.coordinates.homeBlock[0]}, ${t.coordinates.homeBlock[1]})`;

    // === 职位 ===
    const rankIds = ['Councillor','Builder','Recruiter','Police','Tax-exempt','Treasurer','Realtor','Settler'];
    rankIds.forEach(id => {
        const el = dom(id);
        if (el) {
            const arr = t.ranks[id];
            el.textContent = (arr && arr.length) ? arr.join(', ') : '—';
        }
    });

    // === 居民表格 ===
    const residentsBody = dom('residentsTable').querySelector('tbody');
    if (t.residents && t.residents.length) {
        t.residents.forEach(item => {
            residentsBody.insertAdjacentHTML('beforeend',
                `<tr><td><a href="player.html?search=${item.name}">${item.name}</a></td><td>${item.uuid}</td></tr>`);
        });
    } else {
        residentsBody.innerHTML = '<tr class="empty-row"><td colspan="2">暂无居民</td></tr>';
    }

    // 渐入显示
    if (mainArea) {
        mainArea.style.opacity = '1';
        mainArea.classList.add('fade-in');
    }

    searchButton.textContent = '查询城镇信息';
    if (typeof hideLoading === 'function') hideLoading();
})
.catch(err => {
    console.error(err);
    alert('没有查询到该城镇信息');
    searchButton.textContent = '查询城镇信息';
    searchButton.disabled = false;
    if (typeof hideLoading === 'function') hideLoading();
});

// === 查询单一城镇 ===
function search() {
    const input = dom('tName');
    const name = input.value.trim();
    if (!name) {
        input.classList.add('input-shake');
        setTimeout(() => input.classList.remove('input-shake'), 150);
        alert('请输入城镇名称');
        return;
    }
    const btn = dom('searchButton');
    btn.textContent = '跳转中...';
    btn.disabled = true;
    setTimeout(() => { window.location.href = `town.html?search=${encodeURIComponent(name)}`; }, 200);
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
