// pages/History.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import {
  FaHistory, FaEdit, FaTrash, FaMagic, FaChevronDown,
  FaChevronRight, FaArrowRight, FaPlus, FaUpload,
  FaCheckCircle, FaClock, FaTimesCircle, FaSave, FaTimes
} from 'react-icons/fa';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SUBJECT_META = {
  svt:           { emoji: '🧬', label: 'SVT',          color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  physique:      { emoji: '⚡', label: 'Physique',      color: '#4f8ef7', bg: 'rgba(79,142,247,0.12)'  },
  chimie:        { emoji: '🧪', label: 'Chimie',        color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  mathematiques: { emoji: '📐', label: 'Mathématiques', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
};

/* ──────────────────────────────────────────
   Mini composants
────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    completed:  { icon: <FaCheckCircle />, label: 'Feedback reçu',   cls: 'badge-success' },
    processing: { icon: <FaClock />,       label: 'En traitement',   cls: 'badge-warning' },
    saved:      { icon: <FaSave />,        label: 'Sauvegardé',      cls: 'badge-info'    },
    failed:     { icon: <FaTimesCircle />, label: 'Échec',           cls: 'badge-danger'  },
  };
  const s = map[status] || map.saved;
  return (
    <span className={`badge ${s.cls}`} style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
      {s.icon} {s.label}
    </span>
  );
};

const ScoreBar = ({ score, total = 20 }) => {
  if (score === undefined || score === null) return null;
  const pct  = Math.round((score / total) * 100);
  const color = pct >= 70 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171';
  return (
    <div style={{ minWidth: 90 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
        <span style={{ color:'var(--text3)' }}>{score}/{total}</span>
        <span style={{ color, fontWeight:700 }}>{pct}%</span>
      </div>
      <div style={{ height:5, borderRadius:3, background:'var(--bg3)', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3, transition:'width .4s' }} />
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────
   Modal édition inline des réponses
────────────────────────────────────────── */
function EditModal({ answer, onClose, onSaved }) {
  const ep       = answer.epreuve;
  const order    = ep?.order ?? 0;
  const startQ   = order * 20 + 1;
  const meta     = SUBJECT_META[ep?.subject] || { emoji:'📄', label: ep?.subject, color:'#4f8ef7' };

  // Reconstruire tableau 20 cases depuis l'objet answers
  const buildArr = (obj) => {
    const arr = Array(20).fill('');
    for (let i = 0; i < 20; i++) {
      arr[i] = obj?.[`Q${startQ + i}`] || '';
    }
    return arr;
  };

  const [arr,     setArr]     = useState(buildArr(answer.answers));
  const [nom,     setNom]     = useState(answer.nom     || '');
  const [prenom,  setPrenom]  = useState(answer.prenom  || '');
  const [code,    setCode]    = useState(answer.code_candidat || '');
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);

  const show = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (i, v) => {
    const next = [...arr];
    next[i] = v.toUpperCase();
    setArr(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      const obj = {};
      arr.forEach((v, i) => { obj[`Q${startQ + i}`] = v || ''; });

      await axios.put(`${API}/api/answers/${answer._id}`, {
        answers: obj, nom, prenom, code_candidat: code,
        concoursId: answer.concours?._id || answer.concours,
        epreuveId:  ep?._id || ep,
      });
      show('Réponses mises à jour !');
      setTimeout(() => { onSaved(); onClose(); }, 1200);
    } catch {
      show('Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const answered = arr.filter(v => v).length;
  const pct = Math.round((answered / 20) * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg animate-slide-up"
           onClick={e => e.stopPropagation()}
           style={{ maxHeight:'92vh', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div className="modal-header" style={{ background:'var(--bg3)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:22 }}>{meta.emoji}</span>
            <div>
              <h3 style={{ color:'var(--text)', margin:0 }}>Modifier — {meta.label}</h3>
              <p style={{ fontSize:12, color:'var(--text3)', margin:0 }}>
                Q{startQ} à Q{startQ + 19} · {answer.concours?.title || ''}
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><FaTimes /></button>
        </div>

        {/* Progress */}
        <div style={{ padding:'10px 24px', background:'var(--bg3)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text3)', marginBottom:5 }}>
            <span>{answered}/20 réponses renseignées</span>
            <span style={{ fontWeight:700 }}>{pct}%</span>
          </div>
          <div className="progress" style={{ height:4 }}>
            <div className="progress-bar" style={{ width:`${pct}%` }} />
          </div>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ overflowY:'auto', flex:1 }}>
          {/* Infos candidat */}
          <div style={{ marginBottom:20 }}>
            <div className="section-title" style={{ fontSize:12, marginBottom:10 }}>Informations candidat</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              {[['Prénom', prenom, setPrenom], ['Nom', nom, setNom], ['Code candidat', code, setCode]].map(([lbl, val, set]) => (
                <div className="form-group" style={{ margin:0 }} key={lbl}>
                  <label className="form-label">{lbl}</label>
                  <input className="form-input" value={val} onChange={e => set(e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          {/* Grille */}
          <div>
            <div className="section-title" style={{ fontSize:12, marginBottom:10 }}>
              Grille de réponses — Q{startQ} à Q{startQ + 19}
            </div>
            <div className="answer-grid">
              {arr.map((v, i) => (
                <div key={i} className="answer-cell">
                  <label style={{ color: v ? meta.color : 'var(--text3)' }}>Q{startQ + i}</label>
                  <select
                    value={v}
                    onChange={e => handleChange(i, e.target.value)}
                    style={{ borderColor: v ? meta.color + '66' : undefined }}
                  >
                    <option value="">—</option>
                    {['A','B','C','D','E'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ flexShrink:0 }}>
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-success" onClick={save} disabled={saving}>
            {saving ? 'Sauvegarde...' : <><FaSave /> Enregistrer les modifications</>}
          </button>
        </div>

        {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Modal confirmation suppression
────────────────────────────────────────── */
function DeleteModal({ answer, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const ep   = answer.epreuve;
  const meta = SUBJECT_META[ep?.subject] || { emoji:'📄', label: ep?.subject };

  const confirm = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/answers/${answer._id}`);
      onDeleted();
      onClose();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-slide-up" style={{ maxWidth:420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ color:'var(--text)' }}>Supprimer cette épreuve ?</h3>
          <button className="btn-icon" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">
          <div style={{
            padding:'14px 16px', borderRadius:'var(--radius-sm)',
            background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)',
            marginBottom:16, display:'flex', alignItems:'center', gap:12
          }}>
            <span style={{ fontSize:24 }}>{meta.emoji}</span>
            <div>
              <div style={{ fontWeight:700, color:'var(--text)', fontSize:14 }}>{meta.label}</div>
              <div style={{ fontSize:12, color:'var(--text3)' }}>
                {answer.concours?.title} · {answer.nom} {answer.prenom}
              </div>
            </div>
          </div>
          <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>
            Cette action est <strong>irréversible</strong>. Les réponses et le feedback associés seront définitivement supprimés.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button
            className="btn"
            style={{ background:'#f87171', color:'#fff', border:'none' }}
            onClick={confirm}
            disabled={deleting}
          >
            {deleting ? 'Suppression...' : <><FaTrash /> Supprimer définitivement</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Ligne d'une épreuve
────────────────────────────────────────── */
function EpreuveRow({ sub, onEdit, onDelete, onTrigger, triggering }) {
  const [expanded, setExpanded] = useState(false);
  const ep    = sub.epreuve;
  const meta  = SUBJECT_META[ep?.subject] || { emoji:'📄', label: ep?.subject || '—', color:'#4f8ef7', bg:'rgba(79,142,247,0.12)' };
  const order = ep?.order ?? 0;
  const startQ = order * 20 + 1;

  // Aperçu des 20 réponses
  const answers = sub.answers || {};
  const cells = Array.from({ length: 20 }, (_, i) => ({
    key:  `Q${startQ + i}`,
    val:  answers[`Q${startQ + i}`] || '',
  }));

  const feedback  = sub.result?.feedback;
  const questions = feedback?.questions || [];

  return (
    <div style={{
      border:'1px solid var(--border)', borderRadius:'var(--radius)',
      overflow:'hidden', marginBottom:10,
      transition:'box-shadow .2s',
    }}>
      {/* Row principale */}
      <div
        style={{
          display:'flex', alignItems:'center', gap:14,
          padding:'13px 18px', cursor:'pointer',
          background:'var(--bg2)',
        }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Toggle */}
        <span style={{ color:'var(--text3)', fontSize:12, flexShrink:0 }}>
          {expanded ? <FaChevronDown /> : <FaChevronRight />}
        </span>

        {/* Matière */}
        <span style={{
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          width:36, height:36, borderRadius:'var(--radius-sm)',
          background: meta.bg, fontSize:18, flexShrink:0
        }}>{meta.emoji}</span>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, color:'var(--text)', fontSize:14 }}>
            {meta.label}
            <span style={{ marginLeft:8, fontSize:11, color:'var(--text3)', fontWeight:400 }}>
              Q{startQ}–Q{startQ + 19}
            </span>
          </div>
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>
            {sub.prenom} {sub.nom}
            {sub.code_candidat ? ` · ${sub.code_candidat}` : ''}
            {' · '}
            {new Date(sub.updatedAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })}
          </div>
        </div>

        {/* Score */}
        {sub.result?.score !== undefined && (
          <ScoreBar score={sub.result.score} total={sub.result.nb_questions || 20} />
        )}

        {/* Statut */}
        <div style={{ flexShrink:0 }}>
          <StatusBadge status={sub.status} />
        </div>

        {/* Actions — stopper propagation du clic expand */}
        <div
          style={{ display:'flex', gap:6, flexShrink:0 }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="btn btn-ghost btn-sm"
            title="Modifier les réponses"
            onClick={() => onEdit(sub)}
            style={{ padding:'5px 9px' }}
          >
            <FaEdit style={{ fontSize:12 }} />
          </button>
          <button
            className="btn btn-sm"
            title="Générer / Regénérer le feedback IA"
            onClick={() => onTrigger(sub)}
            disabled={triggering === sub._id}
            style={{
              background:'rgba(79,142,247,0.12)', color:'var(--accent)',
              border:'1px solid rgba(79,142,247,0.25)', padding:'5px 10px',
              opacity: triggering === sub._id ? .5 : 1
            }}
          >
            {triggering === sub._id
              ? <><FaClock style={{ fontSize:11 }} /> Envoi...</>
              : <><FaMagic style={{ fontSize:11 }} /> Feedback</>
            }
          </button>
          <button
            className="btn btn-sm"
            title="Supprimer"
            onClick={() => onDelete(sub)}
            style={{ background:'rgba(248,113,113,0.1)', color:'#f87171', border:'1px solid rgba(248,113,113,0.2)', padding:'5px 9px' }}
          >
            <FaTrash style={{ fontSize:12 }} />
          </button>
        </div>
      </div>

      {/* Détail expandé */}
      {expanded && (
        <div style={{ background:'var(--bg1)', borderTop:'1px solid var(--border)', padding:'16px 18px' }}>

          {/* Grille de réponses visuelle */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>
              Réponses saisies
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {cells.map(({ key, val }) => (
                <div key={key} style={{
                  display:'flex', flexDirection:'column', alignItems:'center',
                  width:44, padding:'6px 4px', borderRadius:'var(--radius-sm)',
                  background: val ? meta.bg : 'var(--bg2)',
                  border: `1px solid ${val ? meta.color + '44' : 'var(--border)'}`,
                }}>
                  <span style={{ fontSize:9, color:'var(--text3)', fontWeight:600 }}>{key}</span>
                  <span style={{
                    fontSize:15, fontWeight:800, marginTop:2,
                    color: val ? meta.color : 'var(--text3)',
                    fontFamily:'var(--mono)'
                  }}>{val || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback par question si disponible */}
          {questions.length > 0 && (
            <div>
              <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>
                Analyse par question
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {questions.map(q => {
                  const ok = q.resultat?.includes('✅');
                  return (
                    <div key={q.num} style={{
                      display:'flex', gap:10, padding:'9px 12px',
                      borderRadius:'var(--radius-sm)',
                      background: ok ? 'rgba(52,211,153,0.07)' : 'rgba(248,113,113,0.07)',
                      border: `1px solid ${ok ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                    }}>
                      <span style={{ fontSize:14, flexShrink:0, marginTop:1 }}>{ok ? '✅' : '❌'}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:3 }}>
                          <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)', fontWeight:700 }}>{q.num}</span>
                          {q.theme && <span style={{ fontSize:11, color:'var(--text2)' }}>{q.theme}</span>}
                          {q.type_piege && q.type_piege !== 'Cle' && (
                            <span className="badge badge-warning" style={{ fontSize:9 }}>{q.type_piege}</span>
                          )}
                        </div>
                        {q.retour_personnalise && (
                          <p style={{ fontSize:12, color:'var(--text2)', margin:0, lineHeight:1.55 }}>{q.retour_personnalise}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Synthèse */}
          {feedback?.synthese?.texte_global && (
            <div style={{
              marginTop:14, padding:'12px 14px',
              background:'rgba(79,142,247,0.07)', border:'1px solid rgba(79,142,247,0.18)',
              borderRadius:'var(--radius-sm)'
            }}>
              <div style={{ fontSize:11, color:'var(--accent)', fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>
                Synthèse
              </div>
              <p style={{ fontSize:13, color:'var(--text2)', margin:0, lineHeight:1.65 }}>
                {feedback.synthese.texte_global}
              </p>
              {feedback.synthese?.message_motivation && (
                <p style={{ fontSize:13, color:'var(--accent)', fontWeight:500, marginTop:8, marginBottom:0 }}>
                  💪 {feedback.synthese.message_motivation}
                </p>
              )}
            </div>
          )}

          {/* Lien vers la page détail si completed */}
          {sub.status === 'completed' && (
            <div style={{ marginTop:14, textAlign:'right' }}>
              <Link to={`/submissions/${sub._id}`} className="btn btn-ghost btn-sm" style={{ gap:6 }}>
                Voir le rapport complet <FaArrowRight style={{ fontSize:10 }} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────
   Page principale History
────────────────────────────────────────── */
export default function History() {
  const [answers,   setAnswers]   = useState([]);
  const [concours,  setConcours]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const [triggering,setTriggering]= useState(null); // answerId en cours

  // Modals
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filtre
  const [filterConcours, setFilterConcours] = useState('all');
  const [filterSubject,  setFilterSubject]  = useState('all');
  const [filterStatus,   setFilterStatus]   = useState('all');

  const show = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    try {
      const [ansRes, conRes] = await Promise.all([
        axios.get(`${API}/api/answers`),
        axios.get(`${API}/api/concours`),
      ]);
      setAnswers(ansRes.data.data || []);
      setConcours(conRes.data || []);
    } catch { show('Erreur lors du chargement', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleTrigger = async (sub) => {
    setTriggering(sub._id);
    try {
      await axios.post(`${API}/api/answers/${sub._id}/trigger`);
      show('Feedback en cours de génération…');
      // Mettre à jour le statut localement
      setAnswers(prev => prev.map(a =>
        a._id === sub._id ? { ...a, status: 'processing' } : a
      ));
    } catch {
      show('Erreur lors du déclenchement', 'error');
    } finally {
      setTriggering(null);
    }
  };

  // Filtrage
  const filtered = answers.filter(a => {
    if (filterConcours !== 'all' && (a.concours?._id || a.concours) !== filterConcours) return false;
    if (filterSubject  !== 'all' && a.epreuve?.subject !== filterSubject)                return false;
    if (filterStatus   !== 'all' && a.status !== filterStatus)                           return false;
    return true;
  });

  // Grouper par concours
  const grouped = {};
  filtered.forEach(sub => {
    const cid   = sub.concours?._id || sub.concours || 'unknown';
    const title = sub.concours?.title || '—';
    const year  = sub.concours?.year  || '';
    if (!grouped[cid]) grouped[cid] = { cid, title, year, subs: [] };
    grouped[cid].subs.push(sub);
  });

  // Trier par date la plus récente
  const groups = Object.values(grouped).sort((a, b) => {
    const dA = Math.max(...a.subs.map(s => new Date(s.updatedAt)));
    const dB = Math.max(...b.subs.map(s => new Date(s.updatedAt)));
    return dB - dA;
  });

  // Stats rapides
  const total     = answers.length;
  const completed = answers.filter(a => a.status === 'completed').length;
  const pending   = answers.filter(a => ['processing','saved'].includes(a.status)).length;
  const avgScore  = (() => {
    const withScore = answers.filter(a => a.result?.score !== undefined);
    if (!withScore.length) return null;
    const sum = withScore.reduce((acc, a) => acc + (a.result.score / (a.result.nb_questions || 20)) * 100, 0);
    return Math.round(sum / withScore.length);
  })();

  return (
    <Layout>
      {/* ── En-tête ── */}
      <div className="page-header" style={{ marginBottom:24 }}>
        <h1>
          <span className="icon"><FaHistory /></span>
          Historique des réponses
        </h1>
        <p>Consultez, modifiez ou relancez le feedback IA pour chaque épreuve répondue.</p>
      </div>

      {/* ── Stats rapides ── */}
      {!loading && total > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:24 }}>
          {[
            { label:'Épreuves répondues', value: total,     color:'#4f8ef7' },
            { label:'Feedbacks reçus',    value: completed, color:'#34d399' },
            { label:'En attente',         value: pending,   color:'#fbbf24' },
            { label:'Score moyen',        value: avgScore !== null ? `${avgScore}%` : '—', color:'#a78bfa' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding:'16px 18px', margin:0, textAlign:'center' }}>
              <div style={{ fontSize:26, fontWeight:800, color: s.color, fontFamily:'var(--mono)' }}>
                {s.value}
              </div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filtres ── */}
      <div className="card" style={{ padding:'14px 18px', marginBottom:18, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <span style={{ fontSize:12, color:'var(--text3)', fontWeight:600 }}>Filtrer :</span>

        <select
          className="form-input"
          style={{ flex:1, minWidth:160, maxWidth:260, padding:'6px 10px', fontSize:13 }}
          value={filterConcours}
          onChange={e => setFilterConcours(e.target.value)}
        >
          <option value="all">Tous les concours</option>
          {concours.map(c => (
            <option key={c._id} value={c._id}>{c.title} ({c.year})</option>
          ))}
        </select>

        <select
          className="form-input"
          style={{ flex:1, minWidth:140, maxWidth:200, padding:'6px 10px', fontSize:13 }}
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
        >
          <option value="all">Toutes les matières</option>
          {Object.entries(SUBJECT_META).map(([k, v]) => (
            <option key={k} value={k}>{v.emoji} {v.label}</option>
          ))}
        </select>

        <select
          className="form-input"
          style={{ flex:1, minWidth:140, maxWidth:200, padding:'6px 10px', fontSize:13 }}
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="saved">💾 Sauvegardé</option>
          <option value="processing">⏳ En traitement</option>
          <option value="completed">✅ Feedback reçu</option>
          <option value="failed">❌ Échec</option>
        </select>

        {(filterConcours !== 'all' || filterSubject !== 'all' || filterStatus !== 'all') && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setFilterConcours('all'); setFilterSubject('all'); setFilterStatus('all'); }}
          >
            Réinitialiser
          </button>
        )}

        <div style={{ flex:1 }} />
        <Link to="/exams" className="btn btn-primary btn-sm">
          <FaPlus /> Nouvelle épreuve
        </Link>
      </div>

      {/* ── Contenu ── */}
      {loading ? (
        <div className="page-loading" style={{ minHeight:300 }}>
          <span className="spinner spinner-lg" />
          <span>Chargement de l'historique…</span>
        </div>
      ) : groups.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>{total === 0 ? 'Aucune réponse enregistrée' : 'Aucun résultat pour ces filtres'}</h3>
            <p>{total === 0
              ? 'Commencez par répondre à une épreuve depuis la bibliothèque.'
              : "Modifiez les filtres ci-dessus pour afficher d'autres épreuves."
            }</p>
            {total === 0 && (
              <Link to="/exams" className="btn btn-primary" style={{ marginTop:16 }}>
                Voir les épreuves
              </Link>
            )}
          </div>
        </div>
      ) : (
        groups.map(group => {
          const allDone = group.subs.every(s => s.status === 'completed');
          const doneCnt = group.subs.filter(s => s.status === 'completed').length;
          return (
            <div key={group.cid} style={{ marginBottom:32 }}>
              {/* En-tête du groupe */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <div style={{ flex:1 }}>
                  <h2 style={{ fontSize:16, fontWeight:700, color:'var(--text)', margin:0 }}>
                    {group.title}
                    <span style={{ fontSize:12, color:'var(--text3)', fontWeight:400, marginLeft:8 }}>
                      {group.year}
                    </span>
                  </h2>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                    <div style={{ height:4, width:100, borderRadius:2, background:'var(--bg3)', overflow:'hidden' }}>
                      <div style={{
                        height:'100%',
                        width:`${Math.round((doneCnt / group.subs.length) * 100)}%`,
                        background:'#34d399', borderRadius:2
                      }} />
                    </div>
                    <span style={{ fontSize:11, color:'var(--text3)' }}>
                      {doneCnt}/{group.subs.length} feedback{doneCnt > 1 ? 's' : ''} reçu{doneCnt > 1 ? 's' : ''}
                      {allDone && ' · ✅ Complet'}
                    </span>
                  </div>
                </div>
                <span className="badge badge-info" style={{ fontSize:11 }}>
                  {group.subs.length} épreuve{group.subs.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Lignes épreuves */}
              {group.subs
                .slice()
                .sort((a, b) => (a.epreuve?.order ?? 0) - (b.epreuve?.order ?? 0))
                .map(sub => (
                  <EpreuveRow
                    key={sub._id}
                    sub={sub}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                    onTrigger={handleTrigger}
                    triggering={triggering}
                  />
                ))
              }
            </div>
          );
        })
      )}

      {/* ── Modals ── */}
      {editTarget && (
        <EditModal
          answer={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={load}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          answer={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setAnswers(prev => prev.filter(a => a._id !== deleteTarget._id));
            show('Épreuve supprimée.');
          }}
        />
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '⚠️'} {toast.msg}
        </div>
      )}
    </Layout>
  );
}