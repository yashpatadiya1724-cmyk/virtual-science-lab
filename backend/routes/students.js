/**
 * Student Routes – Profile, Progress, Dashboard data
 */
'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { User, Progress, Session } = require('../models');

// ---- GET /api/students/me ---- (dashboard data for logged-in student)
router.get('/me', auth, async (req, res) => {
  try {
    const [user, progressList, recentSessions] = await Promise.all([
      User.findById(req.user.id).select('-passwordHash').populate('school', 'name district'),
      Progress.find({ student: req.user.id })
        .populate('experiment', 'name subject slug')
        .sort({ lastAttempt: -1 }),
      Session.find({ student: req.user.id })
        .populate('experiment', 'name subject')
        .sort({ startTime: -1 })
        .limit(10)
    ]);

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const completedCount = progressList.filter(p => p.completed).length;
    const avgScore = progressList.length
      ? Math.round(progressList.reduce((s, p) => s + p.bestScore, 0) / progressList.length)
      : 0;
    const totalTime = progressList.reduce((s, p) => s + p.totalTimeSpent, 0);

    res.json({
      success: true,
      user,
      stats: { completedCount, avgScore, totalTime, streakDays: user.streakDays },
      progress: progressList,
      recentSessions
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---- PATCH /api/students/me ---- (update profile)
router.patch('/me', auth, async (req, res) => {
  try {
    const allowed = ['name', 'classLevel', 'language', 'avatar'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-passwordHash');
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ---- GET /api/students/leaderboard ---- (top 10 by experiments completed)
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Progress.aggregate([
      { $match: { completed: true } },
      { $group: { _id: '$student', count: { $sum: 1 }, avgScore: { $avg: '$bestScore' } } },
      { $sort: { count: -1, avgScore: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', classLevel: '$user.classLevel', count: 1, avgScore: { $round: ['$avgScore', 1] } } }
    ]);
    res.json({ success: true, leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
