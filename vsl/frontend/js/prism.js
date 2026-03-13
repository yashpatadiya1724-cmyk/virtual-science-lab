/* ============================================
   prism.js — Prism Light Refraction
   Physics | Class 10-12 | NCERT Ch.10
   ============================================ */
'use strict';

window.PrismExp = {
  name: 'Prism Light Refraction',
  subject: 'Physics',
  classLevel: 'Class 10-12',
  duration: '20 min',

  state: {
    running:false, time:0, currentStep:0,
    prismAngle:60, incidentAngle:40, refractiveIndex:1.52,
    spectrumOn:false
  },

  steps: [
    { text: 'Place the prism on the optical bench.' },
    { text: 'Direct white light beam at one face of the prism.' },
    { text: 'Adjust angle of incidence (i) with the slider.' },
    { text: 'Click ▶ Start to send the light beam through.' },
    { text: 'Observe dispersion: white light → VIBGYOR spectrum.' },
    { text: 'Measure angle of deviation (D) for each colour.' },
    { text: 'Calculate n = sin((A+Dm)/2) ÷ sin(A/2).' }
  ],

  scene:null, THREE:null, objs:{},

  build(scene, THREE) {
    this.scene = scene; this.THREE = THREE;
    const o = this.objs;

    scene.add(new THREE.AmbientLight(0x112233,2));
    const dl = new THREE.DirectionalLight(0xffffff,2);
    dl.position.set(5,8,5); scene.add(dl);

    // Table
    scene.add(Object.assign(new THREE.Mesh(
      new THREE.BoxGeometry(12,0.15,5),
      new THREE.MeshPhongMaterial({color:0x1a2a3a})
    ), {position:{x:0,y:-1.5,z:0}}));

    const grid = new THREE.GridHelper(20,20,0x112233,0x0a1628);
    grid.position.y=-1.65; scene.add(grid);

    // Prism
    const prism = this._mkPrism(THREE);
    prism.position.set(0,-1.3,0);
    scene.add(prism); o.prism = prism;

    // Incident white beam
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04,0.04,4,8),
      new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.8})
    );
    beam.rotation.z = Math.PI/2;
    beam.position.set(-4,-1.1,0);
    scene.add(beam); o.beam = beam;

    // Light source
    const torch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15,0.18,0.8,12),
      new THREE.MeshPhongMaterial({color:0x334455,shininess:80})
    );
    torch.rotation.z = Math.PI/2;
    torch.position.set(-6.2,-1.1,0);
    scene.add(torch);

    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(0.12,16),
      new THREE.MeshBasicMaterial({color:0xffffee})
    );
    lens.position.set(-5.8,-1.1,0);
    lens.rotation.y = Math.PI/2;
    scene.add(lens);

    // Spectrum rays (7 colours)
    const colours = [0xff0000,0xff7700,0xffff00,0x00ff00,0x0088ff,0x4400ff,0x8800cc];
    o.rays = colours.map((col,i) => {
      const ray = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025,0.025,4,6),
        new THREE.MeshBasicMaterial({color:col, transparent:true, opacity:0})
      );
      ray.rotation.z = Math.PI/2 - 0.5 - i*0.06;
      ray.position.set(3.2, -0.8 + i*0.13, 0);
      scene.add(ray); return ray;
    });

    // Screen
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.05,3),
      new THREE.MeshPhongMaterial({color:0xf5f5e0, side:THREE.DoubleSide})
    );
    screen.position.set(6,-0.3,0);
    scene.add(screen);

    // Protractor
    const proto = new THREE.Mesh(
      new THREE.TorusGeometry(1.2,0.02,8,32,Math.PI),
      new THREE.MeshBasicMaterial({color:0xffd700, transparent:true, opacity:0.35})
    );
    proto.rotation.x = -Math.PI/2;
    proto.position.set(0,-1.42,0);
    scene.add(proto);
  },

  _mkPrism(THREE) {
    const verts = new Float32Array([
      -0.7,-0.5, 0.5,  0.7,-0.5, 0.5,  0.0, 0.7, 0.5,
      -0.7,-0.5,-0.5,  0.7,-0.5,-0.5,  0.0, 0.7,-0.5
    ]);
    const idx = [0,1,2, 5,4,3, 0,4,1, 0,3,4, 0,2,3, 2,5,3, 1,4,2, 4,5,2];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(verts,3));
    geo.setIndex(idx); geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo,
      new THREE.MeshPhongMaterial({color:0x88ccff, transparent:true, opacity:0.55, shininess:200, side:THREE.DoubleSide})
    );
    mesh.scale.set(1.5,1.5,2.5);
    return mesh;
  },

  update(dt) {
    const s = this.state;
    if (!s.running) return;
    s.time += dt;
    if (this.objs.beam) this.objs.beam.material.opacity = 0.7 + Math.sin(s.time*10)*0.1;
    if (this.objs.prism) this.objs.prism.rotation.y = Math.sin(s.time*0.3)*0.1;
    if (s.spectrumOn && this.objs.rays)
      this.objs.rays.forEach((r,i) => { r.material.opacity = 0.7 + Math.sin(s.time*4+i*0.4)*0.15; });
  },

  start() {
    this.state.running = true; this.state.spectrumOn = true;
    this.objs.rays?.forEach((r,i)=>{ setTimeout(()=>{ r.material.opacity=0.8; },i*80); });
    showToast('Light beam activated! Observe the spectrum.','success');
  },

  reset() {
    const s=this.state; s.running=false; s.time=0; s.spectrumOn=false; s.currentStep=0;
    this.objs.rays?.forEach(r=>{ r.material.opacity=0; });
  },

  _snell() {
    const s=this.state;
    const sinR = (1.0/s.refractiveIndex)*Math.sin(deg2rad(s.incidentAngle));
    if (Math.abs(sinR)>1) return null;
    const r = Math.asin(sinR)*180/Math.PI;
    return { r, dev: (s.incidentAngle-r)+(s.prismAngle-r)*s.refractiveIndex };
  },

  getResults() {
    const s=this.state, d=this._snell();
    const nCalc = d ? (Math.sin(deg2rad((s.prismAngle+d.dev)/2))/Math.sin(deg2rad(s.prismAngle/2))).toFixed(3) : '—';
    return {
      'Prism Angle (A)': `${s.prismAngle}°`,
      'Incident Angle (i)': `${s.incidentAngle}°`,
      'Refracted Angle (r)': d ? `${d.r.toFixed(1)}°` : 'TIR',
      'Angle of Deviation': d ? `${d.dev.toFixed(1)}°` : '—',
      'Calculated n': nCalc,
      'Actual n (glass)': '1.520'
    };
  },

  cleanup(scene) {
    Object.values(this.objs).forEach(o=>{
      if(Array.isArray(o)) o.forEach(x=>scene.remove(x));
      else if(o?.isObject3D) scene.remove(o);
    });
    this.objs={};
  }
};
