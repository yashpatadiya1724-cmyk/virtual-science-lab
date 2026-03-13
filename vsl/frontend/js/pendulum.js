/* ============================================
   pendulum.js — Simple Pendulum Simulation
   Physics | Class 9-10 | NCERT Ch.10
   ============================================ */
'use strict';

window.PendulumExp = {
  name: 'Simple Pendulum',
  subject: 'Physics',
  classLevel: 'Class 9-10',
  duration: '15 min',

  state: {
    running: false, angle: 0.52, angVel: 0,
    length: 2.0, gravity: 9.8, time: 0,
    period: 0, lastAngle: undefined, lastCross: undefined,
    currentStep: 0
  },

  steps: [
    { text: 'Set string length (L) using the slider below.' },
    { text: 'Release angle is set to 30°. Observe the swing.' },
    { text: 'Click ▶ Start to release the pendulum.' },
    { text: 'Count oscillations over 20 seconds.' },
    { text: 'T = Total time ÷ Number of oscillations.' },
    { text: 'Change L and repeat. See how T changes with L.' },
    { text: 'Calculate g = 4π²L / T². Compare with 9.8 m/s².' }
  ],

  scene: null, objs: {},

  build(scene, THREE) {
    this.scene = scene;
    const o = this.objs;
    const s = this.state;
    const mat = m => new THREE.MeshPhongMaterial(m);

    // Support frame
    const sm = mat({ color:0x334455, shininess:20 });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(4,0.12,0.12), sm);
    bar.position.set(0,3,0); scene.add(bar); o.bar = bar;

    [-2,2].forEach(x => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,4,10), sm);
      p.position.set(x,1,0); scene.add(p);
    });

    // Pivot group
    const pivot = new THREE.Group();
    pivot.position.set(0,3,0);
    scene.add(pivot); o.pivot = pivot;

    // String
    const strMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022,0.022,s.length,8),
      new THREE.MeshBasicMaterial({color:0xaaaaaa})
    );
    strMesh.position.y = -s.length/2;
    pivot.add(strMesh); o.str = strMesh;

    // Bob
    const bob = new THREE.Mesh(
      new THREE.SphereGeometry(0.25,24,24),
      mat({color:0xff6b35, emissive:0xaa2200, emissiveIntensity:0.2, shininess:80})
    );
    bob.position.y = -s.length;
    pivot.add(bob); o.bob = bob;

    // Bob glow ring
    const glow = new THREE.Mesh(
      new THREE.TorusGeometry(0.28,0.03,8,32),
      new THREE.MeshBasicMaterial({color:0xff6b35, transparent:true, opacity:0.4})
    );
    bob.add(glow); o.glow = glow;

    // Table
    const table = new THREE.Mesh(new THREE.BoxGeometry(8,0.15,3), mat({color:0x1a2a3a,shininess:30}));
    table.position.set(0,-1.5,0); scene.add(table);

    // Grid
    const grid = new THREE.GridHelper(20,20,0x112233,0x0a1628);
    grid.position.y = -1.65; scene.add(grid);

    // Ruler
    const ruler = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, s.length+0.5, 0.08),
      mat({color:0xffd700, emissive:0x885500, emissiveIntensity:0.1})
    );
    ruler.position.set(-0.3, 3-(s.length+0.5)/2 - 0.1, 0);
    scene.add(ruler); o.ruler = ruler;

    // Lights
    scene.add(new THREE.AmbientLight(0x112233,2));
    const pl = new THREE.PointLight(0x00c8ff,3,30);
    pl.position.set(4,4,4); scene.add(pl);

    this._calcPeriod();
  },

  _calcPeriod() {
    this.state.period = 2 * Math.PI * Math.sqrt(this.state.length / this.state.gravity);
  },

  setLength(L) {
    const s = this.state;
    s.length = L;
    this._calcPeriod();
    const p = this.objs.pivot;
    if (!p) return;
    p.remove(this.objs.str);
    p.remove(this.objs.bob);
    const strMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022,0.022,L,8),
      new THREE.MeshBasicMaterial({color:0xaaaaaa})
    );
    strMesh.position.y = -L/2;
    p.add(strMesh); this.objs.str = strMesh;
    this.objs.bob.position.y = -L;
    p.add(this.objs.bob);
  },

  update(dt) {
    const s = this.state;
    if (!s.running) return;
    const alpha = -(s.gravity / s.length) * Math.sin(s.angle);
    s.angVel += alpha * dt;
    s.angVel *= 0.9995; // damping
    s.angle  += s.angVel * dt;
    s.time   += dt;
    if (this.objs.pivot) this.objs.pivot.rotation.z = s.angle;
    if (this.objs.glow)  this.objs.glow.material.opacity = 0.2 + Math.abs(s.angVel) * 0.7;
    // Period detection via zero crossing
    if (s.lastAngle !== undefined && s.lastAngle > 0 && s.angle <= 0) {
      if (s.lastCross !== undefined) s.period = (s.time - s.lastCross) * 2;
      s.lastCross = s.time;
    }
    s.lastAngle = s.angle;
  },

  start()  { const s=this.state; s.running=true; s.angVel=0; s.angle=0.52; s.lastAngle=undefined; s.lastCross=undefined; },
  reset()  { const s=this.state; s.running=false; s.angle=0.52; s.angVel=0; s.time=0; s.period=0; s.currentStep=0; s.lastAngle=undefined; if(this.objs.pivot) this.objs.pivot.rotation.z=0.52; },

  getResults() {
    const s = this.state;
    const g = (4*Math.PI*Math.PI*s.length) / (s.period*s.period);
    return {
      'String Length (L)': `${s.length.toFixed(2)} m`,
      'Measured Period (T)': `${s.period.toFixed(3)} s`,
      'Theoretical T': `${(2*Math.PI*Math.sqrt(s.length/9.8)).toFixed(3)} s`,
      'Calculated g': `${isFinite(g)?g.toFixed(2):'—'} m/s²`,
      'Standard g': '9.80 m/s²',
      'Elapsed Time': `${s.time.toFixed(1)} s`
    };
  },

  cleanup(scene) { Object.values(this.objs).forEach(o=>{ if(o&&o.isObject3D) scene.remove(o); }); this.objs={}; }
};
