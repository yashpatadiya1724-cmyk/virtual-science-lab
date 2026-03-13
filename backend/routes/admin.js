/**
 * Admin Routes
 */
'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRole } = auth;
const { User, Experiment, Session, School } = require('../models');

// All admin routes require authentication + teacher or admin role
router.use(auth, requireRole('teacher', 'admin'));

// ---- GET /api/admin/overview ----
router.get('/overview', async (req, res) => {
  try {
    const [totalStudents, totalExperiments, todaySessions, schools] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      Experiment.countDocuments({ status: 'active' }),
      Session.countDocuments({ startTime: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
      School.countDocuments()
    ]);

    res.json({ success: true, overview: { totalStudents, totalExperiments, todaySessions, schools } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---- GET /api/admin/students ----
router.get('/students', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: 'student', isActive: true };
    if (search) filter.name = { $regex: search, $options: 'i' };

    const [students, total] = await Promise.all([
      User.find(filter).select('-passwordHash').sort({ lastActive: -1 })
        .skip((page - 1) * limit).limit(Number(limit)),
      User.countDocuments(filter)
    ]);

    res.json({ success: true, students, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---- GET /api/admin/analytics ----
router.get('/analytics', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const dailySessions = await Session.aggregate([
      { $match: { startTime: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
          count: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topExperiments = await Session.aggregate([
      { $match: { startTime: { $gte: since } } },
      { $group: { _id: '$experiment', sessionCount: { $sum: 1 }, avgScore: { $avg: '$score' } } },
      { $sort: { sessionCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'experiments', localField: '_id', foreignField: '_id', as: 'exp' } },
      { $unwind: '$exp' },
      { $project: { name: '$exp.name', subject: '$exp.subject', sessionCount: 1, avgScore: { $round: ['$avgScore', 1] } } }
    ]);

    res.json({ success: true, dailySessions, topExperiments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
