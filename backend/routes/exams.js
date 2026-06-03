const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { createExam, getExams, deleteExam, getExamById } = require('../controllers/examController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/exams/'); },
  filename: (req, file, cb) => { const unique = Date.now() + '-' + Math.round(Math.random()*1e9); cb(null, unique + path.extname(file.originalname)); }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => { if (file.mimetype === 'application/pdf') cb(null, true); else cb(new Error('Seuls les fichiers PDF sont autorisés')); }
});

router.post('/', authMiddleware, adminMiddleware, upload.fields([{ name: 'examFile', maxCount: 1 }, { name: 'answerGridFile', maxCount: 1 }]), createExam);
router.get('/', authMiddleware, getExams);
router.delete('/:id', authMiddleware, adminMiddleware, deleteExam);
router.get('/:id', authMiddleware, getExamById);

module.exports = router;
