/**
 * scripts/seed.js — Populate demo data
 * Run: node scripts/seed.js
 */
'use strict';
require('dotenv').config({ path:'../.env' });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { School, User, Experiment } = require('../models');
const DB = process.env.MONGODB_URI || 'mongodb://localhost:27017/virtual-science-lab';

const SCHOOLS = [
  { name:'Government High School, Jaipur', code:'GHS001', district:'Jaipur', state:'Rajasthan', tier:'tier3' },
  { name:'Kendriya Vidyalaya, Mumbai',      code:'KV001',  district:'Mumbai', state:'Maharashtra', tier:'tier1' }
];

const EXPERIMENTS = [
  {
    name:'Simple Pendulum', slug:'simple-pendulum', subject:'Physics',
    classLevels:['Class 9','Class 10'],
    description:'Study periodic motion and determine acceleration due to gravity.',
    ncertChapter:'Chapter 10 – Gravitation',
    objectives:['Understand periodic motion','Measure time period','Verify T = 2π√(L/g)','Calculate g'],
    steps:[
      {order:1,instruction:'Adjust string length using the slider.',hint:'Try 0.5m to 3m'},
      {order:2,instruction:'Release angle set to 30°.',hint:'Small angle approximation applies <15°'},
      {order:3,instruction:'Click Start to release the pendulum.'},
      {order:4,instruction:'Count oscillations over 20 seconds.'},
      {order:5,instruction:'Calculate T = Total time ÷ Oscillations.'},
      {order:6,instruction:'Change string length and repeat.'},
      {order:7,instruction:'Calculate g = 4π²L/T². Compare with 9.8 m/s².'}
    ],
    duration:15, difficulty:'easy', tags:['gravity','oscillation','mechanics'], status:'active'
  },
  {
    name:'Prism Refraction', slug:'prism-refraction', subject:'Physics',
    classLevels:['Class 10','Class 11','Class 12'],
    description:'Observe dispersion of white light through a triangular glass prism.',
    ncertChapter:'Chapter 10 – Light, Reflection and Refraction',
    objectives:['Understand refraction','Observe VIBGYOR spectrum','Measure deviation','Calculate n'],
    steps:[
      {order:1,instruction:'Place prism on the optical bench.'},
      {order:2,instruction:'Direct white light at one face.'},
      {order:3,instruction:'Adjust angle of incidence using slider.'},
      {order:4,instruction:'Click Start to activate the light.'},
      {order:5,instruction:'Observe spectrum on screen.'},
      {order:6,instruction:'Measure angle of minimum deviation Dm.'},
      {order:7,instruction:'Calculate n = sin((A+Dm)/2) ÷ sin(A/2).'}
    ],
    duration:20, difficulty:'medium', tags:['optics','refraction','light','spectrum'], status:'active'
  },
  {
    name:'Acid-Base Titration', slug:'acid-base-titration', subject:'Chemistry',
    classLevels:['Class 9','Class 10','Class 11'],
    description:'Neutralisation reaction between HCl and NaOH using phenolphthalein indicator.',
    ncertChapter:'Chapter 2 – Acids, Bases and Salts',
    objectives:['Understand neutralisation','Use burette','Observe indicator changes','Apply M₁V₁=M₂V₂'],
    steps:[
      {order:1,instruction:'Prepare 25mL HCl (0.1M) in a conical flask.'},
      {order:2,instruction:'Add 3 drops of phenolphthalein.'},
      {order:3,instruction:'Fill burette with NaOH (0.1M).'},
      {order:4,instruction:'Click Start to add NaOH dropwise.'},
      {order:5,instruction:'Observe pH changes.'},
      {order:6,instruction:'Note colour change at endpoint (pink).'},
      {order:7,instruction:'Calculate using M₁V₁ = M₂V₂.'}
    ],
    duration:25, difficulty:'medium', tags:['acid','base','titration','pH','neutralisation'], status:'active'
  }
];

async function seed() {
  await mongoose.connect(DB);
  console.log('✅ Connected');
  await Promise.all([School.deleteMany({}), User.deleteMany({}), Experiment.deleteMany({})]);
  console.log('🗑  Cleared');
  const schools = await School.insertMany(SCHOOLS);
  const hash = await bcrypt.hash('demo1234', 12);
  const users = await User.insertMany([
    { name:'Arjun Kumar',      email:'student@demo.com', passwordHash:hash, role:'student', classLevel:'Class 10', school:schools[0]._id, streakDays:4 },
    { name:'Dr. Priya Sharma', email:'teacher@demo.com', passwordHash:hash, role:'teacher', school:schools[0]._id },
    { name:'Admin User',       email:'admin@demo.com',   passwordHash:hash, role:'admin' }
  ]);
  const teacher = users.find(u=>u.role==='teacher');
  await Experiment.insertMany(EXPERIMENTS.map(e=>({ ...e, createdBy:teacher._id })));
  console.log('\n✅ Seeded!\n📧 Demo logins:');
  console.log('   student@demo.com / demo1234');
  console.log('   teacher@demo.com / demo1234');
  console.log('   admin@demo.com   / demo1234');
  process.exit(0);
}

seed().catch(e=>{ console.error('❌', e.message); process.exit(1); });
