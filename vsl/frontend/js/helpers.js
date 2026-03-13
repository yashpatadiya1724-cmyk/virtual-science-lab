/* ============================================
   helpers.js — Shared utility functions
   Virtual Science Lab | Skill India VR
   ============================================ */
'use strict';

/* ---- Animate counter 0 → target ---- */
function animateCounter(el, target, duration = 1800) {
  const num = parseFloat(String(target).replace(/[^0-9.]/g, ''));
  const suf = String(target).replace(/[0-9.]/g, '');
  const start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(e * num).toLocaleString() + suf;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---- URL query param ---- */
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

/* ---- Local storage helpers ---- */
function saveLS(key, val) {
  try { localStorage.setItem('vsl_' + key, JSON.stringify(val)); } catch {}
}
function loadLS(key, fallback = null) {
  try { const v = localStorage.getItem('vsl_' + key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

/* ---- Toast notifications ---- */
function showToast(msg, type = 'info', ms = 3000) {
  document.getElementById('vsl-toast')?.remove();
  const colors = { info:'#00c8ff', success:'#39ff14', warning:'#ffd700', error:'#ff4444' };
  const t = document.createElement('div');
  t.id = 'vsl-toast';
  Object.assign(t.style, {
    position:'fixed', bottom:'1.5rem', right:'1.5rem',
    padding:'0.65rem 1.1rem',
    background:'#0a1628', border:`1px solid ${colors[type]||colors.info}`,
    borderRadius:'10px', color:colors[type]||colors.info,
    fontFamily:"'Space Grotesk',sans-serif", fontSize:'0.85rem',
    zIndex:'9999', maxWidth:'300px',
    animation:'fadeUp 0.3s ease'
  });
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(()=>t.remove(), 300); }, ms);
}

/* ---- Math helpers ---- */
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const lerp  = (a, b, t) => a + (b - a) * t;
const deg2rad = d => d * Math.PI / 180;

/* ---- Format date ---- */
function fmtDate(str) {
  return new Date(str).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

/* ---- Low bandwidth detection ---- */
function isLowBW() {
  if ('connection' in navigator) {
    const c = navigator.connection;
    return c.effectiveType === '2g' || c.effectiveType === 'slow-2g';
  }
  return false;
}

/* ---- API helpers ---- */
const API = 'http://localhost:3000/api';
async function apiGet(url) {
  try { const r = await fetch(API + url); return r.ok ? r.json() : null; } catch { return null; }
}
async function apiPost(url, data) {
  try {
    const r = await fetch(API + url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

/* ---- Inject keyframe if missing ---- */
if (!document.getElementById('vsl-kf')) {
  const s = document.createElement('style');
  s.id = 'vsl-kf';
  s.textContent = `@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`;
  document.head.appendChild(s);
}
