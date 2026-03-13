/**
 * routes/analytics.js — Event logging
 */
'use strict';
const router = require('express').Router();
const auth   = require('../middleware/auth');
const { Analytics } = require('../models');

// POST /api/analytics/event
router.post('/event', auth, async (req, res) => {
  try {
    const { eventType, experimentId, metadata } = req.body;
    await Analytics.create({ eventType, userId:req.user.id, experimentId, metadata });
    res.json({ success:true });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

// GET /api/analytics/summary
router.get('/summary', async (req, res) => {
  try {
    const sessions    = await Analytics.countDocuments({ eventType:'session_start' });
    const uniqueUsers = (await Analytics.distinct('userId')).length;
    res.json({ success:true, sessions, uniqueUsers });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
