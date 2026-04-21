// ===== EarthMC — 玩家详情页 JS =====

// 获取地址栏玩家名
const URLString = window.location.search;
const URL = new URLSearchParams(URLString);
const playerName = URL.get('search');
if (playerName) document.getElementById('pName').value = playerName;

// DOM 快速引用
const dom = id => document.getElementById(id);

// 布尔值 → CSS class
const boolHTML = v => v ? '<span class="yes">是</span>' : '<span class="no">否</span>';
const boolText = v => v ? '是' : '否';

const searchButton = dom('searchButton');

// 显示加载动画
if (typeof showLoading === 'function') showLoading();

// 隐藏结果卡片直到有数据
const playerCard = dom('mainArea');
if (playerCard) playerCard.style.opacity = '0';

fetch('/api/v4/players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: [playerName] })
})
.then(r => r.json())
.then(data => {
    const p = data[0];

    // === 卡片头部 ===
    dom('name').textContent = p.name;
    dom('uuid').textContent = 'UUID: ' + p.uuid;

    // 头像
    const avatar = dom('avatarImg');
    if (avatar && p.uuid) {
        avatar.src = `https://crafatar.com/avatars/${p.uuid}?size=128&overlay=true&v=2`;
        avatar.onerror = () => { avatar.src = `https://mc-heads.net/avatar/${p.uuid}/80`; };
    }

    // === 在线状态 ===
    const onlineBadge = dom('isOnline');
    const onlineDot = dom('onlineBadge').querySelector('.dot') || document.createElement('span');
    if (p.status && p.status.isOnline) {
        onlineBadge.textContent = '在线';
        onlineBadge.style.color = '#22c55e';
        onlineDot.className = 'dot online';
    } else {
        onlineBadge.textContent = '离线';
        onlineDot.className = 'dot offline';
    }

    // === 统计图标行 ===
    dom('balance').textContent = Number(p.stats.balance).toLocaleString('en-US') + ' 金';
    dom('numFriends').textContent = p.stats.numFriends || 0;
    dom('title').textContent = p.title || '—';

    // === 详情区 ===
    dom('surName').innerHTML = p.surname || '—';
    dom('formattedName').innerHTML = p.formattedName || '—';
    dom('about').innerHTML = p.about || '—';

    // 城镇 & 国家
    dom('townJoined').innerHTML = (p.town && p.town.name)
        ? `<a href="town.html?search=${p.town.name}">${p.town.name}</a>` : '无';
    dom('nationJoined').innerHTML = (p.nation && p.nation.name)
        ? `<a href="nation.html?search=${p.nation.name}">${p.nation.name}</a>` : '无';

    // 活跃时间
    dom('registered').textContent  = formatDate(p.timestamps.registered);
    dom('joinedTownAt').textContent = p.timestamps.joinedTownAt ? formatDate(p.timestamps.joinedTownAt) : '—';
    const lastOnline = dom('lastOnline');
    lastOnline.textContent = p.timestamps.lastOnline ? formatDate(p.timestamps.lastOnline) : '—';
    if (p.status && p.status.isOnline) {
        lastOnline.textContent = '当前在线';
        lastOnline.className = 'value online-val';
    }

    // 身份状态
    dom('isNPC').innerHTML = boolHTML(p.status && p.status.isNPC);
    const isMayorEl = dom('isMayor');
    isMayorEl.innerHTML = (p.status && p.status.isMayor)
        ? '<span class="yes">是</span>' : '<span class="no">否</span>';
    const isKingEl = dom('isKing');
    isKingEl.innerHTML = (p.status && p.status.isKing)
        ? '<span class="gold">是</span>' : '<span class="no">否</span>';

    // 职位
    const tr = (p.ranks && p.ranks.townRanks && p.ranks.townRanks.length) ? p.ranks.townRanks.join(', ') : '无';
    const nr = (p.ranks && p.ranks.nationRanks && p.ranks.nationRanks.length) ? p.ranks.nationRanks.join(', ') : '无';
    dom('townRanks').textContent = tr;
    dom('nationRanks').textContent = nr;

    // 好友列表
    const friendsBody = dom('friendsList').querySelector('tbody');
    if (p.friends && p.friends.length) {
        p.friends.forEach(item => {
            friendsBody.insertAdjacentHTML('beforeend',
                `<tr><td><a href="player.html?search=${item.name}">${item.name}</a></td><td>${item.uuid}</td></tr>`);
        });
    } else {
        friendsBody.innerHTML = '<tr class="empty-row"><td colspan="2">暂无好友</td></tr>';
    }

    // 渐入显示
    if (playerCard) {
        playerCard.style.opacity = '1';
        playerCard.classList.add('fade-in');
    }

    searchButton.textContent = '查询玩家信息';
    if (typeof hideLoading === 'function') hideLoading();
})
.catch(err => {
    console.error(err);
    alert('没有查询到该玩家信息');
    searchButton.textContent = '查询玩家信息';
    searchButton.disabled = false;
    if (typeof hideLoading === 'function') hideLoading();
});

// === 查询单一玩家 ===
function search() {
    const input = dom('pName');
    const name = input.value.trim();
    if (!name) {
        input.classList.add('input-shake');
        setTimeout(() => input.classList.remove('input-shake'), 150);
        alert('请输入玩家名称或UUID');
        return;
    }
    const btn = dom('searchButton');
    btn.textContent = '跳转中...';
    btn.disabled = true;
    setTimeout(() => { window.location.href = `player.html?search=${encodeURIComponent(name)}`; }, 200);
}

// === 工具函数 ===
function formatDate(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
