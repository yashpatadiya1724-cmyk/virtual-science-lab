/**
 * server.js — Express Entry Point
 * Virtual Science Lab | Skill India VR
 */
'use strict';
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const path       = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;
const DB   = process.env.MONGODB_URI || 'mongodb://localhost:27017/virtual-science-lab';

// ---- Middleware ----
app.use(helmet({ contentSecurityPolicy:false }));
app.use(cors({ origin:process.env.FRONTEND_ORIGIN||'*' }));
app.use(express.json({ limit:'10mb' }));
app.use(morgan(process.env.NODE_ENV==='production'?'combined':'dev'));

// ---- Static frontend ----
app.use(express.static(path.join(__dirname,'../frontend')));

// ---- Routes ----
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/students',    require('./routes/students'));
app.use('/api/experiments', require('./routes/experiments'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/analytics',   require('./routes/analytics'));

// ---- Health check ----
app.get('/api/health', (req,res) => res.json({
  status:'ok', service:'Virtual Science Lab API', version:'1.0.0',
  db: mongoose.connection.readyState===1?'connected':'disconnected',
  timestamp: new Date().toISOString()
}));

// ---- SPA fallback ----
app.get('*', (req,res) => res.sendFile(path.join(__dirname,'../frontend/index.html')));

// ---- Error handler ----
app.use((err,req,res,next) => {
  console.error(err.stack);
  res.status(err.status||500).json({ success:false, message:err.message||'Internal Server Error' });
});

// ---- Start ----
mongoose.connect(DB)
  .then(() => { console.log('✅ MongoDB connected'); })
  .catch(err => { console.warn('⚠  MongoDB not connected:', err.message, '\nStarting in demo mode...'); });

// Only listen locally — Vercel handles the HTTP layer in production
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server → http://localhost:${PORT}`));
}

module.exports = app;

