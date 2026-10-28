/* ============================================================
   Heygo 俱乐部设备管理台 · 交互 Demo
   纯前端，无后端。操作写 localStorage，刷新保留，可一键重置。

   语义与 dev-portal 对齐（heygo-ai/heygo-web/apps/dev-portal +
   heygo-ai/heygo-biz-portal-bff）：
     · 「解除绑定」只删绑定记录，不释放盒码归属 —— dev-portal 副标题原话
     · 「解绑并重置」= 解绑两区中与这对设备关联的记录 + 重置盒码归属
     · 解绑同步、按区；重置是 预览 → 确认 → 异步作业，失败可重试
     · 盒码状态用 Bridge 词汇：available / claimed / blocked / invalidated
     · 配对固定为出厂配对，本站不做自由配对
   ============================================================ */
'use strict';

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const uid = p => p + Math.random().toString(36).slice(2,8);
const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
  : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{
      const r=Math.random()*16|0; return (c==='x'?r:(r&0x3|0x8)).toString(16);}));

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
  plus:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  spin:'<path d="M21 12a9 9 0 1 1-6.22-8.56"/>'
};
const ic = (n, sz=16) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]||''}</svg>`;

const now = () => {
  const d = new Date(), p = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

/* ---------- 口径常量（与 dev-portal 一致） ---------- */
/* 前缀不固定：1–52 位任意字母数字 + 6 位日期码 + L/R + 5 位序号 */
const SN_RE = /^[A-Z0-9]{1,52}[0-9]{6}[LR][0-9]{5}$/;
/* 设备状态只有两个（用户 2026-10-28 定）：
     可扫码   盒码已释放，可以交给下一位
     绑定中   盒码未释放，还占着

   关键：状态按「盒码有没有释放」推，不按「有没有绑定记录」推。
   因为"零绑定但盒码仍被占用"是后端真实会出现的状态，至少两条路径会产生它 ——
     ① C 端用户在 App 里自己解绑（backend-go internal/devices/handler.go:437
        的 unbind 只删绑定行，完全不碰盒码）
     ② 重置作业失败，盒码停在未释放
   这两种情况按绑定数算会显示成"可扫码"，交出去就是一张扫不了码的工单。

   作业进行中、作业失败都仍然是「绑定中」，不额外占状态名。 */
const OP_STATUS = {
  running:   { t:'正在处理', c:'pill-amber' },
  succeeded: { t:'已完成',   c:'pill-green' },
  failed:    { t:'需要处理', c:'pill-red'   }
};
/* dev-portal i18n 里的错误码文案，原样搬过来 */
const OP_ERROR = {
  SOURCE_RESET_UNVERIFIED:'未能确认包装表已重置。',
  SOURCE_RECORD_MISSING:'包装表中找不到原盒码记录。',
  SOURCE_RECORD_CONFLICT:'包装表记录与设备不一致。',
  PREVIEW_CHANGED:'数据已变化，请重新预览。',
  OPERATION_PENDING:'这对设备已有未完成操作。'
};
const ACTION_TXT = { reset:'解绑并重置', unbind:'解除绑定（历史）', search:'搜索', login:'登录', config:'配置变更',
  auto_reset:'每晚自动收回' };

/* 每晚自动收回（用户 2026-10-28 定）：
     dev-portal 按主体配置，默认关闭，有需要的主体由 Heygo 打开；俱乐部端只读、不能自己改。
     到点对本主体全部「绑定中」设备各提交一次「解绑并重置」，走同一套作业链路，失败同样可重试。
     时间按北京时间（东八区）配置，可选凌晨 0–6 点整点，默认 03:00。 */
const AUTO_TIMES = ['00:00','01:00','02:00','03:00','04:00','05:00','06:00'];
const AUTO_ACTOR = '系统 · 每晚自动收回';
const autoOf = e => e.autoReset || { enabled:false, time:'03:00' };
const autoTxt = e => autoOf(e).enabled ? `每晚 ${autoOf(e).time}` : '关闭';

/* 逐字符顺序模糊匹配：L125 命中 L00125（dev-portal 的 snSearchHint） */
function subseq(q, target){
  if (!q) return true;
  let i = 0;
  for (const ch of target) { if (ch === q[i]) i++; if (i === q.length) return true; }
  return i === q.length;
}

/* ---------- 状态 ---------- */
const KEY = 'heygo-club-portal-demo-v3';
let DB, SESSION = { accountId:null, mode:'club' };

function load(){
  try{ const raw = localStorage.getItem(KEY); if(raw) DB = JSON.parse(raw); }catch(e){}
  if (!DB) DB = clone(window.SEED);
  DB.entities.forEach(e=>{ e.autoReset ||= { enabled:false, time:'03:00' }; });
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(DB)); }catch(e){} }
function resetDB(){ DB = clone(window.SEED); save(); }

const entityById  = id => DB.entities.find(e=>e.id===id);
const accountById = id => DB.accounts.find(a=>a.id===id);
const deviceById  = id => DB.devices.find(d=>d.id===id);
const me  = () => accountById(SESSION.accountId);
const myEntity = () => { const a=me(); return a ? entityById(a.entityId) : null; };
const devicesOf = eid => DB.devices.filter(d=>d.entityId===eid);
const liveOpOf = d => DB.operations.find(o=>o.deviceId===d.id && o.status==='running');
const failedOpOf = d => DB.operations.find(o=>o.deviceId===d.id && o.status==='failed');

function devState(d){
  return d.box.released ? { t:'可扫码', c:'pill-green', k:'free' }
                        : { t:'绑定中', c:'pill-blue',  k:'bound' };
}

/* actor 传了就表示不是当前登录的俱乐部账号在操作（Heygo 运营 / 系统定时任务）；
   主体优先按设备归属取，系统作业完成时没有登录态也能记对主体 */
function log(action, detail, deviceId, result='ok', actor=null, entityId=null){
  const d = deviceId ? deviceById(deviceId) : null;
  DB.logs.unshift({ id:uid('lg_'), at:now(), accountId: actor ? null : SESSION.accountId, actor,
    entityId: entityId || (d ? d.entityId : (me() ? me().entityId : null)), action, deviceId, detail, result });
  save();
}
const actorCell = l => {
  if (l.actor) return `<div style="font-weight:500">${esc(l.actor)}</div><div class="hint">${l.actor===AUTO_ACTOR?'定时任务':'Heygo 内部'}</div>`;
  const a = accountById(l.accountId);
  return `<div style="font-weight:500">${esc(a?a.name:'—')}</div><div class="hint">${esc(a?a.username:'')}</div>`;
};

/* ---------- toast ---------- */
function toast(msg, kind='ok'){
  const n = document.createElement('div');
  n.className = 'toast '+kind;
  n.innerHTML = `<span class="d">${ic(kind==='ok'?'check':'alert',15)}</span><span>${esc(msg)}</span>`;
  $('#toasts').appendChild(n);
  setTimeout(()=>{ n.style.opacity='0'; n.style.transition='opacity .2s'; setTimeout(()=>n.remove(),220); }, 2800);
}

/* ---------- 模态 / 抽屉 ---------- */
/* 手机上弹窗贴底，会被底部的演示控制条压住，所以打开覆盖层时给 body 打标记 */
const syncOverlay = ()=> document.body.classList.toggle('overlay-open',
  $('#modal').classList.contains('on') || $('#drawer').classList.contains('on'));
function openModal(html){ $('#modal').innerHTML = html; $('#modal').classList.add('on'); $('#scrim').classList.add('on'); syncOverlay(); }
function closeModal(){
  const m=$('#modal'); m.classList.remove('on');
  if(!$('#drawer').classList.contains('on')) $('#scrim').classList.remove('on');
  syncOverlay();
  setTimeout(()=>{ if(!m.classList.contains('on')) m.innerHTML=''; }, 220);
}
function openDrawer(html){ $('#drawer').innerHTML = html; $('#drawer').classList.add('on'); $('#scrim').classList.add('on'); syncOverlay(); }
function closeDrawer(){
  const dr=$('#drawer'); dr.classList.remove('on');
  if(!$('#modal').classList.contains('on')) $('#scrim').classList.remove('on');
  syncOverlay();
  setTimeout(()=>{ if(!dr.classList.contains('on')) dr.innerHTML=''; }, 260);
}
$('#scrim').addEventListener('click', ()=>{ closeModal(); closeDrawer(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeModal(); closeDrawer(); } });

/* ---------- 路由 ---------- */
function route(){
  const h = location.hash.replace(/^#\/?/,'') || '';
  if (SESSION.mode === 'admin') return renderAdmin(h.startsWith('admin/') ? h.slice(6) : 'entities');
  if (!SESSION.accountId) return renderLogin();
  renderClub(h.startsWith('admin/') ? 'devices' : (h || 'devices'));
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
        <div class="feat"><span>解除绑定</span><span>解绑并重置</span><span>操作留痕</span></div>
      </div>
      <div class="foot">本页面为演示原型，数据均为虚构 · ${esc(now())}</div>
    </div>
    <div class="login-form"><div class="login-box">
      <div class="login-mini-brand"><span class="wordmark">${LOGO}</span><span>俱乐部设备管理台</span></div>
      <h2>登录</h2>
      <p class="lead">使用 Heygo 分配给你的账号登录</p>
      ${err?`<div class="login-err">${esc(err)}</div>`:''}
      <div class="field"><label>账号</label><input class="input" id="u" placeholder="例如 nanshan_ops" autocomplete="off"></div>
      <div class="field"><label>密码</label><input class="input" id="p" type="password" placeholder="请输入密码"></div>
      <button class="btn btn-brand" id="go" style="width:100%;height:40px">登录</button>
      <div class="hint" style="margin-top:10px">忘记密码请联系你的 Heygo 对接人重置，本站不支持自助修改密码。</div>
      <div class="demo-accounts"><div class="t">演示账号（密码 Heygo@2026）</div>${demo}</div>
    </div></div>
  </div>`;

  $$('#login [data-fill]').forEach(b=>b.onclick=()=>{ $('#u').value=b.dataset.fill; $('#p').value='Heygo@2026'; $('#go').focus(); });
  const submit = ()=>{
    const u=$('#u').value.trim(), p=$('#p').value;
    const acc = DB.accounts.find(a=>a.username===u);
    if(!acc || acc.password!==p) return renderLogin('账号或密码不正确');
    if(acc.status!=='active')    return renderLogin('该账号已被停用，请联系 Heygo 对接人');
    SESSION.accountId = acc.id; acc.lastLogin = now();
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
  const pending = DB.operations.filter(o=>devicesOf(e.id).some(d=>d.id===o.deviceId) && (o.status!=='succeeded')).length;
  const nav = [
    ['devices','box','设备管理', ds.length],
    ['logs','clock','操作记录', pending ? `${pending} 待处理` : DB.logs.filter(l=>l.entityId===e.id).length]
  ].map(([k,i,t,c])=>`<a data-go="${k}" class="${page===k?'on':''}"><span class="ic">${ic(i,15)}</span>${t}<span class="cnt">${c}</span></a>`).join('');

  $('#app').innerHTML = `
  <div id="shell">
    <nav class="side">
      <div class="brand"><span class="wordmark">${LOGO}</span><div class="bar"></div><div><div class="n">俱乐部管理台</div><div class="s">Device Console</div></div></div>
      <div class="entity-chip">
        <div class="l">当前主体</div>
        <div class="v">${esc(e.name)}</div>
        <div class="m">${e.type==='club'?'俱乐部':'公司'} · 授权设备 ${ds.length} 副</div>
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

function renderClub(page){ page==='logs' ? renderClubLogs() : renderDevices(); }

/* ============================================================
   俱乐部端 · 设备管理
   ============================================================ */
let devFilter = { q:'', seg:'all' };

function bindingLines(d){
  /* 零绑定但盒码没释放 = 原账号在 App 里自己解绑了，码还占着。
     这种行不能显示成"未绑定"，否则和「绑定中」自相矛盾。 */
  if (!d.bindings.length)
    return d.box.released ? '<span class="muted">—</span>'
      : '<span class="muted">原账号已自行解绑</span><div class="hint">盒码仍被占用，需重置</div>';
  const byEmail = {};
  d.bindings.forEach(b=>{ (byEmail[b.userEmail] ||= []).push(b); });
  return Object.entries(byEmail).map(([email, list])=>{
    const feet = list.map(b=>b.sn.slice(-6,-5)).sort().join(' / ');
    return `<div class="bind-line"><span class="em">${esc(email)}</span><span class="feet">${feet}</span></div>`;
  }).join('');
}

function renderDevices(){
  const e = myEntity(), all = devicesOf(e.id);
  const q = devFilter.q.trim().toUpperCase();

  let list = all;
  if (devFilter.seg!=='all') list = list.filter(d=>devState(d).k===devFilter.seg);
  if (q) list = list.filter(d =>
    subseq(q, d.leftSn) || subseq(q, d.rightSn) ||
    d.box.code.toUpperCase().includes(q) ||
    d.bindings.some(b=>b.userEmail.toUpperCase().includes(q)));

  /* 越权拦截：本主体没搜到，但这个 SN / 盒码在系统里属于别人 */
  let denied = null;
  if (q.length>=4 && list.length===0){
    const other = DB.devices.find(d => d.entityId!==e.id &&
      (subseq(q,d.leftSn)||subseq(q,d.rightSn)||d.box.code.toUpperCase().includes(q)));
    if (other) denied = q;
  }

  const n = k => all.filter(d=>devState(d).k===k).length;
  const needFix = all.filter(d=>failedOpOf(d)).length;
  const stats = `
    <div class="stats stats-3">
      <div class="stat"><div class="l">${ic('box',14)} 授权设备</div><div class="v">${all.length}<small>副</small></div></div>
      <div class="stat"><div class="l">${ic('users',14)} 绑定中</div><div class="v">${n('bound')}<small>副</small>
        ${needFix?`<span class="stat-warn">${ic('alert',12)} ${needFix} 副收回失败待重试</span>`:''}</div></div>
      <div class="stat"><div class="l">${ic('qr',14)} 可扫码</div><div class="v">${n('free')}<small>副</small></div></div>
    </div>`;

  const rows = list.map(d=>{
    const s = devState(d), op = liveOpOf(d), fop = failedOpOf(d);
    return `<tr data-id="${d.id}">
      <td class="sn-cell" style="min-width:250px">
        <div class="name">${esc(d.model)} <span class="muted" style="font-weight:400">· ${esc(d.batch)} 批次 · ${esc(d.packageType)}</span></div>
        <div class="pair"><span class="tag">L</span><span class="mono">${esc(d.leftSn)}</span></div>
        <div class="pair"><span class="tag">R</span><span class="mono">${esc(d.rightSn)}</span></div>
      </td>
      <td style="min-width:152px"><span class="pill ${s.c}"><span class="dot"></span>${s.t}</span>
        ${fop?`<div class="warn-inline">${ic('alert',12)} 上次重置失败：${esc(OP_ERROR[fop.errorCode]||fop.errorCode)}</div>`:''}
        ${op?`<div class="hint" style="margin-top:4px;display:inline-flex;gap:5px;align-items:center">${ic('spin',12)} 正在处理</div>`:''}
      </td>
      <td style="min-width:210px">${bindingLines(d)}</td>
      <td style="min-width:244px"><div class="row-acts">${rowActions(d)}</div></td>
    </tr>`;
  }).join('');

  const body = `
    ${stats}
    <div class="toolbar">
      <div class="search"><span class="ic">${ic('search',15)}</span><input class="input" id="q" placeholder="SN 短号 / 完整 SN / 使用人邮箱" value="${esc(devFilter.q)}"></div>
      <div class="segs">
        ${[['all','全部'],['bound','绑定中'],['free','可扫码']].map(([k,t])=>
          `<button data-seg="${k}" class="${devFilter.seg===k?'on':''}">${t}</button>`).join('')}
      </div>
      <div class="spacer"></div>
      <span class="hint">共 ${list.length} 条</span>
    </div>
    ${autoOf(e).enabled?`<div class="note note-blue" style="margin-bottom:14px">${ic('clock',16)}
        <div><b>每晚 ${esc(autoOf(e).time)}（北京时间）自动收回</b><div style="margin-top:3px">
        到点后，所有「绑定中」的设备会自动解绑并重置，第二天都能直接扫码。客人如需跨夜使用，请在次日重新扫码绑定。此设置由 Heygo 开通，如需调整时间或关闭请联系 Heygo 对接人。</div></div></div>`:''}
    <div class="hint" style="margin:-6px 0 12px">SN 逐字符顺序匹配：输入 <span class="code-inline">L901</span> 可命中 <span class="code-inline">L00901</span>；所有匹配都会列出，不会自动选中。</div>
    ${denied?`<div class="note note-red" style="margin-bottom:14px">${ic('shield',16)}
        <div><b>该 SN 不在 ${esc(e.name)} 的授权范围内</b><div style="margin-top:3px">
        <span class="code-inline">${esc(denied)}</span> 不在本主体的可操作设备清单里，无法查询或操作。如确认该设备属于贵方，请联系 Heygo 对接人开通授权。</div></div></div>`:''}
    <div class="card">
      <table class="tbl tbl-cards">
        <thead><tr><th>设备</th><th>状态</th><th>当前使用人</th><th>操作</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${list.length?'':`<div class="empty"><div class="big">没有匹配的设备</div><div>换个 SN 短号试试，或切换上方筛选</div></div>`}
    </div>`;

  clubShell('devices','设备管理', `${esc(e.name)} · 只显示已授权给本主体的设备`, body);

  const qi = $('#q');
  qi.oninput = ()=>{ devFilter.q = qi.value; renderDevices(); const n2=$('#q'); n2.focus(); n2.setSelectionRange(n2.value.length,n2.value.length); };
  $$('[data-seg]').forEach(b=>b.onclick=()=>{ devFilter.seg=b.dataset.seg; renderDevices(); });
  if (denied && !(DB.logs[0] && DB.logs[0].result==='denied' && DB.logs[0].detail.endsWith(denied)))
    log('search', `搜索越权 SN · ${denied}`, null, 'denied');
  bindRowActions();
}

function rowActions(d){
  const a=[];
  if (liveOpOf(d)) a.push(`<span class="muted" style="display:inline-flex;gap:5px;align-items:center">${ic('spin',13)} 处理中</span>`);
  else if (failedOpOf(d)) a.push(`<button class="btn-link" data-act="ops" data-id="${d.id}"><b>去重试</b></button>`);
  else if (!d.box.released) a.push(`<button class="btn-link" data-act="reset" data-id="${d.id}"><b>解绑并重置</b></button>`);
  /* 可扫码时最常做的事就是把码亮给客人，直接放在行上，不用进详情 */
  else a.push(`<button class="btn-link" data-act="qr" data-id="${d.id}"><b>${ic('qr',13)} 出示二维码</b></button>`);
  a.push(`<button class="btn-link" data-act="detail" data-id="${d.id}">详情</button>`);
  return a.join('');
}
function bindRowActions(){
  $$('[data-act]').forEach(b=>b.onclick=ev=>{
    ev.stopPropagation();
    const d = deviceById(b.dataset.id);
    ({ reset:askReset, detail:showDetail, qr:showQr, ops:()=>{ location.hash='#/logs'; } })[b.dataset.act](d);
  });
}

/* ============================================================
   唯一动作：解绑并重置（原因必填 → 预览 → 异步作业，可重试）
   对应 dev-portal 盒码管理的 reset：preview → submit(expected_state) → 轮询 → retry
   俱乐部端刻意只保留这一个动作：单独的「解除绑定」只会制造"解绑了还是扫不了码"，
   对前台来说是多一个要理解的概念、多一次会出错的操作。
   ============================================================ */
function resetPreview(d){
  return { state: 'st_'+Math.random().toString(36).slice(2,10), bindCount: d.bindings.length };
}

function askReset(d){
  if (liveOpOf(d)) return toast('这对设备已有未完成操作','err');
  const pv = resetPreview(d);

  const REASONS = ['客人还板，交给下一位','换一副设备给客人','客人扫错了码','设备返修 / 回收'];
  openModal(`
    <div class="modal-h"><h3>解绑并重置</h3>
      <p>把这副设备从当前使用人名下收回，收回后下一位客人可以直接扫码。</p></div>
    <div class="modal-b">
      <div class="target-box">
        <div class="r"><span class="k">设备</span><span>${esc(d.model)} · ${esc(d.batch)} 批次</span></div>
        <div class="r"><span class="k">左脚 SN</span><span class="mono">${esc(d.leftSn)}</span></div>
        <div class="r"><span class="k">右脚 SN</span><span class="mono">${esc(d.rightSn)}</span></div>
        <div class="r"><span class="k">盒码</span><span class="mono">${esc(d.box.code)}</span></div>
        <div class="r"><span class="k">当前使用人</span><span>${d.bindings.length?esc(d.bindings[0].userEmail):'<span class="muted">原账号已自行解绑</span>'}</span></div>
      </div>

      <div class="sec-t" style="margin-top:18px">这一步会做什么</div>
      <ul class="effects">
        <li><span class="m"><span style="color:#C9343C">✕</span></span><span>${pv.bindCount?`原使用人的 App 里不再显示这副设备（${pv.bindCount} 条绑定）`:'当前已无绑定，只需要把码放出来'}</span></li>
        <li><span class="m"><span style="color:#1C7A4A">✓</span></span><span>下一位客人可以直接扫码使用</span></li>
        <li><span class="m"><span class="muted">·</span></span><span>原使用人的历史数据与报告保留，不受影响</span></li>
      </ul>

      <div class="field" style="margin:18px 0 0"><label>为什么收回（点一个就行）</label>
        <div class="chips" id="rChips">${REASONS.map((r,i)=>`<button type="button" class="chip" data-r="${i}">${r}</button>`).join('')}</div>
        <textarea class="textarea" id="rReason" style="min-height:56px;margin-top:9px;font-family:inherit;font-size:13px"
          maxlength="500" placeholder="也可以自己写，最多 500 字"></textarea></div>
    </div>
    <div class="modal-f"><button class="btn" id="mCancel">取消</button>
      <button class="btn btn-danger" id="rOk" disabled>确认收回</button></div>`);
  $('#mCancel').onclick = closeModal;
  const ta = $('#rReason');
  const sync = ()=>{ $('#rOk').disabled = ta.value.trim().length===0; };
  ta.oninput = ()=>{ $$('#rChips .chip').forEach(c=>c.classList.remove('on')); sync(); };
  $$('#rChips .chip').forEach(c=>c.onclick=()=>{
    $$('#rChips .chip').forEach(x=>x.classList.remove('on'));
    c.classList.add('on'); ta.value = REASONS[+c.dataset.r]; sync();
  });
  sync();
  $('#rOk').onclick = ()=>{
    const reason = ta.value.trim();
    closeModal();
    submitReset(d, reason, pv.state);
  };
}

function submitReset(d, reason, expectedState){
  const op = { id:uid('op_'), operationId:uuid(), action:'reset', deviceId:d.id,
    boxCode:d.box.code, status:'running', errorCode:'', actor:me().username,
    reason, expectedState, createdAt:now(), finishedAt:null };
  DB.operations.unshift(op);
  log('reset', `提交解绑并重置 · 作业 ${op.operationId.slice(0,8)} · ${reason}`, d.id);
  save();
  toast('操作已提交。处理状态可在操作记录中查看。');
  route();
  scheduleOp(op.id);
}

function scheduleOp(opId){
  setTimeout(()=>{
    const op = DB.operations.find(o=>o.id===opId);
    if (!op || op.status!=='running') return;
    const d = deviceById(op.deviceId);
    op.status='succeeded'; op.finishedAt=now();
    d.bindings = []; d.box.released = true;
    const auto = op.actor===AUTO_ACTOR;
    log(auto?'auto_reset':'reset', `${auto?'每晚自动收回 · ':''}解绑并重置完成 · 盒码 ${d.box.code} 已可扫码`, d.id, 'ok', auto?AUTO_ACTOR:null);
    save();
    toast(auto?`每晚自动收回：${d.leftSn.slice(-6)} 已可扫码`:'已就绪，可扫码激活');
    route();
  }, 2600);
}

function retryOp(op){
  if (op.status!=='failed') return;
  op.status='running'; op.errorCode=''; op.finishedAt=null;
  const d = deviceById(op.deviceId);
  log('reset', `重试作业 ${op.operationId.slice(0,8)}`, op.deviceId);
  save(); toast('已重新提交'); route();
  scheduleOp(op.id);
}

/* ---------- 出示二维码 ----------
   真二维码由后端 / dev-portal 渲染（dev-portal 用 qrcode.react，level H，中心嵌 logo，
   可下载 PNG）。这里只放占位，demo 不引入编码库。 */
function showQr(d){
  openModal(`
    <div class="modal-h"><h3>扫码使用</h3>
      <p>让客人用 Heygo App 扫这个码，即可开始使用这副设备。</p></div>
    <div class="modal-b" style="text-align:center">
      <div class="qr-big"><span>二维码占位</span></div>
      <div class="mono" style="font-size:13px;word-break:break-all;margin-top:14px">${esc(d.box.code)}</div>
      <div class="hint" style="margin-top:4px">${esc(d.model)} · ${esc(d.leftSn.slice(-6))} / ${esc(d.rightSn.slice(-6))}</div>
      <button class="btn btn-sm" style="margin-top:12px" data-copy="${esc(d.box.code)}">复制盒码</button>
      <div class="note note-blue" style="margin-top:16px;text-align:left">${ic('alert',16)}
        <div>扫完之后这副设备会变成「绑定中」。客人还板时，在列表里点「解绑并重置」收回即可。</div></div>
    </div>
    <div class="modal-f"><button class="btn btn-primary" id="mCancel">知道了</button></div>`);
  $('#mCancel').onclick = closeModal;
  $$('[data-copy]').forEach(b=>b.onclick=()=>{
    navigator.clipboard?.writeText(b.dataset.copy).then(()=>toast('已复制到剪贴板')).catch(()=>toast('复制失败','err'));
  });
}

/* ---------- 设备详情抽屉 ---------- */
function showDetail(d){
  const s = devState(d);
  const hist = DB.logs.filter(l=>l.deviceId===d.id);
  const ops  = DB.operations.filter(o=>o.deviceId===d.id);
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
        <span class="k">包装类型</span><span>${esc(d.packageType)}</span>
        <span class="k">所属主体</span><span>${esc(myEntity().name)}</span>
      </div>
      <div class="hint" style="margin:-8px 0 16px">左右脚为出厂配对，本站不支持重新配对。</div>

      <div class="sec-t">盒码</div>
      <div class="qr">
        <div class="ph"><span>二维码占位</span></div>
        <div style="min-width:0">
          <div class="hint" style="margin:0 0 4px">盒码 / 二维码内容</div>
          <div class="mono" style="font-size:13px;word-break:break-all">${esc(d.box.code)}</div>
          <div class="hint" style="margin-top:6px">${d.box.released?'可扫码':'未释放，下一位扫不了'}</div>
          <div style="display:flex;gap:8px;margin-top:9px">
            ${d.box.released?'<button class="btn btn-sm btn-brand" data-dact="qr">出示二维码</button>':''}
            <button class="btn btn-sm" data-copy="${esc(d.box.code)}">复制盒码</button>
          </div>
        </div></div>

      <div class="sec-t">当前使用人（${d.bindings.length}）</div>
      ${d.bindings.length?`<div class="bind-list">${d.bindings.map(b=>`
        <div class="bind-pick" style="cursor:default">
          <div style="min-width:0;flex:1">
            <div class="r1"><span class="em">${esc(b.userEmail)}</span><span class="feet">${b.sn.slice(-6,-5)==='L'?'左脚':'右脚'}</span></div>
            <div class="mono r2">${esc(b.sn)}</div>
            <div class="hint">固件 ${esc(b.firmware)} · 绑定于 ${esc(b.boundAt)}</div>
          </div></div>`).join('')}</div>`:`<div class="hint">${d.box.released?'没有人在用，可以直接借出。':'原账号已在 App 里自行解绑，但盒码还占着，需要收回一次。'}</div>`}

      ${ops.length?`<div class="sec-t">盒码作业</div>
        <div class="bind-list">${ops.map(o=>`<div class="bind-pick" style="cursor:default">
          <div style="min-width:0;flex:1">
            <div class="r1"><span class="pill ${OP_STATUS[o.status].c}"><span class="dot"></span>${OP_STATUS[o.status].t}</span>
              <span class="em">${esc(ACTION_TXT[o.action])}</span></div>
            <div class="hint mono">${esc(o.operationId)}</div>
            ${o.errorCode?`<div class="warn-inline">${ic('alert',12)} ${esc(OP_ERROR[o.errorCode]||o.errorCode)}</div>`:''}
          </div></div>`).join('')}</div>`:''}

      <div class="sec-t">本设备操作历史</div>
      ${hist.length?`<div class="timeline">${hist.map((l,i)=>{
          const a=accountById(l.accountId);
          return `<div class="it ${i===0?'hi':''}"><div class="tt">${esc(ACTION_TXT[l.action]||l.action)} · ${esc(l.detail)}</div>
                  <div class="tm">${esc(l.at)} · ${esc(a?a.username:'—')}</div></div>`;}).join('')}</div>`
        :`<div class="hint">暂无记录。</div>`}
    </div>
    <div class="drawer-f">
      ${liveOpOf(d)?'<span class="muted" style="display:inline-flex;gap:6px;align-items:center;padding:8px 2px">'+ic('spin',14)+' 作业处理中</span>':`
        ${!d.box.released?'<button class="btn btn-brand" data-dact="reset">解绑并重置</button>':'<span class="muted" style="padding:8px 2px">这副设备已可扫码，无需操作</span>'}`}
    </div>`);
  $('#dClose').onclick = closeDrawer;
  $$('[data-copy]').forEach(b=>b.onclick=()=>{
    navigator.clipboard?.writeText(b.dataset.copy).then(()=>toast('已复制到剪贴板')).catch(()=>toast('复制失败','err'));
  });
  $$('[data-dact]').forEach(b=>b.onclick=()=>{ closeDrawer();
    (b.dataset.dact==='qr' ? showQr : askReset)(d); });
}

/* ============================================================
   俱乐部端 · 操作记录（含最近作业与重试）
   ============================================================ */
function renderClubLogs(){
  const e = myEntity(), mine = devicesOf(e.id).map(d=>d.id);
  const ops = DB.operations.filter(o=>mine.includes(o.deviceId));

  const opCards = ops.map(o=>{
    const d = deviceById(o.deviceId), st = OP_STATUS[o.status];
    return `<div class="op-card ${o.status}">
      <div style="min-width:0;flex:1">
        <div class="r1"><span class="pill ${st.c}"><span class="dot"></span>${st.t}</span>
          <span class="em">${esc(ACTION_TXT[o.action])}</span>
          <span class="hint mono">${esc(o.operationId.slice(0,8))}</span></div>
        <div class="mono" style="font-size:12.5px;margin-top:5px">${d?esc(d.leftSn)+' / '+esc(d.rightSn):'—'}</div>
        <div class="hint">盒码 ${esc(o.boxCode)} · 提交人 ${esc(o.actor)} · ${esc(o.createdAt)}</div>
        ${o.reason?`<div class="hint">原因：${esc(o.reason)}</div>`:''}
        ${o.errorCode?`<div class="warn-inline">${ic('alert',12)} ${esc(OP_ERROR[o.errorCode]||o.errorCode)}</div>`:''}
      </div>
      ${o.status==='failed'?`<button class="btn btn-sm btn-brand" data-retry="${o.id}">${ic('refresh',13)} 重试操作</button>`:''}
    </div>`;
  }).join('');

  const rows = DB.logs.filter(l=>l.entityId===e.id).map(l=>{
    const d = l.deviceId?deviceById(l.deviceId):null;
    const res = l.result==='ok' ? '<span class="pill pill-green"><span class="dot"></span>成功</span>'
             : l.result==='fail' ? '<span class="pill pill-red"><span class="dot"></span>失败</span>'
             : '<span class="pill pill-red"><span class="dot"></span>已拦截</span>';
    return `<tr>
      <td class="mono" style="white-space:nowrap">${esc(l.at)}</td>
      <td>${actorCell(l)}</td>
      <td><span class="pill pill-brand"><span class="dot"></span>${esc(ACTION_TXT[l.action]||l.action)}</span></td>
      <td>${d?`<div class="mono">${esc(d.leftSn)}</div><div class="mono muted">${esc(d.rightSn)}</div>`:'<span class="muted">—</span>'}</td>
      <td>${esc(l.detail)}</td><td>${res}</td></tr>`;
  }).join('');

  clubShell('logs','操作记录', `${esc(e.name)} 下所有账号的操作留痕，不可删除`, `
    <div class="card" style="margin-bottom:18px">
      <div class="card-h"><div><h3>最近操作</h3><div class="sub">收回设备要等后台处理几秒；没成功的在这里重试一次</div></div>
        <button class="btn btn-sm" id="refreshOps">${ic('refresh',13)} 刷新</button></div>
      <div style="padding:14px 16px">${opCards || '<div class="hint">暂无作业。</div>'}</div>
    </div>
    <div class="note note-blue" style="margin-bottom:14px">${ic('shield',16)}
      <div>解绑与盒码重置会影响终端用户的数据归属，因此每一次操作都会记录操作人、时间、对象、原因与结果，Heygo 侧可追溯。</div></div>
    <div class="card"><div class="tbl-scroll"><table class="tbl">
      <thead><tr><th>时间</th><th>操作人</th><th>动作</th><th>设备</th><th>说明</th><th>结果</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
      ${rows?'':'<div class="empty"><div class="big">暂无操作记录</div></div>'}
    </div>`);
  $('#refreshOps').onclick = ()=>route();
  $$('[data-retry]').forEach(b=>b.onclick=()=>retryOp(DB.operations.find(o=>o.id===b.dataset.retry)));
}

/* ============================================================
   dev-portal 配置端（演示用，仅表达三项配置能力）
   ============================================================ */
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
      <td class="mono">${ds.length} 副 / ${ds.length*2} 个 SN</td>
      <td style="white-space:nowrap">${autoOf(e).enabled
          ? `<span class="pill pill-green"><span class="dot"></span>每晚 ${esc(autoOf(e).time)}</span>`
          : '<span class="pill pill-grey"><span class="dot"></span>关闭</span>'}
        <button class="btn-link" data-auto="${e.id}" style="margin-left:6px">设置</button></td>
      <td><button class="btn-link" data-ent="${e.id}">管理设备授权</button></td>
    </tr>`;
  }).join('');
  adminShell('entities','主体管理','俱乐部 / 公司是账号与设备授权的归属单位，一个主体可以有多个登录账号', `
    <div class="toolbar"><div class="spacer"></div><button class="btn btn-brand btn-sm" id="newEnt">${ic('plus',14)} 新建主体</button></div>
    <div class="card"><div class="tbl-scroll"><table class="tbl">
      <thead><tr><th>主体</th><th>类型</th><th>联系人</th><th>账号</th><th>授权设备</th><th>每晚自动收回</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table></div></div>
    <div class="note note-blue" style="margin-top:14px">${ic('shield',16)}<div>
      <b>授权唯一性：</b>一副设备同一时间只能归属一个主体。把它授权给新主体前，必须先从原主体移除，避免两家俱乐部同时能解绑同一副设备。</div></div>`);
  $$('[data-ent]').forEach(b=>b.onclick=()=>{ adminSel.entityId=b.dataset.ent; location.hash='#/admin/devices'; });
  $$('[data-auto]').forEach(b=>b.onclick=()=>autoResetModal(entityById(b.dataset.auto)));
  $('#newEnt').onclick = ()=>{
    openModal(`<div class="modal-h"><h3>新建主体</h3><p>主体建立后即可在其下开通登录账号、授权设备 SN。</p></div>
      <div class="modal-b">
        <div class="field"><label>主体名称</label><input class="input" id="eName" placeholder="例如 南山滑雪俱乐部"></div>
        <div class="field"><label>类型</label><select class="select" id="eType"><option value="club">俱乐部</option><option value="company">公司</option></select></div>
        <div class="field"><label>联系人</label><input class="input" id="eContact" placeholder="现场对接人姓名"></div>
        <div class="field" style="margin-bottom:0"><label>联系电话</label><input class="input" id="ePhone"></div>
      </div>
      <div class="modal-f"><button class="btn" id="mCancel">取消</button><button class="btn btn-brand" id="mOk">创建</button></div>`);
    $('#mCancel').onclick = closeModal;
    $('#mOk').onclick = ()=>{
      const name=$('#eName').value.trim(); if(!name) return toast('请填写主体名称','err');
      DB.entities.push({ id:uid('ent_'), name, type:$('#eType').value,
        contact:$('#eContact').value.trim()||'—', phone:$('#ePhone').value.trim()||'—',
        createdAt:now().slice(0,10), status:'active', autoReset:{ enabled:false, time:'03:00' } });
      save(); closeModal(); toast('主体已创建'); adminEntities();
    };
  };
}

/* ---------- 每晚自动收回（按主体配置，默认关闭） ---------- */
function autoResetModal(e){
  const cur = autoOf(e);
  const bound = devicesOf(e.id).filter(d=>!d.box.released).length;
  openModal(`<div class="modal-h"><h3>每晚自动收回</h3><p>${esc(e.name)}</p></div>
    <div class="modal-b">
      <label class="switch-row"><span><b>开启每晚自动收回</b><span class="hint" style="display:block;margin-top:2px">新主体默认关闭，俱乐部有需要时由 Heygo 打开</span></span>
        <input type="checkbox" class="switch" id="arOn" ${cur.enabled?'checked':''}></label>
      <div class="field" id="arTimeF" style="margin:16px 0 0"><label>执行时间（北京时间）</label>
        <select class="select" id="arTime">${AUTO_TIMES.map(t=>`<option ${t===cur.time?'selected':''}>${t}</option>`).join('')}</select>
        <div class="hint">只开放凌晨 0–6 点整点，避开营业时间。</div></div>
      <div class="sec-t" style="margin-top:18px">到点会做什么</div>
      <ul class="effects">
        <li><span class="m"><span style="color:#C9343C">✕</span></span><span>本主体所有「绑定中」的设备各提交一次「解绑并重置」（当前 ${bound} 副）</span></li>
        <li><span class="m"><span style="color:#1C7A4A">✓</span></span><span>第二天前台打开就是全部「可扫码」，不用逐副收回</span></li>
        <li><span class="m"><span class="muted">·</span></span><span>已有处理中作业的设备跳过；白天收回失败的顺带重试；夜里失败的进俱乐部「操作记录」，可重试</span></li>
        <li><span class="m"><span class="muted">·</span></span><span>原使用人的历史数据与报告保留；操作人记为「${AUTO_ACTOR}」</span></li>
      </ul>
      <div class="note note-amber" style="margin-top:14px">${ic('alert',16)}<div>开启后，客人跨夜连续使用（比如两天课程）也会被收回，次日要重新扫码。开通前和俱乐部确认。</div></div>
    </div>
    <div class="modal-f">
      <button class="btn btn-sm" id="arRun" title="演示用：不等到点，立即按当前主体跑一次" style="margin-right:auto">${ic('refresh',13)} 演示：立即执行一次</button>
      <button class="btn" id="mCancel">取消</button><button class="btn btn-brand" id="mOk">保存</button></div>`);
  const sync = ()=>{ $('#arTimeF').style.opacity = $('#arOn').checked ? 1 : .45; $('#arTime').disabled = !$('#arOn').checked; };
  $('#arOn').onchange = sync; sync();
  $('#mCancel').onclick = closeModal;
  $('#mOk').onclick = ()=>{
    const next = { enabled:$('#arOn').checked, time:$('#arTime').value };
    if (next.enabled===cur.enabled && (!next.enabled || next.time===cur.time)) return closeModal();
    e.autoReset = next;
    log('config', next.enabled ? `${cur.enabled?'修改':'开启'}每晚自动收回 · 每天 ${next.time}（北京时间）` : '关闭每晚自动收回',
      null, 'ok', 'Heygo 运营', e.id);
    save(); closeModal(); toast(next.enabled?`已开启，每晚 ${next.time} 执行`:'已关闭每晚自动收回'); adminEntities();
  };
  $('#arRun').onclick = ()=>{ closeModal(); runAutoReset(e); adminEntities(); };
}

/* 定时任务本体：对主体下每副「绑定中」设备提交一次解绑并重置，和前台手动走同一条作业链路 */
function runAutoReset(e){
  const targets = devicesOf(e.id).filter(d=>!d.box.released && !liveOpOf(d));
  if (!targets.length){
    log('auto_reset','每晚自动收回 · 没有绑定中的设备，无需处理', null, 'ok', AUTO_ACTOR, e.id);
    return toast('没有绑定中的设备，无需处理');
  }
  targets.forEach(d=>{
    /* 白天收回失败、还没人重试的，自动收回直接接着重试这条作业，不另起一条，免得失败记录一直挂着 */
    const fop = failedOpOf(d);
    if (fop){
      fop.status='running'; fop.errorCode=''; fop.finishedAt=null; fop.actor=AUTO_ACTOR;
      log('auto_reset', `每晚自动收回 · 重试作业 ${fop.operationId.slice(0,8)}`, d.id, 'ok', AUTO_ACTOR);
      return scheduleOp(fop.id);
    }
    const op = { id:uid('op_'), operationId:uuid(), action:'reset', deviceId:d.id, boxCode:d.box.code,
      status:'running', errorCode:'', actor:AUTO_ACTOR, reason:'每晚自动收回', createdAt:now(), finishedAt:null };
    DB.operations.unshift(op);
    log('auto_reset', `每晚自动收回 · 提交解绑并重置 · 作业 ${op.operationId.slice(0,8)}`, d.id, 'ok', AUTO_ACTOR);
    scheduleOp(op.id);
  });
  save(); toast(`已提交 ${targets.length} 副设备的解绑并重置`);
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
  $('#mCancel').onclick = closeModal;
  $$('[data-copy]').forEach(b=>b.onclick=()=>{ navigator.clipboard?.writeText(b.dataset.copy).then(()=>toast('已复制到剪贴板')); });
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
      <td><div class="row-acts">
        <button class="btn-link" data-pw="${a.id}">重置密码</button>
        <button class="btn-link ${a.status==='active'?'danger':''}" data-tg="${a.id}">${a.status==='active'?'停用':'启用'}</button>
      </div></td></tr>`;
  }).join('');
  adminShell('accounts','账号管理','每个账号固定归属一个主体；账号不支持自助改密，只能由 Heygo 重置', `
    <div class="toolbar"><div class="spacer"></div><button class="btn btn-brand btn-sm" id="newAcc">${ic('plus',14)} 开通账号</button></div>
    <div class="card"><div class="tbl-scroll"><table class="tbl">
      <thead><tr><th>登录账号</th><th>所属主体</th><th>状态</th><th>创建时间</th><th>最近登录</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table></div></div>
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
      <div class="m">${devicesOf(e.id).length} 副 · ${DB.accounts.filter(a=>a.entityId===e.id).length} 个账号</div></div>`).join('');

  const rows = mine.map(d=>{
    const s = devState(d);
    return `<tr>
      <td class="sn-cell"><div class="pair"><span class="tag">L</span><span class="mono">${esc(d.leftSn)}</span></div>
        <div class="pair"><span class="tag">R</span><span class="mono">${esc(d.rightSn)}</span></div></td>
      <td><div class="mono">${esc(d.box.code.slice(0,14))}…</div>
        <div class="hint" style="margin-top:3px">${d.box.released?'可扫码':'未释放'}</div></td>
      <td><span class="pill ${s.c}"><span class="dot"></span>${s.t}</span></td>
      <td>${d.bindings.length?`${d.bindings.length} 条`:'<span class="muted">—</span>'}</td>
      <td><button class="btn-link danger" data-rm="${d.id}">移除授权</button></td></tr>`;
  }).join('');

  adminShell('devices','设备授权', `为主体配置可操作的设备；俱乐部端的搜索与操作范围严格以此为准`, `
    <div class="two-col">
      <div class="card ent-list">${entList}</div>
      <div>
        <div class="card">
          <div class="card-h"><div><h3>${esc(sel.name)}</h3><div class="sub">已授权 ${mine.length} 副（${mine.length*2} 个 SN）· 系统内未分配 ${unassigned} 副</div></div>
            <button class="btn btn-brand btn-sm" id="addSn">${ic('plus',14)} 添加设备</button></div>
          <div class="tbl-scroll"><table class="tbl"><thead><tr><th>设备 SN（出厂配对）</th><th>盒码</th><th>状态</th><th>绑定账号</th><th></th></tr></thead>
            <tbody>${rows}</tbody></table></div>
          ${mine.length?'':'<div class="empty"><div class="big">该主体还没有授权任何设备</div><div>点右上角「添加设备」</div></div>'}
        </div>
        <div class="note note-amber" style="margin-top:14px">${ic('alert',16)}<div>
          <b>一次一副，两个 SN。</b>左右脚共用一个盒码，只授权单只没有意义；两只必须是同一副出厂配对的设备，本站不支持重新配对。</div></div>
      </div>
    </div>`);

  $$('[data-pick]').forEach(b=>b.onclick=()=>{ adminSel.entityId=b.dataset.pick; adminDevices(); });
  $$('[data-rm]').forEach(b=>b.onclick=()=>{
    const d = deviceById(b.dataset.rm);
    openModal(`<div class="modal-h"><h3>移除设备授权</h3><p>把这副设备从 <b>${esc(sel.name)}</b> 的可操作范围中移除。</p></div>
      <div class="modal-b">
        <div class="target-box">
          <div class="r"><span class="k">左脚 SN</span><span class="mono">${esc(d.leftSn)}</span></div>
          <div class="r"><span class="k">右脚 SN</span><span class="mono">${esc(d.rightSn)}</span></div>
          <div class="r"><span class="k">盒码</span><span class="mono">${esc(d.box.code)}</span></div>
        </div>
        <ul class="effects">
          <li><span class="m"><span style="color:#C9343C">✕</span></span><span>该主体下所有账号将无法搜索和操作这副设备</span></li>
          <li><span class="m"><span class="muted">·</span></span><span>设备当前的绑定关系与盒码状态不变</span></li>
          <li><span class="m"><span style="color:#1C7A4A">✓</span></span><span>可以重新授权给其他主体</span></li>
        </ul>
        ${d.bindings.length?`<div class="note note-amber" style="margin-top:16px">${ic('alert',16)}
          <div>这副设备还有 <b>${d.bindings.length}</b> 条绑定记录。移除授权后，俱乐部<b>无法再自助解绑</b>，只能由 Heygo 处理。</div></div>`:''}
      </div>
      <div class="modal-f"><button class="btn" id="mCancel">取消</button><button class="btn btn-danger" id="mOk">移除授权</button></div>`);
    $('#mCancel').onclick = closeModal;
    $('#mOk').onclick = ()=>{ d.entityId=null; save(); closeModal(); toast('已移除授权'); adminDevices(); };
  });

  $('#addSn').onclick = ()=>{
    openModal(`<div class="modal-h"><h3>添加设备</h3>
        <p>一次添加一副，填左右脚两个完整 SN。两只必须是同一副出厂配对的设备。</p></div>
      <div class="modal-b">
        <div class="field">
          <label>从 SN 主档查找完整 SN</label>
          <div style="display:flex;gap:8px">
            <input class="input" id="snFind" placeholder="输入短号、L901 或完整 SN" autocomplete="off">
            <button class="btn" id="snFindGo" style="flex:none">查找</button>
          </div>
          <div id="snCand"></div>
        </div>
        <div class="grid2">
          <div class="field" style="margin-bottom:0"><label>左脚完整 SN</label>
            <input class="input mono" id="snL" placeholder="…L00901" autocomplete="off"></div>
          <div class="field" style="margin-bottom:0"><label>右脚完整 SN</label>
            <input class="input mono" id="snR" placeholder="…R20901" autocomplete="off"></div>
        </div>
        <div id="pairCheck"></div>
        <div class="hint" style="margin-top:14px">SN 格式：前缀（1–52 位字母数字）+ 6 位日期码 + L/R + 5 位序号，与 dev-portal 盒码管理一致。</div>
      </div>
      <div class="modal-f"><button class="btn" id="mCancel">取消</button>
        <button class="btn btn-brand" id="mOk" disabled>添加这副设备</button></div>`);
    $('#mCancel').onclick = closeModal;

    let target = null;   // 校验通过时指向那副设备

    const say = (cls, st, msg) => {
      $('#pairCheck').innerHTML = `<div class="parse-res"><div class="parse-row">
        <span class="st ${cls}">${st}</span><span class="muted">${msg}</span></div></div>`;
    };

    const check = ()=>{
      target = null; $('#mOk').disabled = true;
      const L = $('#snL').value.trim().toUpperCase(), R = $('#snR').value.trim().toUpperCase();
      $('#snL').value = L; $('#snR').value = R;
      if (!L || !R) { $('#pairCheck').innerHTML=''; return; }
      if (!SN_RE.test(L) || !SN_RE.test(R)) return say('err-c','格式错误','SN 不符合格式，请核对完整 SN');
      if (L.slice(-6,-5)!=='L')             return say('err-c','不是左脚','左脚 SN 的倒数第 6 位应为 L');
      if (R.slice(-6,-5)!=='R')             return say('err-c','不是右脚','右脚 SN 的倒数第 6 位应为 R');
      const dl = DB.devices.find(x=>x.leftSn===L), dr = DB.devices.find(x=>x.rightSn===R);
      if (!dl && !dr) return say('err-c','未登记','SN 主档里没有这两只，请先在设备台账登记');
      if (!dl)        return say('err-c','未登记',`左脚 ${L} 不在 SN 主档里`);
      if (!dr)        return say('err-c','未登记',`右脚 ${R} 不在 SN 主档里`);
      if (dl.id !== dr.id)
        return say('err-c','配对不符',`这两只不是同一副出厂配对的设备（左脚那副的右脚是 ${dl.rightSn}）。本站不支持重新配对。`);
      if (dl.entityId === sel.id) return say('warn-c','已授权','这副设备已在本主体名下，无需重复添加');
      if (dl.entityId)            return say('err-c','冲突',`已授权给「${entityById(dl.entityId).name}」，需先从该主体移除`);
      target = dl; $('#mOk').disabled = false;
      say('ok-c','可添加',`${dl.model} · ${dl.batch} 批次 · ${dl.packageType}`);
    };
    $('#snL').oninput = check; $('#snR').oninput = check;

    /* SN 主档模糊查找：逐字符顺序匹配，多条要人工挑，不自动取第一条 */
    const search = ()=>{
      const q = $('#snFind').value.trim().toUpperCase();
      if (q.length < 2) { $('#snCand').innerHTML = '<div class="hint">至少输入 2 个字符。</div>'; return; }
      const hits = [];
      DB.devices.forEach(d=>{ [d.leftSn,d.rightSn].forEach(sn=>{ if(subseq(q,sn)) hits.push(sn); }); });
      if (!hits.length) { $('#snCand').innerHTML =
        '<div class="hint">SN 主档里没有匹配。请核对设备标签上的日期和短号，不要猜完整前缀。</div>'; return; }
      $('#snCand').innerHTML = `
        ${hits.length>1?`<div class="hint" style="margin-top:8px">找到 ${hits.length} 条，请按批次和日期自己选，不会自动取第一条。</div>`:''}
        <div class="cand-list">${hits.slice(0,12).map(sn=>{
          const isL = sn.slice(-6,-5)==='L';
          return `<div class="cand"><div style="min-width:0">
            <div class="mono" style="font-size:12.5px">${esc(sn)}</div>
            <div class="hint">${isL?'左脚':'右脚'} · 日期码 ${esc(sn.slice(-12,-6))}</div>
          </div><button class="btn btn-sm" data-fill-sn="${esc(sn)}" data-side="${isL?'L':'R'}">填入${isL?'左脚':'右脚'}</button></div>`;
        }).join('')}</div>`;
      $$('[data-fill-sn]').forEach(b=>b.onclick=()=>{
        $(b.dataset.side==='L'?'#snL':'#snR').value = b.dataset.fillSn; check();
      });
    };
    $('#snFindGo').onclick = search;
    $('#snFind').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); search(); } });

    $('#mOk').onclick = ()=>{
      if (!target) return;
      target.entityId = sel.id; save(); closeModal();
      toast(`已授权 ${target.leftSn.slice(-6)} / ${target.rightSn.slice(-6)} 给 ${sel.name}`);
      adminDevices();
    };
  };
}

/* ---------- 操作审计 ---------- */
function adminAudit(){
  const rows = DB.logs.map(l=>{
    const e=entityById(l.entityId), d=l.deviceId?deviceById(l.deviceId):null;
    const res = l.result==='ok' ? '<span class="pill pill-green"><span class="dot"></span>成功</span>'
             : l.result==='fail' ? '<span class="pill pill-red"><span class="dot"></span>失败</span>'
             : '<span class="pill pill-red"><span class="dot"></span>已拦截</span>';
    return `<tr><td class="mono" style="white-space:nowrap">${esc(l.at)}</td>
      <td>${esc(e?e.name:'—')}</td>
      <td>${l.actor?esc(l.actor):`<div class="mono">${esc((accountById(l.accountId)||{}).username||'—')}</div>`}</td>
      <td><span class="pill pill-brand"><span class="dot"></span>${esc(ACTION_TXT[l.action]||l.action)}</span></td>
      <td>${d?`<span class="mono">${esc(d.leftSn)}</span>`:'<span class="muted">—</span>'}</td>
      <td>${esc(l.detail)}</td><td>${res}</td></tr>`;
  }).join('');
  adminShell('audit','操作审计','所有主体的操作流水，按时间倒序', `
    <div class="card"><div class="tbl-scroll"><table class="tbl">
      <thead><tr><th>时间</th><th>主体</th><th>操作人</th><th>动作</th><th>设备</th><th>说明</th><th>结果</th></tr></thead>
      <tbody>${rows}</tbody></table></div></div>`);
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

load();
/* 刷新会丢掉内存里的定时器：把还在 running 的作业重新挂上 */
DB.operations.filter(o=>o.status==='running').forEach(o=>scheduleOp(o.id));
syncDemobar(); route();
