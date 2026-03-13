/**
 * middleware/auth.js — JWT verification + role guard
 */
'use strict';
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'vsl-skill-india-2024';

function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ success:false, message:'No token.' });
  try { req.user = jwt.verify(h.split(' ')[1], SECRET); next(); }
  catch { res.status(401).json({ success:false, message:'Invalid or expired token.' }); }
}

auth.requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role))
    return res.status(403).json({ success:false, message:'Insufficient permissions.' });
  next();
};

module.exports = auth;
