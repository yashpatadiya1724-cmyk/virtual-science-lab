/**
 * Experiment Routes
 * CRUD + session logging + completion tracking
 */
'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRole } = auth;
const { Experiment, Session, Progress, Analytics } = require('../models');

// ---- GET /api/experiments ----  (public list)
router.get('/', async (req, res) => {
  try {
    const { subject, classLevel, status = 'active', page = 1, limit = 20 } = req.query;
    const filter = { status };
    if (subject) filter.subject = subject;
    if (classLevel) filter.classLevels = classLevel;

    const [experiments, total] = await Promise.all([
      Experiment.find(filter)
        .select('-steps')
        .sort({ totalSessions: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Experiment.countDocuments(filter)
    ]);

    res.json({ success: true, experiments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---- GET /api/experiments/:slug ---- (single experiment with steps)
router.get('/:slug', async (req, res) => {
  try {
    const exp = await Experiment.findOne({ slug: req.params.slug, status: 'active' })
      .populate('createdBy', 'name');
    if (!exp) return res.status(404).json({ success: false, message: 'Experiment not found.' });
    res.json({ success: true, experiment: exp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---- POST /api/experiments ---- (teacher/admin only)
router.post('/', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const exp = await Experiment.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, experiment: exp });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ---- PUT /api/experiments/:id ---- (teacher/admin)
router.put('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const exp = await Experiment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!exp) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, experiment: exp });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ---- DELETE /api/experiments/:id ---- (admin only)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Experiment.findByIdAndUpdate(req.params.id, { status: 'archived' });
    res.json({ success: true, message: 'Experiment archived.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---- POST /api/experiments/session/start ----
router.post('/session/start', auth, async (req, res) => {
  try {
    const { experimentId, vrMode, deviceType, bandwidth } = req.body;
    const session = await Session.create({
      student: req.user.id,
      experiment: experimentId,
      vrMode: !!vrMode,
      deviceType: deviceType || 'desktop',
      bandwidth: bandwidth || 'medium'
    });

    // Log analytics event
    await Analytics.create({
      eventType: 'session_start',
      userId: req.user.id,
      experimentId,
      metadata: { vrMode, deviceType }
    });

    res.status(201).json({ success: true, sessionId: session._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---- POST /api/experiments/complete ----
router.post('/complete', auth, async (req, res) => {
  try {
    const { experimentId, sessionId, score, measurements, stepsCompleted, totalSteps, durationMinutes } = req.body;

    // Close session
    if (sessionId) {
      await Session.findByIdAndUpdate(sessionId, {
        endTime: new Date(),
        completed: true,
        score,
        measurements,
        stepsCompleted,
        totalSteps,
        durationMinutes
      });
    }

    // Upsert progress record
    const progress = await Progress.findOneAndUpdate(
      { student: req.user.id, experiment: experimentId },
      {
        $inc: { attempts: 1, totalTimeSpent: durationMinutes || 0 },
        $max: { bestScore: score || 0, stepsReached: stepsCompleted || 0 },
        $set: { lastAttempt: new Date(), completed: true, completedAt: new Date() }
      },
      { upsert: true, new: true }
    );

    // Increment experiment session count + recalculate avg score
    await Experiment.findByIdAndUpdate(experimentId, {
      $inc: { totalSessions: 1 },
    });

    // Log analytics
    await Analytics.create({
      eventType: 'experiment_complete',
      userId: req.user.id,
      experimentId,
      metadata: { score, durationMinutes }
    });

    res.json({ success: true, progress, message: 'Experiment completed. Great work! 🎉' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
