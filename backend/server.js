// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const path = require('path');

// dotenv.config();

// const app = express();

// // Middleware global MINIMAL
// app.use(cors());

// // Logger
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
//   next();
// });

// // Connexion MongoDB
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://salmafadili003_db_user:CcKQEvYpVNgJfgEI@cluster0.l4cpnwr.mongodb.net/concours_prep?retryWrites=true&w=majority';

// mongoose.connect(MONGODB_URI)
//   .then(() => console.log('✅ MongoDB connecté'))
//   .catch(err => console.error('❌ MongoDB error:', err));

// // ========== ROUTES AVEC UPLOAD (SANS express.json !) ==========
// app.use('/api/exams', require('./routes/exams'));
// app.use('/api/concours', require('./routes/concours'));
// app.use('/api/submissions', require('./routes/submissions'));

// // ========== ROUTES SANS UPLOAD (avec express.json) ==========
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/answers', require('./routes/answers'));

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'Serveur fonctionnel' });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Serveur sur port ${PORT}`));

// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ============ CORS & LOGGING ============
app.use(cors());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ============ MONGODB CONNECTION ============
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://salmafadili003_db_user:CcKQEvYpVNgJfgEI@cluster0.l4cpnwr.mongodb.net/concours_prep?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ============ ROUTES AVEC UPLOAD (AVANT express.json) ============
// ⚠️ IMPORTANT: Les routes avec multer DOIVENT être AVANT express.json
app.use('/api/concours', require('./routes/concours'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/submissions', require('./routes/submissions'));

// ============ ROUTES SANS UPLOAD (APRÈS express.json) ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/answers', require('./routes/answers'));

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur fonctionnel',
    env: process.env.NODE_ENV || 'development'
  });
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err);
  res.status(500).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 MongoDB: ${MONGODB_URI.split('@')[1] ? '✅ Connecté' : '❌ À configurer'}\n`);
});