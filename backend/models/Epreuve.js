// models/Epreuve.js
const mongoose = require('mongoose');

const epreuveSchema = new mongoose.Schema({
  concours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Concours',
    required: true,
  },
  subject: {
    type: String,
    required: true,
    enum: ['svt', 'physique', 'chimie', 'mathematiques'],
  },
  title: { type: String, default: '' },
    nbQuestionsParBloc: { type: Number, default: 20 },

  description: { type: String, default: '' },
  year: { type: String },
  examFile: {
    filename: String,
    originalName: String,
    mimeType: { type: String, default: 'application/pdf' },
    size: Number,
    data: String, 
  },
  answerGridFile: {
    filename: String,
    originalName: String,
    mimeType: { type: String, default: 'application/pdf' },
    size: Number,
    data: String, // <-- CHAMP BASE64
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Epreuve', epreuveSchema);