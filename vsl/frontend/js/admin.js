/* ============================================
   admin.js — Teacher/Admin Panel
   ============================================ */
'use strict';

const EXP_DATA=[
  {name:'Simple Pendulum',     sub:'Physics',   cls:'Class 9',  dur:15, status:'active', sessions:142, score:87},
  {name:'Prism Refraction',    sub:'Physics',   cls:'Class 10', dur:20, status:'active', sessions:118, score:82},
  {name:'Acid-Base Titration', sub:'Chemistry', cls:'Class 11', dur:25, status:'active', sessions:96,  score:79},
  {name:"Ohm's Law",           sub:'Physics',   cls:'Class 9',  dur:15, status:'active', sessions:88,  score:91},
  {name:'Photosynthesis',      sub:'Biology',   cls:'Class 8',  dur:20, status:'draft',  sessions:0,   score:0},
  {name:'Electromagnetic Induction',sub:'Physics',cls:'Class 12',dur:30,status:'active',sessions:64,  score:74}
];

const STU_DATA=[
  {name:'Arjun Kumar', cls:'Class 10',done:7, last:'2024-01-15',score:82},
  {name:'Priya Singh',  cls:'Class 9', done:5, last:'2024-01-14',score:91},
  {name:'Ravi Sharma',  cls:'Class 11',done:12,last:'2024-01-15',score:76},
  {name:'Meena Patel',  cls:'Class 10',done:3, last:'2024-01-10',score:88},
  {name:'Suresh Yadav', cls:'Class 9', done:6, last:'2024-01-13',score:79},
  {name:'Anita Rajput', cls:'Class 12',done:15,last:'2024-01-15',score:94}
];

const USAGE=[45,62,88,103,97,30,12];

function showSec(id){
  document.querySelectorAll('[id^="sec-"]').forEach(s=>s.style.display='none');
  document.querySelectorAll('.sidebar-item').forEach(s=>s.classList.remove('active'));
  const sec=document.getElementById('sec-'+id);
  if(sec) sec.style.display='block';
  document.querySelectorAll('.sidebar-item').forEach(s=>{ if(s.getAttribute('onclick')?.includes(id)) s.classList.add('active'); });
}

function renderChart(){
  const el=document.getElementById('usage-chart'); if(!el) return;
  const mx=Math.max(...USAGE);
  el.innerHTML=USAGE.map(v=>`<div class="bar" style="height:${Math.max(8,(v/mx)*110)}px" title="${v} sessions"></div>`).join('');
}

function renderTopExp(){
  const tb=document.getElementById('top-exp-tbody'); if(!tb) return;
  const sorted=[...EXP_DATA].sort((a,b)=>b.sessions-a.sessions).slice(0,5);
  tb.innerHTML=sorted.map(e=>`<tr>
    <td style="color:var(--text);font-weight:500">${e.name}</td>
    <td><span class="pill ${e.sub.toLowerCase()}">${e.sub}</span></td>
    <td>${e.sessions}</td>
    <td>${e.score>0?e.score+'%':'—'}</td>
    <td><span class="pill ${e.status}">${e.status}</span></td>
  </tr>`).join('');
}

function renderExpTable(){
  const tb=document.getElementById('exp-tbody'); if(!tb) return;
  tb.innerHTML=EXP_DATA.map(e=>`<tr>
    <td style="color:var(--text);font-weight:500">${e.name}</td>
    <td><span class="pill ${e.sub.toLowerCase()}">${e.sub}</span></td>
    <td>${e.cls}</td>
    <td>${e.dur} min</td>
    <td><span class="pill ${e.status}">${e.status}</span></td>
    <td>
      <button onclick="showSec('add');showToast('Editing: ${e.name}','info')" style="color:var(--primary);background:none;border:none;cursor:pointer;font-size:0.8rem">Edit</button>
      <button onclick="delExp('${e.name}')" style="color:#ff4444;background:none;border:none;cursor:pointer;font-size:0.8rem;margin-left:0.5rem">Delete</button>
    </td>
  </tr>`).join('');
}

function renderStudents(){
  const tb=document.getElementById('students-tbody'); if(!tb) return;
  tb.innerHTML=STU_DATA.map(s=>`<tr>
    <td style="color:var(--text);font-weight:500">
      <div style="display:flex;align-items:center;gap:0.5rem">
        <div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--orange));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.72rem;color:var(--bg)">${s.name[0]}</div>
        ${s.name}
      </div>
    </td>
    <td>${s.cls}</td>
    <td>${s.done}</td>
    <td>${fmtDate(s.last)}</td>
    <td style="color:${s.score>=80?'var(--green)':s.score>=60?'var(--gold)':'var(--orange)'}">${s.score}%</td>
  </tr>`).join('');
}

function renderPopChart(){
  const el=document.getElementById('pop-chart'); if(!el) return;
  const sorted=[...EXP_DATA].sort((a,b)=>b.sessions-a.sessions).slice(0,5);
  const mx=sorted[0]?.sessions||1;
  el.innerHTML=sorted.map(e=>`<div>
    <div style="display:flex;justify-content:space-between;font-size:0.72rem;margin-bottom:3px">
      <span style="color:var(--muted)">${e.name}</span>
      <span style="color:var(--primary);font-family:var(--font-hd)">${e.sessions}</span>
    </div>
    <div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden">
      <div style="height:100%;width:${(e.sessions/mx)*100}%;background:linear-gradient(90deg,var(--primary),var(--green));border-radius:3px"></div>
    </div>
  </div>`).join('');
}

function renderSubDist(){
  const el=document.getElementById('sub-dist'); if(!el) return;
  const items=[
    {lbl:'Physics',   pct:60, col:'var(--primary)'},
    {lbl:'Chemistry', pct:30, col:'var(--orange)'},
    {lbl:'Biology',   pct:10, col:'var(--green)'}
  ];
  el.innerHTML=items.map(i=>`<div>
    <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:4px">
      <span>${i.lbl}</span><span style="font-family:var(--font-hd);color:${i.col}">${i.pct}%</span>
    </div>
    <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">
      <div style="height:100%;width:${i.pct}%;background:${i.col};border-radius:3px"></div>
    </div>
  </div>`).join('');
}

function delExp(name){
  if(confirm(`Delete "${name}"?`)){ showToast(`🗑 "${name}" deleted.`,'warning'); renderExpTable(); }
}
function saveExp(e){ e.preventDefault(); showToast('✅ Experiment published!','success'); showSec('experiments'); }

document.addEventListener('DOMContentLoaded',()=>{
  renderChart(); renderTopExp(); renderExpTable(); renderStudents(); renderPopChart(); renderSubDist();
});
