/**
 * Prism Light Refraction Experiment
 * Physics – Optics / Dispersion of Light
 * Virtual Science Lab | Skill India VR
 */

'use strict';

window.PrismExperiment = {
  name: 'Prism Light Refraction',
  subject: 'Physics',
  classLevel: 'Class 10-12',
  duration: '20 min',

  state: {
    running: false,
    prismAngle: 60,         // degrees (apex angle of prism)
    incidentAngle: 40,      // degrees
    refractiveIndex: 1.52,  // glass (borosilicate)
    time: 0,
    currentStep: 0,
    beamIntensity: 1.0,
    spectrumVisible: false
  },

  steps: [
    { text: 'Place the prism on the lab table. Observe the triangular cross-section.' },
    { text: 'Direct the white light beam towards one face of the prism.' },
    { text: 'Adjust the angle of incidence (i) using the slider.' },
    { text: 'Click ▶ Start to send the light through the prism.' },
    { text: 'Observe dispersion: white light splits into VIBGYOR spectrum.' },
    { text: 'Measure the angle of deviation (D) for each colour.' },
    { text: 'Find minimum deviation angle and calculate refractive index: n = sin((A+Dm)/2) / sin(A/2).' }
  ],

  scene: null,
  objects: {},

  build(scene, THREE) {
    this.scene = scene;
    this.THREE = THREE;
    const objs = this.objects;

    // -- Lab table --
    const tableMat = new THREE.MeshPhongMaterial({ color: 0x1a2a3a, shininess: 20 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(12, 0.15, 5), tableMat);
    table.position.set(0, -1.5, 0);
    scene.add(table);
    objs.table = table;

    // -- Floor grid --
    const grid = new THREE.GridHelper(20, 20, 0x112233, 0x0a1628);
    grid.position.y = -1.65;
    scene.add(grid);
    objs.grid = grid;

    // -- Prism (triangular prism geometry) --
    const prism = this._createPrism(THREE);
    prism.position.set(0, -1.3, 0);
    scene.add(prism);
    objs.prism = prism;

    // -- Incident light beam (white) --
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const incidentBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 4, 8),
      beamMat
    );
    incidentBeam.rotation.z = Math.PI / 2;
    incidentBeam.position.set(-4, -1.1, 0);
    scene.add(incidentBeam);
    objs.incidentBeam = incidentBeam;

    // -- Light source (torch) --
    const torchBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.18, 0.8, 12),
      new THREE.MeshPhongMaterial({ color: 0x334455, shininess: 80 })
    );
    torchBody.rotation.z = Math.PI / 2;
    torchBody.position.set(-6.2, -1.1, 0);
    scene.add(torchBody);
    objs.torch = torchBody;

    // -- Torch light lens (glowing circle) --
    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(0.12, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffee, emissive: 0xffffee })
    );
    lens.position.set(-5.8, -1.1, 0);
    lens.rotation.y = Math.PI / 2;
    scene.add(lens);
    objs.lens = lens;

    // -- Spectrum rays (initially hidden) --
    const spectrumColors = [
      { color: 0xff0000, deviation: 0.50 }, // Red
      { color: 0xff7700, deviation: 0.55 }, // Orange
      { color: 0xffff00, deviation: 0.60 }, // Yellow
      { color: 0x00ff00, deviation: 0.65 }, // Green
      { color: 0x0088ff, deviation: 0.72 }, // Blue
      { color: 0x4400ff, deviation: 0.80 }, // Indigo
      { color: 0x8800cc, deviation: 0.88 }, // Violet
    ];

    objs.spectrumRays = [];
    spectrumColors.forEach(({ color, deviation }) => {
      const ray = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 4, 6),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 })
      );
      // Position emerging from right face of prism
      ray.rotation.z = Math.PI / 2 - deviation;
      ray.position.set(3.2, -0.8 + deviation * 0.8, 0);
      scene.add(ray);
      objs.spectrumRays.push(ray);
    });

    // -- Protractor (angle guide) on table --
    const protractorGeo = new THREE.TorusGeometry(1.2, 0.02, 8, 32, Math.PI);
    const protractor = new THREE.Mesh(
      protractorGeo,
      new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.4 })
    );
    protractor.rotation.x = -Math.PI / 2;
    protractor.position.set(0, -1.42, 0);
    scene.add(protractor);
    objs.protractor = protractor;

    // -- Lighting --
    scene.add(new THREE.AmbientLight(0x112233, 2));
    const spotlight = new THREE.SpotLight(0xffffff, 3, 20, Math.PI / 4);
    spotlight.position.set(-8, 5, 3);
    scene.add(spotlight);
    objs.spotlight = spotlight;

    // -- Screen/paper on right side --
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.05, 3),
      new THREE.MeshPhongMaterial({ color: 0xf5f5e0, side: THREE.DoubleSide })
    );
    screen.position.set(6, -0.3, 0);
    scene.add(screen);
    objs.screen = screen;

    return objs;
  },

  /**
   * Create a triangular prism mesh
   */
  _createPrism(THREE) {
    // Build triangle cross-section
    const h = Math.sqrt(3) / 2; // equilateral triangle height (side=1)

    const vertices = new Float32Array([
      // Front face (z = 0.5)
      -0.7,  -0.5, 0.5,
       0.7,  -0.5, 0.5,
       0.0,   0.7, 0.5,
      // Back face (z = -0.5)
      -0.7,  -0.5, -0.5,
       0.7,  -0.5, -0.5,
       0.0,   0.7, -0.5,
    ]);

    const indices = [
      // Front
      0, 1, 2,
      // Back
      5, 4, 3,
      // Bottom
      0, 4, 1, 0, 3, 4,
      // Left face
      0, 2, 3, 2, 5, 3,
      // Right face
      1, 4, 2, 4, 5, 2
    ];

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhongMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.55,
      shininess: 200,
      specular: 0xffffff,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(1.5, 1.5, 2.5);
    return mesh;
  },

  update(dt) {
    const s = this.state;
    if (!s.running) return;

    s.time += dt;

    // Animate beam flickering slightly
    if (this.objects.incidentBeam) {
      this.objects.incidentBeam.material.opacity = 0.7 + Math.sin(s.time * 10) * 0.1;
    }

    // Pulsate spectrum rays
    if (s.spectrumVisible && this.objects.spectrumRays) {
      this.objects.spectrumRays.forEach((ray, i) => {
        ray.material.opacity = 0.7 + Math.sin(s.time * 5 + i * 0.3) * 0.15;
      });
    }

    // Slowly rotate prism
    if (this.objects.prism) {
      this.objects.prism.rotation.y = Math.sin(s.time * 0.3) * 0.1;
    }
  },

  /**
   * Snell's law calculation
   * n1 * sin(i) = n2 * sin(r)
   */
  _computeRefraction() {
    const s = this.state;
    const n1 = 1.0; // air
    const n2 = s.refractiveIndex;
    const i = degToRad(s.incidentAngle);
    const sinR = (n1 / n2) * Math.sin(i);
    if (Math.abs(sinR) > 1) return null; // total internal reflection
    const r = Math.asin(sinR);
    const A = degToRad(s.prismAngle);
    const deviation = (i - r) + (A - r) * n2;
    return { r: r * 180 / Math.PI, deviation: deviation * 180 / Math.PI };
  },

  start() {
    const s = this.state;
    s.running = true;
    s.spectrumVisible = true;

    // Show spectrum rays with animation
    if (this.objects.spectrumRays) {
      this.objects.spectrumRays.forEach((ray, i) => {
        setTimeout(() => {
          ray.material.opacity = 0.8;
        }, i * 100);
      });
    }

    showToast('Light beam activated! Observe the spectrum.', 'success');
  },

  reset() {
    const s = this.state;
    s.running = false;
    s.time = 0;
    s.spectrumVisible = false;
    s.currentStep = 0;

    if (this.objects.spectrumRays) {
      this.objects.spectrumRays.forEach(ray => ray.material.opacity = 0);
    }
  },

  getResults() {
    const s = this.state;
    const refData = this._computeRefraction();
    const minDeviation = refData ? refData.deviation.toFixed(1) : '—';
    const measuredN = refData
      ? (Math.sin(degToRad((s.prismAngle + parseFloat(minDeviation)) / 2)) /
         Math.sin(degToRad(s.prismAngle / 2))).toFixed(3)
      : '—';

    return {
      'Prism Angle (A)': `${s.prismAngle}°`,
      'Incident Angle (i)': `${s.incidentAngle}°`,
      'Refracted Angle (r)': refData ? `${refData.r.toFixed(1)}°` : 'TIR',
      'Angle of Deviation': `${minDeviation}°`,
      'Measured n': measuredN,
      'Actual n (glass)': '1.520'
    };
  },

  cleanup(scene) {
    Object.values(this.objects).forEach(obj => {
      if (Array.isArray(obj)) obj.forEach(o => scene.remove(o));
      else scene.remove(obj);
    });
    this.objects = {};
  }
};
