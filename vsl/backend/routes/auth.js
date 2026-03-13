/**
 * routes/auth.js — Register / Login / Me
 */
'use strict';
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { User } = require('../models');
const SECRET  = process.env.JWT_SECRET || 'vsl-skill-india-2024';
const EXPIRES = process.env.JWT_EXPIRES || '7d';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, classLevel } = req.body;
    if (!name||!email||!password) return res.status(400).json({ success:false, message:'Name, email, password required.' });
    if (await User.findOne({ email })) return res.status(409).json({ success:false, message:'Email already registered.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role, classLevel });
    const token = jwt.sign({ id:user._id, role:user.role }, SECRET, { expiresIn:EXPIRES });
    res.status(201).json({ success:true, token, user:{ id:user._id, name:user.name, email:user.email, role:user.role } });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email||!password) return res.status(400).json({ success:false, message:'Email and password required.' });
    const user = await User.findOne({ email, isActive:true });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ success:false, message:'Invalid credentials.' });
    user.lastActive = new Date(); await user.save();
    const token = jwt.sign({ id:user._id, role:user.role }, SECRET, { expiresIn:EXPIRES });
    res.json({ success:true, token, user:{ id:user._id, name:user.name, email:user.email, role:user.role, classLevel:user.classLevel } });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash').populate('school','name district');
    if (!user) return res.status(404).json({ success:false, message:'User not found.' });
    res.json({ success:true, user });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
