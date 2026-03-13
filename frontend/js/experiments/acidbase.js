/**
 * Acid-Base Neutralisation Experiment
 * Chemistry – HCl + NaOH Titration
 * Virtual Science Lab | Skill India VR
 */

'use strict';

window.AcidBaseExperiment = {
  name: 'Acid-Base Reaction (Titration)',
  subject: 'Chemistry',
  classLevel: 'Class 9-11',
  duration: '25 min',

  state: {
    running: false,
    time: 0,
    currentStep: 0,
    acidVolume: 25,       // mL HCl
    baseVolume: 0,        // mL NaOH added so far
    concentration: 0.1,   // mol/L
    pH: 1.0,
    reactionComplete: false,
    bubbles: [],
    colorTransition: 0,   // 0 = red (acid), 1 = purple (neutral), 2 = blue (base)
    indicatorUsed: 'Phenolphthalein',
    neutralisationPoint: 25 // mL NaOH needed (equal volumes, equal concentrations)
  },

  steps: [
    { text: 'Prepare 25 mL of HCl (0.1 M) in a clean conical flask. Add 2-3 drops of phenolphthalein indicator.' },
    { text: 'Fill the burette with NaOH (0.1 M) solution. Note the initial reading.' },
    { text: 'Click ▶ Start to begin adding NaOH dropwise to the HCl.' },
    { text: 'Observe the pH change and solution colour as base is added.' },
    { text: 'At the equivalence point (~25 mL NaOH), the solution turns pink — this is the endpoint.' },
    { text: 'Note the burette reading. Calculate volume of NaOH used.' },
    { text: 'Apply: M₁V₁ = M₂V₂ to verify concentrations. Record your findings.' }
  ],

  scene: null,
  objects: {},

  build(scene, THREE) {
    this.scene = scene;
    this.THREE = THREE;
    const objs = this.objects;

    // -- Lighting --
    scene.add(new THREE.AmbientLight(0x112233, 2));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);
    const greenLight = new THREE.PointLight(0x39ff14, 2, 15);
    greenLight.position.set(-3, 3, 2);
    scene.add(greenLight);
    objs.greenLight = greenLight;

    // -- Table --
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.15, 5),
      new THREE.MeshPhongMaterial({ color: 0x1a2a3a })
    );
    table.position.set(0, -1.5, 0);
    scene.add(table);
    objs.table = table;

    scene.add(new THREE.GridHelper(20, 20, 0x112233, 0x0a1628));

    // -- Retort Stand (burette holder) --
    const standMat = new THREE.MeshPhongMaterial({ color: 0x2a3a4a });
    const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.8), standMat);
    standBase.position.set(1, -1.42, 0);
    scene.add(standBase);

    const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 5, 10), standMat);
    standPole.position.set(1, 1, 0);
    scene.add(standPole);

    const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.15), standMat);
    clamp.position.set(0.6, 2, 0);
    scene.add(clamp);

    // -- Burette --
    const buretteMat = new THREE.MeshPhongMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5, shininess: 200 });
    const burette = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 3.5, 16, 1, true), buretteMat);
    burette.position.set(0, 1, 0);
    scene.add(burette);
    objs.burette = burette;

    // -- NaOH liquid inside burette --
    const buretteLiquid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.06, 3.4, 16),
      new THREE.MeshPhongMaterial({ color: 0x4444ff, transparent: true, opacity: 0.5 })
    );
    buretteLiquid.position.set(0, 1, 0);
    scene.add(buretteLiquid);
    objs.buretteLiquid = buretteLiquid;

    // -- Burette stopcock --
    const stopcock = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.15, 0.15),
      new THREE.MeshPhongMaterial({ color: 0x334455 })
    );
    stopcock.position.set(0, -0.75, 0);
    scene.add(stopcock);
    objs.stopcock = stopcock;

    // -- Conical Flask (Erlenmeyer) --
    const flask = this._createFlask(THREE);
    flask.position.set(0, -1.2, 0);
    scene.add(flask);
    objs.flask = flask;

    // -- Liquid inside flask --
    const liquidMat = new THREE.MeshPhongMaterial({
      color: 0xff4466,  // Start: pink-red (acid + indicator)
      transparent: true,
      opacity: 0.75,
      emissive: 0x880022,
      emissiveIntensity: 0.1
    });
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.35, 0.6, 20), liquidMat);
    liquid.position.set(0, -1.0, 0);
    scene.add(liquid);
    objs.liquid = liquid;
    objs.liquidMat = liquidMat;

    // -- pH meter --
    const pHMeterGroup = new THREE.Group();
    const meter = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.0, 0.15),
      new THREE.MeshPhongMaterial({ color: 0x223344, shininess: 40 })
    );
    pHMeterGroup.add(meter);
    const probe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.025, 1.2, 8),
      new THREE.MeshPhongMaterial({ color: 0x888888 })
    );
    probe.position.y = -1.1;
    pHMeterGroup.add(probe);
    pHMeterGroup.position.set(-1.5, -0.6, 0.5);
    scene.add(pHMeterGroup);
    objs.pHMeter = pHMeterGroup;

    // -- Drip particle system --
    objs.drips = [];

    return objs;
  },

  /**
   * Create Erlenmeyer flask mesh
   */
  _createFlask(THREE) {
    const group = new THREE.Group();
    const glassMat = new THREE.MeshPhongMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.3,
      shininess: 200,
      side: THREE.DoubleSide
    });

    // Wide body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.45, 1.2, 20, 1, true), glassMat);
    group.add(body);

    // Narrow neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 0.6, 14, 1, true), glassMat);
    neck.position.y = 0.9;
    group.add(neck);

    // Rim
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 8, 24), glassMat);
    rim.position.y = 1.2;
    group.add(rim);

    return group;
  },

  /**
   * Calculate pH based on volumes added
   */
  _calculatePH() {
    const s = this.state;
    const molAcid = s.acidVolume * s.concentration / 1000;
    const molBase = s.baseVolume * s.concentration / 1000;
    const diff = molAcid - molBase;

    if (Math.abs(diff) < 1e-6) {
      return 7.0; // Equivalence point
    } else if (diff > 0) {
      // Excess acid
      const totalVol = (s.acidVolume + s.baseVolume) / 1000;
      const [H] = [diff / totalVol];
      return -Math.log10(H);
    } else {
      // Excess base
      const totalVol = (s.acidVolume + s.baseVolume) / 1000;
      const [OH] = [(-diff) / totalVol];
      const pOH = -Math.log10(OH);
      return 14 - pOH;
    }
  },

  /**
   * Get colour of phenolphthalein at given pH
   */
  _getIndicatorColor(pH) {
    if (pH < 6.0) return { color: 0xff4466, emissive: 0x880022 };   // Colourless/light pink (acid)
    if (pH < 7.5) return { color: 0xffaacc, emissive: 0x884466 };   // Light pink (near neutral)
    if (pH < 8.5) return { color: 0xff44cc, emissive: 0x882266 };   // Pink (endpoint)
    return { color: 0xcc00ff, emissive: 0x660088 };                  // Deep purple (alkaline)
  },

  update(dt) {
    const s = this.state;
    if (!s.running || s.reactionComplete) return;

    s.time += dt;

    // Add NaOH slowly (0.5 mL per second)
    const addRate = 0.5;
    s.baseVolume = Math.min(s.baseVolume + addRate * dt, s.neutralisationPoint + 5);

    // Recalculate pH
    s.pH = clamp(this._calculatePH(), 0, 14);

    // Update liquid color
    const col = this._getIndicatorColor(s.pH);
    if (this.objects.liquidMat) {
      this.objects.liquidMat.color.setHex(col.color);
      this.objects.liquidMat.emissive.setHex(col.emissive);
    }

    // Burette liquid level decreases
    if (this.objects.buretteLiquid) {
      const fraction = 1 - (s.baseVolume / 30);
      this.objects.buretteLiquid.scale.y = Math.max(0.05, fraction);
      this.objects.buretteLiquid.position.y = 1 - (1 - fraction) * 1.7;
    }

    // Bubble animation near endpoint
    if (s.pH > 6 && s.pH < 8 && this.objects.liquid) {
      this._spawnBubble();
    }

    // Update drip particles
    this._updateDrips(dt);

    // Check if reaction complete
    if (s.baseVolume >= s.neutralisationPoint + 5) {
      s.reactionComplete = true;
      s.running = false;
      showToast('✅ Neutralisation Complete! Endpoint reached.', 'success', 4000);
    }
  },

  _spawnBubble() {
    if (!this.scene) return;
    if (Math.random() > 0.1) return; // Spawn probability

    const bubble = new THREE.Mesh(
      new THREE.SphereGeometry(0.03 + Math.random() * 0.03, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
    );
    bubble.position.set(
      (Math.random() - 0.5) * 0.7,
      -1.0,
      (Math.random() - 0.5) * 0.5
    );
    bubble.userData = { vy: 0.02 + Math.random() * 0.03 };
    this.scene.add(bubble);
    this.objects.drips.push(bubble);
  },

  _updateDrips(dt) {
    if (!this.objects.drips) return;
    this.objects.drips = this.objects.drips.filter(b => {
      b.position.y += b.userData.vy;
      b.material.opacity -= 0.015;
      if (b.material.opacity <= 0 || b.position.y > -0.3) {
        this.scene.remove(b);
        return false;
      }
      return true;
    });
  },

  start() {
    const s = this.state;
    s.running = true;
    s.reactionComplete = false;
    showToast('Adding NaOH dropwise... watch the pH meter!', 'info');
  },

  reset() {
    const s = this.state;
    s.running = false;
    s.time = 0;
    s.baseVolume = 0;
    s.pH = 1.0;
    s.reactionComplete = false;
    s.currentStep = 0;

    // Reset liquid colour (acid = red/pink)
    if (this.objects.liquidMat) {
      this.objects.liquidMat.color.setHex(0xff4466);
      this.objects.liquidMat.emissive.setHex(0x880022);
    }

    // Reset burette
    if (this.objects.buretteLiquid) {
      this.objects.buretteLiquid.scale.y = 1;
      this.objects.buretteLiquid.position.y = 1;
    }

    // Remove bubbles
    if (this.objects.drips) {
      this.objects.drips.forEach(b => this.scene.remove(b));
      this.objects.drips = [];
    }
  },

  getResults() {
    const s = this.state;
    const volumeBase = s.baseVolume.toFixed(1);
    const equivalenceVol = s.neutralisationPoint.toFixed(1);
    const molarity = ((s.acidVolume * s.concentration) / parseFloat(volumeBase || 1)).toFixed(4);

    return {
      'HCl Volume (V₁)': `${s.acidVolume} mL`,
      'NaOH Added (V₂)': `${volumeBase} mL`,
      'Equivalence Vol.': `${equivalenceVol} mL`,
      'Current pH': `${s.pH.toFixed(2)}`,
      'Calculated M(NaOH)': `${molarity} mol/L`,
      'Reaction Status': s.reactionComplete ? '✅ Complete' : '⏳ In progress'
    };
  },

  cleanup(scene) {
    Object.values(this.objects).forEach(obj => {
      if (Array.isArray(obj)) obj.forEach(o => scene.remove(o));
      else if (obj && obj.isObject3D) scene.remove(obj);
    });
    this.objects = { drips: [] };
  }
};
