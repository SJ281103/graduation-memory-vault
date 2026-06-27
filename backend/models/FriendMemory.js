const mongoose = require('mongoose');

const friendMemorySchema = new mongoose.Schema({
  // Identity
  fullName:           { type: String, required: true, trim: true, maxlength: 100 },
  whatTheyCallMe:     { type: String, trim: true, maxlength: 50 },
  nicknameForMe:      { type: String, trim: true, maxlength: 50 },

  // Contact
  phoneNumber:        { type: String, trim: true, maxlength: 20 },
  instagramId:        { type: String, trim: true, maxlength: 100 },
  linkedinProfile:    { type: String, trim: true, maxlength: 200 },

  // Memories
  favoriteMemory:     { type: String, trim: true, maxlength: 2000 },
  oneWordDescription: { type: String, trim: true, maxlength: 50 },
  messageForFuture:   { type: String, trim: true, maxlength: 2000 },
  adviceForMe:        { type: String, trim: true, maxlength: 1000 },
  funniestMoment:     { type: String, trim: true, maxlength: 1000 },
  hiddenConfession:   { type: String, trim: true, maxlength: 500 },
  whereIn10Years:     { type: String, trim: true, maxlength: 300 },
  friendshipRating:   { type: Number, min: 1, max: 10 },

  // Media
  bestPhotoUrl:       { type: String },
  bestPhotoPublicId:  { type: String },
  currentPhotoUrl:    { type: String },
  currentPhotoPublicId: { type: String },
  videoUrl:           { type: String },
  videoPublicId:      { type: String },

  // Signature doodle (base64 SVG stored as string)
  signatureDataUrl:   { type: String },

  // Meta
  status:             { type: String, enum: ['pending','approved','featured'], default: 'pending' },
  featured:           { type: Boolean, default: false },
  likes:              { type: Number, default: 0 },
  likedBy:            [{ type: String }], // IP fingerprints
  comments: [{
    text:       { type: String, maxlength: 500 },
    authorName: { type: String, maxlength: 100 },
    createdAt:  { type: Date, default: Date.now },
  }],
  submittedAt:        { type: Date, default: Date.now },
  ipAddress:          { type: String },
}, { timestamps: true });

friendMemorySchema.index({ fullName: 'text', favoriteMemory: 'text' });
friendMemorySchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('FriendMemory', friendMemorySchema);
