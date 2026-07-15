import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import AnswerSheet from '../components/AnswerSheet';
import {
  BookOpen,
  Download,
  Upload,
  Eye,
  Calendar,
  FileText,
  CheckCircle,
  X,
  Award,
  PenLine,
  AlertCircle,
  Library,
  Send
} from 'lucide-react';
import { getSubjectMeta } from '../utils/subjectMeta';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Exams() {
  const [concoursList, setConcoursList] = useState([]);
  const [selectedEpreuve, setSelected] = useState(null);
  const [selectedConcours, setSelConcours] = useState(null);
  const [submitModal, setSubmitModal] = useState(null);
  const [previewModal, setPreviewModal] = useState(null);
  const [file, setFile] = useState(null);
  const [selectedPdfEpreuve, setSelectedPdfEpreuve] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConcours();

    return () => {
      if (previewModal?.url) {
        window.URL.revokeObjectURL(previewModal.url);
      }
    };
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const closePreview = () => {
    if (previewModal?.url) {
      window.URL.revokeObjectURL(previewModal.url);
    }
    setPreviewModal(null);
  };

  const fetchConcours = async () => {
    try {
      const res = await axios.get(`${API}/api/concours`);
      const concours = res.data.data || res.data || [];

      const data = concours.map((concour) => {
        const epreuvesSorted = [...(concour.epreuves || [])].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );

        const epreuvesWithRealOrder = epreuvesSorted.map((ep, idx) => ({
          ...ep,
          realOrder: idx,
        }));

        return { ...concour, epreuves: epreuvesWithRealOrder };
      });

      setConcoursList(data);
    } catch (err) {
      console.error('Erreur chargement concours:', err);
      showToast('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRange = (realOrder, nbQ) => {
    const start = realOrder * nbQ + 1;
    const end = (realOrder + 1) * nbQ;
    return `Q${start}-Q${end}`;
  };

  const downloadExamFile = async (epreuveId) => {
    try {
      const res = await axios.get(`${API}/api/concours/${epreuveId}/exam-file`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute('download', 'epreuve.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur telechargement exam:', err);
      showToast('Erreur lors du telechargement', 'error');
    }
  };

  const previewExamFile = async (epreuve) => {
    try {
      if (previewModal?.url) {
        window.URL.revokeObjectURL(previewModal.url);
      }

      const res = await axios.get(`${API}/api/concours/${epreuve._id}/exam-file`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], {
        type: res.data.type || 'application/pdf',
      });

      const url = window.URL.createObjectURL(blob);
      const meta = getSubjectMeta(epreuve.subject);

      setPreviewModal({
        title: epreuve.title || meta.label || 'Epreuve',
        url,
        epreuveId: epreuve._id,
      });
    } catch (err) {
      console.error('Erreur preview exam:', err);
      showToast("Impossible d'afficher l'apercu", 'error');
    }
  };

  const downloadAnswerGrid = async (concoursId) => {
    try {
      const res = await axios.get(`${API}/api/concours/${concoursId}/answer-grid`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute('download', 'grille-reponses.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur telechargement grille:', err);
      showToast('Erreur lors du telechargement', 'error');
    }
  };

  const openSubmitModal = (concour) => {
    setSubmitModal(concour);
    setFile(null);
    setSelectedPdfEpreuve(concour.epreuves?.[0]?._id || '');
  };

  const handleSubmitFull = async (e) => {
    e.preventDefault();

    if (!file) {
      showToast('Veuillez selectionner un fichier PDF', 'error');
      return;
    }

    if (!selectedPdfEpreuve) {
      showToast('Veuillez choisir la matiere du PDF', 'error');
      return;
    }

    setSubmitting(true);

    const fd = new FormData();
    fd.append('pdf', file);
    fd.append('concoursId', submitModal._id);
    fd.append('epreuveId', selectedPdfEpreuve);

    try {
      await axios.post(`${API}/api/answers/submit-pdf`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      showToast('PDF envoye. Extraction en cours.');
      setSubmitModal(null);
      setFile(null);
      setSelectedPdfEpreuve('');
    } catch (err) {
      console.error('Erreur soumission PDF:', err);
      showToast(err.response?.data?.message || 'Erreur lors de la soumission PDF', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openSheet = (epreuve, concours) => {
    setSelected(epreuve);
    setSelConcours(concours);
  };

  const byYear = concoursList.reduce((acc, concours) => {
    if (!acc[concours.year]) acc[concours.year] = [];
    acc[concours.year].push(concours);
    return acc;
  }, {});

  if (loading) {
    return (
      <Layout>
        <div className="page-loading">
          <span className="spinner spinner-lg" />
          <span>Chargement des concours...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1>
          <BookOpen className="icon" size={22} />
          Bibliotheque des concours
        </h1>
        <p>
          Accedez aux annales, entrainez-vous par matiere et recevez des feedbacks personnalises par IA.
        </p>
      </div>

      {Object.keys(byYear).length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Library size={28} />
            </div>
            <h3>Aucun concours disponible</h3>
            <p>Les concours seront ajoutes prochainement.</p>
          </div>
        </div>
      ) : (
        Object.entries(byYear)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([year, concours]) => (
            <section key={year} className="mb-7">
              <div className="mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-aqua-600" />
                <h2 className="text-lg font-extrabold text-ink">Annee {year}</h2>
                <span className="badge badge-info">{concours.length} concours</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {concours.map((concour) => {
                  const epreuves = concour.epreuves || [];

                  return (
                    <div key={concour._id} className="concours-card flex h-full flex-col">
                      <div className="card-header">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-extrabold text-ink">
                            {concour.title}
                          </h3>
                          <div className="text-xs font-bold text-slate-400">
                            {epreuves.length} matiere{epreuves.length > 1 ? 's' : ''}
                          </div>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                          <Award size={17} />
                        </div>
                      </div>

                      <div className="card-body flex-1">
                        {epreuves.length === 0 ? (
                          <p className="py-4 text-center text-sm font-medium text-slate-400">
                            Aucune matiere
                          </p>
                        ) : (
                          epreuves.map((epreuve) => {
                            const meta = getSubjectMeta(epreuve.subject);
                            const SubjectIcon = meta.Icon;

                            return (
                              <div key={epreuve._id} className="subject-row">
                                <div className="subject-info">
                                  <div className="subject-icon" style={{ background: meta.bg }}>
                                    <SubjectIcon size={17} style={{ color: meta.color }} />
                                  </div>

                                  <div className="min-w-0">
                                    <div className="subject-name">{meta.label}</div>
                                    <div className="subject-range">
                                      {getRange(
                                        epreuve.realOrder ?? epreuve.order ?? 0,
                                        epreuve.nbQuestionsParBloc || 20
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="subject-actions">
                                  {epreuve.examFile?.originalName && (
                                    <>
                                      <button
                                        className="btn btn-ghost btn-sm px-2"
                                        onClick={() => previewExamFile(epreuve)}
                                        title="Voir l'epreuve"
                                        type="button"
                                      >
                                        <Eye size={13} />
                                      </button>

                                      <button
                                        className="btn btn-ghost btn-sm px-2"
                                        onClick={() => downloadExamFile(epreuve._id)}
                                        title="Telecharger"
                                        type="button"
                                      >
                                        <Download size={13} />
                                      </button>
                                    </>
                                  )}

                                  <button
                                    className="btn btn-primary btn-sm px-2"
                                    onClick={() => openSheet(epreuve, concour)}
                                    title="Repondre"
                                    type="button"
                                  >
                                    <PenLine size={13} />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="card-footer flex flex-col gap-2">
                        {concour.answerGridFile?.originalName && (
                          <button
                            onClick={() => downloadAnswerGrid(concour._id)}
                            className="btn btn-ghost btn-sm"
                            type="button"
                          >
                            <Eye size={13} />
                            Voir la grille
                          </button>
                        )}

                        <button
                          className="btn btn-primary btn-full"
                          onClick={() => openSubmitModal(concour)}
                          disabled={epreuves.length === 0}
                          type="button"
                        >
                          <Upload size={14} />
                          Soumettre ma copie PDF
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
      )}

      {selectedEpreuve && selectedConcours && (
        <AnswerSheet
          epreuve={selectedEpreuve}
          concours={selectedConcours}
          onClose={() => {
            setSelected(null);
            setSelConcours(null);
          }}
          onSuccess={() => showToast('Operation reussie')}
        />
      )}

      {submitModal && (
        <div className="modal-overlay" onClick={() => setSubmitModal(null)}>
          <div className="modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="flex items-center gap-2">
                <Send size={17} className="text-aqua-600" />
                Soumettre ma copie PDF
              </h3>

              <button className="btn-icon" onClick={() => setSubmitModal(null)} type="button">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitFull}>
              <div className="modal-body">
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  <FileText size={17} />
                  <span>
                    Soumettez votre grille PDF pour : <strong>{submitModal.title}</strong>
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Matiere du PDF</label>
                  <select
                    className="form-input"
                    value={selectedPdfEpreuve}
                    onChange={(e) => setSelectedPdfEpreuve(e.target.value)}
                    required
                  >
                    <option value="">Choisir une matiere</option>
                    {submitModal.epreuves?.map((ep) => {
                      const meta = getSubjectMeta(ep.subject);
                      return (
                        <option key={ep._id} value={ep._id}>
                          {meta.label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <label className={`file-drop ${file ? 'has-file' : ''}`} htmlFor="full-copy-input">
                  <input
                    id="full-copy-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                  />

                  {file ? (
                    <>
                      <CheckCircle className="file-drop-icon text-emerald-600" size={22} />
                      <div className="file-drop-text text-emerald-700">{file.name}</div>
                      <div className="file-drop-hint">Cliquez pour changer</div>
                    </>
                  ) : (
                    <>
                      <Upload className="file-drop-icon" size={22} />
                      <div className="file-drop-text">Cliquez pour selectionner votre PDF</div>
                      <div className="file-drop-hint">PDF uniquement · max 10 Mo</div>
                    </>
                  )}
                </label>

                <p className="mt-3 text-xs font-medium leading-6 text-slate-400">
                  Le PDF sera envoye vers n8n pour extraire les reponses automatiquement.
                </p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setSubmitModal(null)}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !file || !selectedPdfEpreuve}
                >
                  {submitting ? (
                    <>
                      <span className="spinner" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Envoyer le PDF
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewModal && (
        <div className="modal-overlay" onClick={closePreview}>
          <div
            className="modal modal-lg animate-slide-up"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="flex items-center gap-2">
                <Eye size={17} className="text-aqua-600" />
                Apercu de l'epreuve
              </h3>

              <button className="btn-icon" onClick={closePreview} type="button">
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-extrabold text-ink">
                    {previewModal.title}
                  </div>
                  <div className="text-xs font-medium text-slate-400">
                    Apercu PDF avant telechargement
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => downloadExamFile(previewModal.epreuveId)}
                  type="button"
                >
                  <Download size={14} />
                  Telecharger
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-line bg-slate-50">
                <iframe
                  src={previewModal.url}
                  title="Apercu epreuve"
                  className="h-[70vh] w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle size={17} />}
          {toast.msg}
        </div>
      )}
    </Layout>
  );
}