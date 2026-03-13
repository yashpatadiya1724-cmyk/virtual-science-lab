/* ============================================
   home.js — Homepage Three.js + GSAP
   ============================================ */
'use strict';

// Navbar scroll
window.addEventListener('scroll', ()=>{
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY>40);
});

// ===================== HERO 3D SCENE =====================
(function heroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const W = canvas.parentElement.offsetWidth;
  const H = canvas.parentElement.offsetHeight || window.innerHeight;

  const rdr = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  rdr.setSize(W,H); rdr.setPixelRatio(Math.min(devicePixelRatio,2));

  const s = new THREE.Scene();
  const c = new THREE.PerspectiveCamera(60,W/H,0.1,100);
  c.position.set(0,0,12);

  s.add(new THREE.AmbientLight(0x112233,1.5));
  const p1=new THREE.PointLight(0x00c8ff,3,30); p1.position.set(5,5,5); s.add(p1);
  const p2=new THREE.PointLight(0xff6b35,2,20); p2.position.set(-5,-3,3); s.add(p2);

  // Particles
  const N = isLowBW()?200:550;
  const pGeo=new THREE.BufferGeometry();
  const pPos=new Float32Array(N*3);
  for(let i=0;i<N*3;i++) pPos[i]=(Math.random()-0.5)*28;
  pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
  const pts=new THREE.Points(pGeo,new THREE.PointsMaterial({color:0x00c8ff,size:0.06,transparent:true,opacity:0.45}));
  s.add(pts);

  // Atom builder
  function atom(x,y,z,col=0x00c8ff) {
    const g=new THREE.Group(); g.position.set(x,y,z);
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.28,16,16),new THREE.MeshPhongMaterial({color:col,emissive:col,emissiveIntensity:0.3})));
    g.userData.electrons=[];
    for(let i=0;i<3;i++){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(0.65+i*0.1,0.015,8,56),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.4}));
      ring.rotation.x=deg2rad(60*i); ring.rotation.y=deg2rad(30*i);
      g.add(ring);
      const el=new THREE.Mesh(new THREE.SphereGeometry(0.07,8,8),new THREE.MeshBasicMaterial({color:0xffffff}));
      el.userData={r:0.65+i*0.1,spd:1+i*0.5,angle:Math.random()*Math.PI*2,ring};
      g.add(el); g.userData.electrons.push(el);
    }
    return g;
  }

  const atoms=[atom(4,1,-2),atom(-4,-1,-1,0xff6b35),atom(2,-2.5,-3,0x39ff14),atom(-2,2,-4,0xffd700)];
  atoms.forEach(a=>s.add(a));

  // Prism
  const prism=new THREE.Mesh(new THREE.ConeGeometry(0.5,1.2,3),new THREE.MeshPhongMaterial({color:0x88ccff,transparent:true,opacity:0.6,shininess:200}));
  prism.position.set(6,0,-3); s.add(prism);

  // Flask
  const flask=new THREE.Group();
  const fm=new THREE.MeshPhongMaterial({color:0x39ff14,transparent:true,opacity:0.5});
  flask.add(new THREE.Mesh(new THREE.SphereGeometry(0.4,16,16),fm));
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.15,0.5,12),fm); neck.position.y=0.45; flask.add(neck);
  flask.position.set(-6,0.5,-2); s.add(flask);

  let mx=0,my=0;
  document.addEventListener('mousemove',e=>{ mx=(e.clientX/window.innerWidth-0.5)*2; my=-(e.clientY/window.innerHeight-0.5)*2; });

  let t=0;
  (function loop(){
    requestAnimationFrame(loop); t+=0.01;
    pts.rotation.y+=0.0005; pts.rotation.x+=0.0002;
    atoms.forEach((a,i)=>{
      a.rotation.y+=0.003*(i%2?1:-1); a.position.y+=Math.sin(t+i)*0.003;
      a.userData.electrons.forEach(el=>{ el.userData.angle+=0.02*el.userData.spd; el.position.x=Math.cos(el.userData.angle)*el.userData.r; el.position.z=Math.sin(el.userData.angle)*el.userData.r; });
    });
    prism.rotation.y+=0.01; prism.position.y=Math.sin(t*0.5)*0.3;
    flask.position.y=0.5+Math.sin(t*0.7)*0.15; flask.rotation.z=Math.sin(t*0.4)*0.1;
    c.position.x+=(mx*2-c.position.x)*0.03; c.position.y+=(my-c.position.y)*0.03; c.lookAt(0,0,0);
    rdr.render(s,c);
  })();

  window.addEventListener('resize',()=>{ const W2=canvas.parentElement.offsetWidth,H2=canvas.parentElement.offsetHeight||window.innerHeight; c.aspect=W2/H2; c.updateProjectionMatrix(); rdr.setSize(W2,H2); });
})();

// ===================== MINI PREVIEWS =====================
function miniPendulum(containerId) {
  const el=document.getElementById(containerId); if(!el) return;
  const cv=document.createElement('canvas'); cv.style.cssText='width:100%;height:100%'; el.appendChild(cv);
  const W=el.offsetWidth||300, H=el.offsetHeight||175;
  const r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:false}); r.setSize(W,H);
  const s=new THREE.Scene(), c=new THREE.PerspectiveCamera(60,W/H,0.1,50); c.position.set(0,0,5);
  s.add(new THREE.AmbientLight(0x224488,2));
  s.add(Object.assign(new THREE.PointLight(0x00c8ff,3,20),{position:{x:3,y:3,z:3}}));
  const pivot=new THREE.Group(); pivot.position.y=1.5; s.add(pivot);
  pivot.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,2.5,8),new THREE.MeshBasicMaterial({color:0x888888})),{position:{x:0,y:-0.5,z:0}}));
  const bob=new THREE.Mesh(new THREE.SphereGeometry(0.32,16,16),new THREE.MeshPhongMaterial({color:0xff6b35,emissive:0xff2200,emissiveIntensity:0.2,shininess:80}));
  bob.position.y=-1.75; pivot.add(bob);
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(2,0.1,0.1),new THREE.MeshBasicMaterial({color:0x334455})),{position:{x:0,y:1.6,z:0}}));
  let t=0; (function lp(){requestAnimationFrame(lp);t+=0.025;pivot.rotation.z=Math.sin(t)*0.5;r.render(s,c);})();
}

function miniPrism(containerId) {
  const el=document.getElementById(containerId); if(!el) return;
  const cv=document.createElement('canvas'); cv.style.cssText='width:100%;height:100%'; el.appendChild(cv);
  const W=el.offsetWidth||300, H=el.offsetHeight||175;
  const r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:false}); r.setSize(W,H);
  const s=new THREE.Scene(), c=new THREE.PerspectiveCamera(50,W/H,0.1,50); c.position.set(0,0,5);
  s.add(new THREE.AmbientLight(0x112244,2)); s.add(new THREE.PointLight(0xffffff,4,20));
  const prism=new THREE.Mesh(new THREE.ConeGeometry(1,1.5,3),new THREE.MeshPhongMaterial({color:0x88ccff,transparent:true,opacity:0.7,shininess:200}));
  prism.rotation.x=Math.PI/2; s.add(prism);
  [0xff0000,0xff7700,0xffff00,0x00ff00,0x0000ff,0x8800ff].forEach((col,i)=>{
    const ray=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,2.5,6),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.8}));
    ray.rotation.z=Math.PI/2; ray.position.set(2,(i-2.5)*0.15,0); s.add(ray);
  });
  let t=0; (function lp(){requestAnimationFrame(lp);t+=0.01;prism.rotation.z=t;c.position.x=Math.sin(t*0.3)*0.5;c.lookAt(0,0,0);r.render(s,c);})();
}

function miniAcid(containerId) {
  const el=document.getElementById(containerId); if(!el) return;
  const cv=document.createElement('canvas'); cv.style.cssText='width:100%;height:100%'; el.appendChild(cv);
  const W=el.offsetWidth||300, H=el.offsetHeight||175;
  const r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:false}); r.setSize(W,H);
  const s=new THREE.Scene(), c=new THREE.PerspectiveCamera(50,W/H,0.1,50); c.position.set(0,0,6);
  s.add(new THREE.AmbientLight(0x112233,2)); s.add(new THREE.PointLight(0x39ff14,4,20));
  [[−1.2,0xff4444],[1.2,0x4444ff]].forEach(([x,col])=>{
    const g=new THREE.Group(); g.position.x=x;
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.45,1.5,16,1,true),new THREE.MeshPhongMaterial({color:0x88ccff,transparent:true,opacity:0.3,side:THREE.DoubleSide})));
    const liq=new THREE.Mesh(new THREE.CylinderGeometry(0.44,0.4,0.8,16),new THREE.MeshPhongMaterial({color:col,transparent:true,opacity:0.7,emissive:col,emissiveIntensity:0.15}));
    liq.position.y=-0.35; g.add(liq); s.add(g);
  });
  const bubbles=[];
  for(let i=0;i<10;i++){
    const b=new THREE.Mesh(new THREE.SphereGeometry(0.04+Math.random()*0.04,6,6),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.55}));
    b.position.set((Math.random()-0.5)*0.8,-0.5+Math.random()*0.5,0); b.userData.spd=0.012+Math.random()*0.02; b.userData.sy=b.position.y;
    s.add(b); bubbles.push(b);
  }
  (function lp(){requestAnimationFrame(lp);bubbles.forEach(b=>{b.position.y+=b.userData.spd;b.material.opacity=Math.max(0,0.55-(b.position.y-b.userData.sy)*0.5);if(b.position.y>1)b.position.y=b.userData.sy;});r.render(s,c);})();
}

function vrGlobe(containerId) {
  const el=document.getElementById(containerId); if(!el) return;
  const cv=document.createElement('canvas'); cv.style.cssText='width:100%;height:100%'; el.appendChild(cv);
  const W=el.offsetWidth||400, H=el.offsetHeight||380;
  const r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true}); r.setSize(W,H);
  const s=new THREE.Scene(), c=new THREE.PerspectiveCamera(60,W/H,0.1,100); c.position.set(0,0,5);
  s.add(new THREE.AmbientLight(0x112233,2));
  const pl=new THREE.PointLight(0x00c8ff,5,20); pl.position.set(3,3,3); s.add(pl);
  const head=new THREE.Group();
  head.add(new THREE.Mesh(new THREE.BoxGeometry(2,1.2,0.8),new THREE.MeshPhongMaterial({color:0x0a1628,shininess:100})));
  [-0.45,0.45].forEach(x=>{ const lens=new THREE.Mesh(new THREE.CircleGeometry(0.3,32),new THREE.MeshPhongMaterial({color:0x00c8ff,transparent:true,opacity:0.8,emissive:0x00c8ff,emissiveIntensity:0.4})); lens.position.set(x,0,0.41); head.add(lens); });
  const strap=new THREE.Mesh(new THREE.TorusGeometry(1.2,0.05,8,32,Math.PI),new THREE.MeshPhongMaterial({color:0x334455})); strap.rotation.x=Math.PI/2; head.add(strap);
  const glow=new THREE.Mesh(new THREE.TorusGeometry(1.5,0.02,8,64),new THREE.MeshBasicMaterial({color:0x00c8ff,transparent:true,opacity:0.3})); head.add(glow);
  s.add(head);
  const pGeo=new THREE.BufferGeometry(), pPos=new Float32Array(150*3);
  for(let i=0;i<450;i++) pPos[i]=(Math.random()-0.5)*8;
  pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
  s.add(new THREE.Points(pGeo,new THREE.PointsMaterial({color:0x00c8ff,size:0.04,transparent:true,opacity:0.4})));
  let t=0;(function lp(){requestAnimationFrame(lp);t+=0.01;head.rotation.y=Math.sin(t*0.5)*0.4;head.position.y=Math.sin(t)*0.15;glow.rotation.z=t;r.render(s,c);})();
}

// ===================== COUNTER ANIMATIONS =====================
const obs=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){animateCounter(e.target,parseInt(e.target.dataset.target));obs.unobserve(e.target);}
}),{threshold:0.5});
document.querySelectorAll('.stat-num[data-target]').forEach(el=>obs.observe(el));

// ===================== SCROLL REVEAL =====================
const revObs=new IntersectionObserver(entries=>entries.forEach((e,i)=>{
  if(e.isIntersecting){setTimeout(()=>e.target.classList.add('visible'),i*100);revObs.unobserve(e.target);}
}),{threshold:0.1});
document.querySelectorAll('[data-animate]').forEach(el=>revObs.observe(el));

// ===================== INIT PREVIEWS =====================
window.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    miniPendulum('prev-pendulum');
    miniPrism('prev-prism');
    miniAcid('prev-acid');
    vrGlobe('vr-globe');
  },120);
});
