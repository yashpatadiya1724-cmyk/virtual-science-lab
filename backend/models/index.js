/**
 * MongoDB Schemas – Virtual Science Lab
 * Models: Student, Experiment, Session, Progress, School
 */

'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// =====================================================
// SCHOOL SCHEMA
// =====================================================
const SchoolSchema = new Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, unique: true, uppercase: true },
  district: String,
  state: String,
  pincode: String,
  tier: { type: String, enum: ['tier1', 'tier2', 'tier3', 'rural'], default: 'tier3' },
  lowBandwidthMode: { type: Boolean, default: true },
  registeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

// =====================================================
// USER / STUDENT SCHEMA
// =====================================================
const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  school: { type: Schema.Types.ObjectId, ref: 'School' },
  classLevel: { type: String, enum: ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'] },
  avatar: String,
  language: { type: String, default: 'en' },
  lastActive: { type: Date, default: Date.now },
  streakDays: { type: Number, default: 0 },
  totalLabTime: { type: Number, default: 0 }, // in minutes
  badges: [{ name: String, awardedAt: Date, icon: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// =====================================================
// EXPERIMENT SCHEMA
// =====================================================
const ExperimentSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  subject: { type: String, enum: ['Physics', 'Chemistry', 'Biology', 'Mathematics'], required: true },
  classLevels: [{ type: String, enum: ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'] }],
  description: { type: String, maxlength: 1000 },
  ncertChapter: String,
  objectives: [String],
  steps: [{
    order: Number,
    instruction: String,
    hint: String,
    media: String // URL to image/gif
  }],
  duration: { type: Number, default: 20 }, // minutes
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  tags: [String],
  status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  totalSessions: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  ratingCount: { type: Number, default: 0 }
}, { timestamps: true });

// Auto-generate slug
ExperimentSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

// =====================================================
// EXPERIMENT SESSION SCHEMA
// Track each time a student does an experiment
// =====================================================
const SessionSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  experiment: { type: Schema.Types.ObjectId, ref: 'Experiment', required: true },
  school: { type: Schema.Types.ObjectId, ref: 'School' },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  durationMinutes: Number,
  stepsCompleted: { type: Number, default: 0 },
  totalSteps: Number,
  completed: { type: Boolean, default: false },
  score: { type: Number, min: 0, max: 100 },
  vrMode: { type: Boolean, default: false },
  deviceType: { type: String, enum: ['desktop', 'mobile', 'vr-headset'], default: 'desktop' },
  bandwidth: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  measurements: Schema.Types.Mixed, // Experiment-specific recorded data
  notes: String
}, { timestamps: true });

// =====================================================
// STUDENT PROGRESS SCHEMA
// Aggregated progress per student per experiment
// =====================================================
const ProgressSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  experiment: { type: Schema.Types.ObjectId, ref: 'Experiment', required: true },
  attempts: { type: Number, default: 0 },
  bestScore: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completedAt: Date,
  stepsReached: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 }, // minutes
  lastAttempt: Date
}, { timestamps: true });

// Compound index: one progress record per student-experiment pair
ProgressSchema.index({ student: 1, experiment: 1 }, { unique: true });

// =====================================================
// ANALYTICS EVENT SCHEMA (lightweight)
// =====================================================
const AnalyticsSchema = new Schema({
  eventType: {
    type: String,
    enum: ['session_start', 'session_end', 'step_complete', 'experiment_complete', 'vr_enter', 'vr_exit', 'error'],
    required: true
  },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  experimentId: { type: Schema.Types.ObjectId, ref: 'Experiment' },
  schoolId: { type: Schema.Types.ObjectId, ref: 'School' },
  metadata: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

// TTL: auto-delete analytics events after 90 days
AnalyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// =====================================================
// EXPORTS
// =====================================================
module.exports = {
  School:     mongoose.model('School', SchoolSchema),
  User:       mongoose.model('User', UserSchema),
  Experiment: mongoose.model('Experiment', ExperimentSchema),
  Session:    mongoose.model('Session', SessionSchema),
  Progress:   mongoose.model('Progress', ProgressSchema),
  Analytics:  mongoose.model('Analytics', AnalyticsSchema)
};
