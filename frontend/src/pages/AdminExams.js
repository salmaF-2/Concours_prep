import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import {
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Folder,
  FolderPlus,
  HelpCircle,
  Plus,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { SUBJECT_META, getSubjectMeta } from '../utils/subjectMeta';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SUBJECTS = [
  { value: 'svt', label: 'SVT' },
  { value: 'physique', label: 'Physique' },
  { value: 'chimie', label: 'Chimie' },
  { value: 'mathematiques', label: 'Maths' },
];

const FileDropZone = ({ id, label, file, onChange }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <label htmlFor={id} className={`file-drop ${file ? 'has-file' : ''}`}>
      <input id={id} type="file" accept=".pdf" onChange={onChange} />

      {file ? (
        <>
          <CheckCircle className="file-drop-icon text-emerald-600" size={22} />
          <div className="file-drop-text text-emerald-700">{file.name}</div>
          <div className="file-drop-hint">Cliquez pour changer</div>
        </>
      ) : (
        <>
          <Upload className="file-drop-icon" size={22} />
          <div className="file-drop-text">Cliquez pour selectionner</div>
          <div className="file-drop-hint">PDF uniquement</div>
        </>
      )}
    </label>
  </div>
);

export default function AdminExams() {
  const [list, setList] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [addToId, setAddToId] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [newForm, setNewForm] = useState({ title: '', year: '', description: '' });
  const [gridFile, setGridFile] = useState(null);

  const [epForm, setEpForm] = useState({
    subject: 'svt',
    title: '',
    order: 0,
    nbQuestionsParBloc: 20,
  });
  const [examFile, setExamFile] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      const res = await axios.get(`${API}/api/concours`);
      setList(res.data.data || res.data || []);
    } catch (_) {
      showToast('Erreur de chargement', 'error');
    } finally {
      setFetching(false);
    }
  };

  const createConcours = async (event) => {
    event.preventDefault();

    if (!gridFile) {
      showToast('La grille est obligatoire', 'error');
      return;
    }

    setLoading(true);

    const fd = new FormData();
    Object.entries(newForm).forEach(([key, value]) => fd.append(key, value));
    fd.append('answerGridFile', gridFile);

    try {
      await axios.post(`${API}/api/concours`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast('Concours cree');
      setShowNew(false);
      setNewForm({ title: '', year: '', description: '' });
      setGridFile(null);
      fetchAll();
    } catch (_) {
      showToast('Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addEpreuve = async () => {
    if (!examFile) {
      showToast('Le fichier est obligatoire', 'error');
      return;
    }

    setLoading(true);

    const fd = new FormData();
    fd.append('concoursId', addToId);
    Object.entries(epForm).forEach(([key, value]) => fd.append(key, value));
    fd.append('examFile', examFile);

    try {
      await axios.post(`${API}/api/concours/epreuve`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast('Matiere ajoutee');
      setAddToId(null);
      setEpForm({ subject: 'svt', title: '', order: 0, nbQuestionsParBloc: 20 });
      setExamFile(null);
      fetchAll();
    } catch (_) {
      showToast('Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteConcours = async (id) => {
    if (!window.confirm('Supprimer ce concours ?')) return;

    try {
      await axios.delete(`${API}/api/concours/${id}`);
      showToast('Supprime');
      fetchAll();
    } catch (_) {
      showToast('Erreur', 'error');
    }
  };

  const deleteEpreuve = async (id) => {
    if (!window.confirm('Supprimer cette epreuve ?')) return;

    try {
      await axios.delete(`${API}/api/concours/epreuve/${id}`);
      showToast('Epreuve supprimee');
      fetchAll();
    } catch (_) {
      showToast('Erreur', 'error');
    }
  };

  const downloadFile = async (id, type) => {
    try {
      const endpoint =
        type === 'exam'
          ? `${API}/api/concours/${id}/exam-file`
          : `${API}/api/concours/${id}/answer-grid`;

      const res = await axios.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute('download', type === 'exam' ? 'epreuve.pdf' : 'grille.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (_) {
      showToast('Erreur telechargement', 'error');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>
          <Folder className="icon" size={22} />
          Gestion des concours
        </h1>
        <p>Organisez les concours par annee et ajoutez les matieres.</p>
      </div>

      <div className="mb-4 flex justify-end">
        <button className="btn btn-primary" onClick={() => setShowNew(true)} type="button">
          <FolderPlus size={16} />
          Nouveau concours
        </button>
      </div>

      {fetching ? (
        <div className="page-loading">
          <span className="spinner spinner-lg" />
        </div>
      ) : list.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Folder size={28} />
            </div>
            <h3>Aucun concours</h3>
            <p>Cliquez sur Nouveau concours pour commencer.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {list.map((concours) => (
            <div key={concours._id} className="card">
              <div className="card-header">
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-ink">{concours.title}</div>
                  <div className="text-xs font-bold text-slate-400">{concours.year}</div>
                </div>

                <div className="flex items-center gap-1">
                  {concours.answerGridFile?.originalName && (
                    <button
                      className="btn btn-ghost btn-sm px-2"
                      onClick={() => downloadFile(concours._id, 'grid')}
                      type="button"
                      title="Telecharger grille"
                    >
                      <FileText size={13} />
                    </button>
                  )}

                  <button
                    className="btn btn-ghost btn-sm px-2"
                    onClick={() => setAddToId(concours._id)}
                    type="button"
                    title="Ajouter matiere"
                  >
                    <Plus size={13} />
                  </button>

                  <button
                    className="btn btn-danger btn-sm px-2"
                    onClick={() => deleteConcours(concours._id)}
                    type="button"
                    title="Supprimer concours"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="card-body">
                {!concours.epreuves || concours.epreuves.length === 0 ? (
                  <p className="py-4 text-center text-sm font-medium text-slate-400">
                    Aucune matiere
                  </p>
                ) : (
                  <div className="space-y-2">
                    {concours.epreuves.map((epreuve) => {
                      const meta = getSubjectMeta(epreuve.subject);
                      const SubjectIcon = meta.Icon;

                      return (
                        <div
                          key={epreuve._id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-line bg-slate-50/80 px-3 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                              style={{ background: meta.bg }}
                            >
                              <SubjectIcon size={17} style={{ color: meta.color }} />
                            </div>

                            <div className="min-w-0">
                              <div className="truncate text-sm font-extrabold capitalize text-ink">
                                {meta.label || epreuve.subject}
                              </div>
                              <div className="text-xs font-bold text-slate-400">
                                {epreuve.nbQuestionsParBloc || 20} questions
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 gap-1">
                            {epreuve.examFile?.originalName && (
                              <button
                                className="btn btn-ghost btn-sm px-2"
                                onClick={() => downloadFile(epreuve._id, 'exam')}
                                type="button"
                                title="Voir fichier"
                              >
                                <Eye size={12} />
                              </button>
                            )}

                            <button
                              className="btn btn-danger btn-sm px-2"
                              onClick={() => deleteEpreuve(epreuve._id)}
                              type="button"
                              title="Supprimer epreuve"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal animate-slide-up" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3 className="flex items-center gap-2">
                <FolderPlus size={17} className="text-aqua-600" />
                Nouveau concours
              </h3>
              <button className="btn-icon" onClick={() => setShowNew(false)} type="button">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={createConcours}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Titre *</label>
                  <input
                    className="form-input"
                    placeholder="Concours Medecine 2022-2023"
                    value={newForm.title}
                    onChange={(event) =>
                      setNewForm({ ...newForm, title: event.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Annee *</label>
                  <input
                    className="form-input"
                    placeholder="2022-2023"
                    value={newForm.year}
                    onChange={(event) =>
                      setNewForm({ ...newForm, year: event.target.value })
                    }
                    required
                  />
                </div>

                <FileDropZone
                  id="grid-file"
                  label="Grille de correction (PDF) *"
                  file={gridFile}
                  onChange={(event) => setGridFile(event.target.files[0])}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowNew(false)}
                >
                  Annuler
                </button>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creation...' : 'Creer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addToId && (
        <div className="modal-overlay" onClick={() => setAddToId(null)}>
          <div className="modal animate-slide-up" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3 className="flex items-center gap-2">
                <Plus size={17} className="text-aqua-600" />
                Ajouter une matiere
              </h3>
              <button className="btn-icon" onClick={() => setAddToId(null)} type="button">
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Matiere</label>
                <select
                  className="form-select"
                  value={epForm.subject}
                  onChange={(event) =>
                    setEpForm({ ...epForm, subject: event.target.value })
                  }
                >
                  {SUBJECTS.map((subject) => {
                    const meta = SUBJECT_META[subject.value];
                    return (
                      <option key={subject.value} value={subject.value}>
                        {meta?.label || subject.label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Ordre</label>
                <input
                  type="number"
                  className="form-input"
                  value={epForm.order}
                  onChange={(event) =>
                    setEpForm({
                      ...epForm,
                      order: parseInt(event.target.value, 10) || 0,
                    })
                  }
                />
              </div>

              <div className="form-group rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <label className="form-label flex items-center gap-2 text-amber-700">
                  <HelpCircle size={15} />
                  Questions par bloc
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={epForm.nbQuestionsParBloc}
                  onChange={(event) =>
                    setEpForm({
                      ...epForm,
                      nbQuestionsParBloc: parseInt(event.target.value, 10) || 20,
                    })
                  }
                />
              </div>

              <FileDropZone
                id="exam-file"
                label="Fichier epreuve (PDF) *"
                file={examFile}
                onChange={(event) => setExamFile(event.target.files[0])}
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setAddToId(null)} type="button">
                Annuler
              </button>

              <button className="btn btn-primary" onClick={addEpreuve} disabled={loading} type="button">
                {loading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </Layout>
  );
}