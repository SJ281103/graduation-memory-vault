const mongoose = require('mongoose');

// ── Time Capsule ─────────────────────────────────────────────────────────────
const timeCapsuleSchema = new mongoose.Schema({
  authorName:    { type: String, required: true, trim: true, maxlength: 100 },
  message:       { type: String, required: true, trim: true, maxlength: 3000 },
  unlockDate:    { type: Date, required: true },
  isUnlocked:    { type: Boolean, default: false },
  hint:          { type: String, trim: true, maxlength: 200 },
  status:        { type: String, enum: ['pending','approved'], default: 'pending' },
  createdAt:     { type: Date, default: Date.now },
});

timeCapsuleSchema.pre('save', function (next) {
  if (this.unlockDate <= new Date()) {
    this.isUnlocked = true;
  }
  next();
});

// ── Guestbook ────────────────────────────────────────────────────────────────
const guestbookSchema = new mongoose.Schema({
  signerName:    { type: String, required: true, trim: true, maxlength: 100 },
  role:          { type: String, enum: ['friend','classmate','teacher','family','other'], default: 'friend' },
  message:       { type: String, required: true, trim: true, maxlength: 500 },
  emoji:         { type: String, maxlength: 10 },
  signatureUrl:  { type: String }, // drawn signature
  createdAt:     { type: Date, default: Date.now },
  status:        { type: String, enum: ['pending','approved'], default: 'pending' },
});

const TimeCapsule = mongoose.model('TimeCapsule', timeCapsuleSchema);
const Guestbook   = mongoose.model('Guestbook', guestbookSchema);

module.exports = { TimeCapsule, Guestbook };
