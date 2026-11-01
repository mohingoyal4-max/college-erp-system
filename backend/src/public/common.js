// Shared helpers for the standalone ERP pages (fees / timetable / reports)
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
let T = null, U = null;
try {
  T = localStorage.getItem('fees_token') || localStorage.getItem('erp_token');
  U = JSON.parse(localStorage.getItem('fees_user') || localStorage.getItem('erp_user') || 'null');
} catch (e) {}

function toast(t, bad) {
  let m = $('#msg');
  if (!m) { m = document.createElement('div'); m.id = 'msg'; document.body.appendChild(m); }
  m.textContent = t; m.style.background = bad ? '#c53030' : '#2f855a'; m.style.display = 'block';
  setTimeout(() => (m.style.display = 'none'), 3500);
}
async function api(path, opt = {}) {
  const r = await fetch('/api' + path, {
    method: opt.method || 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + T },
    body: opt.body ? JSON.stringify(opt.body) : undefined,
  });
  if (r.status === 401) { logout(); throw new Error('Session expired'); }
  const j = await r.json().catch(() => ({ success: false, message: 'Bad response from server' }));
  if (!j.success) throw new Error(j.message || 'Request failed');
  return j;
}
async function login() {
  try {
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: $('#em').value, password: $('#pw').value }) });
    const j = await r.json();
    if (!j.success) throw new Error(j.message);
    T = j.token; U = j.user;
    try { localStorage.setItem('fees_token', T); localStorage.setItem('fees_user', JSON.stringify(U)); } catch (e) {}
    boot();
  } catch (e) { toast(e.message, 1); }
}
function logout() {
  T = U = null;
  try { localStorage.removeItem('fees_token'); localStorage.removeItem('fees_user'); } catch (e) {}
  boot();
}
const has = (perm) => U && (U.role === 'ADMIN' || (U.permissions || []).includes(perm));

function chrome(title) {
  document.body.insertAdjacentHTML('afterbegin',
    `<header><strong>AcademiaPro · ${title}</strong><nav><a href="/fees">Fees</a><a href="/timetable">Timetable</a><a href="/reports">Reports</a></nav><span id="who"></span></header>
     <main><div id="login" class="card" style="max-width:380px;margin:60px auto;display:none"><h2>Sign in</h2>
     <div class="row" style="flex-direction:column;align-items:stretch"><input id="em" placeholder="Email" autocomplete="username"><input id="pw" type="password" placeholder="Password" autocomplete="current-password"><button onclick="login()">Sign in</button></div></div>
     <div id="app" style="display:none"></div></main>`);
}
function showAuthState() {
  $('#login').style.display = T ? 'none' : 'block';
  $('#app').style.display = T ? 'block' : 'none';
  $('#who').innerHTML = U ? esc(U.name) + ' (' + esc(U.role) + ') <button class="sec" onclick="logout()">Logout</button>' : '';
  return !!T;
}