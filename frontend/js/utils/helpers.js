/**
 * Virtual Science Lab - Helper Utilities
 * Skill India VR | NEP 2020
 */

'use strict';

// =====================================================
// DOM HELPERS
// =====================================================

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Animate a counter from 0 to target
 * @param {HTMLElement} el - The element to animate
 * @param {number} target - Target number
 * @param {number} duration - Duration in ms
 */
function animateCounter(el, target, duration = 2000) {
  const start = performance.now();
  const isSuffix = String(target).includes('%') || String(target).includes('h');
  const num = parseFloat(String(target).replace(/[^0-9.]/g, ''));
  const suffix = String(target).replace(/[0-9.]/g, '');

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(eased * num);
    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/**
 * Detect low bandwidth (rough heuristic)
 */
function isLowBandwidth() {
  if ('connection' in navigator) {
    const conn = navigator.connection;
    return conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g';
  }
  return false;
}

/**
 * Get URL query parameter
 */
function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

/**
 * Save data to localStorage (experiment progress)
 */
function saveProgress(key, data) {
  try {
    localStorage.setItem(`vsl_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage unavailable:', e);
  }
}

/**
 * Load data from localStorage
 */
function loadProgress(key, fallback = null) {
  try {
    const item = localStorage.getItem(`vsl_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Debounce function
 */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Clamp a value between min and max
 */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Linear interpolation
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Degrees to radians
 */
function degToRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Generate random ID
 */
function genId() {
  return Math.random().toString(36).slice(2, 11);
}

/**
 * Show toast notification
 */
function showToast(msg, type = 'info', duration = 3000) {
  const existing = document.getElementById('vsl-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'vsl-toast';
  const colors = {
    info: '#00c8ff',
    success: '#39ff14',
    warning: '#ffd700',
    error: '#ff4444'
  };
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    padding: '0.75rem 1.25rem',
    background: '#0a1628',
    border: `1px solid ${colors[type] || colors.info}`,
    borderRadius: '10px',
    color: colors[type] || colors.info,
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '0.875rem',
    zIndex: '9999',
    animation: 'fadeIn 0.3s ease',
    maxWidth: '300px'
  });
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// =====================================================
// API HELPERS
// =====================================================

const API_BASE = 'http://localhost:3000/api';

async function apiGet(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('API GET error:', e);
    return null;
  }
}

async function apiPost(endpoint, data) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('API POST error:', e);
    return null;
  }
}

// Add simple fade-in keyframe if not already present
if (!document.getElementById('vsl-keyframes')) {
  const style = document.createElement('style');
  style.id = 'vsl-keyframes';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}
