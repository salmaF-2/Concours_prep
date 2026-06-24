// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const { authMiddleware, adminMiddleware } = require('../middleware/auth');
// const {
//   createConcours,
//   addEpreuve,
//   getConcours,
//   getConcoursById,
//   deleteConcours,
//   deleteEpreuve
// } = require('../controllers/concoursController');

// // ✅ memoryStorage pour base64 dans MongoDB
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 20 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === 'application/pdf') cb(null, true);
//     else cb(new Error('Seuls les fichiers PDF sont autorisés'));
//   }
// });

// // Créer un nouveau concours (avec grille réponse)
// router.post('/', authMiddleware, adminMiddleware, 
//   upload.fields([{ name: 'answerGridFile', maxCount: 1 }]), 
//   createConcours
// );

// // Ajouter une épreuve à un concours
// // ✅ upload.fields pour accepter examFile + answerGridFile
// router.post('/epreuve', authMiddleware, adminMiddleware,
//   upload.fields([
//     { name: 'examFile', maxCount: 1 },
//     { name: 'answerGridFile', maxCount: 1 }
//   ]),
//   addEpreuve
// );

// // Récupérer tous les concours
// router.get('/', authMiddleware, getConcours);

// // Récupérer un concours par ID
// router.get('/:id', authMiddleware, getConcoursById);

// // Supprimer un concours
// router.delete('/:id', authMiddleware, adminMiddleware, deleteConcours);

// // Supprimer une épreuve
// router.delete('/epreuve/:id', authMiddleware, adminMiddleware, deleteEpreuve);

// module.exports = router;

// models/Concours.js
const mongoose = require('mongoose');

const concoursSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  answerGridFile: {
    filename: String,
    originalName: String,
    mimeType: { type: String, default: 'application/pdf' },
    size: Number,
    data: String, // ← BASE64 du PDF
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Concours', concoursSchema);