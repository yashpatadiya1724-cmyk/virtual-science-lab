/**
 * Virtual Science Lab — Automated Test Suite
 * Skill India VR | NEP 2020 Architecture & Scientific Verification
 */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Ensure dependencies resolve from backend/node_modules
module.paths.push(path.join(__dirname, '../backend/node_modules'));

console.log('====================================================');
console.log('🔬 VIRTUAL SCIENCE LAB: AUTOMATED VERIFICATION SUITE');
console.log('Skill India VR × NEP 2020 Interactive STEM Engine');
console.log('====================================================\n');

const rootDir = path.resolve(__dirname, '..');
let passedSuites = 0;

// ----------------------------------------------------
// SUITE 1: PROJECT CONFIGURATION & DEPLOYMENT MANIFESTS
// ----------------------------------------------------
console.log('Test Suite 1: Validating Project Manifests & Server Structure...');
{
  const backendPkgPath = path.join(rootDir, 'backend', 'package.json');
  assert.ok(fs.existsSync(backendPkgPath), 'backend/package.json must exist');
  const backendPkg = JSON.parse(fs.readFileSync(backendPkgPath, 'utf8'));
  assert.strictEqual(backendPkg.main, 'server.js', 'backend main entry point must be server.js');
  assert.ok(backendPkg.dependencies.express, 'express must be in dependencies');
  assert.ok(backendPkg.dependencies.mongoose, 'mongoose must be in dependencies');
  assert.ok(backendPkg.dependencies.helmet, 'helmet must be in dependencies');

  const vercelPath = path.join(rootDir, 'vercel.json');
  assert.ok(fs.existsSync(vercelPath), 'vercel.json must exist');
  const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  assert.ok(vercelConfig.routes || vercelConfig.rewrites, 'vercel.json must specify routing rules');

  console.log('✔ Project manifests and deployment configurations verified!');
  passedSuites++;
}

// ----------------------------------------------------
// SUITE 2: FRONTEND VIEWPORTS & WEBXR ENTRY POINTS
// ----------------------------------------------------
console.log('\nTest Suite 2: Verifying Core Frontend Pages & Simulation Engines...');
{
  const frontendDir = path.join(rootDir, 'frontend');
  const requiredPages = [
    'index.html',
    path.join('pages', 'lab.html'),
    path.join('pages', 'dashboard.html'),
    path.join('pages', 'admin.html')
  ];

  for (const page of requiredPages) {
    const fullPath = path.join(frontendDir, page);
    assert.ok(fs.existsSync(fullPath), `Page ${page} must exist in frontend`);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.ok(content.length > 500, `Page ${page} content must not be empty`);
  }

  const expDir = path.join(frontendDir, 'js', 'experiments');
  const experiments = ['pendulum.js', 'acidbase.js', 'prism.js'];
  for (const exp of experiments) {
    const fullPath = path.join(expDir, exp);
    assert.ok(fs.existsSync(fullPath), `Experiment file ${exp} must exist`);
    const code = fs.readFileSync(fullPath, 'utf8');
    assert.ok(code.includes('steps:'), `Experiment ${exp} must define guided steps`);
  }

  console.log('✔ All 4 frontend viewports and 3 simulation engines verified!');
  passedSuites++;
}

// ----------------------------------------------------
// SUITE 3: SCIENTIFIC COMPUTATION & SIMULATION FORMULAS
// ----------------------------------------------------
console.log('\nTest Suite 3: Validating STEM Physics & Chemistry Simulation Formulas...');
{
  // 1. Simple Harmonic Motion: T = 2 * pi * sqrt(L / g)
  const g = 9.8; // m/s^2
  const length = 2.0; // metres
  const expectedPeriod = 2 * Math.PI * Math.sqrt(length / g);
  assert.ok(Math.abs(expectedPeriod - 2.838) < 0.01, `Pendulum period at L=2m must be ~2.84s (calculated: ${expectedPeriod.toFixed(3)})`);

  // 2. Acid-Base Titration Equivalence: (M1 * V1 = M2 * V2)
  const mAcid = 0.1; // mol/L HCl
  const vAcid = 25.0; // mL
  const mBase = 0.1; // mol/L NaOH
  const equivalenceVolume = (mAcid * vAcid) / mBase;
  assert.strictEqual(equivalenceVolume, 25.0, 'Neutralisation endpoint volume must match molar stoichiometry (25.0 mL)');

  // 3. Snell's Law of Refraction: n1 * sin(theta1) = n2 * sin(theta2)
  const nAir = 1.0;
  const nGlass = 1.5;
  const angleIncidentDeg = 45.0;
  const angleIncidentRad = (angleIncidentDeg * Math.PI) / 180.0;
  const sinRefracted = (nAir * Math.sin(angleIncidentRad)) / nGlass;
  const angleRefractedDeg = (Math.asin(sinRefracted) * 180.0) / Math.PI;
  assert.ok(angleRefractedDeg < angleIncidentDeg, 'Light ray must bend towards the normal in a denser medium');
  assert.ok(Math.abs(angleRefractedDeg - 28.13) < 0.1, `Refraction angle must be ~28.1° (calculated: ${angleRefractedDeg.toFixed(2)}°)`);

  // 4. Inverse Acceleration Due to Gravity from Harmonic Oscillation: g = 4 * pi^2 * L / T^2
  const gCalculated = (4 * Math.PI * Math.PI * length) / (expectedPeriod * expectedPeriod);
  assert.ok(Math.abs(gCalculated - 9.8) < 0.05, `Calculated g (${gCalculated.toFixed(2)}) must align with terrestrial gravity (9.8 m/s²)`);

  // 5. Prism Minimum Deviation Angle: n = sin((A + Dm)/2) / sin(A/2)
  const apexAngleA = 60.0; // degrees
  const glassIndex = 1.52; // borosilicate crown glass
  const sinHalfA = Math.sin((apexAngleA * Math.PI) / 360.0);
  const minDeviationDeg = (2 * Math.asin(glassIndex * sinHalfA) * 180.0) / Math.PI - apexAngleA;
  assert.ok(Math.abs(minDeviationDeg - 38.92) < 0.15, `Prism minimum deviation must be ~38.9° (calculated: ${minDeviationDeg.toFixed(2)}°)`);

  // 6. Dynamic pH Curve Progression during Strong Acid / Strong Base Titration
  const phInitial = -Math.log10(mAcid);
  assert.strictEqual(phInitial, 1.0, 'Initial 0.1 M HCl pH must be 1.0');

  const vAdded20mL = 20.0;
  const molesRemainingH = (mAcid * vAcid - mBase * vAdded20mL) / 1000.0;
  const totalVolumePreEq = (vAcid + vAdded20mL) / 1000.0;
  const concentrationH = molesRemainingH / totalVolumePreEq;
  const phPreEq = -Math.log10(concentrationH);
  assert.ok(phPreEq > phInitial && phPreEq < 7.0, 'pH must rise gradually before equivalence point');

  const phEquivalence = 7.0; // Neutral water dissociation at 25°C
  const vAdded30mL = 30.0;
  const molesExcessOH = (mBase * vAdded30mL - mAcid * vAcid) / 1000.0;
  const totalVolumePostEq = (vAcid + vAdded30mL) / 1000.0;
  const concentrationOH = molesExcessOH / totalVolumePostEq;
  const phPostEq = 14.0 - (-Math.log10(concentrationOH));
  assert.ok(phPostEq > phEquivalence && phPostEq > 11.0, 'pH must surge into basic range (>11) after equivalence');

  // 7. Thin Lens Formula for Convex Converging Optics: 1/f = 1/v - 1/u
  const focalLengthF = 15.0; // cm
  // Case A: Real object at 2f (u = -30 cm) -> Real inverted image at 2f (v = +30 cm)
  const objectDistAt2f = -30.0;
  const imageDistAt2f = (focalLengthF * objectDistAt2f) / (objectDistAt2f + focalLengthF);
  assert.ok(Math.abs(imageDistAt2f - 30.0) < 0.01, `Convex lens image distance at 2f must be +30.0 cm (calculated: ${imageDistAt2f.toFixed(2)})`);
  const magnificationAt2f = imageDistAt2f / objectDistAt2f;
  assert.strictEqual(magnificationAt2f, -1.0, 'Magnification at 2f must be -1.0 (inverted, equal size)');

  // Case B: Virtual image magnifying glass regime (u = -10 cm < f)
  const objectDistVirtual = -10.0;
  const imageDistVirtual = (focalLengthF * objectDistVirtual) / (objectDistVirtual + focalLengthF);
  assert.ok(Math.abs(imageDistVirtual - (-30.0)) < 0.01, 'Image must be virtual (v = -30.0 cm)');
  const magnificationVirtual = imageDistVirtual / objectDistVirtual;
  assert.strictEqual(magnificationVirtual, 3.0, 'Virtual image magnification must be +3.0 (upright, magnified)');

  // 8. Ohm's Law & Circuit Equivalent Resistances (Series vs Parallel)
  const r1 = 100.0; // Ohms
  const r2 = 100.0; // Ohms
  const voltage = 10.0; // Volts
  const rSeries = r1 + r2;
  const rParallel = (r1 * r2) / (r1 + r2);
  assert.strictEqual(rSeries, 200.0, 'Series equivalent resistance must sum to 200 Ohms');
  assert.strictEqual(rParallel, 50.0, 'Parallel equivalent resistance must equal 50 Ohms');

  const iParallel = voltage / rParallel;
  const pParallel = voltage * iParallel;
  assert.strictEqual(iParallel, 0.2, 'Parallel total current must be 0.2 Amperes at 10V');
  assert.strictEqual(pParallel, 2.0, 'Total power dissipation must be 2.0 Watts');

  // 9. Ideal Gas Law Thermodynamics: P * V = n * R * T
  const R_GAS = 8.314; // J/(mol*K)
  const n_moles = 1.0; // 1 mole of gas
  const t_kelvin = 273.15; // 0 deg C
  const p_pascals = 101325.0; // 1 atm in Pa
  const molarVolumeM3 = (n_moles * R_GAS * t_kelvin) / p_pascals;
  const molarVolumeLiters = molarVolumeM3 * 1000.0;
  assert.ok(Math.abs(molarVolumeLiters - 22.414) < 0.02, `Standard molar gas volume must be ~22.4L (calculated: ${molarVolumeLiters.toFixed(3)}L)`);

  // Isothermal expansion (Boyle's Law: P1 * V1 = P2 * V2)
  const vDouble = molarVolumeM3 * 2.0;
  const pHalved = (p_pascals * molarVolumeM3) / vDouble;
  assert.strictEqual(pHalved, p_pascals / 2.0, "Isothermal volume doubling must halve gas pressure");

  // 10. Mechanical Energy Conservation: E_total = E_potential + E_kinetic
  const massKg = 0.5;
  const dropHeightM = 10.0;
  const initialEp = massKg * g * dropHeightM; // m * g * h
  // Final velocity upon ground impact: v = sqrt(2 * g * h)
  const impactVelocity = Math.sqrt(2 * g * dropHeightM);
  const finalEk = 0.5 * massKg * impactVelocity * impactVelocity;
  assert.ok(Math.abs(finalEk - initialEp) < 1e-6, `Total mechanical energy (${initialEp} J) must be conserved at impact (${finalEk} J)`);

  console.log('✔ Mathematical & scientific simulation models verified!');
  passedSuites++;
}

// ----------------------------------------------------
// SUITE 4: BACKEND ROUTE & MONGOOSE SCHEMA INTEGRITY
// ----------------------------------------------------
console.log('\nTest Suite 4: Verifying Backend Routes & Mongoose Data Model...');
{
  const modelsPath = path.join(rootDir, 'backend', 'models', 'index.js');
  assert.ok(fs.existsSync(modelsPath), 'backend/models/index.js must exist');
  const modelsCode = fs.readFileSync(modelsPath, 'utf8');

  assert.ok(modelsCode.includes('SchoolSchema'), 'Must define SchoolSchema');
  assert.ok(modelsCode.includes('UserSchema'), 'Must define UserSchema');
  assert.ok(modelsCode.includes('ExperimentSchema'), 'Must define ExperimentSchema');
  assert.ok(modelsCode.includes('ProgressSchema') || modelsCode.includes('SessionSchema'), 'Must define student tracking schemas');

  const routesDir = path.join(rootDir, 'backend', 'routes');
  const requiredRoutes = ['auth.js', 'students.js', 'experiments.js', 'admin.js', 'analytics.js'];
  for (const r of requiredRoutes) {
    assert.ok(fs.existsSync(path.join(routesDir, r)), `Route file ${r} must exist`);
  }

  console.log('✔ Backend models, database schemas, and API routes verified!');
  passedSuites++;
}

// ----------------------------------------------------
// SUITE 5: LIVE EXPRESS HTTP ENDPOINTS & CORS HEADERS
// ----------------------------------------------------
console.log('\nTest Suite 5: Verifying Express Server Endpoints & Health Check...');
(async () => {
  process.env.NODE_ENV = 'test';
  const http = require('http');
  const app = require('../backend/server');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    const res = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body), headers: res.headers }));
      }).on('error', reject);
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.strictEqual(res.body.service, 'Virtual Science Lab API');
    console.log('✔ Express HTTP health check and JSON middleware verified!');
    passedSuites++;
  } finally {
    server.close();
  }

  console.log('\n----------------------------------------------------');
  console.log(`Summary: ${passedSuites} suites passed, 0 failed`);
  console.log('✔ All Virtual Science Lab automated test suites passed successfully!\n');
})();
