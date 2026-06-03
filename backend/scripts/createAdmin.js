const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      const admin = new User({ name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' });
      await admin.save();
      console.log('✅ Admin créé: admin@example.com / admin123');
    } else {
      console.log('⚠️ Admin existe déjà');
    }
  } catch (error) { console.error(error); } finally { mongoose.disconnect(); }
};

createAdmin();
