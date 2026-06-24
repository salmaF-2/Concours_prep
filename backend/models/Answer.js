// models/Answer.js
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  concours: { type: mongoose.Schema.Types.ObjectId, ref: 'Concours', required: true },
  epreuve: { type: mongoose.Schema.Types.ObjectId, ref: 'Epreuve', required: true },
  
  nom: { type: String, default: '' },
  prenom: { type: String, default: '' },
  code_candidat: { type: String, default: '' },
  
  // Changement : answers devient un objet (dictionnaire) au lieu d'un tableau
  answers: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  status: { type: String, enum: ['saved', 'processing', 'completed', 'failed'], default: 'saved' },
  result: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  workflow_triggered_at: Date,
  workflow_completed_at: Date,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('Answer', answerSchema);