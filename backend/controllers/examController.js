const Epreuve = require('../models/Epreuve');

/**
 * Convertit un fichier multer (memoryStorage) en objet fichier avec base64
 */
const buildFileObject = (file) => {
  if (!file) {
    console.log('⚠️ Aucun fichier reçu');
    return {};
  }

  console.log('📦 Traitement du fichier:', file.originalname);
  console.log('   - buffer présent:', !!file.buffer);
  console.log('   - buffer taille:', file.buffer?.length || 0);
  console.log('   - path présent:', !!file.path);
  console.log('   - mimetype:', file.mimetype);

  // CRITIQUE: Vérifier que le buffer existe
  if (!file.buffer || file.buffer.length === 0) {
    console.error('❌ ERREUR: Le buffer est vide!');
    console.error('   Vous utilisez probablement diskStorage au lieu de memoryStorage');
    console.error('   Vérifiez le fichier routes/exams.js');
    
    // Ne pas bloquer l'upload, mais enregistrer sans data
    return {
      filename: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype || 'application/pdf',
      size: file.size || 0,
      // data est absent intentionnellement
    };
  }

  // Convertir en base64
  const base64Data = file.buffer.toString('base64');
  console.log(`   ✅ Base64 généré: ${base64Data.length} caractères`);

  return {
    filename: file.originalname,
    originalName: file.originalname,
    mimeType: file.mimetype || 'application/pdf',
    size: file.size,
    data: base64Data, // <-- C'est ici que le base64 est sauvegardé
  };
};

exports.createExam = async (req, res) => {
  try {
    console.log('📝 Création d\'une épreuve');
    console.log('   - Body:', req.body);
    console.log('   - Files reçus:', req.files ? Object.keys(req.files) : 'Aucun');

    const { concours, title, description, subject, year } = req.body;

    // Vérification détaillée des fichiers
    const examFile = req.files?.examFile?.[0];
    const answerFile = req.files?.answerGridFile?.[0];

    if (examFile) {
      console.log('📄 examFile reçu:');
      console.log(`   - Nom: ${examFile.originalname}`);
      console.log(`   - Taille: ${examFile.size} bytes`);
      console.log(`   - Buffer: ${examFile.buffer ? `${examFile.buffer.length} bytes` : '❌ ABSENT'}`);
    }

    // Construction des objets
    const examFileObj = buildFileObject(examFile);
    const answerGridFileObj = buildFileObject(answerFile);

    // Vérification finale
    if (examFile && !examFileObj.data) {
      console.warn('⚠️ ATTENTION: examFile créé sans data (base64)');
    }

    const exam = new Epreuve({
      concours,
      title: title || '',
      description: description || '',
      subject,
      year: year || '',
      examFile: examFileObj,
      answerGridFile: answerGridFileObj,
      uploadedBy: req.user.id,
    });

    await exam.save();
    console.log('✅ Épreuve sauvegardée avec succès');

    // Retourner sans le base64
    const examObj = exam.toObject();
    if (examObj.examFile?.data) {
      console.log(`   📊 examFile.data: ${examObj.examFile.data.length} caractères`);
      delete examObj.examFile.data;
    }
    if (examObj.answerGridFile?.data) {
      console.log(`   📊 answerGridFile.data: ${examObj.answerGridFile.data.length} caractères`);
      delete examObj.answerGridFile.data;
    }

    res.status(201).json({
      success: true,
      message: 'Épreuve créée avec succès',
      data: examObj,
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.createExam = async (req, res) => {
  try {
    console.log('📝 Création d\'une épreuve');
    console.log('   Body:', req.body);
    console.log('   Fichiers:', req.files ? Object.keys(req.files) : 'AUCUN');

    const { concours, title, description, subject, year } = req.body;

    // Construction des objets fichier
    const examFileObj = buildFileObject(req.files?.examFile?.[0]);
    const answerGridFileObj = buildFileObject(req.files?.answerGridFile?.[0]);

    console.log('   examFile construit:', examFileObj.data ? '✅ avec data' : '❌ sans data');
    console.log('   answerGridFile construit:', answerGridFileObj.data ? '✅ avec data' : '❌ sans data');

    const exam = new Epreuve({
      concours,
      title: title || '',
      description: description || '',
      subject,
      year: year || '',
      examFile: examFileObj,
      answerGridFile: answerGridFileObj,
      uploadedBy: req.user.id,
    });

    await exam.save();
    console.log('✅ Épreuve sauvegardée avec succès');

    // Retourner sans le base64 pour la réponse
    const examObj = exam.toObject();
    if (examObj.examFile?.data) {
      console.log('   examFile.data taille:', examObj.examFile.data.length);
      delete examObj.examFile.data;
    }
    if (examObj.answerGridFile?.data) {
      console.log('   answerGridFile.data taille:', examObj.answerGridFile.data.length);
      delete examObj.answerGridFile.data;
    }

    res.status(201).json({
      success: true,
      message: 'Épreuve créée avec succès',
      data: examObj,
    });
  } catch (error) {
    console.error('❌ Erreur création examen:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

exports.getExams = async (req, res) => {
  try {
    const exams = await Epreuve.find()
      .select('-examFile.data -answerGridFile.data')
      .sort({ createdAt: -1 })
      .populate('concours', 'nom annee');

    res.json({
      success: true,
      data: exams,
    });
  } catch (error) {
    console.error('❌ Erreur récupération examens:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getExamById = async (req, res) => {
  try {
    const exam = await Epreuve.findById(req.params.id)
      .select('-examFile.data -answerGridFile.data')
      .populate('concours', 'nom annee');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Épreuve non trouvée',
      });
    }

    res.json({
      success: true,
      data: exam,
    });
  } catch (error) {
    console.error('❌ Erreur récupération examen:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Epreuve.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Épreuve non trouvée',
      });
    }

    await exam.deleteOne();
    res.json({
      success: true,
      message: 'Épreuve supprimée avec succès',
    });
  } catch (error) {
    console.error('❌ Erreur suppression examen:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getExamFile = async (req, res) => {
  try {
    const exam = await Epreuve.findById(req.params.id).select('examFile');

    if (!exam?.examFile?.data) {
      return res.status(404).json({
        success: false,
        message: 'Fichier épreuve non trouvé',
      });
    }

    const buffer = Buffer.from(exam.examFile.data, 'base64');
    res.set('Content-Type', exam.examFile.mimeType || 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${exam.examFile.originalName || 'epreuve.pdf'}"`);
    res.set('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error('❌ Erreur récupération fichier:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAnswerGridFile = async (req, res) => {
  try {
    const exam = await Epreuve.findById(req.params.id).select('answerGridFile');

    if (!exam?.answerGridFile?.data) {
      return res.status(404).json({
        success: false,
        message: 'Grille de réponses non trouvée',
      });
    }

    const buffer = Buffer.from(exam.answerGridFile.data, 'base64');
    res.set('Content-Type', exam.answerGridFile.mimeType || 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${exam.answerGridFile.originalName || 'grille-reponses.pdf'}"`);
    res.set('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error('❌ Erreur récupération grille:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};