// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Layout from '../components/Layout';
// import {
//   FaFolder, FaFolderPlus, FaPlus, FaTrash, FaUpload,
//   FaFilePdf, FaTimes, FaCheckCircle
// } from 'react-icons/fa';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// const SUBJECTS = [
//   { value:'svt',            label:'Sciences de la Vie (SVT)', emoji:'🧬' },
//   { value:'physique',       label:'Physique',                  emoji:'⚡' },
//   { value:'chimie',         label:'Chimie',                    emoji:'🧪' },
//   { value:'mathematiques',  label:'Mathématiques',             emoji:'📐' },
// ];

// const FileDropZone = ({ id, label, file, onChange, accept = '.pdf' }) => (
//   <div className="form-group">
//     <label className="form-label">{label}</label>
//     <label
//       htmlFor={id}
//       className={`file-drop ${file ? 'has-file' : ''}`}
//       style={{ cursor:'pointer' }}
//     >
//       <input id={id} type="file" accept={accept} onChange={onChange} style={{ display:'none' }} />
//       {file ? (
//         <>
//           <div className="file-drop-icon"><FaCheckCircle /></div>
//           <div className="file-drop-text" style={{ color:'var(--green)', fontWeight:600 }}>{file.name}</div>
//           <div className="file-drop-hint">Cliquez pour changer</div>
//         </>
//       ) : (
//         <>
//           <div className="file-drop-icon"><FaUpload /></div>
//           <div className="file-drop-text">Cliquez pour sélectionner</div>
//           <div className="file-drop-hint">PDF uniquement · max 20 Mo</div>
//         </>
//       )}
//     </label>
//   </div>
// );

// export default function AdminExams() {
//   const [list, setList]               = useState([]);
//   const [showNew, setShowNew]         = useState(false);
//   const [addToId, setAddToId]         = useState(null);
//   const [toast, setToast]             = useState(null);
//   const [loading, setLoading]         = useState(false);
//   const [fetching, setFetching]       = useState(true);

//   // New concours form
//   const [newForm, setNewForm] = useState({ title:'', year:'', description:'' });
//   const [gridFile, setGridFile] = useState(null);

//   // New epreuve form
//   const [epForm, setEpForm]   = useState({ subject:'svt', title:'', order:0 });
//   const [examFile, setExamFile] = useState(null);

//   useEffect(() => { fetchAll(); }, []);

//   const showToast = (msg, type='success') => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3500);
//   };

//   const fetchAll = async () => {
//     try {
//       const res = await axios.get(`${API}/api/concours`);
//       setList(res.data);
//     } catch { showToast('Erreur de chargement', 'error'); }
//     finally { setFetching(false); }
//   };

//   const createConcours = async (e) => {
//     e.preventDefault();
//     if (!gridFile) { showToast('La grille de correction est obligatoire', 'error'); return; }
//     setLoading(true);
//     const fd = new FormData();
//     Object.entries(newForm).forEach(([k,v]) => fd.append(k, v));
//     fd.append('answerGridFile', gridFile);
//     try {
//       await axios.post(`${API}/api/concours`, fd, { headers:{ 'Content-Type':'multipart/form-data' } });
//       showToast('Concours créé avec succès !');
//       setShowNew(false);
//       setNewForm({ title:'', year:'', description:'' });
//       setGridFile(null);
//       fetchAll();
//     } catch { showToast('Erreur lors de la création', 'error'); }
//     finally { setLoading(false); }
//   };

//   const addEpreuve = async () => {
//     if (!examFile) { showToast('Le fichier de l\'épreuve est obligatoire', 'error'); return; }
//     setLoading(true);
//     const fd = new FormData();
//     fd.append('concoursId', addToId);
//     Object.entries(epForm).forEach(([k,v]) => fd.append(k, v));
//     fd.append('examFile', examFile);
//     try {
//       await axios.post(`${API}/api/concours/epreuve`, fd, { headers:{ 'Content-Type':'multipart/form-data' } });
//       showToast('Matière ajoutée avec succès !');
//       setAddToId(null);
//       setEpForm({ subject:'svt', title:'', order:0 });
//       setExamFile(null);
//       fetchAll();
//     } catch { showToast('Erreur lors de l\'ajout', 'error'); }
//     finally { setLoading(false); }
//   };

//   const deleteConcours = async (id) => {
//     if (!window.confirm('Supprimer ce concours et toutes ses épreuves ?')) return;
//     try {
//       await axios.delete(`${API}/api/concours/${id}`);
//       showToast('Concours supprimé');
//       fetchAll();
//     } catch { showToast('Impossible de supprimer', 'error'); }
//   };

//   const deleteEpreuve = async (id) => {
//     if (!window.confirm('Supprimer cette épreuve ?')) return;
//     try {
//       await axios.delete(`${API}/api/concours/epreuve/${id}`);
//       showToast('Épreuve supprimée');
//       fetchAll();
//     } catch { showToast('Impossible de supprimer', 'error'); }
//   };

//   return (
//     <Layout>
//       <div className="page-header">
//         <h1>
//           <span className="icon"><FaFolder /></span>
//           Gestion des concours
//         </h1>
//         <p>Organisez les concours par année et ajoutez les 4 matières avec leur grille de correction.</p>
//       </div>

//       <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:24 }}>
//         <button className="btn btn-primary" onClick={() => setShowNew(true)}>
//           <FaFolderPlus /> Nouveau concours
//         </button>
//       </div>

//       {fetching ? (
//         <div className="page-loading"><span className="spinner spinner-lg" /></div>
//       ) : list.length === 0 ? (
//         <div className="card">
//           <div className="empty-state">
//             <div className="empty-state-icon"><FaFolder /></div>
//             <h3>Aucun concours pour le moment</h3>
//             <p>Cliquez sur "Nouveau concours" pour commencer.</p>
//           </div>
//         </div>
//       ) : (
//         <div>
//           {list.map(concours => (
//             <div key={concours._id} className="admin-concours-panel">
//               {/* Header */}
//               <div className="admin-concours-header">
//                 <div>
//                   <div className="admin-concours-title">{concours.title}</div>
//                   <div className="admin-concours-year">{concours.year}</div>
//                 </div>
//                 <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
//                   {concours.answerGridFile?.path && (
//                     <a
//                       href={`${API}/${concours.answerGridFile.path}`}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="btn btn-ghost btn-sm"
//                     >
//                       <FaFilePdf style={{ color:'var(--green)' }} /> Grille
//                     </a>
//                   )}
//                   <button className="btn btn-ghost btn-sm" onClick={() => setAddToId(concours._id)}>
//                     <FaPlus /> Matière
//                   </button>
//                   <button className="btn btn-danger btn-sm" onClick={() => deleteConcours(concours._id)}>
//                     <FaTrash />
//                   </button>
//                 </div>
//               </div>

//               {/* Epreuves */}
//               <div style={{ padding:'12px 16px' }}>
//                 {(!concours.epreuves || concours.epreuves.length === 0) ? (
//                   <p style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:'12px 0' }}>
//                     Aucune matière — cliquez sur "+ Matière" pour en ajouter.
//                   </p>
//                 ) : (
//                   <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:10 }}>
//                     {concours.epreuves.map(ep => {
//                       const s = SUBJECTS.find(s => s.value === ep.subject);
//                       return (
//                         <div
//                           key={ep._id}
//                           style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)' }}
//                         >
//                           <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//                             <span style={{ fontSize:18 }}>{s?.emoji || '📄'}</span>
//                             <div>
//                               <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', textTransform:'capitalize' }}>{ep.subject}</div>
//                               {ep.examFile?.path && (
//                                 <a href={`${API}/${ep.examFile.path}`} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'var(--accent)' }}>
//                                   Voir PDF
//                                 </a>
//                               )}
//                             </div>
//                           </div>
//                           <button
//                             className="btn btn-danger btn-sm"
//                             style={{ padding:'4px 8px', minWidth:'unset' }}
//                             onClick={() => deleteEpreuve(ep._id)}
//                           >
//                             <FaTrash style={{ fontSize:11 }} />
//                           </button>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Modal: Nouveau concours */}
//       {showNew && (
//         <div className="modal-overlay" onClick={() => setShowNew(false)}>
//           <div className="modal animate-slide-up" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>📁 Nouveau concours</h3>
//               <button className="btn-icon" onClick={() => setShowNew(false)}><FaTimes /></button>
//             </div>
//             <form onSubmit={createConcours}>
//               <div className="modal-body">
//                 <div className="form-group">
//                   <label className="form-label">Titre *</label>
//                   <input className="form-input" placeholder="Ex: Concours Médecine 2022-2023" value={newForm.title} onChange={e => setNewForm({ ...newForm, title:e.target.value })} required />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Année *</label>
//                   <input className="form-input" placeholder="2022-2023" value={newForm.year} onChange={e => setNewForm({ ...newForm, year:e.target.value })} required />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Description</label>
//                   <textarea className="form-textarea" placeholder="Optionnel..." value={newForm.description} onChange={e => setNewForm({ ...newForm, description:e.target.value })} />
//                 </div>
//                 <FileDropZone
//                   id="grid-file"
//                   label="Grille de correction (PDF) *"
//                   file={gridFile}
//                   onChange={e => setGridFile(e.target.files[0])}
//                 />
//               </div>
//               <div className="modal-footer">
//                 <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>Annuler</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>
//                   {loading ? <><span className="spinner" style={{ width:14, height:14, borderWidth:2 }} /> Création...</> : 'Créer'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Modal: Ajouter épreuve */}
//       {addToId && (
//         <div className="modal-overlay" onClick={() => setAddToId(null)}>
//           <div className="modal animate-slide-up" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>➕ Ajouter une matière</h3>
//               <button className="btn-icon" onClick={() => setAddToId(null)}><FaTimes /></button>
//             </div>
//             <div className="modal-body">
//               <div className="form-group">
//                 <label className="form-label">Matière</label>
//                 <select className="form-select" value={epForm.subject} onChange={e => setEpForm({ ...epForm, subject:e.target.value })}>
//                   {SUBJECTS.map(s => (
//                     <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Titre (optionnel)</label>
//                 <input className="form-input" placeholder="Titre personnalisé" value={epForm.title} onChange={e => setEpForm({ ...epForm, title:e.target.value })} />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Ordre d'affichage</label>
//                 <input type="number" min="0" className="form-input" value={epForm.order} onChange={e => setEpForm({ ...epForm, order: parseInt(e.target.value)||0 })} />
//               </div>
//               <FileDropZone
//                 id="exam-file"
//                 label="Fichier épreuve (PDF) *"
//                 file={examFile}
//                 onChange={e => setExamFile(e.target.files[0])}
//               />
//             </div>
//             <div className="modal-footer">
//               <button className="btn btn-ghost" onClick={() => setAddToId(null)}>Annuler</button>
//               <button className="btn btn-primary" onClick={addEpreuve} disabled={loading}>
//                 {loading ? <><span className="spinner" style={{ width:14, height:14, borderWidth:2 }} /> Ajout...</> : 'Ajouter'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Toast */}
//       {toast && (
//         <div className={`toast toast-${toast.type}`}>
//           {toast.type === 'success' ? '✅' : '⚠️'} {toast.msg}
//         </div>
//       )}
//     </Layout>
//   );
// }

// pages/AdminExams.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import {
  FaFolder, FaFolderPlus, FaPlus, FaTrash, FaUpload,
  FaFilePdf, FaTimes, FaCheckCircle, FaQuestionCircle
} from 'react-icons/fa';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SUBJECTS = [
  { value: 'svt', label: 'Sciences de la Vie (SVT)', emoji: '🧬' },
  { value: 'physique', label: 'Physique', emoji: '⚡' },
  { value: 'chimie', label: 'Chimie', emoji: '🧪' },
  { value: 'mathematiques', label: 'Mathématiques', emoji: '📐' },
];

const FileDropZone = ({ id, label, file, onChange, accept = '.pdf' }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <label
      htmlFor={id}
      className={`file-drop ${file ? 'has-file' : ''}`}
      style={{ cursor: 'pointer' }}
    >
      <input id={id} type="file" accept={accept} onChange={onChange} style={{ display: 'none' }} />
      {file ? (
        <>
          <div className="file-drop-icon"><FaCheckCircle /></div>
          <div className="file-drop-text" style={{ color: 'var(--green)', fontWeight: 600 }}>{file.name}</div>
          <div className="file-drop-hint">Cliquez pour changer</div>
        </>
      ) : (
        <>
          <div className="file-drop-icon"><FaUpload /></div>
          <div className="file-drop-text">Cliquez pour sélectionner</div>
          <div className="file-drop-hint">PDF uniquement · max 20 Mo</div>
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

  // New concours form
  const [newForm, setNewForm] = useState({ title: '', year: '', description: '' });
  const [gridFile, setGridFile] = useState(null);

  // New epreuve form
  const [epForm, setEpForm] = useState({
    subject: 'svt',
    title: '',
    order: 0,
    nbQuestionsParBloc: 20, // ⭐ NOUVEAU : par défaut 20
  });
  const [examFile, setExamFile] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = async () => {
    try {
      const res = await axios.get(`${API}/api/concours`);
      setList(res.data.data || res.data);
    } catch (err) {
      console.error('Erreur:', err);
      showToast('Erreur de chargement', 'error');
    } finally {
      setFetching(false);
    }
  };

  const createConcours = async (e) => {
    e.preventDefault();
    if (!gridFile) {
      showToast('La grille de correction est obligatoire', 'error');
      return;
    }

    setLoading(true);
    const fd = new FormData();
    Object.entries(newForm).forEach(([k, v]) => fd.append(k, v));
    fd.append('answerGridFile', gridFile);

    try {
      await axios.post(`${API}/api/concours`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Concours créé avec succès !');
      setShowNew(false);
      setNewForm({ title: '', year: '', description: '' });
      setGridFile(null);
      fetchAll();
    } catch (err) {
      console.error('Erreur création:', err);
      showToast('Erreur lors de la création', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addEpreuve = async () => {
    if (!examFile) {
      showToast('Le fichier de l\'épreuve est obligatoire', 'error');
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append('concoursId', addToId);
    Object.entries(epForm).forEach(([k, v]) => fd.append(k, v));
    fd.append('examFile', examFile);

    try {
      await axios.post(`${API}/api/concours/epreuve`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Matière ajoutée avec succès !');
      setAddToId(null);
      setEpForm({
        subject: 'svt',
        title: '',
        order: 0,
        nbQuestionsParBloc: 20,
      });
      setExamFile(null);
      fetchAll();
    } catch (err) {
      console.error('Erreur ajout:', err);
      showToast('Erreur lors de l\'ajout', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteConcours = async (id) => {
    if (!window.confirm('Supprimer ce concours et toutes ses épreuves ?')) return;
    try {
      await axios.delete(`${API}/api/concours/${id}`);
      showToast('Concours supprimé');
      fetchAll();
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast('Impossible de supprimer', 'error');
    }
  };

  const deleteEpreuve = async (id) => {
    if (!window.confirm('Supprimer cette épreuve ?')) return;
    try {
      await axios.delete(`${API}/api/concours/epreuve/${id}`);
      showToast('Épreuve supprimée');
      fetchAll();
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast('Impossible de supprimer', 'error');
    }
  };

  // Télécharger un fichier PDF depuis base64
  const downloadFile = async (epreuveId, fileType) => {
    try {
      const endpoint = fileType === 'exam'
        ? `${API}/api/concours/${epreuveId}/exam-file`
        : `${API}/api/concours/${epreuveId}/answer-grid`;

      const res = await axios.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileType === 'exam' ? 'epreuve.pdf' : 'grille.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      showToast('Erreur lors du téléchargement', 'error');
    }
  };

  // Calcul de la plage de questions pour une épreuve
  const getQuestionRange = (order, nbQ) => {
    const start = order * nbQ + 1;
    const end = (order + 1) * nbQ;
    return `Q${start}–Q${end}`;
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>
          <span className="icon"><FaFolder /></span>
          Gestion des concours
        </h1>
        <p>Organisez les concours par année et ajoutez les 4 matières avec leur grille de correction.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <FaFolderPlus /> Nouveau concours
        </button>
      </div>

      {fetching ? (
        <div className="page-loading"><span className="spinner spinner-lg" /></div>
      ) : list.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><FaFolder /></div>
            <h3>Aucun concours pour le moment</h3>
            <p>Cliquez sur "Nouveau concours" pour commencer.</p>
          </div>
        </div>
      ) : (
        <div>
          {list.map(concours => (
            <div key={concours._id} className="admin-concours-panel">
              {/* Header */}
              <div className="admin-concours-header">
                <div>
                  <div className="admin-concours-title">{concours.title}</div>
                  <div className="admin-concours-year">{concours.year}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {concours.answerGridFile?.originalName && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => downloadFile(concours._id, 'grid')}
                      title="Télécharger la grille"
                    >
                      <FaFilePdf style={{ color: 'var(--green)' }} /> Grille
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={() => setAddToId(concours._id)}>
                    <FaPlus /> Matière
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteConcours(concours._id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Epreuves */}
              <div style={{ padding: '12px 16px' }}>
                {(!concours.epreuves || concours.epreuves.length === 0) ? (
                  <p style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '12px 0' }}>
                    Aucune matière — cliquez sur "+ Matière" pour en ajouter.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                    {concours.epreuves.map(ep => {
                      const s = SUBJECTS.find(s => s.value === ep.subject);
                      const nbQ = ep.nbQuestionsParBloc || 20;
                      const range = getQuestionRange(ep.order, nbQ);
                      return (
                        <div
                          key={ep._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            background: 'var(--bg2)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>{s?.emoji || '📄'}</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>
                                {ep.subject}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                                {/* ⭐ AFFICHAGE DU NOMBRE DE QUESTIONS */}
                                <span style={{ fontWeight: 700, color: '#fbbf24' }}>
                                  {nbQ} Q/bloc
                                </span>
                                {' · '}
                                {range}
                                {ep.examFile?.originalName && (
                                  <>
                                    {' · '}
                                    <button
                                      onClick={() => downloadFile(ep._id, 'exam')}
                                      style={{
                                        fontSize: 11,
                                        color: 'var(--accent)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                      }}
                                    >
                                      PDF
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 8px', minWidth: 'unset' }}
                            onClick={() => deleteEpreuve(ep._id)}
                          >
                            <FaTrash style={{ fontSize: 11 }} />
                          </button>
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

      {/* Modal: Nouveau concours */}
      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📁 Nouveau concours</h3>
              <button className="btn-icon" onClick={() => setShowNew(false)}><FaTimes /></button>
            </div>
            <form onSubmit={createConcours}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Titre *</label>
                  <input
                    className="form-input"
                    placeholder="Ex: Concours Médecine 2022-2023"
                    value={newForm.title}
                    onChange={e => setNewForm({ ...newForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Année *</label>
                  <input
                    className="form-input"
                    placeholder="2022-2023"
                    value={newForm.year}
                    onChange={e => setNewForm({ ...newForm, year: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Optionnel..."
                    value={newForm.description}
                    onChange={e => setNewForm({ ...newForm, description: e.target.value })}
                  />
                </div>
                <FileDropZone
                  id="grid-file"
                  label="Grille de correction (PDF) *"
                  file={gridFile}
                  onChange={e => setGridFile(e.target.files[0])}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Création...</> : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ajouter épreuve */}
      {addToId && (
        <div className="modal-overlay" onClick={() => setAddToId(null)}>
          <div className="modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Ajouter une matière</h3>
              <button className="btn-icon" onClick={() => setAddToId(null)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Matière</label>
                <select
                  className="form-select"
                  value={epForm.subject}
                  onChange={e => setEpForm({ ...epForm, subject: e.target.value })}
                >
                  {SUBJECTS.map(s => (
                    <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Titre (optionnel)</label>
                <input
                  className="form-input"
                  placeholder="Titre personnalisé"
                  value={epForm.title}
                  onChange={e => setEpForm({ ...epForm, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Ordre d'affichage</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={epForm.order}
                  onChange={e => setEpForm({ ...epForm, order: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* ⭐ NOUVEAU : Nombre de questions par bloc */}
              <div className="form-group" style={{
                border: '2px solid #fbbf24',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                background: 'rgba(251,191,36,0.06)',
                marginBottom: 16
              }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaQuestionCircle /> Nombre de questions par bloc *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="form-input"
                  style={{ borderColor: '#fbbf24' }}
                  value={epForm.nbQuestionsParBloc}
                  onChange={e => setEpForm({ ...epForm, nbQuestionsParBloc: parseInt(e.target.value) || 20 })}
                  required
                />
                <small style={{ color: 'var(--text3)', fontSize: 11, display: 'block', marginTop: 4 }}>
                  Définit le nombre de QCM dans ce bloc. Exemples : 14, 20, 30. Par défaut : 20.
                </small>
              </div>

              <FileDropZone
                id="exam-file"
                label="Fichier épreuve (PDF) *"
                file={examFile}
                onChange={e => setExamFile(e.target.files[0])}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setAddToId(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={addEpreuve} disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Ajout...</> : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '⚠️'} {toast.msg}
        </div>
      )}
    </Layout>
  );
}