// // controllers/answersController.js
// const axios = require('axios');
// const mongoose = require('mongoose');
// const Answer = require('../models/Answer');
// const Concours = require('../models/Concours');
// const Epreuve = require('../models/Epreuve');

// exports.saveAnswers = async (req, res) => {
//   try {
//     console.log('🔵 saveAnswers - Début');
//     console.log('📥 Body reçu:', JSON.stringify(req.body, null, 2));
//     console.log('👤 User:', req.user);
    
//     const studentId = req.user.id;
//     const { concoursId, epreuveId, answers, nom, prenom, code_candidat } = req.body;
    
//     if (!concoursId || !epreuveId) {
//       return res.status(400).json({ success: false, message: 'Concours et épreuve requis' });
//     }
    
//     // Vérifier que answers est soit un tableau soit un objet
//     if (!answers || (typeof answers !== 'object')) {
//       return res.status(400).json({ success: false, message: 'Les réponses sont requises' });
//     }

//     const epreuve = await Epreuve.findById(epreuveId);
//     if (!epreuve) {
//       return res.status(404).json({ success: false, message: 'Épreuve non trouvée' });
//     }

//     // Déterminer l'ordre pour calculer les vrais numéros de questions
//     const matiereOrder = epreuve?.order ?? 0;
//     const startQuestion = matiereOrder * 20 + 1;
    
//     // Transformer les réponses : si c'est un tableau, le convertir en objet avec les bons numéros
//     let formattedAnswers = {};
    
//     if (Array.isArray(answers)) {
//       // Si le frontend envoie un tableau, on le convertit en objet avec les vrais numéros
//       answers.forEach((rep, idx) => {
//         const qNum = startQuestion + idx;
//         formattedAnswers[`Q${qNum}`] = rep || '';
//       });
//     } else {
//       // Si c'est déjà un objet, on le garde tel quel
//       formattedAnswers = answers;
//     }

//     let doc = await Answer.findOne({ student: studentId, concours: concoursId, epreuve: epreuveId });
    
//     if (!doc) {
//       doc = new Answer({ 
//         student: studentId, 
//         concours: concoursId, 
//         epreuve: epreuveId,
//         nom: nom || '',
//         prenom: prenom || '',
//         code_candidat: code_candidat || `CAND${Date.now()}`,
//         answers: formattedAnswers
//       });
//     } else {
//       doc.answers = formattedAnswers;
//       if (nom) doc.nom = nom;
//       if (prenom) doc.prenom = prenom;
//       if (code_candidat) doc.code_candidat = code_candidat;
//       doc.status = 'saved';
//       doc.updatedAt = new Date();
//     }
    
//     await doc.save();
//     res.json({ success: true, answer: doc, message: '✅ Réponses sauvegardées' });
//   } catch (err) {
//     console.error('❌ saveAnswers error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.getMyAnswers = async (req, res) => {
//   try {
//     const studentId = req.user.id;
//     const { concoursId } = req.query;
//     const filter = { student: studentId };
//     if (concoursId) filter.concours = concoursId;
    
//     const answers = await Answer.find(filter)
//       .populate('epreuve')
//       .populate('concours', 'title year')
//       .sort({ updatedAt: -1 });
      
//     res.json({ success: true, data: answers });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.triggerN8n = async (req, res) => {
//   try {
//     console.log('🔵 triggerN8n - Début, answerId:', req.params.id);
//     const answerId = req.params.id;
//     const answer = await Answer.findById(answerId)
//       .populate('epreuve')
//       .populate('concours')
//       .populate('student', 'name email');
      
//     if (!answer) return res.status(404).json({ success: false, message: 'Réponse non trouvée' });
//     if (answer.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
//       return res.status(403).json({ success: false, message: 'Accès non autorisé' });
//     }
    
//     // Vérifier qu'il y a des réponses
//     if (!answer.answers || Object.keys(answer.answers).length === 0) {
//       return res.status(400).json({ success: false, message: 'Aucune réponse à traiter' });
//     }

//     const concours = await Concours.findById(answer.concours);
//     const epreuve = await Epreuve.findById(answer.epreuve);
//     const subject = epreuve?.subject || 'mathematiques';
    
//     const subjectCollectionMap = {
//       'mathematiques': 'qcm_math_enrichi',
//       'math': 'qcm_math_enrichi',
//       'physique': 'qcm_physique_enrichi',
//       'chimie': 'qcm_chimie_enrichi',
//       'svt': 'qcm_svt_enrichi'
//     };
    
//     const collectionName = subjectCollectionMap[subject] || 'qcm_math_enrichi';
//     const concoursAnnee = concours?.year || '2022-2023';
    
//     const matiereOrder = epreuve?.order ?? 0;
//     const startQuestion = matiereOrder * 20 + 1;
//     const endQuestion = (matiereOrder + 1) * 20;
    
//     const questionNumbers = [];
//     for (let i = startQuestion; i <= endQuestion; i++) {
//       questionNumbers.push(`Q${i}`);
//     }
    
//     let questions = [];
//     try {
//       questions = await mongoose.connection.db.collection(collectionName)
//         .find({ 
//           concours_annee: concoursAnnee,
//           num_question: { $in: questionNumbers }
//         })
//         .sort({ num_question: 1 })
//         .toArray();
//       console.log(`✅ Enrichissement: ${questions.length} questions pour ${subject} (${concoursAnnee}) - plage ${startQuestion}-${endQuestion}`);
//     } catch (e) {
//       console.warn(`⚠️ Erreur enrichissement:`, e.message);
//     }

//     // Les réponses sont déjà au format { "Q21": "B", "Q22": "A", ... }
//     const payload = {
//       nom: answer.nom || '',
//       prenom: answer.prenom || '',
//       code_candidat: answer.code_candidat,
//       email: answer.student.email,
//       concours: concours?.title || '',
//       concours_annee: concoursAnnee,
//       epreuve_matiere: subject,
//       matiere_order: matiereOrder,
//       ...answer.answers,  // ← directement l'objet answers
//       questions_db: questions,
//       answerId: answer._id.toString(),
//       callbackUrl: `${process.env.API_URL || 'http://localhost:5000'}/api/answers/webhook/n8n-callback`
//     };

//     answer.status = 'processing';
//     answer.workflow_triggered_at = new Date();
//     await answer.save();

//     const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://cc1234.app.n8n.cloud/webhook/process-subject';

//     try {
//       await axios.post(webhookUrl, payload, { timeout: 120000 });
//       res.json({ success: true, message: '🚀 Workflow déclenché!' });
//     } catch (postErr) {
//       console.error('n8n error:', postErr.message);
//       answer.status = 'failed';
//       answer.result = { error: postErr.message };
//       await answer.save();
//       res.status(500).json({ success: false, message: 'Erreur déclenchement workflow' });
//     }
//   } catch (err) {
//     console.error('triggerN8n err:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.n8nCallback = async (req, res) => {
//   try {
//     const { answerId, status, result, feedback, score, mention } = req.body;
//     const answer = await Answer.findById(answerId);
//     if (!answer) return res.status(404).json({ success: false, message: 'Réponse non trouvée' });
    
//     if (status === 'completed') {
//       answer.status = 'completed';
//       answer.result = { 
//         feedback: feedback || result,
//         score: score,
//         mention: mention,
//         generatedAt: new Date()
//       };
//       answer.workflow_completed_at = new Date();
//     } else if (status === 'failed') {
//       answer.status = 'failed';
//       answer.result = { error: result || 'Erreur inconnue' };
//     }
//     await answer.save();
//     res.json({ success: true, message: 'Callback traité' });
//   } catch (err) {
//     console.error('n8n callback error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.getAnswerFeedback = async (req, res) => {
//   try {
//     const answer = await Answer.findById(req.params.id)
//       .populate('epreuve')
//       .populate('concours', 'title year');
//     if (!answer) return res.status(404).json({ success: false, message: 'Non trouvé' });
//     if (answer.student.toString() !== req.user.id && req.user.role !== 'admin') {
//       return res.status(403).json({ success: false, message: 'Non autorisé' });
//     }
//     res.json({ success: true, data: answer });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// controllers/answersController.js
// const axios    = require('axios');
// const mongoose = require('mongoose');
// const fs       = require('fs');
// const FormData = require('form-data');
// const Answer   = require('../models/Answer');
// const Concours = require('../models/Concours');
// const Epreuve  = require('../models/Epreuve');
// const https     = require('https');
// /* ──────────────────────────────────────────
//    POST /api/answers  — créer ou mettre à jour
// ────────────────────────────────────────── */
// exports.saveAnswers = async (req, res) => {
//   try {
//     const studentId = req.user.id;
//     const { concoursId, epreuveId, answers, nom, prenom, code_candidat } = req.body;

//     if (!concoursId || !epreuveId)
//       return res.status(400).json({ success: false, message: 'Concours et épreuve requis' });
//     if (!answers || typeof answers !== 'object')
//       return res.status(400).json({ success: false, message: 'Les réponses sont requises' });

//     const epreuve = await Epreuve.findById(epreuveId);
//     if (!epreuve) return res.status(404).json({ success: false, message: 'Épreuve non trouvée' });

//     const matiereOrder  = epreuve?.order ?? 0;
//     const startQuestion = matiereOrder * 20 + 1;

//     // Normalisation tableau → objet
//     let formattedAnswers = {};
//     if (Array.isArray(answers)) {
//       answers.forEach((rep, idx) => {
//         formattedAnswers[`Q${startQuestion + idx}`] = rep || '';
//       });
//     } else {
//       formattedAnswers = answers;
//     }

//     let doc = await Answer.findOne({ student: studentId, concours: concoursId, epreuve: epreuveId });

//     if (!doc) {
//       doc = new Answer({
//         student:        studentId,
//         concours:       concoursId,
//         epreuve:        epreuveId,
//         nom:            nom || '',
//         prenom:         prenom || '',
//         code_candidat:  code_candidat || `CAND${Date.now()}`,
//         answers:        formattedAnswers,
//         status:         'saved',
//       });
//     } else {
//       doc.answers = formattedAnswers;
//       if (nom)           doc.nom = nom;
//       if (prenom)        doc.prenom = prenom;
//       if (code_candidat) doc.code_candidat = code_candidat;
//       doc.status    = 'saved';
//       doc.updatedAt = new Date();
//     }

//     await doc.save();
//     res.json({ success: true, answer: doc, message: '✅ Réponses sauvegardées' });
//   } catch (err) {
//     console.error('saveAnswers error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ──────────────────────────────────────────
//    PUT /api/answers/:id  — modifier une réponse existante
// ────────────────────────────────────────── */
// exports.updateAnswers = async (req, res) => {
//   try {
//     const { answers, nom, prenom, code_candidat } = req.body;

//     const doc = await Answer.findById(req.params.id);
//     if (!doc) return res.status(404).json({ success: false, message: 'Réponse non trouvée' });
//     if (doc.student.toString() !== req.user.id && req.user.role !== 'admin')
//       return res.status(403).json({ success: false, message: 'Non autorisé' });

//     if (answers && typeof answers === 'object') {
//       // Si tableau, convertir
//       if (Array.isArray(answers)) {
//         const epreuve       = await Epreuve.findById(doc.epreuve);
//         const startQuestion = (epreuve?.order ?? 0) * 20 + 1;
//         const obj = {};
//         answers.forEach((v, i) => { obj[`Q${startQuestion + i}`] = v || ''; });
//         doc.answers = obj;
//       } else {
//         doc.answers = answers;
//       }
//     }
//     if (nom)           doc.nom = nom;
//     if (prenom)        doc.prenom = prenom;
//     if (code_candidat) doc.code_candidat = code_candidat;
//     doc.status    = 'saved'; // reset au cas où on modifie après un feedback
//     doc.updatedAt = new Date();

//     await doc.save();
//     res.json({ success: true, answer: doc, message: '✅ Réponses mises à jour' });
//   } catch (err) {
//     console.error('updateAnswers error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ──────────────────────────────────────────
//    DELETE /api/answers/:id  — supprimer
// ────────────────────────────────────────── */
// exports.deleteAnswer = async (req, res) => {
//   try {
//     const doc = await Answer.findById(req.params.id);
//     if (!doc) return res.status(404).json({ success: false, message: 'Réponse non trouvée' });
//     if (doc.student.toString() !== req.user.id && req.user.role !== 'admin')
//       return res.status(403).json({ success: false, message: 'Non autorisé' });

//     await doc.deleteOne();
//     res.json({ success: true, message: '🗑️ Épreuve supprimée' });
//   } catch (err) {
//     console.error('deleteAnswer error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ──────────────────────────────────────────
//    GET /api/answers  — liste de l'étudiant
// ────────────────────────────────────────── */
// exports.getMyAnswers = async (req, res) => {
//   try {
//     const studentId = req.user.id;
//     const { concoursId } = req.query;
//     const filter = { student: studentId };
//     if (concoursId) filter.concours = concoursId;

//     const answers = await Answer.find(filter)
//       .populate('epreuve')
//       .populate('concours', 'title year')
//       .sort({ updatedAt: -1 });

//     res.json({ success: true, data: answers });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ──────────────────────────────────────────
//    GET /api/answers/:id/feedback
// ────────────────────────────────────────── */
// exports.getAnswerFeedback = async (req, res) => {
//   try {
//     const answer = await Answer.findById(req.params.id)
//       .populate('epreuve')
//       .populate('concours', 'title year');
//     if (!answer) return res.status(404).json({ success: false, message: 'Non trouvé' });
//     if (answer.student.toString() !== req.user.id && req.user.role !== 'admin')
//       return res.status(403).json({ success: false, message: 'Non autorisé' });
//     res.json({ success: true, data: answer });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ──────────────────────────────────────────
//    POST /api/answers/extract-image
//    Réception image → envoi à n8n extraction → retour JSON réponses
// ────────────────────────────────────────── */
// exports.extractImage = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ success: false, message: 'Image requise' });

//     const startQ = parseInt(req.body.startQ) || 1;
//     const matiereOrder = Math.floor((startQ - 1) / 20); // recalculer le bloc

//     // Lire l'image uploadée
//     const imageBuffer  = fs.readFileSync(req.file.path);
//     const imageBase64  = imageBuffer.toString('base64');
//     const mimeType     = req.file.mimetype;

//     // Appel direct à OpenRouter Vision (sans passer par n8n pour la rapidité)
//     const openrouterKey = process.env.OPENROUTER_API_KEY;
//     if (!openrouterKey) {
//       // Fallback : passer par le webhook n8n dédié
//       return await extractViaWebhook(req, res, startQ, matiereOrder);
//     }

//     const prompt = buildExtractionPrompt(startQ, matiereOrder);

//     const response = await axios.post(
//       'https://openrouter.ai/api/v1/chat/completions',
//       {
//         model: 'anthropic/claude-sonnet-4-5',
//         max_tokens: 500,
//         messages: [{
//           role: 'user',
//           content: [
//             {
//               type:      'image_url',
//               image_url: { url: `data:${mimeType};base64,${imageBase64}` },
//             },
//             { type: 'text', text: prompt },
//           ],
//         }],
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${openrouterKey}`,
//           'Content-Type':  'application/json',
//           'HTTP-Referer':  process.env.API_URL || 'http://localhost:5000',
//         },
//         timeout: 30000,
//       }
//     );

//     const raw = response.data.choices[0].message.content;
//     const extracted = JSON.parse(raw.replace(/```json|```/g, '').trim());

//     // Nettoyer le fichier temporaire
//     fs.unlink(req.file.path, () => {});

//     res.json({ success: true, answers: extracted });
//   } catch (err) {
//     console.error('extractImage error:', err.message);
//     if (req.file?.path) fs.unlink(req.file.path, () => {});
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// function buildExtractionPrompt(startQ, matiereOrder) {
//   const endQ = startQ + 19;
//   return `Tu es un expert en lecture de grilles de réponses QCM pour les concours médicaux (FMPO Maroc).

// Cette image contient une grille de réponses QCM avec des questions numérotées.
// Extrait les réponses du BLOC qui contient Q${startQ} à Q${endQ}.

// RÈGLES :
// 1. Une case cochée (X ou ■) = la réponse sélectionnée.
// 2. Colonnes de gauche à droite : A, B, C, D, E.
// 3. Si aucune case cochée pour une question : retourne "".
// 4. Réponds UNIQUEMENT en JSON valide sans markdown ni backticks.

// Format attendu (uniquement les 20 questions de Q${startQ} à Q${endQ}) :
// {${Array.from({ length: 20 }, (_, i) => `"Q${startQ + i}":""`).join(',')}}`;
// }

// // Fallback si pas de clé OpenRouter : déléguer à n8n
// async function extractViaWebhook(req, res, startQ, matiereOrder) {
//   try {
//     const webhookExtractUrl = process.env.N8N_EXTRACT_WEBHOOK_URL;
//     if (!webhookExtractUrl) throw new Error('N8N_EXTRACT_WEBHOOK_URL non configuré');

//     const formData = new FormData();
//     formData.append('image', fs.createReadStream(req.file.path), {
//       filename:    req.file.originalname,
//       contentType: req.file.mimetype,
//     });
//     formData.append('startQ', String(startQ));

//     const response = await axios.post(webhookExtractUrl, formData, {
//       headers: formData.getHeaders(),
//       timeout: 60000,
//     });

//     fs.unlink(req.file.path, () => {});
//     res.json({ success: true, answers: response.data.answers || response.data });
//   } catch (err) {
//     if (req.file?.path) fs.unlink(req.file.path, () => {});
//     res.status(500).json({ success: false, message: err.message });
//   }
// }

// /* ──────────────────────────────────────────
//    POST /api/answers/:id/trigger  — déclencher n8n feedback
// ────────────────────────────────────────── */
// exports.triggerN8n = async (req, res) => {
//   try {
//     const answerId = req.params.id;
//     const answer = await Answer.findById(answerId)
//       .populate('epreuve')
//       .populate('concours')
//       .populate('student', 'name email');

//     if (!answer) return res.status(404).json({ success: false, message: 'Réponse non trouvée' });
//     if (answer.student._id.toString() !== req.user.id && req.user.role !== 'admin')
//       return res.status(403).json({ success: false, message: 'Accès non autorisé' });
//     if (!answer.answers || Object.keys(answer.answers).length === 0)
//       return res.status(400).json({ success: false, message: 'Aucune réponse à traiter' });

//     const concours = await Concours.findById(answer.concours);
//     const epreuve  = await Epreuve.findById(answer.epreuve);
//     const subject  = epreuve?.subject || 'mathematiques';

//     const subjectCollectionMap = {
//       mathematiques: 'qcm_math_enrichi',
//       math:          'qcm_math_enrichi',
//       physique:      'qcm_physique_enrichi',
//       chimie:        'qcm_chimie_enrichi',
//       svt:           'qcm_svt_enrichi',
//     };

//     const collectionName  = subjectCollectionMap[subject] || 'qcm_math_enrichi';
//     const concoursAnnee   = concours?.year || '2022-2023';
//     const matiereOrder    = epreuve?.order ?? 0;
//     const startQuestion   = matiereOrder * 20 + 1;
//     const endQuestion     = (matiereOrder + 1) * 20;
//     const questionNumbers = Array.from({ length: 20 }, (_, i) => `Q${startQuestion + i}`);

//     let questions = [];
//     try {
//       questions = await mongoose.connection.db.collection(collectionName)
//         .find({ concours_annee: concoursAnnee, num_question: { $in: questionNumbers } })
//         .sort({ num_question: 1 })
//         .toArray();
//     } catch (e) {
//       console.warn('Enrichissement DB:', e.message);
//     }

//     const payload = {
//       nom:             answer.nom || '',
//       prenom:          answer.prenom || '',
//       code_candidat:   answer.code_candidat,
//       email:           answer.student.email,
//       concours:        concours?.title || '',
//       concours_annee:  concoursAnnee,
//       epreuve_matiere: subject,
//       matiere_order:   matiereOrder,
//       ...answer.answers,
//       questions_db:    questions,
//       answerId:        answer._id.toString(),
//       callbackUrl:     `${process.env.API_URL || 'http://localhost:5000'}/api/answers/webhook/n8n-callback`,
//     };

//     answer.status = 'processing';
//     answer.workflow_triggered_at = new Date();
//     await answer.save();

//     const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.yousseflefdaoui.cloud/webhook-test/process-subject';
// const agent = new https.Agent({ rejectUnauthorized: false });

// try {
//   await axios.post(webhookUrl, payload, { timeout: 10000, httpsAgent: agent }); // ← httpsAgent ajouté ici
//   res.json({ success: true, message: '🚀 Workflow déclenché !' });
// } catch (postErr) {
//   if (postErr.code === 'ECONNABORTED' || postErr.code === 'ETIMEDOUT') {
//     res.json({ success: true, message: '🚀 Workflow déclenché (traitement en cours)' });
//   } else {
//     console.error('n8n error:', postErr.message);
//     answer.status = 'failed';
//     answer.result = { error: postErr.message };
//     await answer.save();
//     res.status(500).json({ success: false, message: 'Erreur déclenchement workflow' });
//   }
// }
//   } catch (err) {
//     console.error('triggerN8n err:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ──────────────────────────────────────────
//    POST /api/answers/webhook/n8n-callback
// ────────────────────────────────────────── */
// exports.n8nCallback = async (req, res) => {
//   try {
//     const { answerId, status, result, feedback, score, mention } = req.body;
//     const answer = await Answer.findById(answerId);
//     if (!answer) return res.status(404).json({ success: false, message: 'Réponse non trouvée' });

//     if (status === 'completed') {
//       answer.status = 'completed';
//       answer.result = {
//         feedback:    feedback || result,
//         score,
//         mention,
//         nb_questions: feedback?.nb_questions || 20,
//         generatedAt: new Date(),
//       };
//       answer.workflow_completed_at = new Date();
//     } else if (status === 'failed') {
//       answer.status = 'failed';
//       answer.result = { error: result || 'Erreur inconnue' };
//     }

//     await answer.save();
//     res.json({ success: true, message: 'Callback traité' });
//   } catch (err) {
//     console.error('n8n callback error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
// const axios = require('axios');
// const mongoose = require('mongoose');
// const fs = require('fs');
// const FormData = require('form-data');
// const Answer = require('../models/Answer');
// const Concours = require('../models/Concours');
// const Epreuve = require('../models/Epreuve');
// const https = require('https');

// /* ──────────────────────────────────────────
//    POST /api/answers — créer ou mettre à jour
// ────────────────────────────────────────── */
// exports.saveAnswers = async (req, res) => {
//   try {
//     const studentId = req.user.id;
//     const { concoursId, epreuveId, answers, nom, prenom, code_candidat } = req.body;

//     if (!concoursId || !epreuveId)
//       return res.status(400).json({ success: false, message: 'Concours et épreuve requis' });
//     if (!answers || typeof answers !== 'object')
//       return res.status(400).json({ success: false, message: 'Les réponses sont requises' });

//     const epreuve = await Epreuve.findById(epreuveId);
//     if (!epreuve) return res.status(404).json({ success: false, message: 'Épreuve non trouvée' });

//     const matiereOrder  = epreuve?.order ?? 0;
//     const startQuestion = matiereOrder * 20 + 1;

//     let formattedAnswers = {};
//     if (Array.isArray(answers)) {
//       answers.forEach((rep, idx) => {
//         formattedAnswers[`Q${startQuestion + idx}`] = rep || '';
//       });
//     } else {
//       formattedAnswers = answers;
//     }

//     let doc = await Answer.findOne({ student: studentId, concours: concoursId, epreuve: epreuveId });

//     if (!doc) {
//       doc = new Answer({
//         student:       studentId,
//         concours:      concoursId,
//         epreuve:       epreuveId,
//         nom:           nom || '',
//         prenom:        prenom || '',
//         code_candidat: code_candidat || `CAND${Date.now()}`,
//         answers:       formattedAnswers,
//         status:        'saved',
//       });
//     } else {
//       doc.answers = formattedAnswers;
//       if (nom)           doc.nom = nom;
//       if (prenom)        doc.prenom = prenom;
//       if (code_candidat) doc.code_candidat = code_candidat;
//       doc.status    = 'saved';
//       doc.updatedAt = new Date();
//     }

//     await doc.save();
//     res.json({ success: true, answer: doc, message: '✅ Réponses sauvegardées' });
//   } catch (err) {
//     console.error('saveAnswers error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ──────────────────────────────────────────
//    PUT /api/answers/:id
// ────────────────────────────────────────── */
// exports.updateAnswers = async (req, res) => {
//   try {
//     const { answers, nom, prenom, code_candidat } = req.body;
//     const doc = await Answer.findById(req.params.id);
//     if (!doc) return res.status(404).json({ success: false, message: 'Réponse non trouvée' });
//     if (doc.student.toString() !== req.user.id && req.user.role !== 'admin')
//       return res.status(403).json({ success: false, message: 'Non autorisé' });

//     if (answers && typeof answers === 'object') {
//       if (Array.isArray(answers)) {
//         const epreuve       = await Epreuve.findById(doc.epreuve);
//         const startQuestion = (epreuve?.order ?? 0) * 20 + 1;
//         const obj = {};
//         answers.forEach((v, i) => { obj[`Q${startQuestion + i}`] = v || ''; });
//         doc.answers = obj;
//       } else {
//         doc.answers = answers;
//       }
//     }
//     if (nom)           doc.nom = nom;
//     if (prenom)        doc.prenom = prenom;
//     if (code_candidat) doc.code_candidat = code_candidat;
//     doc.status    = 'saved';
//     doc.updatedAt = new Date();

//     await doc.save();
//     res.json({ success: true, answer: doc, message: '✅ Réponses mises à jour' });
//   } catch (err) {
//     console.error('updateAnswers error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ──────────────────────────────────────────
//    DELETE /api/answers/:id
// ────────────────────────────────────────── */
// exports.deleteAnswer = async (req, res) => {
//   try {
//     const doc = await Answer.findById(req.params.id);
//     if (!doc) return res.status(404).json({ success: false, message: 'Réponse non trouvée' });
//     if (doc.student.toString() !== req.user.id && req.user.role !== 'admin')
//       return res.status(403).json({ success: false, message: 'Non autorisé' });

//     await doc.deleteOne();
//     res.json({ success: true, message: '🗑️ Épreuve supprimée' });
//   } catch (err) {
//     console.error('deleteAnswer error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ──────────────────────────────────────────
//    GET /api/answers
// ────────────────────────────────────────── */
// exports.getMyAnswers = async (req, res) => {
//   try {
//     const studentId = req.user.id;
//     const { concoursId } = req.query;
//     const filter = { student: studentId };
//     if (concoursId) filter.concours = concoursId;

//     const answers = await Answer.find(filter)
//       .populate('epreuve')
//       .populate('concours', 'title year')
//       .sort({ updatedAt: -1 });

//     res.json({ success: true, data: answers });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ──────────────────────────────────────────
//    GET /api/answers/:id/feedback
// ────────────────────────────────────────── */
// exports.getAnswerFeedback = async (req, res) => {
//   try {
//     const answer = await Answer.findById(req.params.id)
//       .populate('epreuve')
//       .populate('concours', 'title year');
//     if (!answer) return res.status(404).json({ success: false, message: 'Non trouvé' });
//     if (answer.student.toString() !== req.user.id && req.user.role !== 'admin')
//       return res.status(403).json({ success: false, message: 'Non autorisé' });
//     res.json({ success: true, data: answer });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ──────────────────────────────────────────
//    POST /api/answers/extract-image
// ────────────────────────────────────────── */
// exports.extractImage = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ success: false, message: 'Image requise' });

//     const startQ       = parseInt(req.body.startQ) || 1;
//     const imageBuffer  = fs.readFileSync(req.file.path);
//     const imageBase64  = imageBuffer.toString('base64');
//     const mimeType     = req.file.mimetype;
//     const endQ         = startQ + 19;

//     const openrouterKey = process.env.OPENROUTER_API_KEY;
//     if (!openrouterKey) {
//       return await extractViaWebhook(req, res, startQ);
//     }

//     const prompt = `Tu es un expert en lecture de grilles de réponses QCM pour les concours médicaux (FMPO Maroc).
// Cette image contient une grille de réponses QCM.
// Extrait les réponses du bloc Q${startQ} à Q${endQ}.
// RÈGLES:
// - Une case cochée (X ou ■) = la réponse sélectionnée.
// - Colonnes de gauche à droite : A, B, C, D, E.
// - Si aucune case cochée : retourne "".
// Réponds UNIQUEMENT en JSON valide sans markdown.
// Format: {"Q${startQ}":"A","Q${startQ+1}":"B",...,"Q${endQ}":""}`;

//     const response = await axios.post(
//       'https://openrouter.ai/api/v1/chat/completions',
//       {
//         model: 'anthropic/claude-sonnet-4-5',
//         max_tokens: 500,
//         messages: [{ role: 'user', content: [
//           { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
//           { type: 'text', text: prompt },
//         ]}],
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${openrouterKey}`,
//           'Content-Type':  'application/json',
//           'HTTP-Referer':  process.env.API_URL || 'http://localhost:5000',
//         },
//         timeout: 30000,
//       }
//     );

//     const raw       = response.data.choices[0].message.content;
//     const extracted = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
//     fs.unlink(req.file.path, () => {});
//     res.json({ success: true, answers: extracted });
//   } catch (err) {
//     console.error('extractImage error:', err.message);
//     if (req.file?.path) fs.unlink(req.file.path, () => {});
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// async function extractViaWebhook(req, res, startQ) {
//   try {
//     const webhookExtractUrl = process.env.N8N_EXTRACT_WEBHOOK_URL;
//     if (!webhookExtractUrl) throw new Error('N8N_EXTRACT_WEBHOOK_URL non configuré');

//     const formData = new FormData();
//     formData.append('image', fs.createReadStream(req.file.path), {
//       filename:    req.file.originalname,
//       contentType: req.file.mimetype,
//     });
//     formData.append('startQ', String(startQ));

//     const response = await axios.post(webhookExtractUrl, formData, {
//       headers: formData.getHeaders(),
//       timeout: 60000,
//     });

//     fs.unlink(req.file.path, () => {});
//     res.json({ success: true, answers: response.data.answers || response.data });
//   } catch (err) {
//     if (req.file?.path) fs.unlink(req.file.path, () => {});
//     res.status(500).json({ success: false, message: err.message });
//   }
// }

// /* ──────────────────────────────────────────
//    POST /api/answers/:id/trigger
//    CORRECTION PRINCIPALE : on envoie les questions_db
//    directement dans le payload pour que n8n les utilise
//    sans avoir besoin de relire MongoDB
// ────────────────────────────────────────── */
// exports.triggerN8n = async (req, res) => {
//   try {
//     const answerId = req.params.id;
//     const answer = await Answer.findById(answerId).populate('epreuve').populate('concours').populate('student');

//     if (!answer) return res.status(404).json({ success: false, message: 'Réponse non trouvée' });

//     const subject = answer.epreuve?.subject || 'mathematiques';
//     const subjectCollectionMap = {
//       mathematiques: 'qcm_math_enrichi',
//       physique: 'qcm_physique_enrichi',
//       chimie: 'qcm_chimie_enrichi',
//       svt: 'qcm_svt_enrichi',
//     };

//     const collectionName = subjectCollectionMap[subject] || 'qcm_math_enrichi';
    
//     // --- CORRECTION FILTRAGE PAR EPREUVE_ID ---
//     let questions = [];
//     try {
//       questions = await mongoose.connection.db.collection(collectionName)
//         .find({ epreuve_id: answer.epreuve._id.toString() }) // Filtre par ID unique de l'épreuve
//         .sort({ num_question: 1 })
//         .toArray();
//       console.log(`${questions.length} questions d'enrichissement trouvées.`);
//     } catch (e) {
//       console.error('Erreur DB Enrichissement:', e.message);
//     }

//     const payload = {
//       answerId: answer._id.toString(),
//       prenom: answer.prenom,
//       nom: answer.nom,
//       email: answer.student?.email,
//       concours: answer.concours?.title,
//       epreuve_matiere: subject,
//       epreuve_id: answer.epreuve._id.toString(), // Envoyé pour n8n
//       nb_questions: 20,
//       ...answer.answers, // Envoie Q1, Q2...
//       questions_db: questions, // Envoie déjà les explications à n8n
//       callbackUrl: `${process.env.API_URL}/api/answers/webhook/n8n-callback`,
//     };

//     answer.status = 'processing';
//     await answer.save();

//     const agent = new https.Agent({ rejectUnauthorized: false });
//     // Appel à n8n
//     axios.post(process.env.N8N_WEBHOOK_URL, payload, { httpsAgent: agent })
//       .catch(err => console.error('Erreur envoi n8n:', err.message));

//     res.json({ success: true, message: '🚀 Analyse lancée !' });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
// /* ──────────────────────────────────────────
//    POST /api/answers/webhook/n8n-callback
//    FIX: Accepte le format de retour du workflow n8n
// ────────────────────────────────────────── */
// exports.n8nCallback = async (req, res) => {
//   try {
//     console.log('📩 n8n callback reçu:', JSON.stringify(req.body, null, 2));
    
//     const { answerId, status, result, feedback, score, mention } = req.body;
    
//     if (!answerId) {
//       return res.status(400).json({ success: false, message: 'answerId manquant' });
//     }

//     const answer = await Answer.findById(answerId);
//     if (!answer) return res.status(404).json({ success: false, message: 'Réponse non trouvée' });

//     if (status === 'completed') {
//       // FIX: Le workflow peut envoyer le feedback dans différents champs
//       let feedbackData = feedback || result;
//       let scoreValue   = score;
//       let mentionValue = mention;

//       // Si le feedback est une string JSON, parser
//       if (typeof feedbackData === 'string') {
//         try {
//           feedbackData = JSON.parse(feedbackData);
//         } catch (_) {}
//       }

//       // Extraire score/mention depuis le feedback si non fournis directement
//       if (feedbackData && typeof feedbackData === 'object') {
//         if (!scoreValue && feedbackData.meta?.score) {
//           const scoreStr = feedbackData.meta.score;
//           scoreValue = parseInt(scoreStr.split('/')[0]) || 0;
//         }
//         if (!mentionValue && feedbackData.meta?.mention) {
//           mentionValue = feedbackData.meta.mention;
//         }
//       }

//       answer.status = 'completed';
//       answer.result = {
//         feedback:     feedbackData,
//         score:        scoreValue,
//         mention:      mentionValue,
//         nb_questions: feedbackData?.questions?.length || 20,
//         generatedAt:  new Date(),
//       };
//       answer.workflow_completed_at = new Date();
//       console.log(`✅ Feedback enregistré pour answer ${answerId}, score: ${scoreValue}`);
//     } else if (status === 'failed') {
//       answer.status = 'failed';
//       answer.result = { error: result || 'Erreur inconnue du workflow' };
//     }

//     await answer.save();
//     res.json({ success: true, message: 'Callback traité' });
//   } catch (err) {
//     console.error('n8n callback error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
// controllers/answersController.js
const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');
const FormData = require('form-data');
const Answer = require('../models/Answer');
const Concours = require('../models/Concours');
const Epreuve = require('../models/Epreuve');
const https = require('https');
const path = require('path');
/* ──────────────────────────────────────────
   POST /api/answers — créer ou mettre à jour
────────────────────────────────────────── */
exports.saveAnswers = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { concoursId, epreuveId, answers, nom, prenom, code_candidat } = req.body;

    if (!concoursId || !epreuveId)
      return res.status(400).json({ success: false, message: 'Concours et épreuve requis' });
    if (!answers || typeof answers !== 'object')
      return res.status(400).json({ success: false, message: 'Les réponses sont requises' });

    const epreuve = await Epreuve.findById(epreuveId);
    if (!epreuve) return res.status(404).json({ success: false, message: 'Épreuve non trouvée' });

    const nbQ = epreuve.nbQuestionsParBloc || 20;
    const matiereOrder = epreuve?.order ?? 0;
    const startQuestion = matiereOrder * nbQ + 1;

    let formattedAnswers = {};
    if (Array.isArray(answers)) {
      answers.forEach((rep, idx) => {
        formattedAnswers[`Q${startQuestion + idx}`] = rep || '';
      });
    } else {
      formattedAnswers = answers;
    }

    let doc = await Answer.findOne({ student: studentId, concours: concoursId, epreuve: epreuveId });

    if (!doc) {
      doc = new Answer({
        student: studentId,
        concours: concoursId,
        epreuve: epreuveId,
        nom: nom || '',
        prenom: prenom || '',
        code_candidat: code_candidat || `CAND${Date.now()}`,
        answers: formattedAnswers,
        status: 'saved',
      });
    } else {
      doc.answers = formattedAnswers;
      if (nom) doc.nom = nom;
      if (prenom) doc.prenom = prenom;
      if (code_candidat) doc.code_candidat = code_candidat;
      doc.status = 'saved';
      doc.updatedAt = new Date();
    }

    await doc.save();
    res.json({ success: true, answer: doc, message: '✅ Réponses sauvegardées' });
  } catch (err) {
    console.error('saveAnswers error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ──────────────────────────────────────────
   PUT /api/answers/:id
────────────────────────────────────────── */
exports.updateAnswers = async (req, res) => {
  try {
    const { answers, nom, prenom, code_candidat } = req.body;
    const doc = await Answer.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Réponse non trouvée' });
    if (doc.student.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Non autorisé' });

    if (answers && typeof answers === 'object') {
      if (Array.isArray(answers)) {
        const epreuve = await Epreuve.findById(doc.epreuve);
        const nbQ = epreuve?.nbQuestionsParBloc || 20;
        const startQuestion = (epreuve?.order ?? 0) * nbQ + 1;
        const obj = {};
        answers.forEach((v, i) => { obj[`Q${startQuestion + i}`] = v || ''; });
        doc.answers = obj;
      } else {
        doc.answers = answers;
      }
    }
    if (nom) doc.nom = nom;
    if (prenom) doc.prenom = prenom;
    if (code_candidat) doc.code_candidat = code_candidat;
    doc.status = 'saved';
    doc.updatedAt = new Date();

    await doc.save();
    res.json({ success: true, answer: doc, message: '✅ Réponses mises à jour' });
  } catch (err) {
    console.error('updateAnswers error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ──────────────────────────────────────────
   DELETE /api/answers/:id
────────────────────────────────────────── */
exports.deleteAnswer = async (req, res) => {
  try {
    const doc = await Answer.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Réponse non trouvée' });
    if (doc.student.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Non autorisé' });

    await doc.deleteOne();
    res.json({ success: true, message: '🗑️ Épreuve supprimée' });
  } catch (err) {
    console.error('deleteAnswer error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ──────────────────────────────────────────
   GET /api/answers
────────────────────────────────────────── */
exports.getMyAnswers = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { concoursId } = req.query;
    const filter = { student: studentId };
    if (concoursId) filter.concours = concoursId;

    const answers = await Answer.find(filter)
      .populate('epreuve')
      .populate('concours', 'title year')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: answers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ──────────────────────────────────────────
   GET /api/answers/:id/feedback
────────────────────────────────────────── */
exports.getAnswerFeedback = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id)
      .populate('epreuve')
      .populate('concours', 'title year');
    if (!answer) return res.status(404).json({ success: false, message: 'Non trouvé' });
    if (answer.student.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    res.json({ success: true, data: answer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ──────────────────────────────────────────
   POST /api/answers/extract-image
────────────────────────────────────────── */
exports.extractImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image requise' });

    const startQ = parseInt(req.body.startQ) || 1;
    const nbQ = parseInt(req.body.nbQuestions) || 20;
    const endQ = startQ + nbQ - 1;

    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      return await extractViaWebhook(req, res, startQ, nbQ);
    }

    const prompt = `Tu es un expert en lecture de grilles de réponses QCM pour les concours médicaux (FMPO Maroc).

Cette image contient une grille de réponses QCM. Extrait les réponses du bloc Q${startQ} à Q${endQ}.

RÈGLES:
- Une case cochée (X ou ■) = la réponse sélectionnée.
- Colonnes de gauche à droite : A, B, C, D, E.
- Si aucune case cochée : retourne "".
- Réponds UNIQUEMENT en JSON valide sans markdown.

Format: {"Q${startQ}":"A","Q${startQ+1}":"B",...,"Q${endQ}":""}`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-sonnet-4-5',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
            { type: 'text', text: prompt },
          ],
        }],
      },
      {
        headers: {
          'Authorization': `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.API_URL || 'http://localhost:5000',
        },
        timeout: 30000,
      }
    );

    const raw = response.data.choices[0].message.content;
    const extracted = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    fs.unlink(req.file.path, () => {});
    res.json({ success: true, answers: extracted });
  } catch (err) {
    console.error('extractImage error:', err.message);
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    res.status(500).json({ success: false, message: err.message });
  }
};

async function extractViaWebhook(req, res, startQ, nbQ) {
  try {
    const webhookExtractUrl = process.env.N8N_EXTRACT_WEBHOOK_URL;
    if (!webhookExtractUrl) throw new Error('N8N_EXTRACT_WEBHOOK_URL non configuré');

    const formData = new FormData();
    formData.append('image', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append('startQ', String(startQ));
    formData.append('nbQuestions', String(nbQ));

    const response = await axios.post(webhookExtractUrl, formData, {
      headers: formData.getHeaders(),
      timeout: 60000,
    });

    fs.unlink(req.file.path, () => {});
    res.json({ success: true, answers: response.data.answers || response.data });
  } catch (err) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    res.status(500).json({ success: false, message: err.message });
  }
}

/* ──────────────────────────────────────────
   POST /api/answers/:id/trigger
────────────────────────────────────────── */
exports.triggerN8n = async (req, res) => {
  try {
    const answerId = req.params.id;
    const answer = await Answer.findById(answerId)
      .populate('epreuve')
      .populate('concours')
      .populate('student');

    if (!answer) return res.status(404).json({ success: false, message: 'Réponse non trouvée' });

    const subject = answer.epreuve?.subject || 'mathematiques';
    const nbQ = answer.epreuve?.nbQuestionsParBloc || 20;
    const matiereOrder = answer.epreuve?.order ?? 0;
    const startQ = matiereOrder * nbQ + 1;
    const endQ = (matiereOrder + 1) * nbQ;

    const subjectCollectionMap = {
      mathematiques: 'qcm_math_enrichi',
      physique: 'qcm_physique_enrichi',
      chimie: 'qcm_chimie_enrichi',
      svt: 'qcm_svt_enrichi',
    };

    const collectionName = subjectCollectionMap[subject] || 'qcm_math_enrichi';

    let questions = [];
    try {
      questions = await mongoose.connection.db.collection(collectionName)
        .find({ epreuve_id: answer.epreuve._id.toString() })
        .sort({ num_question: 1 })
        .toArray();
      console.log(`✅ ${questions.length} questions d'enrichissement trouvées (${nbQ} par bloc)`);
    } catch (e) {
      console.error('Erreur DB Enrichissement:', e.message);
    }

    const payload = {
      answerId: answer._id.toString(),
      prenom: answer.prenom,
      nom: answer.nom,
      email: answer.student?.email,
      concours: answer.concours?.title,
      epreuve_matiere: subject,
      epreuve_id: answer.epreuve._id.toString(),
      nb_questions: nbQ,
      nb_questions_par_bloc: nbQ,
      start_question: startQ,
      end_question: endQ,
      ...answer.answers,
      questions_db: questions,
      callbackUrl: `${process.env.API_URL}/api/answers/webhook/n8n-callback`,
    };

    answer.status = 'processing';
    await answer.save();

    const agent = new https.Agent({ rejectUnauthorized: false });
    axios.post(process.env.N8N_WEBHOOK_URL, payload, { httpsAgent: agent })
      .catch(err => console.error('Erreur envoi n8n:', err.message));

    res.json({ success: true, message: '🚀 Analyse lancée !' });
  } catch (err) {
    console.error('triggerN8n error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ──────────────────────────────────────────
   POST /api/answers/webhook/n8n-callback
────────────────────────────────────────── */
exports.n8nCallback = async (req, res) => {
  try {
    console.log('📩 n8n callback reçu:', JSON.stringify(req.body, null, 2));

    const { answerId, status, result, feedback, score, mention } = req.body;

    if (!answerId) {
      return res.status(400).json({ success: false, message: 'answerId manquant' });
    }

    const answer = await Answer.findById(answerId);
    if (!answer) return res.status(404).json({ success: false, message: 'Réponse non trouvée' });

    if (status === 'completed') {
      let feedbackData = feedback || result;
      let scoreValue = score;
      let mentionValue = mention;

      if (typeof feedbackData === 'string') {
        try {
          feedbackData = JSON.parse(feedbackData);
        } catch (_) {}
      }

      if (feedbackData && typeof feedbackData === 'object') {
        if (!scoreValue && feedbackData.meta?.score) {
          const scoreStr = feedbackData.meta.score;
          scoreValue = parseInt(scoreStr.split('/')[0]) || 0;
        }
        if (!mentionValue && feedbackData.meta?.mention) {
          mentionValue = feedbackData.meta.mention;
        }
      }

      answer.status = 'completed';
      answer.result = {
        feedback: feedbackData,
        score: scoreValue,
        mention: mentionValue,
        nb_questions: feedbackData?.questions?.length || answer.epreuve?.nbQuestionsParBloc || 20,
        generatedAt: new Date(),
      };
      answer.workflow_completed_at = new Date();
      console.log(`✅ Feedback enregistré pour answer ${answerId}, score: ${scoreValue}`);
    } else if (status === 'failed') {
      answer.status = 'failed';
      answer.result = { error: result || 'Erreur inconnue du workflow' };
    }

    await answer.save();
    res.json({ success: true, message: 'Callback traité' });
  } catch (err) {
    console.error('n8n callback error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitPdfAnswers = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { concoursId, epreuveId, nom, prenom, code_candidat } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF requis' });
    }

    if (!concoursId || !epreuveId) {
      return res.status(400).json({
        success: false,
        message: 'Concours et épreuve requis',
      });
    }

    if (!process.env.N8N_EXTRACT_WEBHOOK_URL) {
      return res.status(500).json({
        success: false,
        message: 'N8N_EXTRACT_WEBHOOK_URL non configuré dans .env',
      });
    }

    if (!process.env.API_URL) {
      return res.status(500).json({
        success: false,
        message: 'API_URL non configuré dans .env',
      });
    }

    const concours = await Concours.findById(concoursId);
    const epreuve = await Epreuve.findById(epreuveId);

    if (!concours || !epreuve) {
      return res.status(404).json({
        success: false,
        message: 'Concours ou épreuve introuvable',
      });
    }

    const answer = await Answer.create({
      student: studentId,
      concours: concoursId,
      epreuve: epreuveId,
      nom: nom || '',
      prenom: prenom || '',
      code_candidat: code_candidat || `CAND${Date.now()}`,
      answers: {},
      source: 'pdf',
      status: 'extracting',
      uploadedPdf: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
      workflow_triggered_at: new Date(),
    });

    const form = new FormData();

    form.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    form.append('answerId', answer._id.toString());
    form.append('studentId', studentId);
    form.append('concoursId', concoursId);
    form.append('epreuveId', epreuveId);
    form.append('subject', epreuve.subject);
    form.append('nbQuestions', String(epreuve.nbQuestionsParBloc || 20));
    form.append(
      'callbackUrl',
      `${process.env.API_URL}/api/answers/webhook/extract-callback`
    );

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    await axios.post(process.env.N8N_EXTRACT_WEBHOOK_URL, form, {
      headers: form.getHeaders(),
      timeout: 60000,
      httpsAgent,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    fs.unlink(req.file.path, () => {});

    res.status(201).json({
      success: true,
      message: 'PDF envoyé vers n8n pour extraction',
      data: answer,
    });

  } catch (err) {
    console.error('submitPdfAnswers error:', err);

    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({
      success: false,
      message: err.message,
      code: err.code || null,
    });
  }
};
exports.n8nExtractCallback = async (req, res) => {
  try {
    const {
      answerId,
      answers,
      nom,
      prenom,
      code_candidat,
      date_de_naissance,
      status,
      error,
    } = req.body;

    if (!answerId) {
      return res.status(400).json({ success: false, message: 'answerId manquant' });
    }

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Réponse non trouvée' });
    }

    if (status === 'failed') {
      answer.status = 'failed';
      answer.error = error || 'Extraction échouée';
      await answer.save();
      return res.json({ success: true, message: 'Erreur enregistrée' });
    }

    const cleaned = {};
    Object.entries(answers || {}).forEach(([key, value]) => {
      if (/^Q\d+$/.test(key)) {
        cleaned[key] = value === 'unknown' || value === 'multiple' ? '' : value;
      }
    });

    answer.answers = cleaned;
    if (nom) answer.nom = nom;
    if (prenom) answer.prenom = prenom;
    if (code_candidat) answer.code_candidat = code_candidat;

    answer.result = {
      ...(answer.result || {}),
      date_de_naissance: date_de_naissance || '',
      extraction: req.body,
    };

    answer.status = 'saved';
    await answer.save();

    res.json({
      success: true,
      message: 'Réponses extraites et sauvegardées',
      data: answer,
    });

  } catch (err) {
    console.error('n8nExtractCallback error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};