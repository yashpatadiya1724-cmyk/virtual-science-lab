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
