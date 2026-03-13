/**
 * routes/admin.js — Teacher/Admin API
 */
'use strict';
const router = require('express').Router();
const auth   = require('../middleware/auth');
const { requireRole } = auth;
const { User, Experiment, Session } = require('../models');

router.use(auth, requireRole('teacher','admin'));

// GET /api/admin/overview
router.get('/overview', async (req, res) => {
  try {
    const [students, experiments, todaySessions] = await Promise.all([
      User.countDocuments({ role:'student', isActive:true }),
      Experiment.countDocuments({ status:'active' }),
      Session.countDocuments({ startTime:{ $gte:new Date(new Date().setHours(0,0,0,0)) } })
    ]);
    res.json({ success:true, overview:{ students, experiments, todaySessions } });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

// GET /api/admin/students
router.get('/students', async (req, res) => {
  try {
    const { page=1, limit=20, search } = req.query;
    const filter = { role:'student', isActive:true };
    if (search) filter.name = { $regex:search, $options:'i' };
    const [students, total] = await Promise.all([
      User.find(filter).select('-passwordHash').sort({ lastActive:-1 }).skip((page-1)*limit).limit(Number(limit)),
      User.countDocuments(filter)
    ]);
    res.json({ success:true, students, total });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const since = new Date(Date.now() - 7*24*60*60*1000);
    const daily = await Session.aggregate([
      { $match:{ startTime:{ $gte:since } } },
      { $group:{ _id:{ $dateToString:{ format:'%Y-%m-%d', date:'$startTime' } }, count:{ $sum:1 }, avgScore:{ $avg:'$score' } } },
      { $sort:{ _id:1 } }
    ]);
    const topExp = await Session.aggregate([
      { $match:{ startTime:{ $gte:since } } },
      { $group:{ _id:'$experiment', count:{ $sum:1 } } },
      { $sort:{ count:-1 } }, { $limit:5 },
      { $lookup:{ from:'experiments', localField:'_id', foreignField:'_id', as:'exp' } },
      { $unwind:'$exp' },
      { $project:{ name:'$exp.name', subject:'$exp.subject', count:1 } }
    ]);
    res.json({ success:true, daily, topExp });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
