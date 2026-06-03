const fs = require('fs');
const Exam = require('../models/Exam');

exports.createExam = async (req, res) => {
  try {
    const { concours, title, description, subject, year } = req.body;
    const exam = new Exam({
      concours,
      title,
      description,
      subject,
      year,
      examFile: req.files['examFile'] ? { filename: req.files['examFile'][0].filename, path: req.files['examFile'][0].path, originalName: req.files['examFile'][0].originalname } : {},
      answerGridFile: req.files['answerGridFile'] ? { filename: req.files['answerGridFile'][0].filename, path: req.files['answerGridFile'][0].path, originalName: req.files['answerGridFile'][0].originalname } : {},
      uploadedBy: req.user.id,
    });

    await exam.save();
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ year: -1, concours: 1, subject: 1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Épreuve non trouvée' });

    const filesToDelete = [];
    if (exam.examFile?.path) filesToDelete.push(exam.examFile.path);
    if (exam.answerGridFile?.path) filesToDelete.push(exam.answerGridFile.path);

    await exam.deleteOne();

    filesToDelete.forEach((filePath) => {
      fs.unlink(filePath, (err) => {
        if (err) console.warn('Impossible de supprimer le fichier:', filePath, err.message);
      });
    });

    res.json({ message: 'Épreuve supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Épreuve non trouvée' });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
