/**
 * Analytics Routes – lightweight event logging
 */
'use strict';

const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { Analytics } = require('../models');

// ---- POST /api/analytics/event ----  (log any client-side event)
router.post('/event', auth, async (req, res) => {
  try {
    const { eventType, experimentId, metadata } = req.body;
    await Analytics.create({
      eventType,
      userId: req.user.id,
      experimentId,
      metadata
    });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ---- GET /api/analytics/summary ----  (public summary stats)
router.get('/summary', async (req, res) => {
  try {
    const [totalSessions, totalStudents, totalExperiments] = await Promise.all([
      Analytics.countDocuments({ eventType: 'session_start' }),
      Analytics.distinct('userId').then(ids => ids.length),
      Analytics.distinct('experimentId').then(ids => ids.length)
    ]);
    res.json({ success: true, totalSessions, totalStudents, totalExperiments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
