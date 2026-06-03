const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentFile: {
    filename: String,
    path: String,
    originalName: String
  },
  feedbackFile: {
    filename: String,
    path: String,
    originalName: String
  },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  n8nWorkflowId: String,
  submittedAt: { type: Date, default: Date.now },
  processedAt: Date,
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  gradingDetails: { type: mongoose.Schema.Types.Mixed, default: {} }
});

module.exports = mongoose.model('Submission', submissionSchema);
