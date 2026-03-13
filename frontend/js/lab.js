/**
 * Virtual Lab – Main Orchestrator
 * Manages Three.js renderer, experiment switching, VR mode
 * Virtual Science Lab | Skill India VR
 */

'use strict';

// =====================================================
// GLOBALS
// =====================================================
let renderer, scene, camera, clock;
let currentExperiment = null;
let vrMode = false;
let animFrameId = null;

// Map of experiment IDs to their modules
const EXPERIMENTS = {
  pendulum: window.PendulumExperiment,
  prism: window.PrismExperiment,
  acidbase: window.AcidBaseExperiment
};

// =====================================================
// INITIALISE THREE.JS
// =====================================================
function initRenderer() {
  const canvas = document.getElementById('lab-canvas');
  const container = document.getElementById('canvas-area');

  renderer = new THREE.WebGLRenderer({ canvas, antialias: !isLowBandwidth(), alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowBandwidth() ? 1 : 2));
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setClearColor(0x020810, 1);
  renderer.shadowMap.enabled = !isLowBandwidth();

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020810, 0.04);

  const W = container.offsetWidth;
  const H = container.offsetHeight;
  camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
  camera.position.set(0, 1, 9);

  clock = new THREE.Clock();

  // Resize handler
  window.addEventListener('resize', () => {
    const W2 = container.offsetWidth;
    const H2 = container.offsetHeight;
    camera.aspect = W2 / H2;
    camera.updateProjectionMatrix();
    renderer.setSize(W2, H2);
  });
}

// =====================================================
// EXPERIMENT MANAGEMENT
// =====================================================
function switchExperiment(expId) {
  // Cleanup previous
  if (currentExperiment) {
    currentExperiment.cleanup(scene);
    if (animFrameId) cancelAnimationFrame(animFrameId);
  }

  // Clear scene
  while (scene.children.length) scene.remove(scene.children[0]);

  // Activate new experiment
  currentExperiment = EXPERIMENTS[expId];
  if (!currentExperiment) return;

  // Build 3D scene
  currentExperiment.build(scene, THREE);

  // Update UI
  document.getElementById('exp-title').textContent = currentExperiment.name;
  document.getElementById('panel-exp-name').textContent = `🔬 ${currentExperiment.name}`;
  document.getElementById('panel-exp-class').textContent = `${currentExperiment.subject} – ${currentExperiment.classLevel}`;

  // Render panel
  renderExperimentPanel(currentExperiment);

  // Update active tabs
  document.querySelectorAll('.exp-tab').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.exp-tab').forEach(btn => {
    if (btn.textContent.toLowerCase().includes(expId.substring(0, 4)) ||
        (expId === 'acidbase' && btn.textContent.includes('Acid'))) {
      btn.classList.add('active');
    }
  });

  // Set camera position per experiment
  const camPositions = {
    pendulum: [0, 1.5, 9],
    prism: [0, 0, 9],
    acidbase: [0, 0.5, 8]
  };
  const pos = camPositions[expId] || [0, 1, 9];
  camera.position.set(...pos);
  camera.lookAt(0, 0, 0);

  // Start render loop
  startRenderLoop();

  // Hide loader
  setTimeout(() => {
    const loader = document.getElementById('lab-loading');
    if (loader) loader.classList.add('hidden');
  }, 600);
}

// =====================================================
// RENDER PANEL CONTENT
// =====================================================
function renderExperimentPanel(exp) {
  const body = document.getElementById('panel-body');
  if (!body || !exp) return;

  let html = '';

  // Controls (sliders) per experiment
  if (exp === EXPERIMENTS.pendulum) {
    html += `
      <div class="slider-group">
        <div class="slider-label">
          <span class="slider-name">String Length (L)</span>
          <span class="slider-val" id="val-length">${exp.state.length.toFixed(1)} m</span>
        </div>
        <input type="range" min="0.5" max="4.0" step="0.1"
          value="${exp.state.length}"
          oninput="onSliderChange('length', this.value)" />
      </div>
      <div class="slider-group">
        <div class="slider-label">
          <span class="slider-name">Gravity (g)</span>
          <span class="slider-val" id="val-gravity">${exp.state.gravity.toFixed(1)} m/s²</span>
        </div>
        <input type="range" min="1.6" max="24.8" step="0.1"
          value="${exp.state.gravity}"
          oninput="onSliderChange('gravity', this.value)" />
      </div>
    `;
  }

  if (exp === EXPERIMENTS.prism) {
    html += `
      <div class="slider-group">
        <div class="slider-label">
          <span class="slider-name">Incident Angle (i)</span>
          <span class="slider-val" id="val-angle">${exp.state.incidentAngle}°</span>
        </div>
        <input type="range" min="10" max="80" step="1"
          value="${exp.state.incidentAngle}"
          oninput="onSliderChange('angle', this.value)" />
      </div>
      <div class="slider-group">
        <div class="slider-label">
          <span class="slider-name">Refractive Index (n)</span>
          <span class="slider-val" id="val-n">${exp.state.refractiveIndex}</span>
        </div>
        <input type="range" min="1.3" max="2.5" step="0.01"
          value="${exp.state.refractiveIndex}"
          oninput="onSliderChange('n', this.value)" />
      </div>
    `;
  }

  if (exp === EXPERIMENTS.acidbase) {
    html += `
      <div class="slider-group">
        <div class="slider-label">
          <span class="slider-name">HCl Volume (V₁)</span>
          <span class="slider-val" id="val-acid">${exp.state.acidVolume} mL</span>
        </div>
        <input type="range" min="5" max="50" step="1"
          value="${exp.state.acidVolume}"
          oninput="onSliderChange('acid', this.value)" />
      </div>
      <div class="slider-group">
        <div class="slider-label">
          <span class="slider-name">Concentration (M)</span>
          <span class="slider-val" id="val-conc">${exp.state.concentration} mol/L</span>
        </div>
        <input type="range" min="0.01" max="1.0" step="0.01"
          value="${exp.state.concentration}"
          oninput="onSliderChange('conc', this.value)" />
      </div>
      <div class="results-panel" style="margin-top:0.5rem">
        <div class="results-title">pH Meter</div>
        <div style="font-family:var(--font-display);font-size:2rem;text-align:center;color:var(--clr-primary);padding:0.5rem 0" id="ph-display">
          pH: ${exp.state.pH.toFixed(2)}
        </div>
        <div style="width:100%;height:8px;background:linear-gradient(to right,#ff0000,#ff7700,#ffff00,#00ff00,#0000ff);border-radius:4px;position:relative">
          <div id="ph-indicator" style="position:absolute;top:-4px;width:16px;height:16px;background:white;border-radius:50%;border:2px solid #000;transform:translateX(-50%);left:${(exp.state.pH / 14) * 100}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:var(--clr-text-muted);margin-top:0.3rem">
          <span>0</span><span>7</span><span>14</span>
        </div>
      </div>
    `;
  }

  // Steps list
  html += '<div class="steps-list" style="margin-top:var(--space-sm)">';
  exp.steps.forEach((step, i) => {
    const cls = i < exp.state.currentStep ? 'done' : (i === exp.state.currentStep ? 'active' : '');
    html += `
      <div class="step-item ${cls}" id="step-${i}">
        <div class="step-num">${i < exp.state.currentStep ? '✓' : i + 1}</div>
        <div class="step-text">${step.text}</div>
      </div>
    `;
  });
  html += '</div>';

  // Results
  html += '<div class="results-panel" id="results-panel" style="margin-top:var(--space-sm)">';
  html += '<div class="results-title">📊 Results</div>';
  const results = exp.getResults();
  Object.entries(results).forEach(([k, v]) => {
    html += `<div class="result-row"><span class="result-label">${k}</span><span class="result-value">${v}</span></div>`;
  });
  html += '</div>';

  body.innerHTML = html;
}

// =====================================================
// SLIDER HANDLERS
// =====================================================
function onSliderChange(type, value) {
  if (!currentExperiment) return;
  const v = parseFloat(value);

  if (currentExperiment === EXPERIMENTS.pendulum) {
    if (type === 'length') {
      currentExperiment.setLength(v);
      const el = document.getElementById('val-length');
      if (el) el.textContent = `${v.toFixed(1)} m`;
    }
    if (type === 'gravity') {
      currentExperiment.state.gravity = v;
      currentExperiment._computePeriod();
      const el = document.getElementById('val-gravity');
      if (el) el.textContent = `${v.toFixed(1)} m/s²`;
    }
  }

  if (currentExperiment === EXPERIMENTS.prism) {
    if (type === 'angle') {
      currentExperiment.state.incidentAngle = v;
      const el = document.getElementById('val-angle');
      if (el) el.textContent = `${v}°`;
    }
    if (type === 'n') {
      currentExperiment.state.refractiveIndex = v;
      const el = document.getElementById('val-n');
      if (el) el.textContent = v;
    }
  }

  if (currentExperiment === EXPERIMENTS.acidbase) {
    if (type === 'acid') {
      currentExperiment.state.acidVolume = v;
      currentExperiment.state.neutralisationPoint = v;
      const el = document.getElementById('val-acid');
      if (el) el.textContent = `${v} mL`;
    }
    if (type === 'conc') {
      currentExperiment.state.concentration = v;
      const el = document.getElementById('val-conc');
      if (el) el.textContent = `${v} mol/L`;
    }
  }

  updateResultsDisplay();
}

// =====================================================
// EXPERIMENT CONTROLS
// =====================================================
function startExperiment() {
  if (!currentExperiment) return;
  currentExperiment.start();
  showToast(`▶ ${currentExperiment.name} started!`, 'success');
}

function resetExperiment() {
  if (!currentExperiment) return;
  currentExperiment.reset();
  renderExperimentPanel(currentExperiment);
  showToast('↺ Experiment reset.', 'info');
}

function nextStep() {
  if (!currentExperiment) return;
  const s = currentExperiment.state;
  if (s.currentStep < currentExperiment.steps.length - 1) {
    s.currentStep++;
    renderExperimentPanel(currentExperiment);
    showToast(`Step ${s.currentStep + 1}: ${currentExperiment.steps[s.currentStep].text}`, 'info', 4000);
  } else {
    showToast('✅ All steps complete! Mark experiment done.', 'success');
  }
}

function markComplete() {
  if (!currentExperiment) return;
  const progress = loadProgress('completed') || [];
  const entry = {
    id: Date.now(),
    name: currentExperiment.name,
    subject: currentExperiment.subject,
    date: new Date().toISOString()
  };
  progress.push(entry);
  saveProgress('completed', progress);
  showToast('🏆 Experiment marked as complete! Badge earned.', 'success', 4000);

  // Also POST to backend if available
  apiPost('/experiments/complete', entry).catch(() => {});
}

// =====================================================
// VR MODE
// =====================================================
function toggleVRMode() {
  vrMode = !vrMode;
  const threejsCanvas = document.getElementById('lab-canvas');
  const vrContainer = document.getElementById('vr-scene-container');
  const vrBtn = document.getElementById('vr-toggle');

  if (vrMode) {
    threejsCanvas.style.display = 'none';
    vrContainer.style.display = 'block';
    vrBtn.textContent = '🖥 Exit VR';
    vrBtn.style.borderColor = 'var(--clr-secondary)';
    vrBtn.style.color = 'var(--clr-secondary)';
    showToast('🥽 VR Mode active! Look around with your device.', 'success');
  } else {
    threejsCanvas.style.display = 'block';
    vrContainer.style.display = 'none';
    vrBtn.textContent = '🥽 Enter VR';
    vrBtn.style.borderColor = 'var(--clr-accent)';
    vrBtn.style.color = 'var(--clr-accent)';
  }
}

// =====================================================
// UTILITY ACTIONS
// =====================================================
function takeScreenshot() {
  renderer.render(scene, camera);
  const link = document.createElement('a');
  link.href = renderer.domElement.toDataURL('image/png');
  link.download = `vsl-${currentExperiment?.name || 'screenshot'}-${Date.now()}.png`;
  link.click();
  showToast('📷 Screenshot saved!', 'success');
}

function toggleFullscreen() {
  const el = document.getElementById('canvas-area');
  if (!document.fullscreenElement) {
    el.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function submitExperiment(e) {
  e.preventDefault();
  showToast('✅ Experiment saved & published!', 'success');
}

// =====================================================
// UPDATE LIVE RESULTS DISPLAY
// =====================================================
function updateResultsDisplay() {
  if (!currentExperiment) return;
  const panel = document.getElementById('results-panel');
  if (!panel) return;

  const results = currentExperiment.getResults();
  const rows = panel.querySelectorAll('.result-row');
  const entries = Object.entries(results);

  rows.forEach((row, i) => {
    if (entries[i]) {
      const valEl = row.querySelector('.result-value');
      if (valEl) valEl.textContent = entries[i][1];
    }
  });

  // Update pH display if acid-base experiment
  if (currentExperiment === EXPERIMENTS.acidbase) {
    const phDisplay = document.getElementById('ph-display');
    if (phDisplay) phDisplay.textContent = `pH: ${currentExperiment.state.pH.toFixed(2)}`;

    const phInd = document.getElementById('ph-indicator');
    if (phInd) phInd.style.left = `${(currentExperiment.state.pH / 14) * 100}%`;
  }
}

// =====================================================
// RENDER LOOP
// =====================================================
function startRenderLoop() {
  if (animFrameId) cancelAnimationFrame(animFrameId);

  function loop() {
    animFrameId = requestAnimationFrame(loop);

    const dt = Math.min(clock.getDelta(), 0.05); // cap delta to 50ms

    // Update current experiment physics
    if (currentExperiment) {
      currentExperiment.update(dt);

      // Update live results every ~0.5s
      if (Math.floor(clock.getElapsedTime() * 2) % 2 === 0) {
        updateResultsDisplay();
      }
    }

    // Gentle camera sway
    camera.position.y += Math.sin(clock.getElapsedTime() * 0.5) * 0.0005;

    renderer.render(scene, camera);
  }
  loop();
}

// =====================================================
// INIT
// =====================================================
window.addEventListener('DOMContentLoaded', () => {
  initRenderer();

  // Load experiment from URL param or default to pendulum
  const expParam = getQueryParam('exp') || 'pendulum';
  switchExperiment(expParam);

  // Low bandwidth banner
  if (isLowBandwidth()) {
    showToast('🌐 Low bandwidth mode active – reduced graphics quality.', 'info', 5000);
  }
});
