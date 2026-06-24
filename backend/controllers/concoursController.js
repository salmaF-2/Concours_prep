// const Concours = require('../models/Concours');
// const Epreuve = require('../models/Epreuve');
// const fs = require('fs');
// const path = require('path');

// exports.createConcours = async (req, res) => {
//   try {
//     const { title, year, description } = req.body;
    
//     const concours = new Concours({
//       title,
//       year,
//       description,
//       answerGridFile: req.files && req.files['answerGridFile'] ? {
//         filename: req.files['answerGridFile'][0].filename,
//         path: req.files['answerGridFile'][0].path,
//         originalName: req.files['answerGridFile'][0].originalname
//       } : null,
//       uploadedBy: req.user.id
//     });
    
//     await concours.save();
//     res.status(201).json(concours);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.addEpreuve = async (req, res) => {
//   try {
//     const { concoursId, subject, title, order } = req.body;
    
//     // Vérifier que le concours existe
//     const concours = await Concours.findById(concoursId);
//     if (!concours) {
//       return res.status(404).json({ message: 'Concours non trouvé' });
//     }

//     const epreuve = new Epreuve({
//       concours: concoursId,
//       subject,
//       title,
//       order: order || 0,
//       examFile: req.file ? {
//         filename: req.file.filename,
//         path: req.file.path,
//         originalName: req.file.originalname
//       } : null
//     });
    
//     await epreuve.save();
//     res.status(201).json(epreuve);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getConcours = async (req, res) => {
//   try {
//     const concours = await Concours.find().sort({ year: -1, title: 1 });
    
//     // Pour chaque concours, récupérer ses épreuves
//     const result = await Promise.all(concours.map(async (c) => {
//       const epreuves = await Epreuve.find({ concours: c._id }).sort({ order: 1 });
//       return {
//         ...c.toObject(),
//         epreuves
//       };
//     }));
    
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getConcoursById = async (req, res) => {
//   try {
//     const concours = await Concours.findById(req.params.id);
//     if (!concours) return res.status(404).json({ message: 'Concours non trouvé' });
    
//     const epreuves = await Epreuve.find({ concours: concours._id }).sort({ order: 1 });
//     res.json({ ...concours.toObject(), epreuves });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.deleteConcours = async (req, res) => {
//   try {
//     const concours = await Concours.findById(req.params.id);
//     if (!concours) return res.status(404).json({ message: 'Concours non trouvé' });
    
//     // Supprimer les épreuves associées
//     const epreuves = await Epreuve.find({ concours: concours._id });
//     for (const epreuve of epreuves) {
//       if (epreuve.examFile?.path) {
//         fs.unlink(path.join(__dirname, '../../', epreuve.examFile.path), (err) => {
//           if (err) console.warn('Impossible de supprimer:', err.message);
//         });
//       }
//     }
//     await Epreuve.deleteMany({ concours: concours._id });
    
//     // Supprimer le fichier grille
//     if (concours.answerGridFile?.path) {
//       fs.unlink(path.join(__dirname, '../../', concours.answerGridFile.path), (err) => {
//         if (err) console.warn('Impossible de supprimer:', err.message);
//       });
//     }
    
//     await concours.deleteOne();
//     res.json({ message: 'Concours supprimé avec succès' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.deleteEpreuve = async (req, res) => {
//   try {
//     const epreuve = await Epreuve.findById(req.params.id);
//     if (!epreuve) return res.status(404).json({ message: 'Épreuve non trouvée' });
    
//     if (epreuve.examFile?.path) {
//       fs.unlink(path.join(__dirname, '../../', epreuve.examFile.path), (err) => {
//         if (err) console.warn('Impossible de supprimer:', err.message);
//       });
//     }
    
//     await epreuve.deleteOne();
//     res.json({ message: 'Épreuve supprimée avec succès' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // controllers/concoursController.js
// const Concours = require('../models/Concours');
// const Epreuve = require('../models/Epreuve');

// /**
//  * Convertit un fichier multer (memoryStorage) en objet fichier avec base64
//  */
// const buildFileObject = (file) => {
//   if (!file) return {};

//   console.log('📦 Traitement du fichier:', file.originalname);
//   console.log('   - buffer présent:', !!file.buffer);
//   console.log('   - buffer taille:', file.buffer?.length || 0);
//   console.log('   - mimetype:', file.mimetype);

//   if (!file.buffer || file.buffer.length === 0) {
//     console.error('❌ ERREUR: Le buffer est vide!');
//     console.error('   Vérifiez que memoryStorage est activé dans routes/concours.js');
//     return {
//       filename: file.originalname,
//       originalName: file.originalname,
//       mimeType: file.mimetype || 'application/pdf',
//       size: file.size || 0,
//     };
//   }

//   const base64Data = file.buffer.toString('base64');
//   console.log(`   ✅ Base64 généré: ${base64Data.length} caractères`);

//   return {
//     filename: file.originalname,
//     originalName: file.originalname,
//     mimeType: file.mimetype || 'application/pdf',
//     size: file.size,
//     data: base64Data, // ← CLEF: le base64 est sauvegardé ici
//   };
// };

// // ============ CONCOURS ============

// exports.createConcours = async (req, res) => {
//   try {
//     console.log('📝 Création d\'un concours');
//     console.log('   - Body:', req.body);
//     console.log('   - Files:', req.files ? Object.keys(req.files) : 'AUCUN');

//     const { title, year, description } = req.body;

//     // Récupérer et convertir la grille
//     const gridFile = req.files?.answerGridFile?.[0];
//     const answerGridFileObj = buildFileObject(gridFile);

//     console.log('   - answerGridFile:', answerGridFileObj.data ? '✅ avec data' : '❌ sans data');

//     const concours = new Concours({
//       title,
//       year,
//       description,
//       answerGridFile: answerGridFileObj,
//       uploadedBy: req.user.id
//     });

//     await concours.save();
//     console.log('✅ Concours sauvegardé avec succès');

//     // Réponse sans le base64
//     const concoursObj = concours.toObject();
//     if (concoursObj.answerGridFile?.data) {
//       delete concoursObj.answerGridFile.data;
//     }

//     res.status(201).json({
//       success: true,
//       message: 'Concours créé avec succès',
//       data: concoursObj,
//     });
//   } catch (error) {
//     console.error('❌ Erreur création concours:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.addEpreuve = async (req, res) => {
//   try {
//     console.log('📝 Ajout d\'une épreuve');
//     console.log('   - Body:', req.body);
//     console.log('   - Files:', req.files ? Object.keys(req.files) : 'AUCUN');

//     const { concoursId, subject, title, order } = req.body;

//     // Vérifier que le concours existe
//     const concours = await Concours.findById(concoursId);
//     if (!concours) {
//       return res.status(404).json({ success: false, message: 'Concours non trouvé' });
//     }

//     // Récupérer et convertir les fichiers
//     const examFile = req.files?.examFile?.[0];
//     const answerGridFile = req.files?.answerGridFile?.[0];

//     const examFileObj = buildFileObject(examFile);
//     const answerGridFileObj = buildFileObject(answerGridFile);

//     console.log('   - examFile:', examFileObj.data ? '✅ avec data' : '❌ sans data');
//     console.log('   - answerGridFile:', answerGridFileObj.data ? '✅ avec data' : '❌ sans data');

//     const epreuve = new Epreuve({
//       concours: concoursId,
//       subject,
//       title: title || '',
//       order: order || 0,
//       examFile: examFileObj,
//       answerGridFile: answerGridFileObj,
//       uploadedBy: req.user.id
//     });

//     await epreuve.save();
//     console.log('✅ Épreuve sauvegardée avec succès');

//     // Réponse sans le base64
//     const epreuveObj = epreuve.toObject();
//     if (epreuveObj.examFile?.data) {
//       delete epreuveObj.examFile.data;
//     }
//     if (epreuveObj.answerGridFile?.data) {
//       delete epreuveObj.answerGridFile.data;
//     }

//     res.status(201).json({
//       success: true,
//       message: 'Épreuve ajoutée avec succès',
//       data: epreuveObj,
//     });
//   } catch (error) {
//     console.error('❌ Erreur ajout épreuve:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.getConcours = async (req, res) => {
//   try {
//     const concours = await Concours.find()
//       .select('-answerGridFile.data') // Ne pas envoyer le base64
//       .sort({ year: -1, title: 1 });

//     // Pour chaque concours, récupérer ses épreuves
//     const result = await Promise.all(
//       concours.map(async (c) => {
//         const epreuves = await Epreuve.find({ concours: c._id })
//           .select('-examFile.data -answerGridFile.data') // Sans base64
//           .sort({ order: 1 });
//         return {
//           ...c.toObject(),
//           epreuves
//         };
//       })
//     );

//     res.json({
//       success: true,
//       data: result,
//     });
//   } catch (error) {
//     console.error('❌ Erreur récupération concours:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.getConcoursById = async (req, res) => {
//   try {
//     const concours = await Concours.findById(req.params.id)
//       .select('-answerGridFile.data');

//     if (!concours) {
//       return res.status(404).json({ success: false, message: 'Concours non trouvé' });
//     }

//     const epreuves = await Epreuve.find({ concours: concours._id })
//       .select('-examFile.data -answerGridFile.data')
//       .sort({ order: 1 });

//     res.json({
//       success: true,
//       data: { ...concours.toObject(), epreuves }
//     });
//   } catch (error) {
//     console.error('❌ Erreur récupération concours:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.deleteConcours = async (req, res) => {
//   try {
//     const concours = await Concours.findById(req.params.id);
//     if (!concours) {
//       return res.status(404).json({ success: false, message: 'Concours non trouvé' });
//     }

//     // Supprimer les épreuves associées
//     await Epreuve.deleteMany({ concours: concours._id });
//     await concours.deleteOne();

//     res.json({
//       success: true,
//       message: 'Concours supprimé avec succès'
//     });
//   } catch (error) {
//     console.error('❌ Erreur suppression concours:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.deleteEpreuve = async (req, res) => {
//   try {
//     const epreuve = await Epreuve.findById(req.params.id);
//     if (!epreuve) {
//       return res.status(404).json({ success: false, message: 'Épreuve non trouvée' });
//     }

//     await epreuve.deleteOne();

//     res.json({
//       success: true,
//       message: 'Épreuve supprimée avec succès'
//     });
//   } catch (error) {
//     console.error('❌ Erreur suppression épreuve:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // ============ TÉLÉCHARGEMENT DE FICHIERS ============

// exports.getExamFile = async (req, res) => {
//   try {
//     const epreuve = await Epreuve.findById(req.params.id).select('examFile');

//     if (!epreuve?.examFile?.data) {
//       return res.status(404).json({
//         success: false,
//         message: 'Fichier épreuve non trouvé',
//       });
//     }

//     const buffer = Buffer.from(epreuve.examFile.data, 'base64');
//     res.set('Content-Type', epreuve.examFile.mimeType || 'application/pdf');
//     res.set('Content-Disposition', `inline; filename="${epreuve.examFile.originalName || 'epreuve.pdf'}"`);
//     res.set('Content-Length', buffer.length);
//     res.send(buffer);
//   } catch (error) {
//     console.error('❌ Erreur récupération fichier:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.getAnswerGridFile = async (req, res) => {
//   try {
//     const doc = await Epreuve.findById(req.params.id).select('answerGridFile');

//     if (!doc?.answerGridFile?.data) {
//       return res.status(404).json({
//         success: false,
//         message: 'Grille de réponses non trouvée',
//       });
//     }

//     const buffer = Buffer.from(doc.answerGridFile.data, 'base64');
//     res.set('Content-Type', doc.answerGridFile.mimeType || 'application/pdf');
//     res.set('Content-Disposition', `inline; filename="${doc.answerGridFile.originalName || 'grille-reponses.pdf'}"`);
//     res.set('Content-Length', buffer.length);
//     res.send(buffer);
//   } catch (error) {
//     console.error('❌ Erreur récupération grille:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// controllers/concoursController.js
const mongoose = require('mongoose');
const Concours = require('../models/Concours');
const Epreuve = require('../models/Epreuve');

/**
 * Convertit un fichier multer (memoryStorage) en objet fichier avec base64
 */
const buildFileObject = (file) => {
  if (!file) return {};

  console.log('📦 Traitement du fichier:', file.originalname);
  console.log('   - buffer présent:', !!file.buffer);
  console.log('   - buffer taille:', file.buffer?.length || 0);
  console.log('   - mimetype:', file.mimetype);

  if (!file.buffer || file.buffer.length === 0) {
    console.error('❌ ERREUR: Le buffer est vide!');
    return {
      filename: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype || 'application/pdf',
      size: file.size || 0,
    };
  }

  const base64Data = file.buffer.toString('base64');
  console.log(`   ✅ Base64 généré: ${base64Data.length} caractères`);

  return {
    filename: file.originalname,
    originalName: file.originalname,
    mimeType: file.mimetype || 'application/pdf',
    size: file.size,
    data: base64Data,
  };
};

// ============ CONCOURS ============

exports.createConcours = async (req, res) => {
  try {
    console.log('📝 Création d\'un concours');
    console.log('   - Body:', req.body);
    console.log('   - Files:', req.files ? Object.keys(req.files) : 'AUCUN');

    const { title, year, description } = req.body;

    const gridFile = req.files?.answerGridFile?.[0];
    const answerGridFileObj = buildFileObject(gridFile);

    console.log('   - answerGridFile:', answerGridFileObj.data ? '✅ avec data' : '❌ sans data');

    const concours = new Concours({
      title,
      year,
      description,
      answerGridFile: answerGridFileObj,
      uploadedBy: req.user.id
    });

    await concours.save();
    console.log('✅ Concours sauvegardé avec succès');

    const concoursObj = concours.toObject();
    if (concoursObj.answerGridFile?.data) {
      delete concoursObj.answerGridFile.data;
    }

    res.status(201).json({
      success: true,
      message: 'Concours créé avec succès',
      data: concoursObj,
    });
  } catch (error) {
    console.error('❌ Erreur création concours:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============ ÉPREUVES ============

exports.addEpreuve = async (req, res) => {
  try {
    console.log('📝 Ajout d\'une épreuve');
    console.log('   - Body:', req.body);
    console.log('   - Files:', req.files ? Object.keys(req.files) : 'AUCUN');

    const { concoursId, subject, title, order, nbQuestionsParBloc } = req.body;

    // Vérifier que le concours existe
    const concours = await Concours.findById(concoursId);
    if (!concours) {
      return res.status(404).json({ success: false, message: 'Concours non trouvé' });
    }

    // Récupérer et convertir les fichiers
    const examFile = req.files?.examFile?.[0];
    const answerGridFile = req.files?.answerGridFile?.[0];

    const examFileObj = buildFileObject(examFile);
    const answerGridFileObj = buildFileObject(answerGridFile);

    console.log('   - examFile:', examFileObj.data ? '✅ avec data' : '❌ sans data');
    console.log('   - answerGridFile:', answerGridFileObj.data ? '✅ avec data' : '❌ sans data');

    // ⭐ NOUVEAU: Récupérer nbQuestionsParBloc depuis le body
    const nbQ = parseInt(nbQuestionsParBloc) || 20;

    const epreuve = new Epreuve({
      concours: concoursId,
      subject,
      title: title || '',
      order: order || 0,
      nbQuestionsParBloc: nbQ, // ⭐ SAUVEGARDE
      examFile: examFileObj,
      answerGridFile: answerGridFileObj,
      uploadedBy: req.user.id
    });

    await epreuve.save();
    console.log(`✅ Épreuve sauvegardée avec ${nbQ} questions par bloc`);

    // Réponse sans le base64
    const epreuveObj = epreuve.toObject();
    if (epreuveObj.examFile?.data) {
      delete epreuveObj.examFile.data;
    }
    if (epreuveObj.answerGridFile?.data) {
      delete epreuveObj.answerGridFile.data;
    }

    res.status(201).json({
      success: true,
      message: 'Épreuve ajoutée avec succès',
      data: epreuveObj,
    });
  } catch (error) {
    console.error('❌ Erreur ajout épreuve:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateEpreuve = async (req, res) => {
  try {
    console.log('📝 Mise à jour d\'une épreuve');
    console.log('   - Params:', req.params);
    console.log('   - Body:', req.body);

    const { subject, title, order, nbQuestionsParBloc } = req.body;
    const epreuveId = req.params.id;

    const epreuve = await Epreuve.findById(epreuveId);
    if (!epreuve) {
      return res.status(404).json({ success: false, message: 'Épreuve non trouvée' });
    }

    // Mise à jour des champs
    if (subject) epreuve.subject = subject;
    if (title !== undefined) epreuve.title = title;
    if (order !== undefined) epreuve.order = parseInt(order) || 0;
    if (nbQuestionsParBloc !== undefined) {
      epreuve.nbQuestionsParBloc = parseInt(nbQuestionsParBloc) || 20;
    }

    // Gestion des fichiers si présents
    if (req.files?.examFile?.[0]) {
      epreuve.examFile = buildFileObject(req.files.examFile[0]);
    }
    if (req.files?.answerGridFile?.[0]) {
      epreuve.answerGridFile = buildFileObject(req.files.answerGridFile[0]);
    }

    await epreuve.save();
    console.log(`✅ Épreuve mise à jour avec ${epreuve.nbQuestionsParBloc} questions par bloc`);

    const epreuveObj = epreuve.toObject();
    if (epreuveObj.examFile?.data) delete epreuveObj.examFile.data;
    if (epreuveObj.answerGridFile?.data) delete epreuveObj.answerGridFile.data;

    res.json({
      success: true,
      message: 'Épreuve mise à jour avec succès',
      data: epreuveObj,
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour épreuve:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============ RÉCUPÉRATION ============

exports.getConcours = async (req, res) => {
  try {
    const concours = await Concours.find()
      .select('-answerGridFile.data')
      .sort({ year: -1, title: 1 });

    const result = await Promise.all(
      concours.map(async (c) => {
        const epreuves = await Epreuve.find({ concours: c._id })
          .select('-examFile.data -answerGridFile.data')
          .sort({ order: 1 });
        return {
          ...c.toObject(),
          epreuves
        };
      })
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Erreur récupération concours:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getConcoursById = async (req, res) => {
  try {
    const concours = await Concours.findById(req.params.id)
      .select('-answerGridFile.data');

    if (!concours) {
      return res.status(404).json({ success: false, message: 'Concours non trouvé' });
    }

    const epreuves = await Epreuve.find({ concours: concours._id })
      .select('-examFile.data -answerGridFile.data')
      .sort({ order: 1 });

    res.json({
      success: true,
      data: { ...concours.toObject(), epreuves }
    });
  } catch (error) {
    console.error('❌ Erreur récupération concours:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getEpreuvesByConcours = async (req, res) => {
  try {
    const { concoursId } = req.params;
    const epreuves = await Epreuve.find({ concours: concoursId })
      .select('-examFile.data -answerGridFile.data')
      .sort({ order: 1 });

    res.json({
      success: true,
      data: epreuves,
    });
  } catch (error) {
    console.error('❌ Erreur récupération épreuves:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============ SUPPRESSION ============

exports.deleteConcours = async (req, res) => {
  try {
    const concours = await Concours.findById(req.params.id);
    if (!concours) {
      return res.status(404).json({ success: false, message: 'Concours non trouvé' });
    }

    await Epreuve.deleteMany({ concours: concours._id });
    await concours.deleteOne();

    res.json({
      success: true,
      message: 'Concours supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur suppression concours:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteEpreuve = async (req, res) => {
  try {
    const epreuve = await Epreuve.findById(req.params.id);
    if (!epreuve) {
      return res.status(404).json({ success: false, message: 'Épreuve non trouvée' });
    }

    await epreuve.deleteOne();

    res.json({
      success: true,
      message: 'Épreuve supprimée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur suppression épreuve:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============ TÉLÉCHARGEMENT ============

exports.getExamFile = async (req, res) => {
  try {
    const epreuve = await Epreuve.findById(req.params.id).select('examFile');

    if (!epreuve?.examFile?.data) {
      return res.status(404).json({
        success: false,
        message: 'Fichier épreuve non trouvé',
      });
    }

    const buffer = Buffer.from(epreuve.examFile.data, 'base64');
    res.set('Content-Type', epreuve.examFile.mimeType || 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${epreuve.examFile.originalName || 'epreuve.pdf'}"`);
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
    // D'abord chercher dans Epreuve (car une épreuve peut avoir sa propre grille)
    let doc = await Epreuve.findById(req.params.id).select('answerGridFile');
    
    // Si pas trouvé, chercher dans Concours
    if (!doc?.answerGridFile?.data) {
      const concours = await Concours.findById(req.params.id).select('answerGridFile');
      if (concours?.answerGridFile?.data) {
        doc = concours;
      }
    }

    if (!doc?.answerGridFile?.data) {
      return res.status(404).json({
        success: false,
        message: 'Grille de réponses non trouvée',
      });
    }

    const buffer = Buffer.from(doc.answerGridFile.data, 'base64');
    res.set('Content-Type', doc.answerGridFile.mimeType || 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${doc.answerGridFile.originalName || 'grille-reponses.pdf'}"`);
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