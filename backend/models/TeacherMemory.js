const mongoose = require('mongoose');

const teacherMemorySchema = new mongoose.Schema({
  teacherName:      { type: String, required: true, trim: true, maxlength: 100 },
  subjectTaught:    { type: String, trim: true, maxlength: 100 },
  adviceForFuture:  { type: String, trim: true, maxlength: 2000 },
  messageBlesssing: { type: String, trim: true, maxlength: 2000 },
  favoriteMemory:   { type: String, trim: true, maxlength: 1000 },
  yearsKnown:       { type: String, trim: true, maxlength: 50 },
  photoUrl:         { type: String },
  photoPublicId:    { type: String },
  status:           { type: String, enum: ['pending','approved','featured'], default: 'pending' },
  featured:         { type: Boolean, default: false },
  likes:            { type: Number, default: 0 },
  comments: [{
    text:       { type: String, maxlength: 500 },
    authorName: { type: String, maxlength: 100 },
    createdAt:  { type: Date, default: Date.now },
  }],
  submittedAt:      { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('TeacherMemory', teacherMemorySchema);
