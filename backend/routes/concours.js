// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const { authMiddleware, adminMiddleware } = require('../middleware/auth');
// const {
//   createConcours,
//   addEpreuve,
//   getConcours,
//   getConcoursById,
//   deleteConcours,
//   deleteEpreuve
// } = require('../controllers/concoursController');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     if (file.fieldname === 'examFile') cb(null, 'uploads/exams/');
//     else if (file.fieldname === 'answerGridFile') cb(null, 'uploads/grids/');
//     else cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage,
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
// router.post('/epreuve', authMiddleware, adminMiddleware,
//   upload.single('examFile'),
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

// routes/concours.js
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
//   deleteEpreuve,
//   getExamFile,
//   getAnswerGridFile
// } = require('../controllers/concoursController');

// // ✅ memoryStorage OBLIGATOIRE pour base64 dans MongoDB
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === 'application/pdf') {
//       cb(null, true);
//     } else {
//       cb(new Error('Seuls les fichiers PDF sont autorisés'));
//     }
//   }
// });

// // Créer un nouveau concours (avec grille réponse)
// router.post('/', 
//   authMiddleware, 
//   adminMiddleware, 
//   upload.fields([{ name: 'answerGridFile', maxCount: 1 }]), 
//   createConcours
// );

// // Ajouter une épreuve à un concours (examFile + answerGridFile optionnel)
// router.post('/epreuve', 
//   authMiddleware, 
//   adminMiddleware,
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

// // Télécharger le fichier d'examen (base64 → PDF)
// router.get('/:id/exam-file', authMiddleware, getExamFile);

// // Télécharger la grille de réponses (base64 → PDF)
// router.get('/:id/answer-grid', authMiddleware, getAnswerGridFile);

// // Supprimer un concours
// router.delete('/:id', authMiddleware, adminMiddleware, deleteConcours);

// // Supprimer une épreuve
// router.delete('/epreuve/:id', authMiddleware, adminMiddleware, deleteEpreuve);

// module.exports = router;

// routes/concoursRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const concoursController = require('../controllers/concoursController');

// Configuration multer avec memoryStorage (pour base64)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 Mo
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF, JPG et PNG sont autorisés'), false);
    }
  }
});

// Gestion des fichiers multiples
const uploadFields = upload.fields([
  { name: 'examFile', maxCount: 1 },
  { name: 'answerGridFile', maxCount: 1 },
]);

// Routes protégées (admin uniquement)
router.post('/', authMiddleware, adminMiddleware, uploadFields, concoursController.createConcours);
router.post('/epreuve', authMiddleware, adminMiddleware, uploadFields, concoursController.addEpreuve);
router.put('/epreuve/:id', authMiddleware, adminMiddleware, uploadFields, concoursController.updateEpreuve);
router.delete('/:id', authMiddleware, adminMiddleware, concoursController.deleteConcours);
router.delete('/epreuve/:id', authMiddleware, adminMiddleware, concoursController.deleteEpreuve);

// Routes de récupération (public ou authentifié)
router.get('/', concoursController.getConcours);
router.get('/:id', concoursController.getConcoursById);
router.get('/:concoursId/epreuves', concoursController.getEpreuvesByConcours);

// Routes de téléchargement
router.get('/:id/exam-file', concoursController.getExamFile);
router.get('/:id/answer-grid', concoursController.getAnswerGridFile);

module.exports = router;