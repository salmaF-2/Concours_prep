const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://salmafadili003_db_user:CcKQEvYpVNgJfgEI@cluster0.l4cpnwr.mongodb.net/concours_db?retryWrites=true&w=majority')
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/submissions', require('./routes/submissions'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur port ${PORT}`));