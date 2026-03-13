/**
 * Admin Panel JS
 * Teacher/Admin Interface for Virtual Science Lab
 */

'use strict';

// =====================================================
// MOCK DATA
// =====================================================
const EXPERIMENTS_DATA = [
  { name: 'Simple Pendulum', subject: 'Physics', cls: 'Class 9', duration: 15, status: 'active', sessions: 142, score: 87 },
  { name: 'Prism Refraction', subject: 'Physics', cls: 'Class 10', duration: 20, status: 'active', sessions: 118, score: 82 },
  { name: 'Acid-Base Titration', subject: 'Chemistry', cls: 'Class 11', duration: 25, status: 'active', sessions: 96, score: 79 },
  { name: 'Ohm\'s Law', subject: 'Physics', cls: 'Class 9', duration: 15, status: 'active', sessions: 88, score: 91 },
  { name: 'Photosynthesis', subject: 'Biology', cls: 'Class 8', duration: 20, status: 'draft', sessions: 0, score: 0 },
  { name: 'Electromagnetic Induction', subject: 'Physics', cls: 'Class 12', duration: 30, status: 'active', sessions: 64, score: 74 }
];

const STUDENTS_DATA = [
  { name: 'Arjun Kumar', cls: 'Class 10', done: 7, lastActive: '2024-01-15', score: 82 },
  { name: 'Priya Singh', cls: 'Class 9', done: 5, lastActive: '2024-01-14', score: 91 },
  { name: 'Ravi Sharma', cls: 'Class 11', done: 12, lastActive: '2024-01-15', score: 76 },
  { name: 'Meena Patel', cls: 'Class 10', done: 3, lastActive: '2024-01-10', score: 88 },
  { name: 'Suresh Yadav', cls: 'Class 9', done: 6, lastActive: '2024-01-13', score: 79 },
  { name: 'Anita Rajput', cls: 'Class 12', done: 15, lastActive: '2024-01-15', score: 94 }
];

const WEEKLY_USAGE = [45, 62, 88, 103, 97, 30, 12];

// =====================================================
// SECTION NAVIGATION
// =====================================================
function showSection(id) {
  document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));

  const section = document.getElementById(`section-${id}`);
  if (section) section.style.display = 'block';

  document.querySelectorAll('.admin-nav-item').forEach(item => {
    if (item.getAttribute('onclick')?.includes(id)) item.classList.add('active');
  });
}

// =====================================================
// RENDER FUNCTIONS
// =====================================================
function renderAdminChart() {
  const container = document.getElementById('admin-chart');
  if (!container) return;

  const max = Math.max(...WEEKLY_USAGE);
  container.innerHTML = WEEKLY_USAGE.map(val => {
    const height = Math.max(8, (val / max) * 130);
    return `<div class="chart-bar" style="height:${height}px" title="${val} sessions"></div>`;
  }).join('');
}

function renderTopExperiments() {
  const tbody = document.getElementById('top-exp-table');
  if (!tbody) return;

  const sorted = [...EXPERIMENTS_DATA].sort((a, b) => b.sessions - a.sessions).slice(0, 5);
  tbody.innerHTML = sorted.map(exp => `
    <tr>
      <td style="color:var(--clr-text);font-weight:500">${exp.name}</td>
      <td><span class="badge ${exp.subject.toLowerCase()}">${exp.subject}</span></td>
      <td>${exp.sessions}</td>
      <td>${exp.score > 0 ? exp.score + '%' : '—'}</td>
      <td><span class="badge ${exp.status}">${exp.status}</span></td>
    </tr>
  `).join('');
}

function renderExperimentsTable() {
  const tbody = document.getElementById('experiments-table');
  if (!tbody) return;

  tbody.innerHTML = EXPERIMENTS_DATA.map(exp => `
    <tr>
      <td style="color:var(--clr-text);font-weight:500">${exp.name}</td>
      <td><span class="badge ${exp.subject.toLowerCase()}">${exp.subject}</span></td>
      <td>${exp.cls}</td>
      <td>${exp.duration} min</td>
      <td><span class="badge ${exp.status}">${exp.status}</span></td>
      <td>
        <button onclick="editExperiment('${exp.name}')" style="color:var(--clr-primary);background:none;border:none;cursor:pointer;font-size:0.8rem">Edit</button>
        <button onclick="deleteExperiment('${exp.name}')" style="color:#ff4444;background:none;border:none;cursor:pointer;font-size:0.8rem;margin-left:0.5rem">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderStudentsTable() {
  const tbody = document.getElementById('students-table');
  if (!tbody) return;

  tbody.innerHTML = STUDENTS_DATA.map(s => `
    <tr>
      <td style="color:var(--clr-text);font-weight:500">
        <div style="display:flex;align-items:center;gap:0.5rem">
          <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--clr-primary),var(--clr-secondary));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;color:var(--clr-bg)">
            ${s.name[0]}
          </div>
          ${s.name}
        </div>
      </td>
      <td>${s.cls}</td>
      <td>${s.done}</td>
      <td>${formatDate(s.lastActive)}</td>
      <td><span style="color:${s.score >= 80 ? 'var(--clr-accent)' : s.score >= 60 ? 'var(--clr-gold)' : 'var(--clr-secondary)'}">${s.score}%</span></td>
    </tr>
  `).join('');
}

function renderPopularityChart() {
  const container = document.getElementById('chart-popularity');
  if (!container) return;

  const sorted = [...EXPERIMENTS_DATA].sort((a, b) => b.sessions - a.sessions).slice(0, 5);
  const max = sorted[0]?.sessions || 1;

  container.innerHTML = `<div style="padding:1rem;width:100%;display:flex;flex-direction:column;gap:0.5rem">` +
    sorted.map(exp => `
      <div>
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:3px">
          <span style="color:var(--clr-text-muted)">${exp.name}</span>
          <span style="color:var(--clr-primary);font-family:var(--font-display)">${exp.sessions}</span>
        </div>
        <div style="height:6px;background:var(--clr-border);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${(exp.sessions / max) * 100}%;background:linear-gradient(90deg,var(--clr-primary),var(--clr-accent));border-radius:3px"></div>
        </div>
      </div>
    `).join('') + `</div>`;
}

// =====================================================
// ACTIONS
// =====================================================
function editExperiment(name) {
  showSection('add-exp');
  showToast(`✏️ Editing: ${name}`, 'info');
}

function deleteExperiment(name) {
  if (confirm(`Delete "${name}"? This cannot be undone.`)) {
    const idx = EXPERIMENTS_DATA.findIndex(e => e.name === name);
    if (idx !== -1) EXPERIMENTS_DATA.splice(idx, 1);
    renderExperimentsTable();
    renderTopExperiments();
    showToast(`🗑 "${name}" deleted.`, 'warning');
  }
}

function submitExperiment(e) {
  e.preventDefault();
  showToast('✅ Experiment published successfully!', 'success');
  showSection('experiments');
}

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  renderAdminChart();
  renderTopExperiments();
  renderExperimentsTable();
  renderStudentsTable();
  renderPopularityChart();

  // Fetch real data from API if available
  apiGet('/admin/analytics').then(data => {
    if (!data) return;
    // Update with real data...
  });
});
