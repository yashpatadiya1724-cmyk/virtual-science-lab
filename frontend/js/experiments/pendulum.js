/**
 * Pendulum Experiment Simulation
 * Physics – Simple Harmonic Motion
 * Virtual Science Lab | Skill India VR
 */

'use strict';

window.PendulumExperiment = {
  name: 'Simple Pendulum',
  subject: 'Physics',
  classLevel: 'Class 9-10',
  duration: '15 min',
  
  // Simulation state
  state: {
    running: false,
    angle: 0.5,        // radians (initial release angle)
    angularVelocity: 0,
    length: 2.0,       // metres
    gravity: 9.8,      // m/s²
    time: 0,
    period: 0,
    measurements: [],
    currentStep: 0
  },

  // Experiment steps
  steps: [
    { text: 'Set up the pendulum: adjust the string length using the slider below.' },
    { text: 'Pull the bob to one side — set the release angle (θ) to about 30°.' },
    { text: 'Click ▶ Start to release the pendulum and observe the oscillation.' },
    { text: 'Count the number of complete oscillations in 20 seconds.' },
    { text: 'Record the time period T = Total Time / Number of Oscillations.' },
    { text: 'Change the string length and repeat. Observe how T changes with L.' },
    { text: 'Calculate g using: g = 4π²L / T². Compare with 9.8 m/s².' }
  ],

  // Three.js objects (set by lab.js)
  scene: null,
  objects: {},

  /**
   * Build the 3D scene objects for this experiment
   */
  build(scene, THREE) {
    this.scene = scene;
    const objs = this.objects;
    const s = this.state;

    // -- Pivot support frame --
    const supportMat = new THREE.MeshPhongMaterial({ color: 0x334455, shininess: 20 });

    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(4, 0.12, 0.12), supportMat);
    crossbar.position.set(0, 3, 0);
    scene.add(crossbar);
    objs.crossbar = crossbar;

    const leftPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4, 10), supportMat);
    leftPole.position.set(-2, 1, 0);
    scene.add(leftPole);

    const rightPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4, 10), supportMat);
    rightPole.position.set(2, 1, 0);
    scene.add(rightPole);

    // -- Pivot group (everything hangs from here) --
    const pivot = new THREE.Group();
    pivot.position.set(0, 3, 0);
    scene.add(pivot);
    objs.pivot = pivot;

    // -- String --
    const stringGeo = new THREE.CylinderGeometry(0.02, 0.02, s.length, 8);
    const stringMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    const stringMesh = new THREE.Mesh(stringGeo, stringMat);
    stringMesh.position.y = -s.length / 2;
    pivot.add(stringMesh);
    objs.string = stringMesh;

    // -- Bob --
    const bob = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 24, 24),
      new THREE.MeshPhongMaterial({ color: 0xff6b35, emissive: 0xaa2200, emissiveIntensity: 0.2, shininess: 80 })
    );
    bob.position.y = -s.length;
    pivot.add(bob);
    objs.bob = bob;

    // -- Bob glow ring --
    const glowRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.03, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.4 })
    );
    bob.add(glowRing);
    objs.glowRing = glowRing;

    // -- Lab table --
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.15, 3),
      new THREE.MeshPhongMaterial({ color: 0x1a2a3a, shininess: 40 })
    );
    table.position.set(0, -1.5, 0);
    scene.add(table);

    // -- Floor grid --
    const gridHelper = new THREE.GridHelper(20, 20, 0x112233, 0x0a1628);
    gridHelper.position.y = -1.65;
    scene.add(gridHelper);

    // -- Lab room walls (subtle) --
    const wallMat = new THREE.MeshPhongMaterial({ color: 0x0a1628, transparent: true, opacity: 0.5, side: THREE.BackSide });
    const room = new THREE.Mesh(new THREE.BoxGeometry(18, 12, 10), wallMat);
    room.position.y = 2;
    scene.add(room);

    // -- Ruler on table --
    const ruler = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, s.length + 0.5, 0.08),
      new THREE.MeshPhongMaterial({ color: 0xffd700, emissive: 0x885500, emissiveIntensity: 0.1 })
    );
    ruler.position.set(-0.3, 3 - (s.length + 0.5) / 2 - 0.1, 0);
    scene.add(ruler);
    objs.ruler = ruler;

    // Compute initial period
    this._computePeriod();
    return objs;
  },

  /**
   * Update the pendulum simulation every animation frame
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    const s = this.state;
    if (!s.running) return;

    // Physics: θ'' = -(g/L) * sin(θ)
    // Using Euler integration (simple but sufficient for demo)
    const alpha = -(s.gravity / s.length) * Math.sin(s.angle);
    s.angularVelocity += alpha * dt;
    s.angle += s.angularVelocity * dt;

    // Apply damping (air resistance)
    s.angularVelocity *= 0.9995;

    s.time += dt;

    // Update 3D objects
    if (this.objects.pivot) {
      this.objects.pivot.rotation.z = s.angle;
    }

    // Glow ring pulsates with speed
    if (this.objects.glowRing) {
      const speed = Math.abs(s.angularVelocity);
      this.objects.glowRing.material.opacity = 0.2 + speed * 0.8;
    }

    // Track period (zero crossing detection)
    if (s.lastAngle !== undefined) {
      if (s.lastAngle > 0 && s.angle <= 0) {
        if (s.lastCrossTime !== undefined) {
          const halfPeriod = s.time - s.lastCrossTime;
          s.period = halfPeriod * 2;
        }
        s.lastCrossTime = s.time;
      }
      s.lastAngle = s.angle;
    } else {
      s.lastAngle = s.angle;
    }
  },

  /**
   * Compute theoretical period
   */
  _computePeriod() {
    this.state.period = 2 * Math.PI * Math.sqrt(this.state.length / this.state.gravity);
  },

  /**
   * Update string length (from slider)
   */
  setLength(newLength) {
    const s = this.state;
    s.length = newLength;
    this._computePeriod();

    if (this.objects.string) {
      // Rebuild string geometry
      const scene = this.scene;
      const pivot = this.objects.pivot;
      pivot.remove(this.objects.string);
      pivot.remove(this.objects.bob);

      const stringGeo = new THREE.CylinderGeometry(0.02, 0.02, s.length, 8);
      const stringMesh = new THREE.Mesh(stringGeo, new THREE.MeshBasicMaterial({ color: 0xaaaaaa }));
      stringMesh.position.y = -s.length / 2;
      pivot.add(stringMesh);
      this.objects.string = stringMesh;

      this.objects.bob.position.y = -s.length;
      pivot.add(this.objects.bob);

      // Update ruler
      if (this.objects.ruler) {
        this.objects.ruler.scale.y = s.length / 2;
      }
    }
  },

  /**
   * Get current results for display
   */
  getResults() {
    const s = this.state;
    const computedG = (4 * Math.PI * Math.PI * s.length) / (s.period * s.period);
    return {
      'Length (L)': `${s.length.toFixed(2)} m`,
      'Measured Period (T)': `${s.period.toFixed(3)} s`,
      'Theoretical Period': `${(2 * Math.PI * Math.sqrt(s.length / 9.8)).toFixed(3)} s`,
      'Computed g': `${isFinite(computedG) ? computedG.toFixed(2) : '—'} m/s²`,
      'Actual g': '9.80 m/s²',
      'Elapsed Time': `${s.time.toFixed(1)} s`
    };
  },

  start() {
    const s = this.state;
    s.running = true;
    s.angularVelocity = 0;
    s.angle = 0.52; // ~30 degrees release angle
    s.lastAngle = undefined;
    s.lastCrossTime = undefined;
  },

  reset() {
    const s = this.state;
    s.running = false;
    s.angle = 0.52;
    s.angularVelocity = 0;
    s.time = 0;
    s.period = 0;
    s.lastAngle = undefined;
    s.currentStep = 0;
    if (this.objects.pivot) this.objects.pivot.rotation.z = s.angle;
  },

  cleanup(scene) {
    Object.values(this.objects).forEach(obj => scene.remove(obj));
    this.objects = {};
    this.state = { ...PendulumExperiment.state };
  }
};
