/**
 * Virtual Science Lab – Express.js Server
 * Skill India VR | NEP 2020
 * 
 * Entry point: initialises Express, MongoDB, and routes
 */

'use strict';

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/virtual-science-lab';

// =====================================================
// MIDDLEWARE
// =====================================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false // disabled to allow Three.js/A-Frame CDN loads
}));

// CORS (allow frontend dev server)
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// =====================================================
// ROUTES
// =====================================================
const authRoutes        = require('./routes/auth');
const studentRoutes     = require('./routes/students');
const experimentRoutes  = require('./routes/experiments');
const adminRoutes       = require('./routes/admin');
const analyticsRoutes   = require('./routes/analytics');

app.use('/api/auth',        authRoutes);
app.use('/api/students',    studentRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/analytics',   analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Virtual Science Lab API',
    version: '1.0.0',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Catch-all: serve frontend SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// =====================================================
// ERROR HANDLING
// =====================================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// =====================================================
// DATABASE + SERVER START
// =====================================================
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(`✅ MongoDB connected: ${MONGODB_URI}`);
    app.listen(PORT, () => {
      console.log(`🚀 Virtual Science Lab server running on http://localhost:${PORT}`);
      console.log(`📚 NEP 2020 | Skill India VR Platform`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('ℹ  Starting server without database (demo mode)...');
    // Start anyway for frontend serving
    app.listen(PORT, () => {
      console.log(`🚀 Server running (no DB) on http://localhost:${PORT}`);
    });
  });

module.exports = app;
