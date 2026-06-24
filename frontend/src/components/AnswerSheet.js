// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';
// import { FaSave, FaMagic, FaTimes, FaUser, FaCheckCircle } from 'react-icons/fa';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// const SUBJECT_META = {
//   svt:          { emoji: '🧬', label: 'Sciences de la Vie',  color: '#34d399' },
//   physique:     { emoji: '⚡', label: 'Physique',            color: '#4f8ef7' },
//   chimie:       { emoji: '🧪', label: 'Chimie',              color: '#a78bfa' },
//   mathematiques:{ emoji: '📐', label: 'Mathématiques',       color: '#fbbf24' },
// };

// export default function AnswerSheet({ epreuve, concours, onClose, onSuccess }) {
//   const { user } = useAuth();
//   const [answers, setAnswers] = useState(Array(20).fill(''));
//   const [answerId, setAnswerId] = useState(null);
//   const [status, setStatus] = useState('idle');
//   const [toast, setToast] = useState(null);
//   const [nom, setNom] = useState('');
//   const [prenom, setPrenom] = useState('');
//   const [codeCandidat, setCodeCandidat] = useState('');

//   // ====================== ORDRE RÉEL (0‑BASED) ======================
//   // Priorité à realOrder (calculé dans Exams.js), sinon fallback sur order
//   const order = epreuve?.realOrder ?? epreuve?.order ?? 0;
//   const startQ = order * 20 + 1;
//   const endQ = (order + 1) * 20;
//   const blocIndex = order + 1;   // 1,2,3,4 pour l'affichage

//   const meta = SUBJECT_META[epreuve.subject] || { emoji: '📄', label: epreuve.subject, color: '#4f8ef7' };

//   useEffect(() => {
//     if (user?.name) {
//       const parts = user.name.split(' ');
//       setPrenom(parts[0] || '');
//       setNom(parts.slice(1).join(' ') || '');
//     }
//     loadExisting();
//   }, [epreuve._id]);

//   const loadExisting = async () => {
//     try {
//       const res = await axios.get(`${API}/api/answers`, { params: { concoursId: concours._id } });
//       const found = res.data.data?.find(a => a.epreuve?._id === epreuve._id);
//       if (found) {
//         setAnswers(found.answers?.length === 20 ? found.answers : Array(20).fill(''));
//         setAnswerId(found._id);
//         setNom(found.nom || nom);
//         setPrenom(found.prenom || prenom);
//         setCodeCandidat(found.code_candidat || '');
//       }
//     } catch (_) {}
//   };

//   const saveAnswers = async () => {
//     if (!prenom.trim() || !nom.trim()) {
//       showToast('Veuillez entrer votre nom et prénom', 'error');
//       return;
//     }
//     setStatus('saving');
//     try {
//       const res = await axios.post(`${API}/api/answers`, {
//         concoursId: concours._id,
//         epreuveId: epreuve._id,
//         answers,
//         nom,
//         prenom,
//         code_candidat: codeCandidat || `CAND${Date.now()}`,
//       });
//       setAnswerId(res.data.answer._id);
//       showToast('Réponses sauvegardées avec succès !');
//     } catch {
//       showToast('Erreur lors de la sauvegarde', 'error');
//     } finally {
//       setStatus('idle');
//     }
//   };

//   const triggerFeedback = async () => {
//     if (!answerId) {
//       showToast('Sauvegardez d\'abord vos réponses', 'error');
//       return;
//     }
//     setStatus('triggering');
//     try {
//       await axios.post(`${API}/api/answers/${answerId}/trigger`);
//       showToast('Feedback en cours de génération...');
//       setTimeout(() => { onClose(); if (onSuccess) onSuccess(); }, 2500);
//     } catch {
//       showToast('Erreur lors du déclenchement', 'error');
//     } finally {
//       setStatus('idle');
//     }
//   };

//   const handleChange = (i, val) => {
//     const next = [...answers];
//     next[i] = val.toUpperCase();
//     setAnswers(next);
//   };

//   const answered = answers.filter(a => a && a.trim()).length;
//   const pct = Math.round((answered / 20) * 100);

//   const showToast = (msg, type = 'success') => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3500);
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal modal-lg animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxHeight: '92vh' }}>
        
//         <div className="modal-header" style={{ background: 'var(--bg3)' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//             <span style={{ fontSize: 24 }}>{meta.emoji}</span>
//             <div>
//               <h3 style={{ color: 'var(--text)', textTransform: 'capitalize' }}>{meta.label}</h3>
//               <p style={{ fontSize: 12, color: 'var(--text3)' }}>
//                 {concours.title} — Bloc {blocIndex} (Q{startQ} à Q{endQ})
//               </p>
//             </div>
//           </div>
//           <button className="btn-icon" onClick={onClose}><FaTimes /></button>
//         </div>

//         <div style={{ padding: '12px 24px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
//             <span>Progression</span>
//             <span style={{ fontWeight: 700 }}>{pct}%</span>
//           </div>
//           <div className="progress">
//             <div className="progress-bar" style={{ width: `${pct}%` }} />
//           </div>
//         </div>

//         <div className="modal-body">
//           <div style={{ marginBottom: 20 }}>
//             <div className="section-title"><FaUser /> Informations candidat</div>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
//               <div className="form-group" style={{ margin: 0 }}>
//                 <label className="form-label">Prénom *</label>
//                 <input className="form-input" value={prenom} onChange={e => setPrenom(e.target.value)} />
//               </div>
//               <div className="form-group" style={{ margin: 0 }}>
//                 <label className="form-label">Nom *</label>
//                 <input className="form-input" value={nom} onChange={e => setNom(e.target.value)} />
//               </div>
//               <div className="form-group" style={{ margin: 0 }}>
//                 <label className="form-label">Code candidat</label>
//                 <input className="form-input" value={codeCandidat} onChange={e => setCodeCandidat(e.target.value)} />
//               </div>
//             </div>
//           </div>

//           <div style={{ marginBottom: 20 }}>
//             <div className="section-title">Grille de réponses — Q{startQ} à Q{endQ}</div>
//             <div className="answer-grid">
//               {answers.map((ans, i) => (
//                 <div key={i} className="answer-cell">
//                   <label>Q{startQ + i}</label>
//                   <select value={ans} onChange={e => handleChange(i, e.target.value)}>
//                     <option value="">—</option>
//                     {['A','B','C','D','E'].map(o => <option key={o} value={o}>{o}</option>)}
//                   </select>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="modal-footer" style={{ flexWrap: 'wrap', gap: 10 }}>
//           <button className="btn btn-ghost" onClick={onClose}>Fermer</button>
//           <div style={{ flex: 1 }} />
//           <button className="btn btn-success" onClick={saveAnswers} disabled={status === 'saving'}>
//             {status === 'saving' ? 'Sauvegarde...' : <><FaSave /> Sauvegarder</>}
//           </button>
//           <button className="btn btn-primary" onClick={triggerFeedback} disabled={status === 'triggering' || !answerId}>
//             {status === 'triggering' ? 'Envoi...' : <><FaMagic /> Générer feedback</>}
//           </button>
//         </div>

//         {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
//       </div>
//     </div>
//   );
// }

// // components/AnswerSheet.js
// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';
// import {
//   FaSave, FaMagic, FaTimes, FaUser,
//   FaKeyboard, FaCamera, FaUpload, FaCheckCircle, FaSpinner
// } from 'react-icons/fa';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// const SUBJECT_META = {
//   svt:           { emoji: '🧬', label: 'Sciences de la Vie',  color: '#34d399' },
//   physique:      { emoji: '⚡', label: 'Physique',            color: '#4f8ef7' },
//   chimie:        { emoji: '🧪', label: 'Chimie',              color: '#a78bfa' },
//   mathematiques: { emoji: '📐', label: 'Mathématiques',       color: '#fbbf24' },
// };

// // ─── Onglet Saisie manuelle ───────────────────────────────────────────────────
// function ManualTab({ answers, startQ, meta, onChange }) {
//   return (
//     <div>
//       <div style={{ fontSize:12, color:'var(--text3)', marginBottom:12 }}>
//         Sélectionnez la réponse pour chaque question (A–E).
//       </div>
//       <div className="answer-grid">
//         {answers.map((v, i) => (
//           <div key={i} className="answer-cell">
//             <label style={{ color: v ? meta.color : 'var(--text3)' }}>
//               Q{startQ + i}
//             </label>
//             <select
//               value={v}
//               onChange={e => onChange(i, e.target.value)}
//               style={{ borderColor: v ? meta.color + '55' : undefined }}
//             >
//               <option value="">—</option>
//               {['A','B','C','D','E'].map(o => <option key={o} value={o}>{o}</option>)}
//             </select>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─── Onglet Upload image ──────────────────────────────────────────────────────
// function UploadTab({ startQ, onExtracted }) {
//   const [file,        setFile]        = useState(null);
//   const [preview,     setPreview]     = useState(null);
//   const [extracting,  setExtracting]  = useState(false);
//   const [extracted,   setExtracted]   = useState(null); // { Q1:"A", ... }
//   const [error,       setError]       = useState(null);
//   const inputRef = useRef();

//   const handleFile = (f) => {
//     if (!f) return;
//     setFile(f);
//     setExtracted(null);
//     setError(null);
//     const reader = new FileReader();
//     reader.onload = e => setPreview(e.target.result);
//     reader.readAsDataURL(f);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     const f = e.dataTransfer.files[0];
//     if (f && (f.type.startsWith('image/') || f.type === 'application/pdf')) {
//       handleFile(f);
//     }
//   };

//   const extract = async () => {
//     if (!file) return;
//     setExtracting(true);
//     setError(null);
//     try {
//       const formData = new FormData();
//       formData.append('image', file);
//       formData.append('startQ', startQ); // le backend transmettra à n8n

//       const res = await axios.post(`${API}/api/answers/extract-image`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         timeout: 60000,
//       });

//       if (res.data.success && res.data.answers) {
//         setExtracted(res.data.answers);
//         onExtracted(res.data.answers); // remonte vers AnswerSheet
//       } else {
//         setError('Extraction impossible. Vérifiez la qualité de l\'image.');
//       }
//     } catch (e) {
//       setError(e.response?.data?.message || 'Erreur lors de l\'extraction IA.');
//     } finally {
//       setExtracting(false);
//     }
//   };

//   return (
//     <div>
//       <div style={{ fontSize:12, color:'var(--text3)', marginBottom:14 }}>
//         Photographiez ou scannez votre grille de réponses. L'IA extraira les réponses automatiquement.
//       </div>

//       {/* Zone drop */}
//       <div
//         onDrop={handleDrop}
//         onDragOver={e => e.preventDefault()}
//         onClick={() => inputRef.current?.click()}
//         style={{
//           border:`2px dashed ${file ? '#34d399' : 'var(--border)'}`,
//           borderRadius:'var(--radius)',
//           padding:'24px 20px',
//           textAlign:'center',
//           cursor:'pointer',
//           background: file ? 'rgba(52,211,153,0.05)' : 'var(--bg2)',
//           transition:'all .2s',
//           marginBottom:14,
//         }}
//       >
//         <input
//           ref={inputRef}
//           type="file"
//           accept="image/*,.pdf"
//           style={{ display:'none' }}
//           onChange={e => handleFile(e.target.files[0])}
//         />
//         {file ? (
//           <>
//             <FaCheckCircle style={{ fontSize:28, color:'#34d399', marginBottom:8 }} />
//             <div style={{ fontWeight:600, color:'var(--text)', fontSize:14 }}>{file.name}</div>
//             <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>
//               Cliquez pour changer l'image
//             </div>
//           </>
//         ) : (
//           <>
//             <FaUpload style={{ fontSize:28, color:'var(--text3)', marginBottom:8 }} />
//             <div style={{ fontWeight:600, color:'var(--text)', fontSize:14 }}>
//               Glissez-déposez ou cliquez pour sélectionner
//             </div>
//             <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>
//               JPG, PNG, PDF · Max 10 Mo
//             </div>
//           </>
//         )}
//       </div>

//       {/* Aperçu image */}
//       {preview && preview.startsWith('data:image') && (
//         <div style={{ marginBottom:14, textAlign:'center' }}>
//           <img
//             src={preview}
//             alt="Aperçu grille"
//             style={{
//               maxHeight:220, maxWidth:'100%', borderRadius:'var(--radius-sm)',
//               border:'1px solid var(--border)', objectFit:'contain'
//             }}
//           />
//         </div>
//       )}

//       {/* Bouton extraction */}
//       <button
//         className="btn btn-primary"
//         style={{ width:'100%' }}
//         onClick={extract}
//         disabled={!file || extracting}
//       >
//         {extracting
//           ? <><FaSpinner className="spin" /> Extraction en cours…</>
//           : <><FaCamera /> Extraire les réponses par IA</>
//         }
//       </button>

//       {/* Erreur */}
//       {error && (
//         <div style={{
//           marginTop:12, padding:'10px 14px', borderRadius:'var(--radius-sm)',
//           background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)',
//           fontSize:13, color:'#f87171'
//         }}>
//           ⚠️ {error}
//         </div>
//       )}

//       {/* Résultats extraits */}
//       {extracted && (
//         <div style={{
//           marginTop:14, padding:'12px 14px', borderRadius:'var(--radius-sm)',
//           background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.25)',
//         }}>
//           <div style={{ fontSize:12, fontWeight:700, color:'#34d399', marginBottom:8 }}>
//             ✅ Extraction réussie — vérifiez dans l'onglet "Saisie manuelle"
//           </div>
//           <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
//             {Object.entries(extracted).map(([k, v]) => (
//               <span key={k} style={{
//                 padding:'3px 8px', borderRadius:4, fontSize:11,
//                 background:'rgba(52,211,153,0.15)', color:'#34d399',
//                 fontFamily:'var(--mono)', fontWeight:700
//               }}>
//                 {k}:{v}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Composant principal ──────────────────────────────────────────────────────
// export default function AnswerSheet({ epreuve, concours, onClose, onSuccess }) {
//   const { user } = useAuth();
//   const [tab,          setTab]          = useState('manual'); // 'manual' | 'upload'
//   const [answers,      setAnswers]      = useState(Array(20).fill(''));
//   const [answerId,     setAnswerId]     = useState(null);
//   const [status,       setStatus]       = useState('idle');
//   const [toast,        setToast]        = useState(null);
//   const [nom,          setNom]          = useState('');
//   const [prenom,       setPrenom]       = useState('');
//   const [codeCandidat, setCodeCandidat] = useState('');

//   const order   = epreuve?.realOrder ?? epreuve?.order ?? 0;
//   const startQ  = order * 20 + 1;
//   const blocIndex = order + 1;
//   const meta = SUBJECT_META[epreuve.subject] || { emoji:'📄', label: epreuve.subject, color:'#4f8ef7' };

//   useEffect(() => {
//     if (user?.name) {
//       const parts = user.name.split(' ');
//       setPrenom(parts[0] || '');
//       setNom(parts.slice(1).join(' ') || '');
//     }
//     loadExisting();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [epreuve._id]);

//   const loadExisting = async () => {
//     try {
//       const res = await axios.get(`${API}/api/answers`, { params: { concoursId: concours._id } });
//       const found = res.data.data?.find(a => a.epreuve?._id === epreuve._id);
//       if (found) {
//         setAnswerId(found._id);
//         if (found.nom)           setNom(found.nom);
//         if (found.prenom)        setPrenom(found.prenom);
//         if (found.code_candidat) setCodeCandidat(found.code_candidat);

//         if (found.answers && typeof found.answers === 'object') {
//           const arr = Array(20).fill('');
//           for (let i = 0; i < 20; i++) {
//             arr[i] = found.answers[`Q${startQ + i}`] || '';
//           }
//           setAnswers(arr);
//         }
//       }
//     } catch (_) {}
//   };

//   // Callback depuis UploadTab : injecte les réponses extraites dans le tableau local
//   const handleExtracted = (extractedObj) => {
//     const arr = Array(20).fill('');
//     for (let i = 0; i < 20; i++) {
//       const key = `Q${startQ + i}`;
//       arr[i] = extractedObj[key] || extractedObj[`Q${i + 1}`] || '';
//     }
//     setAnswers(arr);
//     setTab('manual'); // basculer vers saisie manuelle pour vérification
//     showToast('Réponses extraites — vérifiez et corrigez si besoin, puis sauvegardez.');
//   };

//   const saveAnswers = async () => {
//     if (!prenom.trim() || !nom.trim()) {
//       showToast('Veuillez entrer votre nom et prénom', 'error');
//       return;
//     }
//     setStatus('saving');
//     try {
//       const obj = {};
//       answers.forEach((v, i) => { obj[`Q${startQ + i}`] = v || ''; });

//       const res = await axios.post(`${API}/api/answers`, {
//         concoursId:    concours._id,
//         epreuveId:     epreuve._id,
//         answers:       obj,
//         nom, prenom,
//         code_candidat: codeCandidat || `CAND${Date.now()}`,
//       });
//       setAnswerId(res.data.answer._id);
//       showToast('Réponses sauvegardées !');
//     } catch {
//       showToast('Erreur lors de la sauvegarde', 'error');
//     } finally {
//       setStatus('idle');
//     }
//   };

//   const triggerFeedback = async () => {
//     if (!answerId) { showToast('Sauvegardez d\'abord vos réponses', 'error'); return; }
//     setStatus('triggering');
//     try {
//       await axios.post(`${API}/api/answers/${answerId}/trigger`);
//       showToast('Feedback en cours de génération… Consultez l\'Historique dans quelques instants.');
//       setTimeout(() => { onClose(); if (onSuccess) onSuccess(); }, 3000);
//     } catch {
//       showToast('Erreur lors du déclenchement', 'error');
//     } finally {
//       setStatus('idle');
//     }
//   };

//   const handleChange = (i, v) => {
//     const next = [...answers];
//     next[i] = v.toUpperCase();
//     setAnswers(next);
//   };

//   const answered = answers.filter(v => v).length;
//   const pct      = Math.round((answered / 20) * 100);

//   const showToast = (msg, type = 'success') => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 4000);
//   };

//   const tabStyle = (t) => ({
//     padding:'8px 18px', fontSize:13, fontWeight:600, cursor:'pointer',
//     borderBottom:`2px solid ${tab === t ? meta.color : 'transparent'}`,
//     color: tab === t ? meta.color : 'var(--text3)',
//     background:'transparent', border:'none',
//     borderBottom:`2px solid ${tab === t ? meta.color : 'transparent'}`,
//     transition:'all .15s',
//   });

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div
//         className="modal modal-lg animate-slide-up"
//         onClick={e => e.stopPropagation()}
//         style={{ maxHeight:'92vh', display:'flex', flexDirection:'column' }}
//       >
//         {/* Header */}
//         <div className="modal-header" style={{ background:'var(--bg3)', flexShrink:0 }}>
//           <div style={{ display:'flex', alignItems:'center', gap:12 }}>
//             <span style={{ fontSize:24 }}>{meta.emoji}</span>
//             <div>
//               <h3 style={{ color:'var(--text)', margin:0, textTransform:'capitalize' }}>{meta.label}</h3>
//               <p style={{ fontSize:12, color:'var(--text3)', margin:0 }}>
//                 {concours.title} — Bloc {blocIndex} (Q{startQ} à Q{startQ + 19})
//               </p>
//             </div>
//           </div>
//           <button className="btn-icon" onClick={onClose}><FaTimes /></button>
//         </div>

//         {/* Progress */}
//         <div style={{ padding:'10px 24px', background:'var(--bg3)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
//           <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text3)', marginBottom:5 }}>
//             <span>{answered}/20 réponses</span>
//             <span style={{ fontWeight:700 }}>{pct}%</span>
//           </div>
//           <div className="progress" style={{ height:4 }}>
//             <div className="progress-bar" style={{ width:`${pct}%` }} />
//           </div>
//         </div>

//         {/* Tabs */}
//         <div style={{
//           display:'flex', borderBottom:'1px solid var(--border)',
//           background:'var(--bg2)', flexShrink:0
//         }}>
//           <button style={tabStyle('manual')} onClick={() => setTab('manual')}>
//             <FaKeyboard style={{ marginRight:6, fontSize:11 }} /> Saisie manuelle
//           </button>
//           <button style={tabStyle('upload')} onClick={() => setTab('upload')}>
//             <FaCamera style={{ marginRight:6, fontSize:11 }} /> Upload &amp; extraction IA
//           </button>
//         </div>

//         {/* Body */}
//         <div className="modal-body" style={{ flex:1, overflowY:'auto' }}>
//           {/* Infos candidat (toujours visible) */}
//           <div style={{ marginBottom:20 }}>
//             <div className="section-title" style={{ display:'flex', alignItems:'center', gap:6 }}>
//               <FaUser style={{ fontSize:11 }} /> Informations candidat
//             </div>
//             <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
//               {[
//                 ['Prénom *', prenom, setPrenom],
//                 ['Nom *',    nom,    setNom],
//                 ['Code candidat', codeCandidat, setCodeCandidat],
//               ].map(([lbl, val, set]) => (
//                 <div className="form-group" style={{ margin:0 }} key={lbl}>
//                   <label className="form-label">{lbl}</label>
//                   <input className="form-input" value={val} onChange={e => set(e.target.value)} />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Contenu onglet */}
//           {tab === 'manual'
//             ? <ManualTab answers={answers} startQ={startQ} meta={meta} onChange={handleChange} />
//             : <UploadTab startQ={startQ} onExtracted={handleExtracted} />
//           }
//         </div>

//         {/* Footer */}
//         <div className="modal-footer" style={{ flexShrink:0, flexWrap:'wrap', gap:10 }}>
//           <button className="btn btn-ghost" onClick={onClose}>Fermer</button>
//           <div style={{ flex:1 }} />
//           <button className="btn btn-success" onClick={saveAnswers} disabled={status === 'saving'}>
//             {status === 'saving' ? 'Sauvegarde…' : <><FaSave /> Sauvegarder</>}
//           </button>
//           <button
//             className="btn btn-primary"
//             onClick={triggerFeedback}
//             disabled={status === 'triggering' || !answerId}
//           >
//             {status === 'triggering' ? 'Envoi…' : <><FaMagic /> Générer feedback</>}
//           </button>
//         </div>

//         {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
//       </div>
//     </div>
//   );
// }
// components/AnswerSheet.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FaSave, FaMagic, FaTimes, FaUser,
  FaKeyboard, FaCamera, FaUpload, FaCheckCircle, FaSpinner
} from 'react-icons/fa';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SUBJECT_META = {
  svt: { emoji: '🧬', label: 'Sciences de la Vie', color: '#34d399' },
  physique: { emoji: '⚡', label: 'Physique', color: '#4f8ef7' },
  chimie: { emoji: '🧪', label: 'Chimie', color: '#a78bfa' },
  mathematiques: { emoji: '📐', label: 'Mathématiques', color: '#fbbf24' },
};

// ─── Onglet Saisie manuelle ───────────────────────────────────────────────────
function ManualTab({ nbQ, answers, startQ, meta, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
        Sélectionnez la réponse pour chaque question (A–E).
      </div>
      <div className="answer-grid" style={{ gridTemplateColumns: `repeat(${Math.min(nbQ, 5)}, 1fr)` }}>
        {answers.map((v, i) => (
          <div key={i} className="answer-cell">
            <label style={{ color: v ? meta.color : 'var(--text3)' }}>
              Q{startQ + i}
            </label>
            <select
              value={v}
              onChange={e => onChange(i, e.target.value)}
              style={{ borderColor: v ? meta.color + '55' : undefined }}
            >
              <option value="">—</option>
              {['A', 'B', 'C', 'D', 'E'].map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Onglet Upload image ──────────────────────────────────────────────────────
function UploadTab({ startQ, nbQ, onExtracted }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setExtracted(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.type.startsWith('image/') || f.type === 'application/pdf')) {
      handleFile(f);
    }
  };

  const extract = async () => {
    if (!file) return;
    setExtracting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('startQ', startQ);
      formData.append('nbQuestions', nbQ);

      const res = await axios.post(`${API}/api/answers/extract-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      if (res.data.success && res.data.answers) {
        setExtracted(res.data.answers);
        onExtracted(res.data.answers);
      } else {
        setError('Extraction impossible. Vérifiez la qualité de l\'image.');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de l\'extraction IA.');
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>
        Photographiez ou scannez votre grille de réponses. L'IA extraira les réponses automatiquement.
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${file ? '#34d399' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          padding: '24px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: file ? 'rgba(52,211,153,0.05)' : 'var(--bg2)',
          transition: 'all .2s',
          marginBottom: 14,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
        {file ? (
          <>
            <FaCheckCircle style={{ fontSize: 28, color: '#34d399', marginBottom: 8 }} />
            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{file.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
              Cliquez pour changer l'image
            </div>
          </>
        ) : (
          <>
            <FaUpload style={{ fontSize: 28, color: 'var(--text3)', marginBottom: 8 }} />
            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>
              Glissez-déposez ou cliquez pour sélectionner
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
              JPG, PNG, PDF · Max 10 Mo
            </div>
          </>
        )}
      </div>

      {preview && preview.startsWith('data:image') && (
        <div style={{ marginBottom: 14, textAlign: 'center' }}>
          <img
            src={preview}
            alt="Aperçu grille"
            style={{
              maxHeight: 220, maxWidth: '100%', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', objectFit: 'contain'
            }}
          />
        </div>
      )}

      <button
        className="btn btn-primary"
        style={{ width: '100%' }}
        onClick={extract}
        disabled={!file || extracting}
      >
        {extracting
          ? <><FaSpinner className="spin" /> Extraction en cours…</>
          : <><FaCamera /> Extraire les réponses par IA</>
        }
      </button>

      {error && (
        <div style={{
          marginTop: 12, padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
          fontSize: 13, color: '#f87171'
        }}>
          ⚠️ {error}
        </div>
      )}

      {extracted && (
        <div style={{
          marginTop: 14, padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>
            ✅ Extraction réussie — vérifiez dans l'onglet "Saisie manuelle"
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {Object.entries(extracted).map(([k, v]) => (
              <span key={k} style={{
                padding: '3px 8px', borderRadius: 4, fontSize: 11,
                background: 'rgba(52,211,153,0.15)', color: '#34d399',
                fontFamily: 'var(--mono)', fontWeight: 700
              }}>
                {k}:{v}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AnswerSheet({ epreuve, concours, onClose, onSuccess }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('manual');
  const [answers, setAnswers] = useState([]);
  const [answerId, setAnswerId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [toast, setToast] = useState(null);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [codeCandidat, setCodeCandidat] = useState('');

  const nbQ = epreuve?.nbQuestionsParBloc || 20;
  const order = epreuve?.realOrder ?? epreuve?.order ?? 0;
  const startQ = order * nbQ + 1;
  const blocIndex = order + 1;
  const meta = SUBJECT_META[epreuve.subject] || { emoji: '📄', label: epreuve.subject, color: '#4f8ef7' };

  useEffect(() => {
    if (user?.name) {
      const parts = user.name.split(' ');
      setPrenom(parts[0] || '');
      setNom(parts.slice(1).join(' ') || '');
    }
    setAnswers(Array(nbQ).fill(''));
    loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epreuve._id, nbQ]);

  const loadExisting = async () => {
    try {
      const res = await axios.get(`${API}/api/answers`, { params: { concoursId: concours._id } });
      const found = res.data.data?.find(a => a.epreuve?._id === epreuve._id);
      if (found) {
        setAnswerId(found._id);
        if (found.nom) setNom(found.nom);
        if (found.prenom) setPrenom(found.prenom);
        if (found.code_candidat) setCodeCandidat(found.code_candidat);

        if (found.answers && typeof found.answers === 'object') {
          const arr = Array(nbQ).fill('');
          for (let i = 0; i < nbQ; i++) {
            arr[i] = found.answers[`Q${startQ + i}`] || '';
          }
          setAnswers(arr);
        }
      }
    } catch (_) {}
  };

  const handleExtracted = (extractedObj) => {
    const arr = Array(nbQ).fill('');
    for (let i = 0; i < nbQ; i++) {
      const key = `Q${startQ + i}`;
      arr[i] = extractedObj[key] || extractedObj[`Q${i + 1}`] || '';
    }
    setAnswers(arr);
    setTab('manual');
    showToast('Réponses extraites — vérifiez et corrigez si besoin, puis sauvegardez.');
  };

  const saveAnswers = async () => {
    if (!prenom.trim() || !nom.trim()) {
      showToast('Veuillez entrer votre nom et prénom', 'error');
      return;
    }
    setStatus('saving');
    try {
      const obj = {};
      answers.forEach((v, i) => { obj[`Q${startQ + i}`] = v || ''; });

      const res = await axios.post(`${API}/api/answers`, {
        concoursId: concours._id,
        epreuveId: epreuve._id,
        answers: obj,
        nom, prenom,
        code_candidat: codeCandidat || `CAND${Date.now()}`,
      });
      setAnswerId(res.data.answer._id);
      showToast('Réponses sauvegardées !');
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setStatus('idle');
    }
  };

  const triggerFeedback = async () => {
    if (!answerId) { showToast('Sauvegardez d\'abord vos réponses', 'error'); return; }
    setStatus('triggering');
    try {
      await axios.post(`${API}/api/answers/${answerId}/trigger`);
      showToast('Feedback en cours de génération… Consultez l\'Historique dans quelques instants.');
      setTimeout(() => { onClose(); if (onSuccess) onSuccess(); }, 3000);
    } catch {
      showToast('Erreur lors du déclenchement', 'error');
    } finally {
      setStatus('idle');
    }
  };

  const handleChange = (i, v) => {
    const next = [...answers];
    next[i] = v.toUpperCase();
    setAnswers(next);
  };

  const answered = answers.filter(v => v).length;
  const pct = nbQ > 0 ? Math.round((answered / nbQ) * 100) : 0;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const tabStyle = (t) => ({
    padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    color: tab === t ? meta.color : 'var(--text3)',
    background: 'transparent', border: 'none',
    borderBottom: `2px solid ${tab === t ? meta.color : 'transparent'}`,
    transition: 'all .15s',
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal-lg animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-header" style={{ background: 'var(--bg3)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{meta.emoji}</span>
            <div>
              <h3 style={{ color: 'var(--text)', margin: 0, textTransform: 'capitalize' }}>{meta.label}</h3>
              <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>
                {concours.title} — Bloc {blocIndex} (Q{startQ} à Q{startQ + nbQ - 1})
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><FaTimes /></button>
        </div>

        <div style={{ padding: '10px 24px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 5 }}>
            <span>{answered}/{nbQ} réponses</span>
            <span style={{ fontWeight: 700 }}>{pct}%</span>
          </div>
          <div className="progress" style={{ height: 4 }}>
            <div className="progress-bar" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div style={{
          display: 'flex', borderBottom: '1px solid var(--border)',
          background: 'var(--bg2)', flexShrink: 0
        }}>
          <button style={tabStyle('manual')} onClick={() => setTab('manual')}>
            <FaKeyboard style={{ marginRight: 6, fontSize: 11 }} /> Saisie manuelle
          </button>
          <button style={tabStyle('upload')} onClick={() => setTab('upload')}>
            <FaCamera style={{ marginRight: 6, fontSize: 11 }} /> Upload &amp; extraction IA
          </button>
        </div>

        <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: 20 }}>
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaUser style={{ fontSize: 11 }} /> Informations candidat
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                ['Prénom *', prenom, setPrenom],
                ['Nom *', nom, setNom],
                ['Code candidat', codeCandidat, setCodeCandidat],
              ].map(([lbl, val, set]) => (
                <div className="form-group" style={{ margin: 0 }} key={lbl}>
                  <label className="form-label">{lbl}</label>
                  <input className="form-input" value={val} onChange={e => set(e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          {tab === 'manual'
            ? <ManualTab nbQ={nbQ} answers={answers} startQ={startQ} meta={meta} onChange={handleChange} />
            : <UploadTab startQ={startQ} nbQ={nbQ} onExtracted={handleExtracted} />
          }
        </div>

        <div className="modal-footer" style={{ flexShrink: 0, flexWrap: 'wrap', gap: 10 }}>
          <button className="btn btn-ghost" onClick={onClose}>Fermer</button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-success" onClick={saveAnswers} disabled={status === 'saving'}>
            {status === 'saving' ? 'Sauvegarde…' : <><FaSave /> Sauvegarder</>}
          </button>
          <button
            className="btn btn-primary"
            onClick={triggerFeedback}
            disabled={status === 'triggering' || !answerId}
          >
            {status === 'triggering' ? 'Envoi…' : <><FaMagic /> Générer feedback</>}
          </button>
        </div>

        {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      </div>
    </div>
  );
}