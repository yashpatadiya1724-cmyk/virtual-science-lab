/**
 * routes/experiments.js — CRUD + session + completion
 */
'use strict';
const router = require('express').Router();
const auth   = require('../middleware/auth');
const { requireRole } = auth;
const { Experiment, Session, Progress, Analytics } = require('../models');

// GET /api/experiments
router.get('/', async (req, res) => {
  try {
    const { subject, classLevel, status='active', page=1, limit=20 } = req.query;
    const filter = { status };
    if (subject) filter.subject = subject;
    if (classLevel) filter.classLevels = classLevel;
    const [exps, total] = await Promise.all([
      Experiment.find(filter).select('-steps').sort({ totalSessions:-1 }).skip((page-1)*limit).limit(Number(limit)),
      Experiment.countDocuments(filter)
    ]);
    res.json({ success:true, experiments:exps, total, page:Number(page) });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

// GET /api/experiments/:slug
router.get('/:slug', async (req, res) => {
  try {
    const exp = await Experiment.findOne({ slug:req.params.slug, status:'active' }).populate('createdBy','name');
    if (!exp) return res.status(404).json({ success:false, message:'Not found.' });
    res.json({ success:true, experiment:exp });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST /api/experiments  (teacher+)
router.post('/', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    const exp = await Experiment.create({ ...req.body, createdBy:req.user.id });
    res.status(201).json({ success:true, experiment:exp });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

// PUT /api/experiments/:id  (teacher+)
router.put('/:id', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    const exp = await Experiment.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true });
    if (!exp) return res.status(404).json({ success:false, message:'Not found.' });
    res.json({ success:true, experiment:exp });
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

// DELETE /api/experiments/:id  (admin)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Experiment.findByIdAndUpdate(req.params.id, { status:'archived' });
    res.json({ success:true, message:'Archived.' });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST /api/experiments/session/start
router.post('/session/start', auth, async (req, res) => {
  try {
    const { experimentId, vrMode, deviceType } = req.body;
    const session = await Session.create({ student:req.user.id, experiment:experimentId, vrMode:!!vrMode, deviceType:deviceType||'desktop' });
    await Analytics.create({ eventType:'session_start', userId:req.user.id, experimentId, metadata:{ vrMode, deviceType } });
    res.status(201).json({ success:true, sessionId:session._id });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST /api/experiments/complete
router.post('/complete', auth, async (req, res) => {
  try {
    const { experimentId, sessionId, score, measurements, stepsCompleted, durationMinutes } = req.body;
    if (sessionId) await Session.findByIdAndUpdate(sessionId, { endTime:new Date(), completed:true, score, measurements, stepsCompleted, durationMinutes });
    const progress = await Progress.findOneAndUpdate(
      { student:req.user.id, experiment:experimentId },
      { $inc:{ attempts:1, totalTimeSpent:durationMinutes||0 }, $max:{ bestScore:score||0 }, $set:{ lastAttempt:new Date(), completed:true, completedAt:new Date() } },
      { upsert:true, new:true }
    );
    await Experiment.findByIdAndUpdate(experimentId, { $inc:{ totalSessions:1 } });
    await Analytics.create({ eventType:'experiment_complete', userId:req.user.id, experimentId, metadata:{ score, durationMinutes } });
    res.json({ success:true, progress, message:'Great work! 🎉' });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
