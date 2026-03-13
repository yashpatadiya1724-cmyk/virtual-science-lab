/**
 * Student Dashboard JS
 * Virtual Science Lab | Skill India VR
 */

'use strict';

// =====================================================
// MOCK DATA (would come from MongoDB in production)
// =====================================================
const MOCK_PROGRESS = [
  { name: 'Simple Pendulum', subject: 'Physics', progress: 100, tag: 'Completed' },
  { name: 'Prism Refraction', subject: 'Physics', progress: 80, tag: 'In Progress' },
  { name: 'Acid-Base Reaction', subject: 'Chemistry', progress: 60, tag: 'In Progress' },
  { name: 'Ohm\'s Law', subject: 'Physics', progress: 100, tag: 'Completed' },
  { name: 'Photosynthesis', subject: 'Biology', progress: 30, tag: 'Started' }
];

const MOCK_COMPLETED = [
  { icon: '⚖️', name: 'Simple Pendulum', date: '2024-01-15' },
  { icon: '⚡', name: 'Ohm\'s Law', date: '2024-01-12' },
  { icon: '🔭', name: 'Convex Lens', date: '2024-01-09' },
  { icon: '⚗️', name: 'pH Indicators', date: '2024-01-05' },
  { icon: '🧲', name: 'Electromagnets', date: '2024-01-02' }
];

const MOCK_BADGES = [
  { emoji: '🏆', name: 'First Experiment', desc: 'Completed your first lab' },
  { emoji: '🔬', name: 'Science Star', desc: '5 experiments done' },
  { emoji: '⚡', name: 'Physics Whiz', desc: '3 physics experiments' }
];

const MOCK_RECOMMENDED = [
  { icon: '🌊', name: 'Waves & Sound', subject: 'Physics', exp: 'sound' },
  { icon: '🔋', name: 'Electrolysis', subject: 'Chemistry', exp: 'electrolysis' },
  { icon: '🌱', name: 'Osmosis', subject: 'Biology', exp: 'osmosis' }
];

// =====================================================
// RENDER FUNCTIONS
// =====================================================

function renderProgressList() {
  const container = document.getElementById('progress-list');
  if (!container) return;

  const stored = loadProgress('completed') || [];
  // Merge stored completions into mock data
  const data = MOCK_PROGRESS.map(item => {
    const found = stored.find(s => s.name === item.name);
    return found ? { ...item, progress: 100, tag: 'Completed' } : item;
  });

  container.innerHTML = data.map(item => `
    <div class="progress-item">
      <div>
        <div class="progress-name">
          ${item.name}
          <span class="exp-tag ${item.subject.toLowerCase()}" style="font-size:0.65rem;padding:0.15rem 0.5rem;margin-left:0.4rem">${item.subject}</span>
        </div>
        <div class="progress-bar-wrap" style="margin-top:4px">
          <div class="progress-bar" style="width:${item.progress}%;${item.progress === 100 ? 'background:linear-gradient(90deg,var(--clr-accent),#88ff44)' : ''}"></div>
        </div>
        <div class="progress-tag">${item.tag}</div>
      </div>
      <span class="progress-pct ${item.progress === 100 ? '' : ''}"
        style="${item.progress === 100 ? 'color:var(--clr-accent)' : ''}">
        ${item.progress}%
      </span>
    </div>
  `).join('');
}

function renderCompletedList() {
  const container = document.getElementById('completed-list');
  if (!container) return;

  // Merge local storage with mock data
  const stored = loadProgress('completed') || [];
  const allCompleted = [
    ...stored.map(s => ({ icon: '✅', name: s.name, date: s.date })),
    ...MOCK_COMPLETED
  ].slice(0, 8);

  container.innerHTML = allCompleted.map(item => `
    <div class="completed-item">
      <span class="completed-icon">${item.icon}</span>
      <span class="completed-name">${item.name}</span>
      <span class="completed-date">${formatDate(item.date)}</span>
    </div>
  `).join('');
}

function renderBadges() {
  const container = document.getElementById('badges-grid');
  if (!container) return;

  container.innerHTML = MOCK_BADGES.map(badge => `
    <div style="
      display:flex;flex-direction:column;align-items:center;gap:0.3rem;
      padding:var(--space-sm);background:var(--clr-bg);border:1px solid var(--clr-border);
      border-radius:var(--radius);text-align:center;min-width:100px;cursor:default;
      transition:var(--transition)
    " onmouseover="this.style.borderColor='var(--clr-gold)'" onmouseout="this.style.borderColor='var(--clr-border)'">
      <div style="font-size:2rem">${badge.emoji}</div>
      <div style="font-family:var(--font-display);font-size:0.72rem;font-weight:700;color:var(--clr-gold)">${badge.name}</div>
      <div style="font-size:0.68rem;color:var(--clr-text-muted)">${badge.desc}</div>
    </div>
  `).join('');
}

function renderRecommended() {
  const container = document.getElementById('recommended-list');
  if (!container) return;

  container.innerHTML = MOCK_RECOMMENDED.map(item => `
    <div style="
      display:flex;align-items:center;gap:0.75rem;
      padding:0.75rem;background:var(--clr-bg);border:1px solid var(--clr-border);
      border-radius:var(--radius);cursor:pointer;transition:var(--transition)
    "
      onclick="location.href='lab.html?exp=${item.exp}'"
      onmouseover="this.style.borderColor='var(--clr-primary)'"
      onmouseout="this.style.borderColor='var(--clr-border)'">
      <span style="font-size:1.3rem">${item.icon}</span>
      <div>
        <div style="font-size:0.875rem;font-weight:600">${item.name}</div>
        <div style="font-size:0.72rem;color:var(--clr-text-muted)">${item.subject}</div>
      </div>
      <span style="margin-left:auto;color:var(--clr-primary);font-size:0.8rem">→</span>
    </div>
  `).join('');
}

function updateStats() {
  const stored = loadProgress('completed') || [];
  const totalDone = MOCK_COMPLETED.length + stored.length;
  const statEl = document.getElementById('stat-completed');
  if (statEl) animateCounter(statEl, totalDone);
}

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  // Animate stats
  document.querySelectorAll('.stat-card .num').forEach(el => {
    const val = el.textContent;
    const isPercent = val.includes('%');
    const isH = val.includes('h');
    if (!isPercent && !isH) {
      animateCounter(el, parseInt(val));
    }
  });

  renderProgressList();
  renderCompletedList();
  renderBadges();
  renderRecommended();
  updateStats();

  // Fetch from API if available
  apiGet('/students/me').then(data => {
    if (!data) return;
    const nameEl = document.getElementById('user-name');
    if (nameEl && data.name) nameEl.textContent = `Welcome back, ${data.name}!`;
    const avatarEl = document.getElementById('user-avatar');
    if (avatarEl && data.name) avatarEl.textContent = data.name[0].toUpperCase();
  });
});
