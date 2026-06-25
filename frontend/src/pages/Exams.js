// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Layout from '../components/Layout';
// import AnswerSheet from '../components/AnswerSheet';
// import {
//   FaBook, FaDownload, FaUpload, FaEye, FaCalendarAlt,
//   FaFilePdf, FaCheckCircle, FaTimes
// } from 'react-icons/fa';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// const SUBJECT_META = {
//   svt:           { emoji: '🧬', color: '#34d399', bg: 'rgba(52,211,153,0.1)',  label: 'SVT' },
//   physique:      { emoji: '⚡', color: '#4f8ef7', bg: 'rgba(79,142,247,0.1)',  label: 'Physique' },
//   chimie:        { emoji: '🧪', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', label: 'Chimie' },
//   mathematiques: { emoji: '📐', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  label: 'Maths' },
// };

// export default function Exams() {
//   const [concoursList, setConcoursList]   = useState([]);
//   const [selectedEpreuve, setSelected]    = useState(null);
//   const [selectedConcours, setSelConcours]= useState(null);
//   const [submitModal, setSubmitModal]     = useState(null);
//   const [file, setFile]                   = useState(null);
//   const [submitting, setSubmitting]       = useState(false);
//   const [toast, setToast]                 = useState(null);
//   const [loading, setLoading]             = useState(true);

//   useEffect(() => { fetchConcours(); }, []);

//   const showToast = (msg, type = 'success') => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 4000);
//   };

//   const fetchConcours = async () => {
//     try {
//       const res = await axios.get(`${API}/api/concours`);
//       // Pour chaque concours, trier les épreuves par order et ajouter un champ realOrder (0,1,2,3)
//       const data = res.data.map(concour => {
//         const epreuvesSorted = [...(concour.epreuves || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//         const epreuvesWithRealOrder = epreuvesSorted.map((ep, idx) => ({ ...ep, realOrder: idx }));
//         return { ...concour, epreuves: epreuvesWithRealOrder };
//       });
//       setConcoursList(data);
//     } catch { 
//       showToast('Erreur lors du chargement', 'error'); 
//     } finally { 
//       setLoading(false); 
//     }
//   };

//   // Calcul de la plage à partir de l'ordre réel (0 → Q1-20, 1 → Q21-40, ...)
//   const getRange = (realOrder) => {
//     const start = realOrder * 20 + 1;
//     const end = (realOrder + 1) * 20;
//     return `Q${start}–Q${end}`;
//   };

//   const handleSubmitFull = async (e) => {
//     e.preventDefault();
//     if (!file) { 
//       showToast('Veuillez sélectionner un fichier PDF', 'error'); 
//       return; 
//     }
//     setSubmitting(true);
//     const fd = new FormData();
//     fd.append('studentFile', file);
//     fd.append('concoursId', submitModal._id);
//     try {
//       await axios.post(`${API}/api/submissions`, fd);
//       showToast('Copie soumise avec succès !');
//       setSubmitModal(null); 
//       setFile(null);
//     } catch { 
//       showToast('Erreur lors de la soumission', 'error'); 
//     } finally { 
//       setSubmitting(false); 
//     }
//   };

//   const openSheet = (epreuve, concours) => {
//     setSelected(epreuve);
//     setSelConcours(concours);
//   };

//   // Group by year
//   const byYear = concoursList.reduce((acc, c) => {
//     if (!acc[c.year]) acc[c.year] = [];
//     acc[c.year].push(c);
//     return acc;
//   }, {});

//   if (loading) return (
//     <Layout>
//       <div className="page-loading">
//         <span className="spinner spinner-lg" />
//         <span>Chargement des concours...</span>
//       </div>
//     </Layout>
//   );

//   return (
//     <Layout>
//       <div className="page-header">
//         <h1>
//           <span className="icon"><FaBook /></span>
//           Bibliothèque des concours
//         </h1>
//         <p>Accédez aux annales, entraînez-vous par matière et recevez des feedbacks personnalisés par IA.</p>
//       </div>

//       {Object.keys(byYear).length === 0 ? (
//         <div className="card">
//           <div className="empty-state">
//             <div className="empty-state-icon">📚</div>
//             <h3>Aucun concours disponible</h3>
//             <p>Les concours seront ajoutés prochainement.</p>
//           </div>
//         </div>
//       ) : (
//         Object.entries(byYear)
//           .sort((a, b) => b[0].localeCompare(a[0]))
//           .map(([year, concours]) => (
//             <div key={year} style={{ marginBottom: 40 }}>
//               <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
//                 <FaCalendarAlt style={{ color:'var(--accent)', fontSize:16 }} />
//                 <h2 style={{ fontSize:18, fontWeight:700, color:'var(--text)' }}>Année {year}</h2>
//                 <span className="badge badge-info">{concours.length} concours</span>
//               </div>

//               <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:20 }}>
//                 {concours.map(concour => {
//                   // Les épreuves sont déjà triées et possèdent `realOrder`
//                   const epreuves = concour.epreuves || [];
//                   return (
//                     <div key={concour._id} className="concours-card">
//                       <div className="concours-card-header">
//                         <h3>{concour.title}</h3>
//                         <p>{epreuves.length} matière(s) · 20 QCM chacune</p>
//                       </div>

//                       <div style={{ padding:'12px 16px' }}>
//                         {epreuves.length === 0 ? (
//                           <p style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:'12px 0' }}>
//                             Aucune matière ajoutée
//                           </p>
//                         ) : epreuves.map(ep => {
//                           const m = SUBJECT_META[ep.subject] || { emoji:'📄', color:'#4f8ef7', bg:'rgba(79,142,247,0.1)', label: ep.subject };
//                           return (
//                             <div key={ep._id} className="subject-row">
//                               <div className="subject-info">
//                                 <span className="subject-emoji">{m.emoji}</span>
//                                 <div>
//                                   <div className="subject-name">{m.label}</div>
//                                   <div className="subject-questions">{getRange(ep.realOrder)}</div>
//                                 </div>
//                               </div>
//                               <div style={{ display:'flex', gap:6 }}>
//                                 {ep.examFile?.path && (
//                                   <a
//                                     href={`${API}/${ep.examFile.path}`}
//                                     target="_blank"
//                                     rel="noreferrer"
//                                     className="btn btn-ghost btn-sm"
//                                     title="Télécharger le PDF"
//                                     style={{ padding:'5px 10px' }}
//                                   >
//                                     <FaDownload style={{ fontSize:11 }} />
//                                   </a>
//                                 )}
//                                 <button
//                                   className="btn btn-sm"
//                                   style={{ background: m.bg, color: m.color, border:`1px solid ${m.color}33` }}
//                                   onClick={() => openSheet(ep, concour)}
//                                 >
//                                   ✏️ Répondre
//                                 </button>
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>

//                       <div className="card-footer" style={{ display:'flex', flexDirection:'column', gap:8 }}>
//                         {concour.answerGridFile?.path && (
//                           <a
//                             href={`${API}/${concour.answerGridFile.path}`}
//                             target="_blank"
//                             rel="noreferrer"
//                             style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:13, color:'var(--green)', textDecoration:'none', padding:'6px 0' }}
//                           >
//                             <FaEye /> Voir la grille de correction
//                           </a>
//                         )}
//                         <button
//                           className="btn btn-ghost btn-full"
//                           onClick={() => setSubmitModal(concour)}
//                           style={{ fontSize:13 }}
//                         >
//                           <FaUpload /> Soumettre ma copie complète
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           ))
//       )}

//       {/* Modals */}
//       {selectedEpreuve && selectedConcours && (
//         <AnswerSheet
//           epreuve={selectedEpreuve}
//           concours={selectedConcours}
//           onClose={() => { setSelected(null); setSelConcours(null); }}
//           onSuccess={() => showToast('Opération réussie !')}
//         />
//       )}

//       {submitModal && (
//         <div className="modal-overlay" onClick={() => setSubmitModal(null)}>
//           <div className="modal animate-slide-up" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>Soumettre ma copie complète</h3>
//               <button className="btn-icon" onClick={() => setSubmitModal(null)}><FaTimes /></button>
//             </div>
//             <form onSubmit={handleSubmitFull}>
//               <div className="modal-body">
//                 <div className="alert alert-success" style={{ marginBottom:16 }}>
//                   <FaFilePdf />
//                   <span>Soumettez toutes les matières en un seul fichier PDF ({submitModal.title})</span>
//                 </div>

//                 <label className={`file-drop ${file ? 'has-file' : ''}`} htmlFor="full-copy-input" style={{ cursor:'pointer' }}>
//                   <input id="full-copy-input" type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} />
//                   {file ? (
//                     <>
//                       <div className="file-drop-icon"><FaCheckCircle /></div>
//                       <div className="file-drop-text" style={{ color:'var(--green)', fontWeight:600 }}>{file.name}</div>
//                       <div className="file-drop-hint">Cliquez pour changer</div>
//                     </>
//                   ) : (
//                     <>
//                       <div className="file-drop-icon"><FaUpload /></div>
//                       <div className="file-drop-text">Cliquez pour sélectionner votre copie (PDF)</div>
//                       <div className="file-drop-hint">Taille max : 20 Mo</div>
//                     </>
//                   )}
//                 </label>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" className="btn btn-ghost" onClick={() => setSubmitModal(null)}>Annuler</button>
//                 <button type="submit" className="btn btn-primary" disabled={submitting || !file}>
//                   {submitting ? 'Envoi en cours...' : 'Soumettre'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {toast && (
//         <div className={`toast toast-${toast.type}`}>
//           {toast.type === 'success' ? '✅' : '⚠️'} {toast.msg}
//         </div>
//       )}
//     </Layout>
//   );
// }
// pages/Exams.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Layout from '../components/Layout';
// import AnswerSheet from '../components/AnswerSheet';
// import {
//   FaBook, FaDownload, FaUpload, FaEye, FaCalendarAlt,
//   FaFilePdf, FaCheckCircle, FaTimes
// } from 'react-icons/fa';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// const SUBJECT_META = {
//   svt:           { emoji: '🧬', color: '#34d399', bg: 'rgba(52,211,153,0.1)',  label: 'SVT' },
//   physique:      { emoji: '⚡', color: '#4f8ef7', bg: 'rgba(79,142,247,0.1)',  label: 'Physique' },
//   chimie:        { emoji: '🧪', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', label: 'Chimie' },
//   mathematiques: { emoji: '📐', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  label: 'Maths' },
// };

// export default function Exams() {
//   const [concoursList, setConcoursList]   = useState([]);
//   const [selectedEpreuve, setSelected]    = useState(null);
//   const [selectedConcours, setSelConcours]= useState(null);
//   const [submitModal, setSubmitModal]     = useState(null);
//   const [file, setFile]                   = useState(null);
//   const [submitting, setSubmitting]       = useState(false);
//   const [toast, setToast]                 = useState(null);
//   const [loading, setLoading]             = useState(true);

//   useEffect(() => { fetchConcours(); }, []);

//   const showToast = (msg, type = 'success') => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 4000);
//   };

//   const fetchConcours = async () => {
//     try {
//       const res = await axios.get(`${API}/api/concours`);
//       // Récupérer les données correctement
//       const concours = res.data.data || res.data;
      
//       // Pour chaque concours, trier les épreuves par order et ajouter un champ realOrder (0,1,2,3)
//       const data = concours.map(concour => {
//         const epreuvesSorted = [...(concour.epreuves || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//         const epreuvesWithRealOrder = epreuvesSorted.map((ep, idx) => ({ ...ep, realOrder: idx }));
//         return { ...concour, epreuves: epreuvesWithRealOrder };
//       });
//       setConcoursList(data);
//     } catch (err) {
//       console.error('Erreur chargement concours:', err);
//       showToast('Erreur lors du chargement', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calcul de la plage à partir de l'ordre réel (0 → Q1-20, 1 → Q21-40, ...)
//   const getRange = (realOrder) => {
//     const start = realOrder * 20 + 1;
//     const end = (realOrder + 1) * 20;
//     return `Q${start}–Q${end}`;
//   };

//   // ✅ Télécharger un fichier PDF depuis base64
//   const downloadExamFile = async (epreuveId) => {
//     try {
//       console.log('Téléchargement du fichier exam:', epreuveId);
//       const res = await axios.get(`${API}/api/concours/${epreuveId}/exam-file`, {
//         responseType: 'blob'
//       });
      
//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', 'epreuve.pdf');
//       document.body.appendChild(link);
//       link.click();
//       link.parentElement.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error('Erreur téléchargement exam:', err);
//       showToast('Erreur lors du téléchargement', 'error');
//     }
//   };

//   // ✅ Télécharger la grille depuis base64
//   const downloadAnswerGrid = async (concoursId) => {
//     try {
//       console.log('Téléchargement de la grille:', concoursId);
//       const res = await axios.get(`${API}/api/concours/${concoursId}/answer-grid`, {
//         responseType: 'blob'
//       });
      
//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', 'grille-reponses.pdf');
//       document.body.appendChild(link);
//       link.click();
//       link.parentElement.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error('Erreur téléchargement grille:', err);
//       showToast('Erreur lors du téléchargement', 'error');
//     }
//   };

//   const handleSubmitFull = async (e) => {
//     e.preventDefault();
//     if (!file) {
//       showToast('Veuillez sélectionner un fichier PDF', 'error');
//       return;
//     }
//     setSubmitting(true);
//     const fd = new FormData();
//     fd.append('studentFile', file);
//     fd.append('concoursId', submitModal._id);
//     try {
//       await axios.post(`${API}/api/submissions`, fd);
//       showToast('Copie soumise avec succès !');
//       setSubmitModal(null);
//       setFile(null);
//     } catch (err) {
//       console.error('Erreur soumission:', err);
//       showToast('Erreur lors de la soumission', 'error');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const openSheet = (epreuve, concours) => {
//     setSelected(epreuve);
//     setSelConcours(concours);
//   };

//   // Group by year
//   const byYear = concoursList.reduce((acc, c) => {
//     if (!acc[c.year]) acc[c.year] = [];
//     acc[c.year].push(c);
//     return acc;
//   }, {});

//   if (loading) return (
//     <Layout>
//       <div className="page-loading">
//         <span className="spinner spinner-lg" />
//         <span>Chargement des concours...</span>
//       </div>
//     </Layout>
//   );

//   return (
//     <Layout>
//       <div className="page-header">
//         <h1>
//           <span className="icon"><FaBook /></span>
//           Bibliothèque des concours
//         </h1>
//         <p>Accédez aux annales, entraînez-vous par matière et recevez des feedbacks personnalisés par IA.</p>
//       </div>

//       {Object.keys(byYear).length === 0 ? (
//         <div className="card">
//           <div className="empty-state">
//             <div className="empty-state-icon">📚</div>
//             <h3>Aucun concours disponible</h3>
//             <p>Les concours seront ajoutés prochainement.</p>
//           </div>
//         </div>
//       ) : (
//         Object.entries(byYear)
//           .sort((a, b) => b[0].localeCompare(a[0]))
//           .map(([year, concours]) => (
//             <div key={year} style={{ marginBottom: 40 }}>
//               <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
//                 <FaCalendarAlt style={{ color:'var(--accent)', fontSize:16 }} />
//                 <h2 style={{ fontSize:18, fontWeight:700, color:'var(--text)' }}>Année {year}</h2>
//                 <span className="badge badge-info">{concours.length} concours</span>
//               </div>

//               <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:20 }}>
//                 {concours.map(concour => {
//                   const epreuves = concour.epreuves || [];
//                   return (
//                     <div key={concour._id} className="concours-card">
//                       <div className="concours-card-header">
//                         <h3>{concour.title}</h3>
//                         <p>{epreuves.length} matière(s) · 20 QCM chacune</p>
//                       </div>

//                       <div style={{ padding:'12px 16px' }}>
//                         {epreuves.length === 0 ? (
//                           <p style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:'12px 0' }}>
//                             Aucune matière ajoutée
//                           </p>
//                         ) : epreuves.map(ep => {
//                           const m = SUBJECT_META[ep.subject] || { emoji:'📄', color:'#4f8ef7', bg:'rgba(79,142,247,0.1)', label: ep.subject };
//                           return (
//                             <div key={ep._id} className="subject-row">
//                               <div className="subject-info">
//                                 <span className="subject-emoji">{m.emoji}</span>
//                                 <div>
//                                   <div className="subject-name">{m.label}</div>
//                                   <div className="subject-questions">{getRange(ep.realOrder)}</div>
//                                 </div>
//                               </div>
//                               <div style={{ display:'flex', gap:6 }}>
//                                 {/* ✅ NOUVEAU: utiliser downloadExamFile au lieu de path */}
//                                 {ep.examFile?.originalName && (
//                                   <button
//                                     onClick={() => downloadExamFile(ep._id)}
//                                     className="btn btn-ghost btn-sm"
//                                     title="Télécharger le PDF"
//                                     style={{ padding:'5px 10px', cursor: 'pointer' }}
//                                   >
//                                     <FaDownload style={{ fontSize:11 }} />
//                                   </button>
//                                 )}
//                                 <button
//                                   className="btn btn-sm"
//                                   style={{ background: m.bg, color: m.color, border:`1px solid ${m.color}33` }}
//                                   onClick={() => openSheet(ep, concour)}
//                                 >
//                                   ✏️ Répondre
//                                 </button>
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>

//                       <div className="card-footer" style={{ display:'flex', flexDirection:'column', gap:8 }}>
//                         {/* ✅ NOUVEAU: utiliser downloadAnswerGrid au lieu de path */}
//                         {concour.answerGridFile?.originalName && (
//                           <button
//                             onClick={() => downloadAnswerGrid(concour._id)}
//                             style={{
//                               display:'flex',
//                               alignItems:'center',
//                               justifyContent:'center',
//                               gap:8,
//                               fontSize:13,
//                               color:'var(--green)',
//                               background:'none',
//                               border:'none',
//                               cursor:'pointer',
//                               padding:'6px 0',
//                               textDecoration:'none'
//                             }}
//                           >
//                             <FaEye /> Voir la grille de correction
//                           </button>
//                         )}
//                         <button
//                           className="btn btn-ghost btn-full"
//                           onClick={() => setSubmitModal(concour)}
//                           style={{ fontSize:13 }}
//                         >
//                           <FaUpload /> Soumettre ma copie complète
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           ))
//       )}

//       {/* Modals */}
//       {selectedEpreuve && selectedConcours && (
//         <AnswerSheet
//           epreuve={selectedEpreuve}
//           concours={selectedConcours}
//           onClose={() => { setSelected(null); setSelConcours(null); }}
//           onSuccess={() => showToast('Opération réussie !')}
//         />
//       )}

//       {submitModal && (
//         <div className="modal-overlay" onClick={() => setSubmitModal(null)}>
//           <div className="modal animate-slide-up" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>Soumettre ma copie complète</h3>
//               <button className="btn-icon" onClick={() => setSubmitModal(null)}><FaTimes /></button>
//             </div>
//             <form onSubmit={handleSubmitFull}>
//               <div className="modal-body">
//                 <div className="alert alert-success" style={{ marginBottom:16 }}>
//                   <FaFilePdf />
//                   <span>Soumettez toutes les matières en un seul fichier PDF ({submitModal.title})</span>
//                 </div>

//                 <label className={`file-drop ${file ? 'has-file' : ''}`} htmlFor="full-copy-input" style={{ cursor:'pointer' }}>
//                   <input id="full-copy-input" type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} />
//                   {file ? (
//                     <>
//                       <div className="file-drop-icon"><FaCheckCircle /></div>
//                       <div className="file-drop-text" style={{ color:'var(--green)', fontWeight:600 }}>{file.name}</div>
//                       <div className="file-drop-hint">Cliquez pour changer</div>
//                     </>
//                   ) : (
//                     <>
//                       <div className="file-drop-icon"><FaUpload /></div>
//                       <div className="file-drop-text">Cliquez pour sélectionner votre copie (PDF)</div>
//                       <div className="file-drop-hint">Taille max : 20 Mo</div>
//                     </>
//                   )}
//                 </label>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" className="btn btn-ghost" onClick={() => setSubmitModal(null)}>Annuler</button>
//                 <button type="submit" className="btn btn-primary" disabled={submitting || !file}>
//                   {submitting ? 'Envoi en cours...' : 'Soumettre'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {toast && (
//         <div className={`toast toast-${toast.type}`}>
//           {toast.type === 'success' ? '✅' : '⚠️'} {toast.msg}
//         </div>
//       )}
//     </Layout>
//   );
// }

// pages/Exams.jsx
// pages/Exams.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import AnswerSheet from '../components/AnswerSheet';
import {
  FaBook, FaDownload, FaUpload, FaEye, FaCalendarAlt,
  FaFilePdf, FaCheckCircle, FaTimes
} from 'react-icons/fa';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SUBJECT_META = {
  svt: { emoji: '🧬', color: '#34d399', bg: 'rgba(52,211,153,0.1)', label: 'SVT' },
  physique: { emoji: '⚡', color: '#4f8ef7', bg: 'rgba(79,142,247,0.1)', label: 'Physique' },
  chimie: { emoji: '🧪', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', label: 'Chimie' },
  mathematiques: { emoji: '📐', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', label: 'Maths' },
};

export default function Exams() {
  const [concoursList, setConcoursList] = useState([]);
  const [selectedEpreuve, setSelected] = useState(null);
  const [selectedConcours, setSelConcours] = useState(null);

  const [submitModal, setSubmitModal] = useState(null);
  const [file, setFile] = useState(null);
  const [selectedPdfEpreuve, setSelectedPdfEpreuve] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConcours();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
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

        return {
          ...concour,
          epreuves: epreuvesWithRealOrder,
        };
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
    return `Q${start}–Q${end}`;
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
      console.error('Erreur téléchargement exam:', err);
      showToast('Erreur lors du téléchargement', 'error');
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
      console.error('Erreur téléchargement grille:', err);
      showToast('Erreur lors du téléchargement', 'error');
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
      showToast('Veuillez sélectionner un fichier PDF', 'error');
      return;
    }

    if (!selectedPdfEpreuve) {
      showToast('Veuillez choisir la matière du PDF', 'error');
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

      showToast('PDF envoyé. Extraction en cours.');
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

  const byYear = concoursList.reduce((acc, c) => {
    if (!acc[c.year]) acc[c.year] = [];
    acc[c.year].push(c);
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
          <span className="icon"><FaBook /></span>
          Bibliothèque des concours
        </h1>
        <p>
          Accédez aux annales, entraînez-vous par matière et recevez des feedbacks personnalisés par IA.
        </p>
      </div>

      {Object.keys(byYear).length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>Aucun concours disponible</h3>
            <p>Les concours seront ajoutés prochainement.</p>
          </div>
        </div>
      ) : (
        Object.entries(byYear)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([year, concours]) => (
            <div key={year} style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <FaCalendarAlt style={{ color: 'var(--accent)', fontSize: 16 }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                  Année {year}
                </h2>
                <span className="badge badge-info">{concours.length} concours</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 20,
                }}
              >
                {concours.map((concour) => {
                  const epreuves = concour.epreuves || [];

                  return (
                    <div key={concour._id} className="concours-card">
                      <div className="concours-card-header">
                        <h3>{concour.title}</h3>
                        <p>
                          {epreuves.length} matière(s) · {epreuves[0]?.nbQuestionsParBloc || 20} QCM chacune
                        </p>
                      </div>

                      <div style={{ padding: '12px 16px' }}>
                        {epreuves.length === 0 ? (
                          <p
                            style={{
                              fontSize: 13,
                              color: 'var(--text3)',
                              textAlign: 'center',
                              padding: '12px 0',
                            }}
                          >
                            Aucune matière ajoutée
                          </p>
                        ) : (
                          epreuves.map((epreuve) => {
                            const meta = SUBJECT_META[epreuve.subject] || {
                              emoji: '📄',
                              color: 'var(--accent)',
                              bg: 'var(--bg3)',
                              label: epreuve.subject,
                            };

                            return (
                              <div key={epreuve._id} className="subject-row">
                                <div
                                  className="subject-icon"
                                  style={{ background: meta.bg, color: meta.color }}
                                >
                                  {meta.emoji}
                                </div>

                                <div className="subject-info">
                                  <div className="subject-name">{meta.label}</div>
                                  <div className="subject-range">
                                    {getRange(
                                      epreuve.realOrder ?? epreuve.order ?? 0,
                                      epreuve.nbQuestionsParBloc || 20
                                    )}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => downloadExamFile(epreuve._id)}
                                    title="Télécharger l'épreuve"
                                  >
                                    <FaDownload />
                                  </button>

                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => openSheet(epreuve, concour)}
                                  >
                                    ✏️ Répondre
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="card-footer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {concour.answerGridFile?.originalName && (
                          <button
                            onClick={() => downloadAnswerGrid(concour._id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                              fontSize: 13,
                              color: 'var(--green)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '6px 0',
                            }}
                          >
                            <FaEye /> Voir la grille de correction
                          </button>
                        )}

                        <button
                          className="btn btn-ghost btn-full"
                          onClick={() => openSubmitModal(concour)}
                          style={{ fontSize: 13 }}
                          disabled={epreuves.length === 0}
                        >
                          <FaUpload /> Soumettre ma copie PDF
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
          onSuccess={() => showToast('Opération réussie !')}
        />
      )}

      {submitModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setSubmitModal(null);
            setFile(null);
            setSelectedPdfEpreuve('');
          }}
        >
          <div className="modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Soumettre ma copie PDF</h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => {
                  setSubmitModal(null);
                  setFile(null);
                  setSelectedPdfEpreuve('');
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitFull}>
              <div className="modal-body">
                <div className="alert alert-success" style={{ marginBottom: 16 }}>
                  <FaFilePdf />
                  <span>
                    Soumettez votre grille PDF pour le concours : <strong>{submitModal.title}</strong>
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Matière du PDF</label>
                  <select
                    className="form-input"
                    value={selectedPdfEpreuve}
                    onChange={(e) => setSelectedPdfEpreuve(e.target.value)}
                    required
                  >
                    <option value="">Choisir une matière</option>
                    {submitModal.epreuves?.map((ep) => {
                      const meta = SUBJECT_META[ep.subject];
                      return (
                        <option key={ep._id} value={ep._id}>
                          {meta?.emoji || '📄'} {meta?.label || ep.subject} — {ep.title || 'Épreuve'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <label
                  className={`file-drop ${file ? 'has-file' : ''}`}
                  htmlFor="full-copy-input"
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    id="full-copy-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                  />

                  {file ? (
                    <>
                      <div className="file-drop-icon">
                        <FaCheckCircle />
                      </div>
                      <div
                        className="file-drop-text"
                        style={{ color: 'var(--green)', fontWeight: 600 }}
                      >
                        {file.name}
                      </div>
                      <div className="file-drop-hint">Cliquez pour changer</div>
                    </>
                  ) : (
                    <>
                      <div className="file-drop-icon">
                        <FaUpload />
                      </div>
                      <div className="file-drop-text">Cliquez pour sélectionner votre PDF</div>
                      <div className="file-drop-hint">PDF uniquement · max 10 Mo</div>
                    </>
                  )}
                </label>

                <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 12, lineHeight: 1.6 }}>
                  Le PDF sera envoyé vers n8n pour extraire les réponses, puis il sera enregistré dans
                  la même collection que la saisie manuelle.
                </p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setSubmitModal(null);
                    setFile(null);
                    setSelectedPdfEpreuve('');
                  }}
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
                      <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <FaUpload /> Envoyer le PDF
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
        </div>
      )}
    </Layout>
  );
}