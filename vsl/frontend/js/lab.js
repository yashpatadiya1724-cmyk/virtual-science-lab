/* ============================================
   lab.js — Main Lab Orchestrator
   Three.js renderer + experiment manager + VR
   ============================================ */
'use strict';

let renderer, scene, camera, clock;
let curExp = null, animId = null, vrActive = false;

const EXPS = {
  pendulum: window.PendulumExp,
  prism:    window.PrismExp,
  acidbase: window.AcidBaseExp
};

// ===================== INIT THREE.JS =====================
function initRenderer() {
  const canvas    = document.getElementById('lab-canvas');
  const container = document.getElementById('lab-canvas-area');

  renderer = new THREE.WebGLRenderer({ canvas, antialias:!isLowBW(), alpha:false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowBW()?1:2));
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setClearColor(0x020810, 1);

  scene  = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020810, 0.04);

  camera = new THREE.PerspectiveCamera(55, container.offsetWidth/container.offsetHeight, 0.1, 100);
  camera.position.set(0,1,9);

  clock = new THREE.Clock();

  window.addEventListener('resize', () => {
    const W=container.offsetWidth, H=container.offsetHeight;
    camera.aspect=W/H; camera.updateProjectionMatrix();
    renderer.setSize(W,H);
  });
}

// ===================== SWITCH EXPERIMENT =====================
function switchExp(id) {
  if (curExp) { curExp.cleanup(scene); if(animId) cancelAnimationFrame(animId); }
  while (scene.children.length) scene.remove(scene.children[0]);

  curExp = EXPS[id];
  if (!curExp) return;

  curExp.build(scene, THREE);

  // Update UI labels
  document.getElementById('nav-title').textContent  = curExp.name;
  document.getElementById('panel-name').textContent = '🔬 ' + curExp.name.toUpperCase();
  document.getElementById('panel-class').textContent= `${curExp.subject} – ${curExp.classLevel}`;

  // Active tab
  document.querySelectorAll('.exp-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.exp-tab').forEach(b => {
    const t = b.textContent.toLowerCase();
    if ((id==='pendulum'&&t.includes('pendulum'))||(id==='prism'&&t.includes('prism'))||(id==='acidbase'&&t.includes('acid')))
      b.classList.add('active');
  });

  // Camera position per experiment
  const camPos = { pendulum:[0,1.5,9], prism:[0,0,9], acidbase:[0,0.5,8] };
  camera.position.set(...(camPos[id]||[0,1,9]));
  camera.lookAt(0,0,0);

  renderPanel();
  startLoop();

  setTimeout(()=>{ const l=document.getElementById('lab-loader'); if(l) l.classList.add('gone'); }, 700);
}

// ===================== PANEL RENDER =====================
function renderPanel() {
  if (!curExp) return;
  const body = document.getElementById('panel-body');
  let html = '';

  // Sliders per experiment
  if (curExp === EXPS.pendulum) {
    html += slider('String Length (L)', 'length', 0.5, 4, 0.1, curExp.state.length, 'm');
    html += slider('Gravity (g)', 'gravity', 1.6, 24.8, 0.1, curExp.state.gravity, 'm/s²');
  }
  if (curExp === EXPS.prism) {
    html += slider('Incident Angle (i)', 'iangle', 10, 80, 1, curExp.state.incidentAngle, '°');
    html += slider('Refractive Index (n)', 'rindex', 1.3, 2.5, 0.01, curExp.state.refractiveIndex, '');
  }
  if (curExp === EXPS.acidbase) {
    html += slider('HCl Volume (V₁)', 'acidvol', 5, 50, 1, curExp.state.acidVol, ' mL');
    html += slider('Concentration (M)', 'conc', 0.01, 1.0, 0.01, curExp.state.conc, ' mol/L');
    html += `<div class="results-box" style="margin-top:0.6rem">
      <div class="results-title">pH Meter</div>
      <div id="ph-num" style="font-family:var(--font-hd);font-size:1.8rem;text-align:center;color:var(--primary);padding:0.3rem 0">
        pH: ${curExp.state.pH.toFixed(2)}</div>
      <div class="ph-bar-wrap"><div class="ph-dot" id="ph-dot" style="left:${(curExp.state.pH/14)*100}%"></div></div>
      <div class="ph-labels"><span>0</span><span>Acid</span><span>7</span><span>Base</span><span>14</span></div>
    </div>`;
  }

  // Steps
  html += '<div class="steps-list">';
  curExp.steps.forEach((st,i) => {
    const s = curExp.state;
    const cls = i<s.currentStep ? 'done' : i===s.currentStep ? 'active' : '';
    html += `<div class="step-row ${cls}">
      <div class="step-dot">${i<s.currentStep?'✓':i+1}</div>
      <div class="step-txt">${st.text}</div>
    </div>`;
  });
  html += '</div>';

  // Results
  html += '<div class="results-box" id="results-box" style="margin-top:0.8rem"><div class="results-title">📊 Results</div>';
  Object.entries(curExp.getResults()).forEach(([k,v])=>{
    html += `<div class="result-row"><span class="r-lbl">${k}</span><span class="r-val" id="rv-${k.replace(/\W/g,'')}">${v}</span></div>`;
  });
  html += '</div>';

  body.innerHTML = html;
}

function slider(label, id, min, max, step, val, unit) {
  return `<div class="slider-grp">
    <div class="slider-row">
      <span class="slider-lbl">${label}</span>
      <span class="slider-val" id="sv-${id}">${val}${unit}</span>
    </div>
    <input type="range" min="${min}" max="${max}" step="${step}" value="${val}"
      oninput="onSlider('${id}',this.value,'${unit}')" />
  </div>`;
}

// ===================== SLIDER HANDLER =====================
function onSlider(id, val, unit) {
  const v = parseFloat(val);
  const el = document.getElementById('sv-'+id);
  if (el) el.textContent = v + unit;

  if (curExp === EXPS.pendulum) {
    if (id==='length') curExp.setLength(v);
    if (id==='gravity') { curExp.state.gravity=v; curExp._calcPeriod(); }
  }
  if (curExp === EXPS.prism) {
    if (id==='iangle') curExp.state.incidentAngle=v;
    if (id==='rindex') curExp.state.refractiveIndex=v;
  }
  if (curExp === EXPS.acidbase) {
    if (id==='acidvol') { curExp.state.acidVol=v; curExp.state.eqPoint=v; }
    if (id==='conc') curExp.state.conc=v;
  }
  updateResults();
}

// ===================== CONTROLS =====================
function startExp() { curExp?.start(); showToast('▶ Experiment started!','success'); }
function resetExp() { curExp?.reset(); renderPanel(); showToast('↺ Reset.','info'); }
function nextStep() {
  if (!curExp) return;
  const s=curExp.state;
  if (s.currentStep<curExp.steps.length-1) {
    s.currentStep++;
    renderPanel();
    showToast(`Step ${s.currentStep+1}: ${curExp.steps[s.currentStep].text}`,'info',4000);
  } else showToast('✅ All steps done! Mark complete.','success');
}
function markDone() {
  if (!curExp) return;
  const saved=loadLS('completed')||[];
  saved.push({name:curExp.name,subject:curExp.subject,date:new Date().toISOString()});
  saveLS('completed',saved);
  showToast('🏆 Marked complete! Badge earned.','success',4000);
  apiPost('/experiments/complete',{name:curExp.name}).catch(()=>{});
}

// ===================== LIVE RESULT UPDATE =====================
function updateResults() {
  if (!curExp) return;
  const res = curExp.getResults();
  Object.entries(res).forEach(([k,v])=>{
    const el=document.getElementById('rv-'+k.replace(/\W/g,''));
    if(el) el.textContent=v;
  });
  // pH bar update
  if (curExp===EXPS.acidbase) {
    const pn=document.getElementById('ph-num');
    const pd=document.getElementById('ph-dot');
    if(pn) pn.textContent=`pH: ${curExp.state.pH.toFixed(2)}`;
    if(pd) pd.style.left=`${(curExp.state.pH/14)*100}%`;
  }
}

// ===================== VR =====================
function toggleVR() {
  vrActive=!vrActive;
  const canvas=document.getElementById('lab-canvas');
  const vrc=document.getElementById('vr-container');
  const btn=document.getElementById('vr-toggle-nav');
  if (vrActive) {
    canvas.style.display='none'; vrc.style.display='block';
    if(btn){btn.textContent='🖥 Exit VR';btn.style.color='var(--orange)';}
    showToast('🥽 VR Mode active!','success');
  } else {
    canvas.style.display='block'; vrc.style.display='none';
    if(btn){btn.textContent='🥽 VR Mode';btn.style.color='var(--green)';}
  }
}

// ===================== UTILS =====================
function doScreenshot() {
  renderer.render(scene,camera);
  const a=document.createElement('a');
  a.href=renderer.domElement.toDataURL('image/png');
  a.download=`vsl-${Date.now()}.png`;
  a.click();
  showToast('📷 Screenshot saved!','success');
}
function toggleFull() {
  const el=document.getElementById('lab-canvas-area');
  !document.fullscreenElement ? el.requestFullscreen?.() : document.exitFullscreen?.();
}

// ===================== RENDER LOOP =====================
function startLoop() {
  if (animId) cancelAnimationFrame(animId);
  let tick2 = 0;
  function loop() {
    animId=requestAnimationFrame(loop);
    const dt=Math.min(clock.getDelta(),0.05);
    curExp?.update(dt);
    camera.position.y+=Math.sin(clock.getElapsedTime()*0.5)*0.0004;
    tick2+=dt;
    if (tick2>0.25) { updateResults(); tick2=0; }
    renderer.render(scene,camera);
  }
  loop();
}

// ===================== BOOT =====================
window.addEventListener('DOMContentLoaded', ()=>{
  initRenderer();
  const exp=getParam('exp')||'pendulum';
  switchExp(exp);
  if (getParam('mode')==='vr') setTimeout(toggleVR,1000);
  if (isLowBW()) showToast('🌐 Low bandwidth mode active.','info',5000);
});
