/* ============================================
   acidbase.js — Acid-Base Titration
   Chemistry | Class 9-11 | NCERT Ch.2
   ============================================ */
'use strict';

window.AcidBaseExp = {
  name: 'Acid-Base Titration',
  subject: 'Chemistry',
  classLevel: 'Class 9-11',
  duration: '25 min',

  state: {
    running:false, time:0, currentStep:0,
    acidVol:25, baseVol:0, conc:0.1,
    pH:1.0, complete:false, bubbles:[],
    eqPoint:25
  },

  steps: [
    { text: 'Prepare 25 mL of HCl (0.1M) in a conical flask.' },
    { text: 'Add 3 drops of phenolphthalein indicator.' },
    { text: 'Fill burette with NaOH (0.1M) solution.' },
    { text: 'Click ▶ Start to add NaOH dropwise.' },
    { text: 'Watch pH rise and solution colour change.' },
    { text: 'At ~25 mL NaOH the solution turns pink — endpoint!' },
    { text: 'Apply M₁V₁ = M₂V₂ to calculate concentration.' }
  ],

  scene:null, objs:{},

  build(scene, THREE) {
    this.scene=scene; this.THREE=THREE;
    const o=this.objs;
    const mat=m=>new THREE.MeshPhongMaterial(m);

    scene.add(new THREE.AmbientLight(0x112233,2));
    const dl=new THREE.DirectionalLight(0xffffff,2); dl.position.set(5,8,5); scene.add(dl);
    const gl=new THREE.PointLight(0x39ff14,2,15); gl.position.set(-3,3,2); scene.add(gl);

    // Table
    const table=new THREE.Mesh(new THREE.BoxGeometry(12,0.15,5),mat({color:0x1a2a3a}));
    table.position.set(0,-1.5,0); scene.add(table);
    const grid=new THREE.GridHelper(20,20,0x112233,0x0a1628); grid.position.y=-1.65; scene.add(grid);

    // Retort stand
    const sm=mat({color:0x2a3a4a});
    const sBase=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.08,0.8),sm); sBase.position.set(1,-1.42,0); scene.add(sBase);
    const sPole=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,5,10),sm); sPole.position.set(1,1,0); scene.add(sPole);
    const clamp=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.12,0.15),sm); clamp.position.set(0.6,2,0); scene.add(clamp);

    // Burette (glass tube)
    const burette=new THREE.Mesh(
      new THREE.CylinderGeometry(0.1,0.08,3.5,16,1,true),
      mat({color:0x88ccff, transparent:true, opacity:0.45, shininess:200})
    );
    burette.position.set(0,1,0); scene.add(burette); o.burette=burette;

    // NaOH liquid inside burette
    const bLiq=new THREE.Mesh(
      new THREE.CylinderGeometry(0.08,0.06,3.4,16),
      mat({color:0x4444ff, transparent:true, opacity:0.5})
    );
    bLiq.position.set(0,1,0); scene.add(bLiq); o.bLiq=bLiq;

    // Flask
    const flask=this._mkFlask(THREE);
    flask.position.set(0,-1.2,0); scene.add(flask); o.flask=flask;

    // Liquid in flask
    const liqMat=mat({color:0xff4466, transparent:true, opacity:0.75, emissive:0x880022, emissiveIntensity:0.1});
    const liq=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.35,0.6,20),liqMat);
    liq.position.set(0,-1.0,0); scene.add(liq); o.liq=liq; o.liqMat=liqMat;

    // pH meter
    const phGrp=new THREE.Group();
    phGrp.add(Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(0.6,1,0.15),mat({color:0x223344,shininess:40}))
    ));
    const probe=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.025,1.2,8),mat({color:0x888888}));
    probe.position.y=-1.1; phGrp.add(probe);
    phGrp.position.set(-1.5,-0.6,0.5); scene.add(phGrp);

    o.bubbles=[];
  },

  _mkFlask(THREE) {
    const g=new THREE.Group();
    const gm=new THREE.MeshPhongMaterial({color:0x88ccff,transparent:true,opacity:0.3,shininess:200,side:THREE.DoubleSide});
    const body=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.45,1.2,20,1,true),gm); g.add(body);
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.25,0.6,14,1,true),gm); neck.position.y=0.9; g.add(neck);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(0.15,0.02,8,24),gm); rim.position.y=1.2; g.add(rim);
    return g;
  },

  _calcPH() {
    const s=this.state;
    const molA=(s.acidVol*s.conc)/1000, molB=(s.baseVol*s.conc)/1000;
    const diff=molA-molB, vol=(s.acidVol+s.baseVol)/1000;
    if (Math.abs(diff)<1e-6) return 7.0;
    if (diff>0) return clamp(-Math.log10(diff/vol),0,14);
    return clamp(14+Math.log10((-diff)/vol),0,14);
  },

  _colour(pH) {
    if (pH<6)   return {c:0xff4466, e:0x880022};
    if (pH<7.5) return {c:0xffaacc, e:0x884466};
    if (pH<8.5) return {c:0xff44cc, e:0x882266};
    return {c:0xcc00ff, e:0x660088};
  },

  update(dt) {
    const s=this.state;
    if (!s.running||s.complete) return;
    s.time+=dt;
    s.baseVol=Math.min(s.baseVol+0.5*dt, s.eqPoint+5);
    s.pH=this._calcPH();
    const col=this._colour(s.pH);
    if (this.objs.liqMat) { this.objs.liqMat.color.setHex(col.c); this.objs.liqMat.emissive.setHex(col.e); }
    if (this.objs.bLiq) {
      const f=Math.max(0.05,1-(s.baseVol/30));
      this.objs.bLiq.scale.y=f; this.objs.bLiq.position.y=1-(1-f)*1.7;
    }
    if (s.pH>6&&s.pH<8) this._spawnBubble();
    this._moveBubbles(dt);
    if (s.baseVol>=s.eqPoint+5) { s.complete=true; s.running=false; showToast('✅ Neutralisation complete! Endpoint reached.','success',4000); }
  },

  _spawnBubble() {
    if (Math.random()>0.12||!this.scene) return;
    const b=new THREE.Mesh(
      new THREE.SphereGeometry(0.03+Math.random()*0.03,6,6),
      new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.5})
    );
    b.position.set((Math.random()-0.5)*0.7,-1.0,(Math.random()-0.5)*0.5);
    b.userData.vy=0.02+Math.random()*0.025;
    this.scene.add(b); this.objs.bubbles.push(b);
  },

  _moveBubbles(dt) {
    if (!this.objs.bubbles) return;
    this.objs.bubbles=this.objs.bubbles.filter(b=>{
      b.position.y+=b.userData.vy;
      b.material.opacity-=0.012;
      if (b.material.opacity<=0||b.position.y>-0.25) { this.scene.remove(b); return false; }
      return true;
    });
  },

  start() { this.state.running=true; this.state.complete=false; showToast('Adding NaOH dropwise... watch the pH meter!','info'); },

  reset() {
    const s=this.state; s.running=false; s.time=0; s.baseVol=0; s.pH=1.0; s.complete=false; s.currentStep=0;
    if (this.objs.liqMat) { this.objs.liqMat.color.setHex(0xff4466); this.objs.liqMat.emissive.setHex(0x880022); }
    if (this.objs.bLiq) { this.objs.bLiq.scale.y=1; this.objs.bLiq.position.y=1; }
    this.objs.bubbles?.forEach(b=>this.scene.remove(b)); this.objs.bubbles=[];
  },

  getResults() {
    const s=this.state;
    return {
      'HCl Volume (V₁)': `${s.acidVol} mL`,
      'NaOH Added (V₂)': `${s.baseVol.toFixed(1)} mL`,
      'Equivalence Vol.': `${s.eqPoint} mL`,
      'Current pH': `${s.pH.toFixed(2)}`,
      'M(NaOH) calc.': `${((s.acidVol*s.conc)/Math.max(s.baseVol,0.01)).toFixed(4)} mol/L`,
      'Status': s.complete ? '✅ Complete' : s.running ? '⏳ Running' : '⏸ Paused'
    };
  },

  cleanup(scene) {
    Object.values(this.objs).forEach(o=>{
      if(Array.isArray(o)) o.forEach(x=>{ if(x?.isObject3D) scene.remove(x); });
      else if(o?.isObject3D) scene.remove(o);
    });
    this.objs={bubbles:[]};
  }
};
