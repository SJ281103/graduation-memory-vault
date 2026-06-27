const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  name:         { type: String, default: 'Admin' },
  createdAt:    { type: Date, default: Date.now },
  lastLogin:    { type: Date },
});

adminSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

adminSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('Admin', adminSchema);
