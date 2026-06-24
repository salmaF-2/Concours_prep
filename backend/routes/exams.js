// routes/exams.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  createExam,
  getExams,
  deleteExam,
  getExamById,
  getExamFile,
  getAnswerGridFile,
} = require('../controllers/examController');

// ⚠️ ATTENTION: Ceci est la configuration CORRECTE avec memoryStorage
const upload = multer({
  storage: multer.memoryStorage(), // <-- OBLIGATOIRE pour avoir file.buffer
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont autorisés'));
    }
  },
});

// Routes
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'examFile', maxCount: 1 },
    { name: 'answerGridFile', maxCount: 1 },
  ]),
  createExam
);

router.get('/', authMiddleware, getExams);
router.get('/:id', authMiddleware, getExamById);
router.delete('/:id', authMiddleware, adminMiddleware, deleteExam);
router.get('/:id/file', authMiddleware, getExamFile);
router.get('/:id/answer-grid', authMiddleware, getAnswerGridFile);

module.exports = router;