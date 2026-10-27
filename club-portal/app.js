/* ============================================================
   Heygo 俱乐部设备管理台 · 交互 Demo
   纯前端，无后端。所有操作写进 localStorage，刷新保留，可一键重置。
   ============================================================ */
'use strict';

/* ---------- 基础工具 ---------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const uid = p => p + Math.random().toString(36).slice(2,8);

/* Heygo 字标：矢量取自 app_flutter/assets/svg/login-logo.svg，
   仅把 fill 从 white 改成 currentColor，形状未改。深底用白、浅底用 #1A1A1A。 */
const LOGO = `<svg viewBox="0 0 88 38" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"><path d="M79.7235 16.8242C80.1817 16.5436 80.4403 16.4581 80.704 16.624C80.9688 16.798 81.9535 21.1619 77.0516 24.0576C76.0206 24.6666 67.6434 29.0747 63.5663 31.5977C63.5253 31.6251 58.9555 34.6903 57.7303 34.9092C56.5007 35.1281 52.9599 34.7403 52.7958 32.29C52.7274 31.2659 53.5214 30.7731 54.3944 30.2969C55.4654 29.713 59.9734 28.8934 60.2469 28.8477C61.8443 28.579 75.4247 20.7824 77.746 18.4971C78.2279 18.0226 79.1072 17.2019 79.7235 16.8242ZM46.0673 18.2402L50.3163 8.91895H53.9628L44.5116 30.5713H40.6356L44.0673 22.748L37.4344 8.91895H41.455L46.0673 18.2402ZM67.8788 23.3574C67.8788 23.5654 67.8979 23.7625 67.8788 23.9502L64.2655 26.0713C64.3979 25.6161 64.4767 25.0968 64.5018 24.5137C64.5134 24.4981 64.5229 23.3925 64.5321 22.0127C63.3152 23.4688 61.6099 24.3766 59.7206 24.377C56.024 24.3768 53.0266 20.9104 53.0262 16.6357C53.0264 12.361 55.7265 8.89562 59.7206 8.89551C61.8379 8.89581 63.4711 9.70732 64.5946 11.0273L64.6083 8.86133L67.8788 8.83984V23.3574ZM6.6366 12.0352H17.2147V3H20.8505V24.376H17.2147V15.3408H6.6366V24.376H2.99988V3H6.6366V12.0352ZM30.9081 8.6748C35.6451 8.67505 38.371 12.0225 38.371 16.0811C38.371 16.7031 38.3384 17.3548 38.2411 17.9473H27.6259C27.0491 17.4089 26.9666 15.7844 27.6259 15.1631H35.3134C35.2307 14.212 35.0945 13.1671 34.2938 12.3936C33.5501 11.5397 32.3656 11.0987 30.9081 11.0986C29.4503 11.0986 28.5361 11.4566 27.4618 12.4482C26.3875 13.4399 26.1008 15.2585 26.1678 16.498C26.3301 19.4985 27.9584 20.8779 30.9081 20.8779C33.8576 20.8779 36.2496 20.2439 37.4891 19.5127L37.495 22.9795C36.2621 23.6016 33.1024 24.3759 30.9608 24.376C24.7958 24.376 22.5038 21.2655 22.5038 16.5254C22.5038 12.3186 25.5542 8.6748 30.9081 8.6748ZM77.1014 8.83984C81.8406 8.84005 85.035 12.2698 85.035 16.8545C85.035 19.9848 83.2447 22.9708 80.7108 24.1279C80.1217 24.3188 79.8565 24.3759 79.5262 24.376C79.1961 24.376 78.6453 24.2663 78.5067 24.1562L79.1678 23.5771C82.3351 21.6215 82.4073 17.683 82.2528 16.3604C82.0049 14.2393 80.0952 12.034 77.1014 12.2598C74.1077 12.4859 73.0165 14.6798 73.0165 16.8545C73.0165 18.0705 73.4575 19.1801 74.1053 19.9688L70.7753 21.9404C69.6807 20.5784 69.1689 18.9279 69.1688 16.8545C69.1689 12.2698 72.2936 8.84004 77.1014 8.83984ZM60.5331 11.96C58.0012 11.9601 56.4423 13.8644 56.4423 16.3975C56.4427 18.93 57.8248 21.0106 60.5331 21.0107C63.2406 21.0101 64.5405 18.9297 64.5409 16.3975C64.5409 13.8648 63.0643 11.9606 60.5331 11.96Z" fill="currentColor"/></svg>`;

const ICONS = {
  box:'<path d="M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  building:'<path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16"/><path d="M16 9h3a2 2 0 0 1 2 2v10"/><path d="M9 7h3M9 11h3M9 15h3"/>',
  users:'<path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  search:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  x:'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  alert:'<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  check:'<polyline points="20 6 9 17 4 12"/>',
  qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM19 19h2v2h-2z"/>',
  refresh:'<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
  unlink:'<path d="M18.84 12.25l1.72-1.71a4.24 4.24 0 0 0-6-6l-1.71 1.71"/><path d="M5.17 11.75l-1.71 1.71a4.24 4.24 0 0 0 6 6l1.71-1.71"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="2" y1="8" x2="5" y2="8"/>',
  plus:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'
};
const ic = (n, sz=16) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]||''}</svg>`;

const now = () => {
  const d = new Date(), p = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const randBox = () => {
  const cs='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let s=''; for(let i=0;i<22;i++) s+=cs[Math.floor(Math.random()*cs.length)];
  return 'HG3.'+s;
};

/* ---------- 状态 ---------- */
const KEY = 'heygo-club-portal-demo-v1';
let DB, SESSION = { accountId:null, mode:'club' };

function load(){
  try{ const raw = localStorage.getItem(KEY); if(raw){ DB = JSON.parse(raw); return; } }catch(e){}
  DB = clone(window.SEED);
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(DB)); }catch(e){} }
function resetDB(){ DB = clone(window.SEED); save(); }

const entityById  = id => DB.entities.find(e=>e.id===id);
const accountById = id => DB.accounts.find(a=>a.id===id);
const deviceById  = id => DB.devices.find(d=>d.id===id);
const me  = () => accountById(SESSION.accountId);
const myEntity = () => { const a=me(); return a ? entityById(a.entityId) : null; };
const devicesOf = eid => DB.devices.filter(d=>d.entityId===eid);
const snsOf = d => [d.leftSn, d.rightSn];

/* 设备展示状态：盒码状态 × 绑定状态 的组合 */
function devState(d){
  if (d.boxStatus==='none')        return { t:'未生成盒码', c:'pill-grey',  k:'nobox'  };
  if (d.bound)                     return { t:'已绑定账号', c:'pill-blue',  k:'bound'  };
  if (d.boxStatus==='preconsumed') return { t:'扫码中',     c:'pill-amber', k:'scan'   };
  if (d.boxStatus==='consumed')    return { t:'盒码被占用', c:'pill-red',   k:'stuck'  };
  return { t:'可激活', c:'pill-green', k:'free' };
}
const BOXTXT = { none:'未生成', usable:'usable · 可扫', preconsumed:'preconsumed · 扫码中', consumed:'consumed · 已占用' };

/* ---------- 日志 ---------- */
function log(action, detail, deviceId, result='ok'){
  DB.logs.unshift({ id:uid('lg_'), at:now(), accountId:SESSION.accountId,
    entityId: me() ? me().entityId : null, action, deviceId, detail, result });
  save();
}
const ACTION_TXT = { release:'释放设备', unbind:'解绑账号', reset:'重置盒码', generate:'生成盒码', search:'搜索', login:'登录', config:'配置变更' };

/* ---------- toast ---------- */
function toast(msg, kind='ok'){
  const n = document.createElement('div');
  n.className = 'toast '+kind;
  n.innerHTML = `<span class="d">${ic(kind==='ok'?'check':'alert',15)}</span><span>${esc(msg)}</span>`;
  $('#toasts').appendChild(n);
  setTimeout(()=>{ n.style.opacity='0'; n.style.transition='opacity .2s'; setTimeout(()=>n.remove(),220); }, 2600);
}

/* ---------- 模态 / 抽屉 ---------- */
let modalOnConfirm = null;
function openModal(html, onConfirm){
  $('#modal').innerHTML = html;
  modalOnConfirm = onConfirm || null;
  $('#modal').classList.add('on'); $('#scrim').classList.add('on');
}
function closeModal(){
  const m=$('#modal'); m.classList.remove('on');
  if(!$('#drawer').classList.contains('on')) $('#scrim').classList.remove('on');
  modalOnConfirm=null;
  setTimeout(()=>{ if(!m.classList.contains('on')) m.innerHTML=''; }, 220);   // 清掉残留节点，避免旧按钮还能被触发
}
function openDrawer(html){ $('#drawer').innerHTML = html; $('#drawer').classList.add('on'); $('#scrim').classList.add('on'); }
function closeDrawer(){
  const dr=$('#drawer'); dr.classList.remove('on');
  if(!$('#modal').classList.contains('on')) $('#scrim').classList.remove('on');
  setTimeout(()=>{ if(!dr.classList.contains('on')) dr.innerHTML=''; }, 260);
}
$('#scrim').addEventListener('click', ()=>{ closeModal(); closeDrawer(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeModal(); closeDrawer(); } });

/* ============================================================
   路由
   ============================================================ */
function route(){
  const h = location.hash.replace(/^#\/?/,'') || '';
  if (SESSION.mode === 'admin') return renderAdmin(h.startsWith('admin/') ? h.slice(6) : 'entities');
  if (!SESSION.accountId) return renderLogin();
  const page = h.startsWith('admin/') ? 'devices' : (h || 'devices');
  renderClub(page);
}
window.addEventListener('hashchange', route);

/* ============================================================
   登录页
   ============================================================ */
function renderLogin(err){
  const demo = DB.accounts.filter(a=>a.status==='active').slice(0,3).map(a=>{
    const e = entityById(a.entityId);
    return `<button data-fill="${a.username}"><span class="u">${esc(a.username)}</span><span class="e">${esc(e?e.name:'')}</span></button>`;
  }).join('');

  $('#app').innerHTML = `
  <div id="login">
    <div class="login-art">
      <picture class="art-media">
        <source srcset="assets/hero-cn-desktop.webp" type="image/webp">
        <img src="assets/hero-cn-desktop.jpg" alt="">
      </picture>
      <div class="art-tint"></div><div class="art-scrim"></div>
      <div class="logo"><span class="wordmark">${LOGO}</span><span class="nm">俱乐部设备管理台</span></div>
      <div class="art-copy">
        <h1>管理你场地里的<br>每一副 <em>Heygo</em> 雪板传感器</h1>
        <p>账号由 Heygo 统一开通并绑定到你的俱乐部 / 公司，登录后只能看到并操作分配给你的设备。</p>
        <div class="feat"><span>设备解绑</span><span>盒码生成</span><span>盒码重置</span><span>操作留痕</span></div>
      </div>
      <div class="foot">本页面为演示原型，数据均为虚构 · ${esc(now())}</div>
    </div>
    <div class="login-form"><div class="login-box">
      <h2>登录</h2>
      <p class="lead">使用 Heygo 分配给你的账号登录</p>
      ${err?`<div class="login-err">${esc(err)}</div>`:''}
      <div class="field"><label>账号</label><input class="input" id="u" placeholder="例如 nanshan_ops" autocomplete="off"></div>
      <div class="field"><label>密码</label><input class="input" id="p" type="password" placeholder="请输入密码"></div>
      <button class="btn btn-brand" id="go" style="width:100%;height:40px">登录</button>
      <div class="hint" style="margin-top:10px">忘记密码请联系你的 Heygo 对接人重置，本站不支持自助修改密码。</div>
      <div class="demo-accounts">
        <div class="t">演示账号（密码 Heygo@2026）</div>
        ${demo}
      </div>
    </div></div>
  </div>`;

  $$('#login [data-fill]').forEach(b=>b.onclick=()=>{ $('#u').value=b.dataset.fill; $('#p').value='Heygo@2026'; $('#go').focus(); });
  const submit = ()=>{
    const u=$('#u').value.trim(), p=$('#p').value;
    const acc = DB.accounts.find(a=>a.username===u);
    if(!acc || acc.password!==p) return renderLogin('账号或密码不正确');
    if(acc.status!=='active')    return renderLogin('该账号已被停用，请联系 Heygo 对接人');
    SESSION.accountId = acc.id;
    acc.lastLogin = now();
    log('login','登录成功',null); save();
    location.hash = '#/devices'; route();
  };
  $('#go').onclick = submit;
  $$('#u,#p').forEach(i=>i.addEventListener('keydown',e=>{ if(e.key==='Enter') submit(); }));
}

/* ============================================================
   俱乐部端 · 框架
   ============================================================ */
function clubShell(page, title, sub, body){
  const a = me(), e = myEntity(), ds = devicesOf(e.id);
  const logs = DB.logs.filter(l=>l.entityId===e.id);
  const nav = [
    ['devices','box','设备管理', ds.length],
    ['logs','clock','操作记录', logs.length]
  ].map(([k,i,t,c])=>`<a data-go="${k}" class="${page===k?'on':''}"><span class="ic">${ic(i,15)}</span>${t}<span class="cnt">${c}</span></a>`).join('');

  $('#app').innerHTML = `
  <div id="shell">
    <nav class="side">
      <div class="brand"><span class="wordmark">${LOGO}</span><div class="bar"></div><div><div class="n">俱乐部管理台</div><div class="s">Device Console</div></div></div>
      <div class="entity-chip">
        <div class="l">当前主体</div>
        <div class="v">${esc(e.name)}</div>
        <div class="m">${e.type==='club'?'俱乐部':'公司'} · 授权设备 ${ds.length} 套</div>
      </div>
      <div class="nav">${nav}</div>
      <div class="user">
        <span class="avatar">${esc(a.username.slice(0,2).toUpperCase())}</span>
        <div style="flex:1;min-width:0"><div class="nm">${esc(a.name)}</div><div class="rl">${esc(a.username)}</div></div>
        <button class="btn btn-ghost btn-sm" id="logout" title="退出登录">${ic('logout',15)}</button>
      </div>
    </nav>
    <div class="main">
      <div class="topbar"><div><h2>${esc(title)}</h2><div class="sub">${sub}</div></div></div>
      <div class="page">${body}</div>
    </div>
  </div>`;
  $$('[data-go]').forEach(n=>n.onclick=()=>{ location.hash='#/'+n.dataset.go; });
  $('#logout').onclick = ()=>{ SESSION.accountId=null; location.hash='#/'; route(); };
}

function renderClub(page){
  if (page==='logs') return renderClubLogs();
  renderDevices();
}

/* ============================================================
   俱乐部端 · 设备管理
   ============================================================ */
let devFilter = { q:'', seg:'all' };

function renderDevices(){
  const e = myEntity(), all = devicesOf(e.id);
  const q = devFilter.q.trim().toUpperCase();

  let list = all;
  if (devFilter.seg!=='all') list = list.filter(d=>{
    const k = devState(d).k;
    if (devFilter.seg==='bound') return k==='bound';
    if (devFilter.seg==='free')  return k==='free';
    return k==='stuck'||k==='scan'||k==='nobox';          // 需处理
  });
  if (q) list = list.filter(d =>
    d.leftSn.toUpperCase().includes(q) || d.rightSn.toUpperCase().includes(q) ||
    (d.boxCode||'').toUpperCase().includes(q) || (d.bound&&d.bound.nickname.toUpperCase().includes(q)));

  /* 越权拦截：本主体没搜到，但这个 SN / 盒码在系统里属于别人 */
  let denied = null;
  if (q.length>=6 && list.length===0){
    const other = DB.devices.find(d => d.entityId!==e.id &&
      (d.leftSn.toUpperCase().includes(q)||d.rightSn.toUpperCase().includes(q)||(d.boxCode||'').toUpperCase().includes(q)));
    if (other) denied = q;
  }

  const n = k => all.filter(d=>devState(d).k===k).length;
  const stats = `
    <div class="stats">
      <div class="stat"><div class="l">${ic('box',14)} 授权设备</div><div class="v">${all.length}<small>套</small></div></div>
      <div class="stat"><div class="l">${ic('users',14)} 已绑定账号</div><div class="v">${n('bound')}<small>套</small></div></div>
      <div class="stat"><div class="l">${ic('qr',14)} 可激活</div><div class="v">${n('free')}<small>套</small></div></div>
      <div class="stat"><div class="l" style="color:var(--orange-900)">${ic('alert',14)} 待处理</div><div class="v">${n('stuck')+n('scan')+n('nobox')}<small>套</small></div></div>
    </div>`;

  const rows = list.map(d=>{
    const s = devState(d);
    return `<tr data-id="${d.id}">
      <td class="sn-cell" style="min-width:260px">
        <div class="name">${esc(d.model)} <span class="muted" style="font-weight:400">· ${esc(d.batch)} 批次</span></div>
        <div class="pair"><span class="tag">L</span><span class="mono">${esc(d.leftSn)}</span></div>
        <div class="pair"><span class="tag">R</span><span class="mono">${esc(d.rightSn)}</span></div>
      </td>
      <td style="min-width:200px">
        ${d.boxCode ? `<div class="mono">${esc(d.boxCode)}</div><div class="hint" style="margin-top:2px">${esc(BOXTXT[d.boxStatus])}</div>`
                    : `<span class="muted">—</span><div class="hint" style="margin-top:2px">未生成</div>`}
      </td>
      <td style="min-width:146px"><span class="pill ${s.c}"><span class="dot"></span>${s.t}</span>
        ${s.k==='stuck'?`<div class="warn-inline">${ic('alert',12)} 已解绑但盒码未释放</div>`:''}
        ${s.k==='scan'?`<div class="hint" style="margin-top:3px">${esc(d.preconsumedUntil||'')} 自动回滚</div>`:''}
      </td>
      <td style="min-width:150px">
        ${d.bound ? `<div style="font-weight:500">${esc(d.bound.nickname)}</div><div class="hint">${esc(d.bound.phone)} · ${esc(d.bound.boundAt)}</div>`
                  : `<span class="muted">未绑定</span>`}
      </td>
      <td style="text-align:right;min-width:190px"><div class="row-acts">${rowActions(d)}</div></td>
    </tr>`;
  }).join('');

  const body = `
    ${stats}
    <div class="toolbar">
      <div class="search">${`<span class="ic">${ic('search',15)}</span>`}<input class="input" id="q" placeholder="搜索 SN 尾号 / 完整 SN / 盒码 / 绑定人" value="${esc(devFilter.q)}"></div>
      <div class="segs">
        ${[['all','全部'],['bound','已绑定'],['free','可激活'],['todo','待处理']].map(([k,t])=>
          `<button data-seg="${k}" class="${devFilter.seg===k?'on':''}">${t}</button>`).join('')}
      </div>
      <div class="spacer"></div>
      <span class="hint">共 ${list.length} 条</span>
    </div>
    ${denied?`<div class="note note-red" style="margin-bottom:14px">${ic('shield',16)}
        <div><b>该 SN 不在 ${esc(e.name)} 的授权范围内</b><div style="margin-top:3px">
        <span class="code-inline">${esc(denied)}</span> 不在本主体的可操作设备清单里，无法查询或操作。如确认该设备属于贵方，请联系 Heygo 对接人开通授权。</div></div></div>`:''}
    <div class="card">
      <table class="tbl">
        <thead><tr><th>设备（左 / 右脚 SN）</th><th>盒码</th><th>状态</th><th>绑定账号</th><th style="text-align:right">操作</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${list.length?'':`<div class="empty"><div class="big">没有匹配的设备</div><div>换个 SN 尾号试试，或切换上方筛选</div></div>`}
    </div>`;

  clubShell('devices','设备管理', `${esc(e.name)} · 只显示已授权给本主体的设备`, body);

  const qi = $('#q');
  qi.oninput = ()=>{ devFilter.q = qi.value; renderDevices(); const n2=$('#q'); n2.focus(); n2.setSelectionRange(n2.value.length,n2.value.length); };
  $$('[data-seg]').forEach(b=>b.onclick=()=>{ devFilter.seg=b.dataset.seg; renderDevices(); });
  /* 同一个越权关键词只记一条，避免逐字输入刷屏 */
  if (denied && !(DB.logs[0] && DB.logs[0].result==='denied' && DB.logs[0].detail.endsWith(denied)))
    log('search', `搜索越权 SN · ${denied}`, null, 'denied');
  bindRowActions();
}

function rowActions(d){
  const s = devState(d).k, a=[];
  if (s==='nobox') a.push(`<button class="btn-link" data-act="generate" data-id="${d.id}">生成盒码</button>`);
  if (s==='bound'){
    a.push(`<button class="btn-link" data-act="release" data-id="${d.id}"><b>释放设备</b></button>`);
    a.push(`<button class="btn-link" data-act="unbind" data-id="${d.id}">仅解绑</button>`);
  }
  if (s==='stuck'||s==='scan') a.push(`<button class="btn-link" data-act="reset" data-id="${d.id}">重置盒码</button>`);
  if (s==='free')              a.push(`<button class="btn-link" data-act="reset" data-id="${d.id}">重置盒码</button>`);
  a.push(`<button class="btn-link" data-act="detail" data-id="${d.id}">详情</button>`);
  return a.join('');
}
function bindRowActions(){
  $$('[data-act]').forEach(b=>b.onclick=ev=>{
    ev.stopPropagation();
    const d = deviceById(b.dataset.id);
    ({ generate:askGenerate, release:askRelease, unbind:askUnbind, reset:askReset, detail:showDetail })[b.dataset.act](d);
  });
}

/* ============================================================
   俱乐部端 · 操作记录
   ============================================================ */
function renderClubLogs(){
  const e = myEntity();
  const rows = DB.logs.filter(l=>l.entityId===e.id).map(l=>{
    const a = accountById(l.accountId), d = l.deviceId?deviceById(l.deviceId):null;
    return `<tr>
      <td class="mono" style="white-space:nowrap">${esc(l.at)}</td>
      <td><div style="font-weight:500">${esc(a?a.name:'—')}</div><div class="hint">${esc(a?a.username:'')}</div></td>
      <td><span class="pill ${l.result==='ok'?'pill-brand':'pill-red'}">${esc(ACTION_TXT[l.action]||l.action)}</span></td>
      <td>${d?`<div class="mono">${esc(d.leftSn)}</div><div class="mono muted">${esc(d.rightSn)}</div>`:'<span class="muted">—</span>'}</td>
      <td>${esc(l.detail)}</td>
      <td>${l.result==='ok'?'<span class="pill pill-green"><span class="dot"></span>成功</span>':'<span class="pill pill-red"><span class="dot"></span>已拦截</span>'}</td>
    </tr>`;
  }).join('');
  clubShell('logs','操作记录', `${esc(e.name)} 下所有账号的设备操作留痕，不可删除`, `
    <div class="note note-blue" style="margin-bottom:14px">${ic('shield',16)}
      <div>解绑与盒码重置会影响终端用户的数据归属，因此每一次操作都会记录操作人、时间、对象与结果，Heygo 侧可追溯。</div></div>
    <div class="card"><table class="tbl">
      <thead><tr><th>时间</th><th>操作人</th><th>动作</th><th>设备</th><th>说明</th><th>结果</th></tr></thead>
      <tbody>${rows}</tbody></table>
      ${rows?'':'<div class="empty"><div class="big">暂无操作记录</div></div>'}
    </div>`);
}

/* ============================================================
   设备操作：解绑 / 重置盒码 / 释放 / 生成盒码
   —— 四个动作的语义严格对齐后端数据：
      解绑   = 删除设备与账号的绑定关系，盒码占用状态不变
      重置   = 盒码置回可扫并清掉占用记录，绑定关系不变
      释放   = 两件一起做（现场换人时真正需要的那个）
      生成   = 为没有盒码的 SN 新建一条可扫的激活码
   ============================================================ */
function targetBox(d){
  return `<div class="target-box">
    <div class="r"><span class="k">设备</span><span>${esc(d.model)} · ${esc(d.batch)} 批次</span></div>
    <div class="r"><span class="k">左脚 SN</span><span class="mono">${esc(d.leftSn)}</span></div>
    <div class="r"><span class="k">右脚 SN</span><span class="mono">${esc(d.rightSn)}</span></div>
    <div class="r"><span class="k">盒码</span><span class="mono">${d.boxCode?esc(d.boxCode):'—'}</span></div>
    <div class="r"><span class="k">当前绑定</span><span>${d.bound?esc(d.bound.nickname)+' · '+esc(d.bound.phone):'<span class="muted">未绑定</span>'}</span></div>
  </div>`;
}
function confirmBox(o){
  openModal(`
    <div class="modal-h"><h3>${o.title}</h3><p>${o.lead}</p></div>
    <div class="modal-b">
      ${targetBox(o.device)}
      <ul class="effects">${o.effects.map(x=>`<li><span class="m">${x[0]==='+'?'<span style="color:#1C7A4A">✓</span>':x[0]==='-'?'<span style="color:#C9343C">✕</span>':'<span class="muted">·</span>'}</span><span>${x.slice(1)}</span></li>`).join('')}</ul>
      ${o.note?`<div class="note ${o.noteKind||'note-amber'}" style="margin-top:16px">${ic('alert',16)}<div>${o.note}</div></div>`:''}
      ${o.ack?`<label class="ack"><input type="checkbox" id="ack"><span>${o.ack}</span></label>`:''}
    </div>
    <div class="modal-f">
      <button class="btn" id="mCancel">取消</button>
      <button class="btn ${o.danger?'btn-danger':'btn-brand'}" id="mOk" ${o.ack?'disabled':''}>${o.confirmText}</button>
    </div>`);
  $('#mCancel').onclick = closeModal;
  if (o.ack) $('#ack').onchange = e => $('#mOk').disabled = !e.target.checked;
  $('#mOk').onclick = ()=>{ closeModal(); o.onOk(); };
}

function askUnbind(d){
  if(!d.bound) return toast('该设备当前没有绑定账号','err');
  confirmBox({ device:d, danger:true, confirmText:'确认解绑',
    title:'解绑账号',
    lead:`将这套设备与当前账号 <b>${esc(d.bound.nickname)}</b> 的绑定关系解除。`,
    effects:[
      '-该账号的 App 里不再显示这套设备',
      '·该账号已产生的滑行数据与报告保留，不受影响',
      '·盒码仍为 consumed（被该账号占用），其他人扫码会提示「已被占用」'
    ],
    note:'只解绑、不重置盒码的话，<b>新用户还是扫不了这套设备的二维码</b>。现场换人请直接用「释放设备」。',
    ack:'我已确认这套设备当前不在该用户手上，解绑不会影响他正在进行的滑行。',
    onOk:()=>{ const was=d.bound.nickname; d.bound=null;
      log('unbind', `原绑定 ${was}`, d.id); save();
      toast('已解绑，盒码仍被原账号占用'); renderDevices(); }
  });
}
function askReset(d){
  if(!d.boxCode) return toast('该设备还没有盒码，请先生成','err');
  confirmBox({ device:d, confirmText:'确认重置',
    title:'重置盒码',
    lead:`把盒码 <span class="mono">${esc(d.boxCode)}</span> 恢复成可扫状态。`,
    effects:[
      '+盒码状态回到 usable，任何账号都可以重新扫码激活',
      '+清空占用记录（used_by / used_at）',
      d.bound ? '·设备仍绑定在 '+esc(d.bound.nickname)+' 名下，不会被解除' : '·当前无绑定关系，无需额外处理'
    ],
    note: d.bound ? '这套设备目前还绑在 <b>'+esc(d.bound.nickname)+'</b> 名下。只重置盒码不解绑，新用户扫码后会与原绑定冲突。建议改用「释放设备」。' : null,
    onOk:()=>{ d.boxStatus='usable'; delete d.preconsumedUntil;
      log('reset', d.boxCode, d.id); save(); toast('盒码已重置，可重新扫码'); renderDevices(); }
  });
}
function askRelease(d){
  if(!d.bound) return toast('该设备当前没有绑定账号','err');
  confirmBox({ device:d, danger:true, confirmText:'确认释放',
    title:'释放设备（解绑 + 重置盒码）',
    lead:`把这套设备从 <b>${esc(d.bound.nickname)}</b> 名下收回，并让二维码重新可扫。`,
    effects:[
      '-解除与 '+esc(d.bound.nickname)+' 的绑定',
      '+盒码恢复 usable，下一位用户可直接扫码激活',
      '·原用户的历史数据与报告保留'
    ],
    ack:'我已确认设备已归还，可以交给下一位用户。',
    onOk:()=>{ const was=d.bound.nickname; d.bound=null; d.boxStatus='usable'; delete d.preconsumedUntil;
      log('release', `原绑定 ${was}，盒码已重置`, d.id); save();
      toast('设备已释放，可交给下一位用户'); renderDevices(); }
  });
}
function askGenerate(d){
  confirmBox({ device:d, confirmText:'生成盒码',
    title:'生成盒码', noteKind:'note-blue',
    lead:'为这套尚未登记盒码的设备生成一个新的激活二维码。',
    effects:[
      '+生成一个新的 HG3. 盒码并置为 usable',
      '+左右脚共用同一个盒码，扫一次即可完成配对',
      '·盒码不区分环境，生成后立即可扫'
    ],
    note:'每套设备同一时间只应存在一个有效盒码。如果这套设备的二维码卡片还在，请改用「重置盒码」，不要重复生成。',
    onOk:()=>{ d.boxCode=randBox(); d.boxStatus='usable';
      log('generate', d.boxCode, d.id); save(); renderDevices(); showBoxCode(d, true); }
  });
}

function qrBlock(code){
  return `<div class="qr">
    <div class="ph"><span>二维码占位</span></div>
    <div style="min-width:0">
      <div class="hint" style="margin:0 0 4px">盒码 / 二维码内容</div>
      <div class="mono" style="font-size:13px;word-break:break-all">${esc(code)}</div>
      <button class="btn btn-sm" style="margin-top:9px" data-copy="${esc(code)}">复制盒码</button>
    </div></div>`;
}
function showBoxCode(d, isNew){
  openModal(`
    <div class="modal-h"><h3>${isNew?'盒码已生成':'设备盒码'}</h3><p>把这个二维码交给用户扫码激活。</p></div>
    <div class="modal-b">${qrBlock(d.boxCode)}
      <div class="note note-green" style="margin-top:14px">${ic('check',16)}<div>状态：usable · 可扫。左右脚 SN <span class="mono">${esc(d.leftSn.slice(-6))}</span> / <span class="mono">${esc(d.rightSn.slice(-6))}</span> 共用此码。</div></div>
    </div>
    <div class="modal-f"><button class="btn btn-primary" id="mCancel">知道了</button></div>`);
  $('#mCancel').onclick = closeModal;
  bindCopy();
}
function bindCopy(){
  $$('[data-copy]').forEach(b=>b.onclick=()=>{
    navigator.clipboard?.writeText(b.dataset.copy).then(()=>toast('已复制到剪贴板')).catch(()=>toast('复制失败','err'));
  });
}

/* ---------- 设备详情抽屉 ---------- */
function showDetail(d){
  const s = devState(d);
  const hist = DB.logs.filter(l=>l.deviceId===d.id);
  openDrawer(`
    <div class="drawer-h">
      <div><h3>${esc(d.model)} · ${esc(d.batch)} 批次</h3>
        <span class="pill ${s.c}"><span class="dot"></span>${s.t}</span></div>
      <button class="btn btn-ghost btn-sm" id="dClose">${ic('x',15)}</button>
    </div>
    <div class="drawer-b">
      <div class="kv">
        <span class="k">左脚 SN</span><span class="mono">${esc(d.leftSn)}</span>
        <span class="k">右脚 SN</span><span class="mono">${esc(d.rightSn)}</span>
        <span class="k">盒码状态</span><span>${esc(BOXTXT[d.boxStatus])}</span>
        <span class="k">所属主体</span><span>${esc(myEntity().name)}</span>
      </div>
      <div class="sec-t">激活二维码</div>
      ${d.boxCode ? qrBlock(d.boxCode) : `<div class="note note-amber">${ic('alert',16)}<div>这套设备还没有登记盒码，用户无法扫码激活。可在下方生成。</div></div>`}
      <div class="sec-t">绑定情况</div>
      ${d.bound ? `<div class="target-box">
            <div class="r"><span class="k">账号</span><span>${esc(d.bound.nickname)}</span></div>
            <div class="r"><span class="k">手机号</span><span class="mono">${esc(d.bound.phone)}</span></div>
            <div class="r"><span class="k">绑定时间</span><span class="mono">${esc(d.bound.boundAt)}</span></div></div>`
          : `<div class="hint">当前没有账号绑定这套设备。</div>`}
      <div class="sec-t">本设备操作历史</div>
      ${hist.length?`<div class="timeline">${hist.map((l,i)=>{
          const a=accountById(l.accountId);
          return `<div class="it ${i===0?'hi':''}"><div class="tt">${esc(ACTION_TXT[l.action]||l.action)} · ${esc(l.detail)}</div>
                  <div class="tm">${esc(l.at)} · ${esc(a?a.username:'—')}</div></div>`;}).join('')}</div>`
        :`<div class="hint">暂无记录。</div>`}
    </div>
    <div class="drawer-f">
      ${d.bound?`<button class="btn btn-brand" data-dact="release">释放设备</button><button class="btn" data-dact="unbind">仅解绑</button>`:''}
      ${d.boxCode?`<button class="btn" data-dact="reset">重置盒码</button>`:`<button class="btn btn-brand" data-dact="generate">生成盒码</button>`}
    </div>`);
  $('#dClose').onclick = closeDrawer;
  bindCopy();
  $$('[data-dact]').forEach(b=>b.onclick=()=>{ closeDrawer();
    ({release:askRelease,unbind:askUnbind,reset:askReset,generate:askGenerate})[b.dataset.dact](d); });
}

/* ============================================================
   dev-portal 配置端（演示用，仅表达三项配置能力）
   1 账号配置  2 主体关联  3 设备 SN 授权
   ============================================================ */
const SN_RE = /^HGS1STGBG\d{6}[LR]\d{5}$/;
let adminSel = { entityId:'ent_nanshan' };

function adminShell(page, title, sub, body){
  const nav = [
    ['entities','building','主体管理', DB.entities.length],
    ['accounts','users','账号管理', DB.accounts.length],
    ['devices','box','设备授权', DB.devices.filter(d=>d.entityId).length],
    ['audit','clock','操作审计', DB.logs.length]
  ].map(([k,i,t,c])=>`<a data-ago="${k}" class="${page===k?'on':''}"><span class="ic">${ic(i,15)}</span>${t}<span class="cnt">${c}</span></a>`).join('');
  $('#app').innerHTML = `
  <div id="shell">
    <nav class="side">
      <div class="brand"><span class="wordmark">${LOGO}</span><div class="bar"></div><div><div class="n">dev-portal</div><div class="s">账号与设备授权</div></div></div>
      <div class="entity-chip" style="background:var(--blue-100)">
        <div class="l">说明</div>
        <div class="v" style="font-size:12.5px;font-weight:500;line-height:1.5">这几页是在现有 dev-portal 里新增的配置入口，俱乐部看不到。</div>
      </div>
      <div class="nav">${nav}</div>
      <div class="user"><span class="avatar">HG</span>
        <div style="flex:1"><div class="nm">Heygo 运营</div><div class="rl">内部账号</div></div></div>
    </nav>
    <div class="main">
      <div class="topbar"><div><h2>${esc(title)}</h2><div class="sub">${sub}</div></div></div>
      <div class="page">${body}</div>
    </div>
  </div>`;
  $$('[data-ago]').forEach(n=>n.onclick=()=>{ location.hash='#/admin/'+n.dataset.ago; });
}

function renderAdmin(page){
  if (page==='accounts') return adminAccounts();
  if (page==='devices')  return adminDevices();
  if (page==='audit')    return adminAudit();
  adminEntities();
}

/* ---------- 主体管理 ---------- */
function adminEntities(){
  const rows = DB.entities.map(e=>{
    const accs = DB.accounts.filter(a=>a.entityId===e.id), ds = devicesOf(e.id);
    return `<tr>
      <td><div style="font-weight:600">${esc(e.name)}</div><div class="hint">创建于 ${esc(e.createdAt)}</div></td>
      <td><span class="pill ${e.type==='club'?'pill-brand':'pill-blue'}">${e.type==='club'?'俱乐部':'公司'}</span></td>
      <td>${esc(e.contact)}<div class="hint mono">${esc(e.phone)}</div></td>
      <td class="mono">${accs.length} 个</td>
      <td class="mono">${ds.length} 套 / ${ds.length*2} 个 SN</td>
      <td><span class="pill pill-green"><span class="dot"></span>启用</span></td>
      <td style="text-align:right"><button class="btn-link" data-ent="${e.id}">管理设备授权</button></td>
    </tr>`;
  }).join('');
  adminShell('entities','主体管理','俱乐部 / 公司是账号与设备授权的归属单位，一个主体可以有多个登录账号', `
    <div class="toolbar"><div class="spacer"></div><button class="btn btn-brand btn-sm" id="newEnt">${ic('plus',14)} 新建主体</button></div>
    <div class="card"><table class="tbl">
      <thead><tr><th>主体</th><th>类型</th><th>联系人</th><th>账号</th><th>授权设备</th><th>状态</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    <div class="note note-blue" style="margin-top:14px">${ic('shield',16)}<div>
      <b>授权唯一性：</b>一个设备 SN 同一时间只能归属一个主体。把 SN 授权给新主体前，必须先从原主体移除，避免两家俱乐部同时能解绑同一副设备。</div></div>`);
  $$('[data-ent]').forEach(b=>b.onclick=()=>{ adminSel.entityId=b.dataset.ent; location.hash='#/admin/devices'; });
  $('#newEnt').onclick = ()=>{
    openModal(`<div class="modal-h"><h3>新建主体</h3><p>主体建立后即可在其下开通登录账号、授权设备 SN。</p></div>
      <div class="modal-b">
        <div class="field"><label>主体名称</label><input class="input" id="eName" placeholder="例如 南山滑雪俱乐部"></div>
        <div class="field"><label>类型</label><select class="select" id="eType"><option value="club">俱乐部</option><option value="company">公司</option></select></div>
        <div class="field"><label>联系人</label><input class="input" id="eContact" placeholder="现场对接人姓名"></div>
        <div class="field" style="margin-bottom:0"><label>联系电话</label><input class="input" id="ePhone" placeholder="用于紧急联系"></div>
      </div>
      <div class="modal-f"><button class="btn" id="mCancel">取消</button><button class="btn btn-brand" id="mOk">创建</button></div>`);
    $('#mCancel').onclick = closeModal;
    $('#mOk').onclick = ()=>{
      const name=$('#eName').value.trim(); if(!name) return toast('请填写主体名称','err');
      DB.entities.push({ id:uid('ent_'), name, type:$('#eType').value, contact:$('#eContact').value.trim()||'—',
        phone:$('#ePhone').value.trim()||'—', createdAt:now().slice(0,10), status:'active' });
      save(); closeModal(); toast('主体已创建'); adminEntities();
    };
  };
}

/* ---------- 账号管理 ---------- */
function genPwd(){
  const cs='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let s=''; for(let i=0;i<10;i++) s+=cs[Math.floor(Math.random()*cs.length)];
  return s;
}
function showPwd(acc, pwd, isNew){
  openModal(`<div class="modal-h"><h3>${isNew?'账号已创建':'密码已重置'}</h3><p>密码只在此处显示一次，请立刻复制并通过安全渠道交给对方。</p></div>
    <div class="modal-b">
      <div class="kv" style="margin-bottom:10px"><span class="k">登录账号</span><span class="mono">${esc(acc.username)}</span>
        <span class="k">所属主体</span><span>${esc(entityById(acc.entityId).name)}</span></div>
      <div class="pw-show"><span class="v">${esc(pwd)}</span><button class="btn btn-sm" data-copy="${esc(pwd)}">复制</button></div>
      <div class="note note-amber" style="margin-top:14px">${ic('alert',16)}<div>该账号<b>不能自助修改密码</b>。遗忘后只能由 Heygo 在此页重置，重置后旧密码立即失效。</div></div>
    </div>
    <div class="modal-f"><button class="btn btn-primary" id="mCancel">我已复制</button></div>`);
  $('#mCancel').onclick = closeModal; bindCopy();
}
function adminAccounts(){
  const rows = DB.accounts.map(a=>{
    const e = entityById(a.entityId);
    return `<tr>
      <td><div class="mono" style="font-weight:600;font-size:13px">${esc(a.username)}</div><div class="hint">${esc(a.name)}</div></td>
      <td>${esc(e?e.name:'—')}<div class="hint">${e&&e.type==='club'?'俱乐部':'公司'}</div></td>
      <td>${a.status==='active'?'<span class="pill pill-green"><span class="dot"></span>启用</span>':'<span class="pill pill-grey"><span class="dot"></span>已停用</span>'}</td>
      <td class="mono hint">${esc(a.createdAt)}</td>
      <td class="mono hint">${esc(a.lastLogin)}</td>
      <td style="text-align:right"><div class="row-acts">
        <button class="btn-link" data-pw="${a.id}">重置密码</button>
        <button class="btn-link ${a.status==='active'?'danger':''}" data-tg="${a.id}">${a.status==='active'?'停用':'启用'}</button>
      </div></td></tr>`;
  }).join('');
  adminShell('accounts','账号管理','每个账号固定归属一个主体；账号不支持自助改密，只能由 Heygo 重置', `
    <div class="toolbar"><div class="spacer"></div><button class="btn btn-brand btn-sm" id="newAcc">${ic('plus',14)} 开通账号</button></div>
    <div class="card"><table class="tbl">
      <thead><tr><th>登录账号</th><th>所属主体</th><th>状态</th><th>创建时间</th><th>最近登录</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    <div class="note note-amber" style="margin-top:14px">${ic('alert',16)}<div>
      <b>停用即时生效：</b>俱乐部人员离职时停用账号，该账号的会话应在下一次请求时被拒绝。历史操作记录保留。</div></div>`);

  $$('[data-pw]').forEach(b=>b.onclick=()=>{ const a=accountById(b.dataset.pw); const p=genPwd(); a.password=p; save(); showPwd(a,p,false); });
  $$('[data-tg]').forEach(b=>b.onclick=()=>{ const a=accountById(b.dataset.tg);
    a.status = a.status==='active'?'disabled':'active'; save(); toast(a.status==='active'?'账号已启用':'账号已停用'); adminAccounts(); });

  $('#newAcc').onclick = ()=>{
    openModal(`<div class="modal-h"><h3>开通账号</h3><p>账号创建后归属固定主体，不可更换主体。</p></div>
      <div class="modal-b">
        <div class="field"><label>所属主体</label><select class="select" id="aEnt">${DB.entities.map(e=>`<option value="${e.id}">${esc(e.name)}</option>`).join('')}</select></div>
        <div class="field"><label>登录账号</label><input class="input" id="aUser" placeholder="英文小写 + 下划线，例如 nanshan_ops"></div>
        <div class="field" style="margin-bottom:0"><label>备注名</label><input class="input" id="aName" placeholder="例如 南山 · 器材前台"></div>
        <div class="note note-blue" style="margin-top:16px">${ic('shield',16)}<div>初始密码由系统随机生成并只展示一次，俱乐部侧无法自行修改。</div></div>
      </div>
      <div class="modal-f"><button class="btn" id="mCancel">取消</button><button class="btn btn-brand" id="mOk">创建并生成密码</button></div>`);
    $('#mCancel').onclick = closeModal;
    $('#mOk').onclick = ()=>{
      const u=$('#aUser').value.trim();
      if(!u) return toast('请填写登录账号','err');
      if(DB.accounts.some(a=>a.username===u)) return toast('该登录账号已存在','err');
      const p = genPwd();
      const acc = { id:uid('acc_'), username:u, name:$('#aName').value.trim()||u, entityId:$('#aEnt').value,
        password:p, status:'active', createdAt:now().slice(0,10), lastLogin:'—' };
      DB.accounts.push(acc); save(); closeModal(); showPwd(acc,p,true);
    };
  };
}

/* ---------- 设备授权 ---------- */
function adminDevices(){
  const sel = entityById(adminSel.entityId) || DB.entities[0];
  adminSel.entityId = sel.id;
  const mine = devicesOf(sel.id);
  const unassigned = DB.devices.filter(d=>!d.entityId).length;

  const entList = DB.entities.map(e=>`<div class="it ${e.id===sel.id?'on':''}" data-pick="${e.id}">
      <div class="n">${esc(e.name)}</div>
      <div class="m">${devicesOf(e.id).length} 套 · ${DB.accounts.filter(a=>a.entityId===e.id).length} 个账号</div></div>`).join('');

  const rows = mine.map(d=>{
    const s = devState(d);
    return `<tr>
      <td class="sn-cell"><div class="pair"><span class="tag">L</span><span class="mono">${esc(d.leftSn)}</span></div>
        <div class="pair"><span class="tag">R</span><span class="mono">${esc(d.rightSn)}</span></div></td>
      <td class="mono">${d.boxCode?esc(d.boxCode.slice(0,14))+'…':'<span class="muted">未生成</span>'}</td>
      <td style="min-width:146px"><span class="pill ${s.c}"><span class="dot"></span>${s.t}</span></td>
      <td>${d.bound?esc(d.bound.nickname):'<span class="muted">—</span>'}</td>
      <td style="text-align:right"><button class="btn-link danger" data-rm="${d.id}">移除授权</button></td></tr>`;
  }).join('');

  adminShell('devices','设备授权', `为主体配置可操作的设备 SN；俱乐部端的搜索与操作范围严格以此为准`, `
    <div class="two-col">
      <div class="card ent-list">${entList}</div>
      <div>
        <div class="card">
          <div class="card-h"><div><h3>${esc(sel.name)}</h3><div class="sub">已授权 ${mine.length} 套（${mine.length*2} 个 SN）· 系统内未分配 ${unassigned} 套</div></div>
            <button class="btn btn-brand btn-sm" id="addSn">${ic('plus',14)} 批量添加 SN</button></div>
          <table class="tbl"><thead><tr><th>设备 SN</th><th>盒码</th><th>状态</th><th>绑定账号</th><th></th></tr></thead>
            <tbody>${rows}</tbody></table>
          ${mine.length?'':'<div class="empty"><div class="big">该主体还没有授权任何设备</div><div>点右上角批量添加 SN</div></div>'}
        </div>
        <div class="note note-amber" style="margin-top:14px">${ic('alert',16)}<div>
          <b>按对授权：</b>左右脚共用一个盒码，因此只授权单只 SN 没有意义。添加时系统会自动带上配对的另一只 SN。</div></div>
      </div>
    </div>`);

  $$('[data-pick]').forEach(b=>b.onclick=()=>{ adminSel.entityId=b.dataset.pick; adminDevices(); });
  $$('[data-rm]').forEach(b=>b.onclick=()=>{
    const d = deviceById(b.dataset.rm);
    confirmBox({ device:d, danger:true, confirmText:'移除授权', title:'移除设备授权',
      lead:`把这套设备从 <b>${esc(sel.name)}</b> 的可操作范围中移除。`,
      effects:['-该主体下所有账号将无法搜索和操作这套设备','·设备当前的绑定关系与盒码状态不变','+该 SN 可以重新授权给其他主体'],
      note: d.bound ? `这套设备目前仍绑定在 <b>${esc(d.bound.nickname)}</b> 名下。移除授权后，俱乐部<b>无法再自助解绑</b>，只能由 Heygo 处理。` : null,
      onOk:()=>{ d.entityId=null; save(); toast('已移除授权'); adminDevices(); } });
  });

  $('#addSn').onclick = ()=>{
    openModal(`<div class="modal-h"><h3>批量添加设备 SN</h3><p>一行一个 SN，或用逗号 / 空格分隔。支持左右脚任一只，系统自动补全另一只。</p></div>
      <div class="modal-b">
        <textarea class="textarea" id="snIn" placeholder="HGS1STGBG260921L00908
HGS1STGBG261002L00911
HGS1STGBG260916L00903"></textarea>
        <div class="hint">SN 格式：HGS1STGBG + 6 位生产日期 + L/R + 5 位序号</div>
        <div id="parse"></div>
      </div>
      <div class="modal-f"><button class="btn" id="mCancel">取消</button>
        <button class="btn" id="mCheck">校验</button>
        <button class="btn btn-brand" id="mOk" disabled>添加</button></div>`, null);
    $('#mCancel').onclick = closeModal;
    let okIds = [];
    const doParse = ()=>{
      const toks = $('#snIn').value.toUpperCase().split(/[\s,，;；]+/).map(s=>s.trim()).filter(Boolean);
      const seen = new Set(); okIds = [];
      const res = toks.map(t=>{
        if(!SN_RE.test(t)) return { t, st:'格式错误', cls:'err-c', msg:'不符合 SN 格式，已跳过' };
        const d = DB.devices.find(x=>x.leftSn===t||x.rightSn===t);
        if(!d) return { t, st:'未登记', cls:'err-c', msg:'系统中没有这个 SN，请先在设备台账登记' };
        if(d.entityId===sel.id) return { t, st:'已授权', cls:'warn-c', msg:'已在本主体名下，无需重复添加' };
        if(d.entityId) return { t, st:'冲突', cls:'err-c', msg:`已授权给「${entityById(d.entityId).name}」，需先从该主体移除` };
        if(seen.has(d.id)) return { t, st:'重复', cls:'warn-c', msg:'与上一条属于同一套设备' };
        seen.add(d.id); okIds.push(d.id);
        const other = d.leftSn===t ? d.rightSn : d.leftSn;
        return { t, st:'可添加', cls:'ok-c', msg:`自动带入配对 SN ${other}` };
      });
      $('#parse').innerHTML = res.length ? `<div class="parse-res">${res.map(r=>
        `<div class="parse-row"><span class="st ${r.cls}">${r.st}</span><span class="mono">${esc(r.t)}</span><span class="muted" style="margin-left:auto">${esc(r.msg)}</span></div>`).join('')}</div>` : '';
      $('#mOk').disabled = okIds.length===0;
      $('#mOk').textContent = okIds.length? `添加 ${okIds.length} 套设备` : '添加';
    };
    $('#mCheck').onclick = doParse;
    $('#snIn').oninput = doParse;
    $('#mOk').onclick = ()=>{ okIds.forEach(id=>{ deviceById(id).entityId = sel.id; });
      save(); closeModal(); toast(`已授权 ${okIds.length} 套设备给 ${sel.name}`); adminDevices(); };
  };
}

/* ---------- 操作审计 ---------- */
function adminAudit(){
  const rows = DB.logs.map(l=>{
    const a=accountById(l.accountId), e=entityById(l.entityId), d=l.deviceId?deviceById(l.deviceId):null;
    return `<tr><td class="mono" style="white-space:nowrap">${esc(l.at)}</td>
      <td>${esc(e?e.name:'—')}</td>
      <td><div class="mono">${esc(a?a.username:'—')}</div></td>
      <td><span class="pill ${l.result==='ok'?'pill-brand':'pill-red'}">${esc(ACTION_TXT[l.action]||l.action)}</span></td>
      <td>${d?`<span class="mono">${esc(d.leftSn)}</span>`:'<span class="muted">—</span>'}</td>
      <td>${esc(l.detail)}</td></tr>`;
  }).join('');
  adminShell('audit','操作审计','所有主体的操作流水，按时间倒序', `
    <div class="card"><table class="tbl">
      <thead><tr><th>时间</th><th>主体</th><th>操作人</th><th>动作</th><th>设备</th><th>说明</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`);
}

/* ============================================================
   启动
   ============================================================ */
function syncDemobar(){ $$('#demobar [data-mode]').forEach(b=>b.classList.toggle('on', b.dataset.mode===SESSION.mode)); }
$$('#demobar [data-mode]').forEach(b=>b.onclick=()=>{
  SESSION.mode = b.dataset.mode; syncDemobar();
  location.hash = SESSION.mode==='admin' ? '#/admin/entities' : '#/devices';
  route();
});
$('#resetDemo').onclick = ()=>{ resetDB(); SESSION.accountId=null; toast('演示数据已重置'); location.hash='#/'; route(); };

load(); syncDemobar(); route();
