import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { FaDownload, FaFileAlt, FaCalendarAlt, FaSchool, FaTimes } from 'react-icons/fa';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/exams`);
      setExams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Organiser les épreuves par année, puis par université
  const examsByYearAndUniversity = exams.reduce((acc, exam) => {
    const year = exam.year || 'Autres';
    const university = exam.subject || 'Médecine';

    if (!acc[year]) acc[year] = {};
    if (!acc[year][university]) acc[year][university] = [];
    acc[year][university].push(exam);
    return acc;
  }, {});

  const submit = async (e) => {
    e.preventDefault();
    if (!selected || !file) return;

    setLoading(true);
    const data = new FormData();
    data.append('studentFile', file);
    data.append('examId', selected._id);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg('✅ Copie soumise avec succès');
      setFile(null);
      setSelected(null);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">📚 Épreuves disponibles</h1>
          <p className="text-gray-600 mt-2">Sélectionnez les épreuves pour accéder aux fichiers et soumettre votre copie</p>
        </div>

        {msg && (
          <div className={`mb-6 p-4 rounded-lg ${msg.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {msg}
          </div>
        )}

        {/* Parcourir par année */}
        {Object.entries(examsByYearAndUniversity).map(([year, universities]) => (
          <div key={year} className="mb-12">
            {/* Titre année */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
              <FaCalendarAlt className="text-2xl text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">{year}</h2>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                {Object.values(universities).flat().length} épreuve(s)
              </span>
            </div>

            {/* Grille d'épreuves par université */}
            <div className="grid grid-cols-2 gap-6 md:grid-cols-1">
              {Object.entries(universities).map(([university, universityExams]) => (
                <div key={university} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                  {/* Header université */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center gap-3">
                    <FaSchool className="text-2xl" />
                    <div>
                      <h3 className="font-bold text-lg">{university}</h3>
                      <p className="text-blue-100 text-sm">{universityExams.length} matière(s)</p>
                    </div>
                  </div>

                  {/* Épreuves */}
                  <div className="p-4 space-y-3">
                    {universityExams.map((exam) => (
                      <div
                        key={exam._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer hover:border-blue-300"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{exam.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{exam.description}</p>
                          </div>
                          <button
                            onClick={() => setSelected(exam)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold transition"
                          >
                            Soumettre
                          </button>
                        </div>

                        {/* Téléchargements */}
                        <div className="mt-3 flex gap-2">
                          <a
                            href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${exam.examFile.path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-semibold"
                          >
                            <FaDownload /> Épreuve
                          </a>
                          <a
                            href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${exam.answerGridFile.path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-semibold"
                          >
                            <FaDownload /> Grille réponse
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Soumission */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Soumettre votre copie</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Info épreuve */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm font-semibold text-blue-900">{selected.title}</p>
              <p className="text-xs text-blue-700 mt-1">{selected.description}</p>
            </div>

            {/* Formulaire */}
            <form onSubmit={submit}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaFileAlt className="inline mr-2" />
                Votre copie remplie (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full mb-4 p-2 border rounded-lg"
                required
              />

              {file && (
                <p className="text-xs text-gray-600 mb-4">
                  ✅ Fichier sélectionné: <span className="font-semibold">{file.name}</span>
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {loading ? 'Envoi...' : '📤 Envoyer'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Exams;
