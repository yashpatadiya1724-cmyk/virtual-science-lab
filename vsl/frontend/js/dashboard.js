/* ============================================
   dashboard.js — Student Dashboard
   ============================================ */
'use strict';

const PROGRESS_DATA = [
  { name:'Simple Pendulum',   subject:'Physics',   pct:100, tag:'Completed' },
  { name:'Prism Refraction',  subject:'Physics',   pct:80,  tag:'In Progress' },
  { name:'Acid-Base Titration',subject:'Chemistry',pct:60,  tag:'In Progress' },
  { name:"Ohm's Law",         subject:'Physics',   pct:100, tag:'Completed' },
  { name:'Photosynthesis',    subject:'Biology',   pct:30,  tag:'Started' }
];

const DONE_DATA = [
  { icon:'⚖️', name:'Simple Pendulum',   date:'2024-01-15' },
  { icon:'⚡', name:"Ohm's Law",         date:'2024-01-12' },
  { icon:'🔭', name:'Convex Lens',       date:'2024-01-09' },
  { icon:'⚗️', name:'pH Indicators',     date:'2024-01-05' },
  { icon:'🧲', name:'Electromagnets',    date:'2024-01-02' }
];

const BADGES_DATA = [
  { em:'🏆', nm:'First Experiment', dc:'Completed your first lab' },
  { em:'🔬', nm:'Science Star',     dc:'5 experiments done' },
  { em:'⚡', nm:'Physics Whiz',     dc:'3 physics experiments' }
];

const REC_DATA = [
  { ico:'🌊', ttl:'Waves & Sound',  sub:'Physics',   exp:'sound' },
  { ico:'🔋', ttl:'Electrolysis',   sub:'Chemistry', exp:'electrolysis' },
  { ico:'🌱', ttl:'Osmosis',        sub:'Biology',   exp:'osmosis' }
];

function renderProgress() {
  const el=document.getElementById('prog-list'); if(!el) return;
  const stored=loadLS('completed')||[];
  el.innerHTML=PROGRESS_DATA.map(item=>{
    const done=stored.some(s=>s.name===item.name);
    const pct=done?100:item.pct;
    const sub=done?'Completed':item.tag;
    const colDone=pct===100?'background:linear-gradient(90deg,var(--primary),var(--green))':'';
    return `<div class="prog-row">
      <div>
        <div class="prog-name">${item.name} <span class="exp-tag ${item.subject.toLowerCase()}" style="font-size:0.62rem;padding:0.12rem 0.45rem;margin-left:0.3rem">${item.subject}</span></div>
        <div class="prog-track"><div class="prog-fill" style="width:${pct}%;${colDone}"></div></div>
        <div class="prog-sub">${sub}</div>
      </div>
      <span class="prog-pct" style="${pct===100?'color:var(--green)':''}">${pct}%</span>
    </div>`;
  }).join('');
}

function renderDone() {
  const el=document.getElementById('done-list'); if(!el) return;
  const stored=(loadLS('completed')||[]).map(s=>({icon:'✅',name:s.name,date:s.date}));
  const all=[...stored,...DONE_DATA].slice(0,8);
  el.innerHTML=all.map(i=>`<div class="done-row"><span class="icon">${i.icon}</span><span class="name">${i.name}</span><span class="date">${fmtDate(i.date)}</span></div>`).join('');
}

function renderBadges() {
  const el=document.getElementById('badges-wrap'); if(!el) return;
  el.innerHTML=BADGES_DATA.map(b=>`<div class="badge-card"><div class="em">${b.em}</div><div class="nm">${b.nm}</div><div class="dc">${b.dc}</div></div>`).join('');
}

function renderRec() {
  const el=document.getElementById('rec-list'); if(!el) return;
  el.innerHTML=REC_DATA.map(r=>`<div class="rec-row" onclick="location.href='lab.html?exp=${r.exp}'">
    <div class="ico">${r.ico}</div>
    <div class="info"><div class="ttl">${r.ttl}</div><div class="sub">${r.sub}</div></div>
    <div class="arr">→</div>
  </div>`).join('');
}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.stat-card .big').forEach(el=>{
    const v=el.textContent.replace(/[^0-9.]/g,'');
    if(v) animateCounter(el,parseFloat(v));
  });
  renderProgress(); renderDone(); renderBadges(); renderRec();

  // Try fetch from API
  apiGet('/students/me').then(d=>{ if(!d) return; if(d.user?.name){ document.getElementById('user-name').textContent=`Welcome back, ${d.user.name}!`; document.getElementById('user-avatar').textContent=d.user.name[0]; } });
});
