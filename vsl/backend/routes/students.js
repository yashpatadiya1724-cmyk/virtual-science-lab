/**
 * routes/students.js — Dashboard data, profile, leaderboard
 */
'use strict';
const router = require('express').Router();
const auth   = require('../middleware/auth');
const { User, Progress, Session } = require('../models');

// GET /api/students/me
router.get('/me', auth, async (req, res) => {
  try {
    const [user, progressList, sessions] = await Promise.all([
      User.findById(req.user.id).select('-passwordHash').populate('school','name district'),
      Progress.find({ student:req.user.id }).populate('experiment','name subject slug').sort({ lastAttempt:-1 }),
      Session.find({ student:req.user.id }).populate('experiment','name subject').sort({ startTime:-1 }).limit(10)
    ]);
    if (!user) return res.status(404).json({ success:false, message:'Not found.' });
    const completedCount = progressList.filter(p=>p.completed).length;
    const avgScore = progressList.length ? Math.round(progressList.reduce((s,p)=>s+p.bestScore,0)/progressList.length) : 0;
    res.json({ success:true, user, stats:{ completedCount, avgScore, streakDays:user.streakDays }, progress:progressList, sessions });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

// PATCH /api/students/me
router.patch('/me', auth, async (req, res) => {
  try {
    const allowed = ['name','classLevel','language'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k])=>allowed.includes(k)));
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new:true }).select('-passwordHash');
    res.json({ success:true, user });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

// GET /api/students/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const lb = await Progress.aggregate([
      { $match:{ completed:true } },
      { $group:{ _id:'$student', count:{ $sum:1 }, avgScore:{ $avg:'$bestScore' } } },
      { $sort:{ count:-1, avgScore:-1 } }, { $limit:10 },
      { $lookup:{ from:'users', localField:'_id', foreignField:'_id', as:'user' } },
      { $unwind:'$user' },
      { $project:{ name:'$user.name', classLevel:'$user.classLevel', count:1, avgScore:{ $round:['$avgScore',1] } } }
    ]);
    res.json({ success:true, leaderboard:lb });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
