// // routes/answers.js
// const express = require('express');
// const router = express.Router();
// const { authMiddleware } = require('../middleware/auth');
// const answersController = require('../controllers/answersController');

// router.post('/', authMiddleware, answersController.saveAnswers);
// router.get('/', authMiddleware, answersController.getMyAnswers);
// router.get('/:id/feedback', authMiddleware, answersController.getAnswerFeedback);
// router.post('/:id/trigger', authMiddleware, answersController.triggerN8n);
// router.post('/webhook/n8n-callback', answersController.n8nCallback);

// module.exports = router;
// routes/answers.js
// const express  = require('express');
// const router   = express.Router();
// const multer   = require('multer');
// const path     = require('path');
// const fs       = require('fs');
// const { authMiddleware } = require('../middleware/auth');
// const ctrl = require('../controllers/answersController');

// // Stockage temporaire pour les images d'extraction
// const tmpDir = path.join('uploads', 'tmp');
// if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

// const upload = multer({
//   dest: tmpDir,
//   limits: { fileSize: 10 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const ok = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
//     ok ? cb(null, true) : cb(new Error('Image ou PDF uniquement'));
//   },
// });

// // ── CRUD réponses ──────────────────────────────────────────────────
// router.post('/',                 authMiddleware, ctrl.saveAnswers);
// router.put('/:id',               authMiddleware, ctrl.updateAnswers);
// router.delete('/:id',            authMiddleware, ctrl.deleteAnswer);
// router.get('/',                  authMiddleware, ctrl.getMyAnswers);
// router.get('/:id/feedback',      authMiddleware, ctrl.getAnswerFeedback);

// // ── Workflow ───────────────────────────────────────────────────────
// router.post('/:id/trigger',      authMiddleware, ctrl.triggerN8n);
// router.post('/webhook/n8n-callback',             ctrl.n8nCallback);

// // ── Extraction IA depuis image ─────────────────────────────────────
// router.post('/extract-image', authMiddleware, upload.single('image'), ctrl.extractImage);

// module.exports = router;

// routes/answersRoutes.js
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { authMiddleware } = require('../middleware/auth');
// const ctrl = require('../controllers/answersController');

// const tmpDir = path.join('uploads', 'tmp');
// if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

// const upload = multer({
//   dest: tmpDir,
//   limits: { fileSize: 10 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const ok = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
//     ok ? cb(null, true) : cb(new Error('Image ou PDF uniquement'));
//   },
// });

// // ── CRUD réponses ──────────────────────────────────────────────────
// router.post('/', authMiddleware, ctrl.saveAnswers);
// router.put('/:id', authMiddleware, ctrl.updateAnswers);
// router.delete('/:id', authMiddleware, ctrl.deleteAnswer);
// router.get('/', authMiddleware, ctrl.getMyAnswers);
// router.get('/:id/feedback', authMiddleware, ctrl.getAnswerFeedback);

// // ── Workflow ───────────────────────────────────────────────────────
// router.post('/:id/trigger', authMiddleware, ctrl.triggerN8n);
// router.post('/webhook/n8n-callback', ctrl.n8nCallback);

// // ── Extraction IA depuis image ─────────────────────────────────────
// router.post('/extract-image', authMiddleware, upload.single('image'), ctrl.extractImage);

// module.exports = router;

// routes/answersRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');
const ctrl = require('../controllers/answersController');

const tmpDir = path.join('uploads', 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const upload = multer({
  dest: tmpDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
    ok ? cb(null, true) : cb(new Error('Image ou PDF uniquement'));
  },
});

// ── CRUD réponses ──────────────────────────────────────────────────
router.post('/', authMiddleware, ctrl.saveAnswers);
router.put('/:id', authMiddleware, ctrl.updateAnswers);
router.delete('/:id', authMiddleware, ctrl.deleteAnswer);
router.get('/', authMiddleware, ctrl.getMyAnswers);
router.get('/:id/feedback', authMiddleware, ctrl.getAnswerFeedback);

// ── Workflow ───────────────────────────────────────────────────────
router.post('/:id/trigger', authMiddleware, ctrl.triggerN8n);
router.post('/submit-pdf', authMiddleware, upload.single('pdf'), ctrl.submitPdfAnswers);
router.post('/webhook/n8n-callback', ctrl.n8nCallback);
router.post('/webhook/extract-callback', ctrl.n8nExtractCallback);
// ── Extraction IA depuis image ─────────────────────────────────────
router.post('/extract-image', authMiddleware, upload.single('image'), ctrl.extractImage);

module.exports = router;