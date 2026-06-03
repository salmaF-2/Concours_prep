import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { FaPlus, FaUpload, FaTrash, FaEdit } from 'react-icons/fa';

const SUBJECTS = [
  { value: 'math', label: 'Mathématiques' },
  { value: 'physique', label: 'Physique' },
  { value: 'chimie', label: 'Chimie' },
  { value: 'svt', label: 'SVT' }
];

const AdminExams = () => {
  const [form, setForm] = useState({ concours: '', title: '', subject: 'math', year: '', description: '' });
  const [examFile, setExamFile] = useState(null);
  const [gridFile, setGridFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchExams();
  }, [refresh]);

  const fetchExams = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/exams`);
      setExams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!examFile || !gridFile) {
      setMsg('❌ Veuillez sélectionner le fichier d\'épreuve et la grille de réponse.');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('concours', form.concours);
    data.append('title', form.title);
    data.append('subject', form.subject);
    data.append('year', form.year);
    data.append('description', form.description);
    data.append('examFile', examFile);
    data.append('answerGridFile', gridFile);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/exams`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg('✅ Épreuve ajoutée avec succès');
      setForm({ concours: '', title: '', subject: 'math', year: '', description: '' });
      setExamFile(null);
      setGridFile(null);
      setRefresh(!refresh);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  const deleteExam = async (id) => {
    if (!window.confirm('Confirmer la suppression de cette épreuve ?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/exams/${id}`);
      setMsg('✅ Épreuve supprimée');
      setRefresh(!refresh);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Impossible de supprimer');
    }
  };

  return (
    <Layout>
      <div className="space-y-10">
        <div>
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <FaPlus className="text-blue-600" />
              Gestion des épreuves
            </h1>
            <p className="text-gray-600 mt-2">Ajoutez, affichez et supprimez les épreuves par concours, année et matière.</p>
          </div>

          {msg && (
            <div className={`mb-6 p-4 rounded-lg font-semibold ${msg.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {msg}
            </div>
          )}

          <div className="section-panel">
            <h2 className="text-2xl font-semibold mb-4">Ajouter une nouvelle matière</h2>
            <form onSubmit={submit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-1">
                <div>
                  <label className="label">Concours</label>
                  <input
                    type="text"
                    value={form.concours}
                    onChange={(e) => setForm({ ...form, concours: e.target.value })}
                    placeholder="Ex: Concours médecine - Session 2026"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Année</label>
                  <input
                    type="text"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="2026"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 md:grid-cols-1">
                <div>
                  <label className="label">Matière</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input-field"
                    required
                  >
                    {SUBJECTS.map((subject) => (
                      <option key={subject.value} value={subject.value}>{subject.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Titre de l'épreuve</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: Mathématiques concours"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Notes sur l'épreuve ou l'université"
                  rows="3"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-6 md:grid-cols-1">
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
                  <label className="label flex items-center gap-2">
                    <FaUpload className="text-blue-600" />
                    Fichier de l'épreuve (PDF)
                  </label>
                  <input type="file" accept=".pdf" onChange={(e) => setExamFile(e.target.files[0])} className="w-full" required />
                  {examFile && <p className="text-sm text-green-600 font-semibold mt-2">✅ {examFile.name}</p>}
                </div>
                <div className="border-2 border-dashed border-green-300 rounded-lg p-6 bg-green-50">
                  <label className="label flex items-center gap-2">
                    <FaUpload className="text-green-600" />
                    Grille de réponse commune (PDF)
                  </label>
                  <input type="file" accept=".pdf" onChange={(e) => setGridFile(e.target.files[0])} className="w-full" required />
                  {gridFile && <p className="text-sm text-green-600 font-semibold mt-2">✅ {gridFile.name}</p>}
                </div>
              </div>

              <button type="submit" disabled={loading} className="button-gradient w-full justify-center">
                <FaPlus />
                {loading ? 'Chargement...' : 'Ajouter la matière'}
              </button>
            </form>
          </div>
        </div>

        <div className="section-panel">
          <div className="section-header">
            <div>
              <h2 className="section-title">Épreuves enregistrées</h2>
              <p className="text-gray-600 mt-2">Supprimez les matières incorrectes ou obsolètes.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-600">Concours</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-600">Année</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-600">Matière</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-600">Fichier</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">{exam.concours}</td>
                    <td className="px-5 py-4">{exam.year}</td>
                    <td className="px-5 py-4 capitalize">{exam.subject}</td>
                    <td className="px-5 py-4">
                      <a href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${exam.examFile.path}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">
                        Télécharger
                      </a>
                    </td>
                    <td className="px-5 py-4 flex gap-3">
                      <button type="button" onClick={() => deleteExam(exam._id)} className="btn btn-danger px-4 py-2 flex items-center gap-2">
                        <FaTrash /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminExams;
