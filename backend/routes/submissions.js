const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { authMiddleware } = require('../middleware/auth');
const { submitExam, n8nCallback, getMySubmissions, getSubmissionById } = require('../controllers/submissionController');

const uploadDir = path.join('uploads', 'submissions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, uploadDir); },
  filename: (req, file, cb) => { const unique = Date.now() + '-' + Math.round(Math.random()*1e9); cb(null, unique + path.extname(file.originalname)); }
});

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 }, fileFilter: (req, file, cb) => { if (file.mimetype === 'application/pdf') cb(null, true); else cb(new Error('Seuls les fichiers PDF sont autorisés')); } });

router.post('/', authMiddleware, upload.single('studentFile'), submitExam);
router.post('/webhook/n8n-callback', n8nCallback);
router.get('/my-submissions', authMiddleware, getMySubmissions);
router.get('/:id', authMiddleware, getSubmissionById);

module.exports = router;
