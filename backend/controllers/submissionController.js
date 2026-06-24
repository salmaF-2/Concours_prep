const path = require('path');
const axios = require('axios');
const Submission = require('../models/Submission');
const Concours = require('../models/Concours');

exports.submitExam = async (req, res) => {
  try {
    const { concoursId } = req.body;
    const concours = await Concours.findById(concoursId);
    if (!concours) return res.status(404).json({ message: 'Concours non trouvé' });

    const submission = new Submission({
      student: req.user.id,
      concours: concoursId,
      studentFile: { filename: req.file.filename, path: req.file.path, originalName: req.file.originalname },
      status: 'pending',
    });
    await submission.save();

    try {
      const webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/process-exam';
      await axios.post(webhookUrl, {
        submissionId: submission._id.toString(),
        studentId: req.user.id,
        studentEmail: req.user.email,
        concoursId: concours._id.toString(),
        concoursTitle: concours.title,
        studentFileUrl: `${process.env.API_URL || 'http://localhost:5000'}/${submission.studentFile.path}`,
        answerGridUrl: `${process.env.API_URL || 'http://localhost:5000'}/${concours.answerGridFile.path}`,
        callbackUrl: `${process.env.API_URL || 'http://localhost:5000'}/api/submissions/webhook/n8n-callback`,
      });
      submission.status = 'processing';
      await submission.save();
    } catch (n8nError) {
      console.error('Erreur n8n:', n8nError.message);
      submission.status = 'failed';
      await submission.save();
    }

    res.status(201).json({ submission, message: 'Votre copie a été soumise avec succès. La correction sera disponible prochainement.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.n8nCallback = async (req, res) => {
  try {
    const { submissionId, feedbackFileUrl, status, error } = req.body;
    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: 'Soumission non trouvée' });

    if (status === 'completed' && feedbackFileUrl) {
      submission.feedbackFile = {
        filename: path.basename(feedbackFileUrl),
        path: feedbackFileUrl.replace('http://localhost:5000/', ''),
        originalName: `feedback_${submission._id}.pdf`,
      };
      submission.status = 'completed';
      submission.processedAt = new Date();
    } else if (status === 'failed') {
      submission.status = 'failed';
      submission.error = error;
    }

    await submission.save();
    res.json({ message: 'Callback traité avec succès' });
  } catch (err) {
    console.error('Erreur callback:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user.id }).populate('concours').sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('concours').populate('student', 'name email');
    if (!submission) return res.status(404).json({ message: 'Soumission non trouvée' });
    if (submission.student._id.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Accès non autorisé' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
