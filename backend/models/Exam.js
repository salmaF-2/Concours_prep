const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  concours: { type: String, required: true },
  year: { type: String, required: true },
  subject: {
    type: String,
    required: true,
    enum: ['math', 'physique', 'chimie', 'svt']
  },
  title: { type: String, required: true },
  description: String,
  examFile: {
    filename: String,
    path: String,
    originalName: String
  },
  answerGridFile: {
    filename: String,
    path: String,
    originalName: String
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exam', examSchema);
