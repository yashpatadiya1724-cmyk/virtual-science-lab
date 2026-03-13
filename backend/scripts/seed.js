/**
 * Database Seed Script
 * Populates MongoDB with sample experiments, schools, and demo users
 * Run: node scripts/seed.js
 */

'use strict';

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { School, User, Experiment } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/virtual-science-lab';

const SCHOOLS = [
  { name: 'Government High School, Jaipur', code: 'GHS001', district: 'Jaipur', state: 'Rajasthan', tier: 'tier3' },
  { name: 'Kendriya Vidyalaya, Mumbai',     code: 'KV001',  district: 'Mumbai',  state: 'Maharashtra', tier: 'tier1' },
  { name: 'Zila Parishad School, Pune',     code: 'ZPS001', district: 'Pune',    state: 'Maharashtra', tier: 'rural' }
];

const EXPERIMENTS = [
  {
    name: 'Simple Pendulum',
    slug: 'simple-pendulum',
    subject: 'Physics',
    classLevels: ['Class 9', 'Class 10'],
    description: 'Study the periodic motion of a simple pendulum and determine the acceleration due to gravity.',
    ncertChapter: 'Chapter 10 – Gravitation',
    objectives: [
      'Understand the concept of periodic motion',
      'Measure time period of oscillation',
      'Verify T = 2π√(L/g)',
      'Calculate g experimentally'
    ],
    steps: [
      { order: 1, instruction: 'Adjust the string length using the slider.', hint: 'Try lengths between 0.5m and 3m' },
      { order: 2, instruction: 'Set the release angle to ~30°.', hint: 'Small angle approximation applies under 15°' },
      { order: 3, instruction: 'Click Start to release the pendulum.', hint: 'Count oscillations from left to right and back' },
      { order: 4, instruction: 'Record the time for 20 oscillations.', hint: 'One oscillation = complete back-and-forth swing' },
      { order: 5, instruction: 'Calculate T = Total time / Number of oscillations', hint: '' },
      { order: 6, instruction: 'Change string length and repeat.', hint: '' },
      { order: 7, instruction: 'Calculate g = 4π²L/T²', hint: 'Standard value of g = 9.8 m/s²' }
    ],
    duration: 15,
    difficulty: 'easy',
    tags: ['gravity', 'periodic-motion', 'oscillation', 'mechanics'],
    status: 'active'
  },
  {
    name: 'Prism Light Refraction',
    slug: 'prism-refraction',
    subject: 'Physics',
    classLevels: ['Class 10', 'Class 11', 'Class 12'],
    description: 'Observe the dispersion of white light through a triangular glass prism and measure the refractive index.',
    ncertChapter: 'Chapter 10 – Light – Reflection and Refraction',
    objectives: [
      'Understand refraction and dispersion',
      'Observe VIBGYOR spectrum formation',
      'Measure angle of deviation',
      'Calculate refractive index using n = sin((A+Dm)/2) / sin(A/2)'
    ],
    steps: [
      { order: 1, instruction: 'Place the prism on the optical bench.' },
      { order: 2, instruction: 'Direct a narrow beam of white light at one face.' },
      { order: 3, instruction: 'Adjust the angle of incidence using the slider.' },
      { order: 4, instruction: 'Click Start to activate the light beam.' },
      { order: 5, instruction: 'Observe the spectrum on the screen.' },
      { order: 6, instruction: 'Measure the angle of minimum deviation Dm.' },
      { order: 7, instruction: 'Calculate n using the formula.' }
    ],
    duration: 20,
    difficulty: 'medium',
    tags: ['optics', 'refraction', 'light', 'spectrum', 'dispersion'],
    status: 'active'
  },
  {
    name: 'Acid-Base Titration',
    slug: 'acid-base-titration',
    subject: 'Chemistry',
    classLevels: ['Class 9', 'Class 10', 'Class 11'],
    description: 'Perform a neutralisation reaction between hydrochloric acid and sodium hydroxide using phenolphthalein indicator.',
    ncertChapter: 'Chapter 2 – Acids, Bases and Salts',
    objectives: [
      'Understand acid-base neutralisation',
      'Use a burette for precise volume measurement',
      'Observe indicator colour changes',
      'Apply M₁V₁ = M₂V₂ to calculate concentration'
    ],
    steps: [
      { order: 1, instruction: 'Prepare 25mL of HCl (0.1M) in a conical flask.' },
      { order: 2, instruction: 'Add 3 drops of phenolphthalein indicator.' },
      { order: 3, instruction: 'Fill the burette with NaOH (0.1M) solution.' },
      { order: 4, instruction: 'Click Start to add NaOH dropwise.' },
      { order: 5, instruction: 'Observe pH changes on the meter.' },
      { order: 6, instruction: 'Note the colour change at endpoint (light pink).' },
      { order: 7, instruction: 'Calculate using M₁V₁ = M₂V₂.' }
    ],
    duration: 25,
    difficulty: 'medium',
    tags: ['acid', 'base', 'titration', 'neutralisation', 'pH'],
    status: 'active'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      School.deleteMany({}),
      User.deleteMany({}),
      Experiment.deleteMany({})
    ]);
    console.log('🗑  Cleared existing data');

    // Insert schools
    const schools = await School.insertMany(SCHOOLS);
    console.log(`🏫 Created ${schools.length} schools`);

    // Create demo users
    const passwordHash = await bcrypt.hash('demo1234', 12);
    const users = await User.insertMany([
      {
        name: 'Arjun Kumar',
        email: 'student@demo.com',
        passwordHash,
        role: 'student',
        classLevel: 'Class 10',
        school: schools[0]._id,
        streakDays: 4
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'teacher@demo.com',
        passwordHash,
        role: 'teacher',
        school: schools[0]._id
      },
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        passwordHash,
        role: 'admin'
      }
    ]);
    console.log(`👤 Created ${users.length} demo users`);

    // Insert experiments
    const teacher = users.find(u => u.role === 'teacher');
    const experiments = await Experiment.insertMany(
      EXPERIMENTS.map(e => ({ ...e, createdBy: teacher._id }))
    );
    console.log(`🧪 Created ${experiments.length} experiments`);

    console.log('\n✅ Database seeded successfully!');
    console.log('📧 Demo credentials:');
    console.log('   Student  → student@demo.com / demo1234');
    console.log('   Teacher  → teacher@demo.com / demo1234');
    console.log('   Admin    → admin@demo.com   / demo1234');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
