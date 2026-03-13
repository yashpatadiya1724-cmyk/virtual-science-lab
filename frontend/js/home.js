/**
 * Virtual Science Lab – Home Page JS
 * Three.js hero canvas + GSAP animations
 */

'use strict';

// =====================================================
// NAVBAR scroll effect
// =====================================================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// =====================================================
// HERO 3D SCENE – Three.js floating atoms & molecules
// =====================================================
(function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const W = canvas.parentElement.offsetWidth;
  const H = canvas.parentElement.offsetHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
  camera.position.set(0, 0, 12);

  // Lighting
  const ambient = new THREE.AmbientLight(0x112233, 1.5);
  scene.add(ambient);
  const point1 = new THREE.PointLight(0x00c8ff, 3, 30);
  point1.position.set(5, 5, 5);
  scene.add(point1);
  const point2 = new THREE.PointLight(0xff6b35, 2, 20);
  point2.position.set(-5, -3, 3);
  scene.add(point2);

  // ---- Floating Particles ----
  const particleGeo = new THREE.BufferGeometry();
  const N = isLowBandwidth() ? 200 : 600;
  const positions = new Float32Array(N * 3);
  for (let i = 0; i < N * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 30;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x00c8ff,
    size: 0.06,
    transparent: true,
    opacity: 0.5
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ---- Atom Model: central nucleus + orbiting electrons ----
  function createAtom(x, y, z, color = 0x00c8ff) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Nucleus
    const nucleusMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 16),
      new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.3 })
    );
    group.add(nucleusMesh);

    // Orbit rings
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(0.7 + i * 0.1, 0.015, 8, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = degToRad(60 * i);
      ring.rotation.y = degToRad(30 * i);
      group.add(ring);

      // Electron
      const electronMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      electronMesh.userData = { orbitRadius: 0.7 + i * 0.1, speed: 1 + i * 0.5, ring, angle: Math.random() * Math.PI * 2 };
      group.add(electronMesh);
      group.userData.electrons = group.userData.electrons || [];
      group.userData.electrons.push(electronMesh);
    }

    return group;
  }

  const atoms = [
    createAtom(4, 1, -2, 0x00c8ff),
    createAtom(-4, -1, -1, 0xff6b35),
    createAtom(2, -2.5, -3, 0x39ff14),
    createAtom(-2, 2, -4, 0xffd700)
  ];
  atoms.forEach(a => scene.add(a));

  // ---- Prism ----
  const prismGeo = new THREE.ConeGeometry(0.5, 1.2, 3);
  const prismMat = new THREE.MeshPhongMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.6,
    shininess: 200
  });
  const prism = new THREE.Mesh(prismGeo, prismMat);
  prism.position.set(6, 0, -3);
  scene.add(prism);

  // ---- Flask ----
  function createFlask() {
    const group = new THREE.Group();
    // Body
    const bodyGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x39ff14, transparent: true, opacity: 0.5 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);
    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.1, 0.15, 0.5, 12);
    const neck = new THREE.Mesh(neckGeo, bodyMat);
    neck.position.y = 0.45;
    group.add(neck);
    group.position.set(-6, 0.5, -2);
    return group;
  }
  const flask = createFlask();
  scene.add(flask);

  // ---- Mouse parallax ----
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ---- Animation loop ----
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;

    // Rotate particles
    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0002;

    // Animate atoms
    atoms.forEach((atom, i) => {
      atom.rotation.y += 0.003 * (i % 2 === 0 ? 1 : -1);
      atom.position.y += Math.sin(t + i) * 0.003;

      if (atom.userData.electrons) {
        atom.userData.electrons.forEach(el => {
          el.userData.angle += 0.02 * el.userData.speed;
          const r = el.userData.orbitRadius;
          el.position.x = Math.cos(el.userData.angle) * r;
          el.position.z = Math.sin(el.userData.angle) * r;
        });
      }
    });

    // Prism spin
    prism.rotation.y += 0.01;
    prism.position.y = Math.sin(t * 0.5) * 0.3;

    // Flask bob
    flask.position.y = 0.5 + Math.sin(t * 0.7) * 0.15;
    flask.rotation.z = Math.sin(t * 0.4) * 0.1;

    // Camera parallax
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.03;
    camera.position.y += (mouseY * 1 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    const W2 = canvas.parentElement.offsetWidth;
    const H2 = canvas.parentElement.offsetHeight || window.innerHeight;
    camera.aspect = W2 / H2;
    camera.updateProjectionMatrix();
    renderer.setSize(W2, H2);
  });
})();

// =====================================================
// STAT COUNTERS animation (Intersection Observer)
// =====================================================
const statNums = document.querySelectorAll('.stat-num[data-target]');
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCounter(el, parseInt(el.dataset.target));
      counterObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
statNums.forEach(el => counterObs.observe(el));

// =====================================================
// SCROLL REVEAL for NEP cards
// =====================================================
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 100);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-animate]').forEach(el => revealObs.observe(el));

// =====================================================
// MINI 3D PREVIEWS for experiment cards (tiny renderers)
// =====================================================
function createMiniPendulumPreview(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  r.setSize(container.offsetWidth || 300, container.offsetHeight || 180);

  const s = new THREE.Scene();
  const c = new THREE.PerspectiveCamera(60, (container.offsetWidth || 300) / (container.offsetHeight || 180), 0.1, 50);
  c.position.set(0, 0, 5);

  s.add(new THREE.AmbientLight(0x224488, 2));
  const pl = new THREE.PointLight(0x00c8ff, 3, 20);
  pl.position.set(3, 3, 3);
  s.add(pl);

  // String
  const strGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.5, 8);
  const strMat = new THREE.MeshBasicMaterial({ color: 0x888888 });
  const str = new THREE.Mesh(strGeo, strMat);
  str.position.y = -0.5;

  // Bob
  const bob = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16),
    new THREE.MeshPhongMaterial({ color: 0xff6b35, emissive: 0xff2200, emissiveIntensity: 0.2, shininess: 80 })
  );
  bob.position.y = -1.75;

  const pivot = new THREE.Group();
  pivot.add(str);
  pivot.add(bob);
  pivot.position.y = 1.5;
  s.add(pivot);

  // Support
  const support = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.1, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x334455 })
  );
  support.position.y = 1.6;
  s.add(support);

  let t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    t += 0.025;
    pivot.rotation.z = Math.sin(t) * 0.5;
    r.render(s, c);
  })();
}

function createMiniPrismPreview(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  r.setSize(container.offsetWidth || 300, container.offsetHeight || 180);

  const s = new THREE.Scene();
  const c = new THREE.PerspectiveCamera(50, (container.offsetWidth || 300) / (container.offsetHeight || 180), 0.1, 50);
  c.position.set(0, 0, 5);

  s.add(new THREE.AmbientLight(0x112244, 2));
  s.add(new THREE.PointLight(0xffffff, 4, 20));

  // Prism
  const prismGeo = new THREE.ConeGeometry(1, 1.5, 3);
  const prism = new THREE.Mesh(prismGeo,
    new THREE.MeshPhongMaterial({ color: 0x88ccff, transparent: true, opacity: 0.7, shininess: 200, wireframe: false })
  );
  prism.rotation.x = Math.PI / 2;
  s.add(prism);

  // Spectrum rays (coloured cylinders)
  const spectrumColors = [0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x0000ff, 0x8800ff];
  spectrumColors.forEach((col, i) => {
    const ray = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 2.5, 6),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8 })
    );
    ray.rotation.z = Math.PI / 2;
    ray.position.set(2, (i - 2.5) * 0.15, 0);
    s.add(ray);
  });

  let t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    t += 0.01;
    prism.rotation.z = t;
    c.position.x = Math.sin(t * 0.3) * 0.5;
    c.lookAt(0, 0, 0);
    r.render(s, c);
  })();
}

function createMiniAcidPreview(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  r.setSize(container.offsetWidth || 300, container.offsetHeight || 180);

  const s = new THREE.Scene();
  const c = new THREE.PerspectiveCamera(50, (container.offsetWidth || 300) / (container.offsetHeight || 180), 0.1, 50);
  c.position.set(0, 0, 6);

  s.add(new THREE.AmbientLight(0x112233, 2));
  s.add(new THREE.PointLight(0x39ff14, 4, 20));

  // Beakers
  function makeBeaker(x, col) {
    const g = new THREE.Group();
    g.position.x = x;

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.45, 1.5, 16, 1, true),
      new THREE.MeshPhongMaterial({ color: 0x88ccff, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    g.add(body);

    const liquid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.44, 0.4, 0.8, 16),
      new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.7, emissive: col, emissiveIntensity: 0.2 })
    );
    liquid.position.y = -0.35;
    g.add(liquid);
    return g;
  }

  s.add(makeBeaker(-1.2, 0xff4444));
  s.add(makeBeaker(1.2, 0x4444ff));

  // Bubbles
  const bubbles = [];
  for (let i = 0; i < 12; i++) {
    const b = new THREE.Mesh(
      new THREE.SphereGeometry(0.04 + Math.random() * 0.04, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
    );
    b.position.set((Math.random() - 0.5) * 0.8, -0.5 + Math.random() * 0.5, 0);
    b.userData.speed = 0.01 + Math.random() * 0.02;
    b.userData.startY = b.position.y;
    s.add(b);
    bubbles.push(b);
  }

  let t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    t += 0.016;
    bubbles.forEach(b => {
      b.position.y += b.userData.speed;
      b.material.opacity = Math.max(0, 0.6 - (b.position.y - b.userData.startY) * 0.5);
      if (b.position.y > 1) b.position.y = b.userData.startY;
    });
    r.render(s, c);
  })();
}

function createVRGlobe() {
  const container = document.getElementById('vr-globe');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const W = container.offsetWidth || 400;
  const H = container.offsetHeight || 400;

  const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  r.setSize(W, H);

  const s = new THREE.Scene();
  const c = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
  c.position.set(0, 0, 5);

  s.add(new THREE.AmbientLight(0x112233, 2));
  const pl = new THREE.PointLight(0x00c8ff, 5, 20);
  pl.position.set(3, 3, 3);
  s.add(pl);

  // VR Headset representation
  const headset = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1.2, 0.8),
    new THREE.MeshPhongMaterial({ color: 0x0a1628, shininess: 100 })
  );
  headset.add(body);

  // Lenses
  [-0.45, 0.45].forEach(x => {
    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(0.3, 32),
      new THREE.MeshPhongMaterial({ color: 0x00c8ff, transparent: true, opacity: 0.8, emissive: 0x00c8ff, emissiveIntensity: 0.4 })
    );
    lens.position.set(x, 0, 0.41);
    headset.add(lens);
  });

  // Strap
  const strap = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.05, 8, 32, Math.PI),
    new THREE.MeshPhongMaterial({ color: 0x334455 })
  );
  strap.rotation.x = Math.PI / 2;
  headset.add(strap);

  // Glow ring
  const glow = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.02, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x00c8ff, transparent: true, opacity: 0.3 })
  );
  headset.add(glow);

  s.add(headset);

  // Floating particles around headset
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(150 * 3);
  for (let i = 0; i < 150 * 3; i++) pPos[i] = (Math.random() - 0.5) * 8;
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  s.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x00c8ff, size: 0.04, transparent: true, opacity: 0.4 })));

  let t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    t += 0.01;
    headset.rotation.y = Math.sin(t * 0.5) * 0.4;
    headset.position.y = Math.sin(t) * 0.15;
    glow.rotation.z = t;
    r.render(s, c);
  })();
}

// Init mini previews after DOM loads
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    createMiniPendulumPreview('preview-pendulum');
    createMiniPrismPreview('preview-prism');
    createMiniAcidPreview('preview-acid');
    createVRGlobe();
  }, 100);
});
