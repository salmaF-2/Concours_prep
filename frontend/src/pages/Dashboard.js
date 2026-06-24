// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Layout from '../components/Layout';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { FaBook, FaFileAlt, FaCheckCircle, FaClock, FaArrowRight, FaChartLine } from 'react-icons/fa';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// const StatusBadge = ({ status }) => {
//   if (status === 'completed') return <span className="badge badge-success">✅ Feedback reçu</span>;
//   if (status === 'processing' || status === 'pending') return <span className="badge badge-warning">⏳ En traitement</span>;
//   return <span className="badge badge-danger">❌ Échec</span>;
// };

// export default function Dashboard() {
//   const { user } = useAuth();
//   const [stats, setStats] = useState({ totalExams: 0, totalSubs: 0, completed: 0, pending: 0 });
//   const [recent, setRecent] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => { fetchData(); }, []);

//   const fetchData = async () => {
//     try {
//       const [examsRes, subsRes] = await Promise.all([
//         axios.get(`${API}/api/concours`),
//         axios.get(`${API}/api/answers`),
//       ]);
//       const subs = subsRes.data.data || [];
//       setStats({
//         totalExams: examsRes.data.length,
//         totalSubs:  subs.length,
//         completed:  subs.filter(s => s.status === 'completed').length,
//         pending:    subs.filter(s => s.status === 'processing' || s.status === 'saved').length,
//       });
//       setRecent(subs.slice(0, 6));
//     } catch (_) {}
//     finally { setLoading(false); }
//   };

//   const greeting = () => {
//     const h = new Date().getHours();
//     if (h < 12) return 'Bonjour';
//     if (h < 18) return 'Bon après-midi';
//     return 'Bonsoir';
//   };

//   return (
//     <Layout>
//       {/* Welcome */}
//       <div style={{ marginBottom:32 }}>
//         <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
//           <div>
//             <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text)', marginBottom:6 }}>
//               {greeting()}, {user?.name?.split(' ')[0]} 👋
//             </h1>
//             <p style={{ color:'var(--text2)', fontSize:14 }}>
//               Plateforme de préparation aux concours de médecine · Maroc
//             </p>
//           </div>
//           <Link to="/exams" className="btn btn-primary">
//             <FaBook /> Commencer une épreuve
//           </Link>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="stats-grid">
//         <div className="stat-card blue">
//           <div className="stat-icon"><FaBook /></div>
//           <div className="stat-label">Concours disponibles</div>
//           <div className="stat-value">{loading ? '—' : stats.totalExams}</div>
//         </div>
//         <div className="stat-card purple">
//           <div className="stat-icon"><FaFileAlt /></div>
//           <div className="stat-label">Copies soumises</div>
//           <div className="stat-value">{loading ? '—' : stats.totalSubs}</div>
//         </div>
//         <div className="stat-card green">
//           <div className="stat-icon"><FaCheckCircle /></div>
//           <div className="stat-label">Feedbacks reçus</div>
//           <div className="stat-value">{loading ? '—' : stats.completed}</div>
//         </div>
//         <div className="stat-card amber">
//           <div className="stat-icon"><FaClock /></div>
//           <div className="stat-label">En traitement</div>
//           <div className="stat-value">{loading ? '—' : stats.pending}</div>
//         </div>
//       </div>

//       {/* Recent */}
//       <div className="card">
//         <div className="card-header">
//           <div style={{ display:'flex', alignItems:'center', gap:10 }}>
//             <FaChartLine style={{ color:'var(--accent)' }} />
//             <span style={{ fontWeight:700, color:'var(--text)' }}>Activité récente</span>
//           </div>
//           <Link to="/submissions" className="btn btn-ghost btn-sm">
//             Tout voir <FaArrowRight style={{ fontSize:11 }} />
//           </Link>
//         </div>

//         {loading ? (
//           <div className="page-loading" style={{ minHeight:200 }}>
//             <span className="spinner" />
//             <span>Chargement...</span>
//           </div>
//         ) : recent.length === 0 ? (
//           <div className="empty-state">
//             <div className="empty-state-icon">📋</div>
//             <h3>Aucune activité pour le moment</h3>
//             <p>Commencez par répondre à une épreuve</p>
//             <Link to="/exams" className="btn btn-primary" style={{ marginTop:16 }}>
//               Voir les épreuves
//             </Link>
//           </div>
//         ) : (
//           <div className="table-wrap">
//             <table>
//               <thead>
//                 <tr>
//                   <th>Matière</th>
//                   <th>Concours</th>
//                   <th>Date</th>
//                   <th>Statut</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {recent.map(sub => (
//                   <tr key={sub._id}>
//                     <td>
//                       <span style={{ fontWeight:600, color:'var(--text)', textTransform:'capitalize' }}>
//                         {sub.epreuve?.subject || '—'}
//                       </span>
//                     </td>
//                     <td style={{ color:'var(--text3)', fontSize:13 }}>
//                       {sub.concours?.title || '—'}
//                     </td>
//                     <td style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--text3)' }}>
//                       {new Date(sub.updatedAt).toLocaleDateString('fr-FR')}
//                     </td>
//                     <td><StatusBadge status={sub.status} /></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// }

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaBook, FaFileAlt, FaCheckCircle, FaClock,
  FaArrowRight, FaChartLine, FaMagic
} from 'react-icons/fa';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SUBJECT_META = {
  svt:           { emoji: '🧬', label: 'SVT',     color: '#34d399' },
  physique:      { emoji: '⚡', label: 'Physique', color: '#4f8ef7' },
  chimie:        { emoji: '🧪', label: 'Chimie',   color: '#a78bfa' },
  mathematiques: { emoji: '📐', label: 'Maths',    color: '#fbbf24' },
};

const StatusDot = ({ status }) => {
  const map = {
    completed:  { color: '#34d399', label: '✅ Feedback reçu' },
    processing: { color: '#fbbf24', label: '⏳ En traitement' },
    saved:      { color: '#4f8ef7', label: '💾 Sauvegardé'   },
    failed:     { color: '#f87171', label: '❌ Échec'        },
  };
  const s = map[status] || map.saved;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, color: s.color, fontWeight:600 }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background: s.color, display:'inline-block' }} />
      {s.label}
    </span>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState({ totalExams:0, totalSubs:0, completed:0, pending:0 });
  const [history, setHistory] = useState([]); // groupé par concours
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [examsRes, subsRes] = await Promise.all([
        axios.get(`${API}/api/concours`),
        axios.get(`${API}/api/answers`),
      ]);

      const subs = subsRes.data.data || [];

      setStats({
        totalExams: examsRes.data.length,
        totalSubs:  subs.length,
        completed:  subs.filter(s => s.status === 'completed').length,
        pending:    subs.filter(s => ['processing','saved'].includes(s.status)).length,
      });

      // Grouper les soumissions par concours pour l'historique
      const grouped = {};
      subs.forEach(sub => {
        const cid   = sub.concours?._id || 'unknown';
        const ctitle = sub.concours?.title || '—';
        const cyear  = sub.concours?.year  || '';
        if (!grouped[cid]) {
          grouped[cid] = { cid, ctitle, cyear, subjects: [] };
        }
        grouped[cid].subjects.push(sub);
      });

      // Trier par date de dernière activité
      const sorted = Object.values(grouped).sort((a, b) => {
        const dateA = Math.max(...a.subjects.map(s => new Date(s.updatedAt)));
        const dateB = Math.max(...b.subjects.map(s => new Date(s.updatedAt)));
        return dateB - dateA;
      });

      setHistory(sorted);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <Layout>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text)', marginBottom:6 }}>
              {greeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color:'var(--text2)', fontSize:14 }}>
              Plateforme de préparation aux concours de médecine · Maroc
            </p>
          </div>
          <Link to="/exams" className="btn btn-primary">
            <FaBook /> Commencer une épreuve
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card blue">
          <div className="stat-icon"><FaBook /></div>
          <div className="stat-label">Concours disponibles</div>
          <div className="stat-value">{loading ? '—' : stats.totalExams}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon"><FaFileAlt /></div>
          <div className="stat-label">Épreuves répondues</div>
          <div className="stat-value">{loading ? '—' : stats.totalSubs}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><FaCheckCircle /></div>
          <div className="stat-label">Feedbacks reçus</div>
          <div className="stat-value">{loading ? '—' : stats.completed}</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon"><FaClock /></div>
          <div className="stat-label">En attente / traitement</div>
          <div className="stat-value">{loading ? '—' : stats.pending}</div>
        </div>
      </div>

      {/* Historique groupé par concours */}
      <div className="card">
        <div className="card-header">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <FaChartLine style={{ color:'var(--accent)' }} />
            <span style={{ fontWeight:700, color:'var(--text)' }}>
              Historique par concours
            </span>
          </div>
          <Link to="/submissions" className="btn btn-ghost btn-sm">
            Tout voir <FaArrowRight style={{ fontSize:11 }} />
          </Link>
        </div>

        {loading ? (
          <div className="page-loading" style={{ minHeight:200 }}>
            <span className="spinner" /><span>Chargement...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>Aucune activité pour le moment</h3>
            <p>Commencez par répondre à une épreuve</p>
            <Link to="/exams" className="btn btn-primary" style={{ marginTop:16 }}>
              Voir les épreuves
            </Link>
          </div>
        ) : (
          <div style={{ padding: '0 0 8px' }}>
            {history.map(group => {
              const allDone  = group.subjects.every(s => s.status === 'completed');
              const someDone = group.subjects.some(s => s.status === 'completed');
              return (
                <div
                  key={group.cid}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    padding: '16px 24px',
                  }}
                >
                  {/* En-tête du groupe */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <div>
                      <span style={{ fontWeight:700, color:'var(--text)', fontSize:15 }}>
                        {group.ctitle}
                      </span>
                      <span style={{ fontSize:12, color:'var(--text3)', marginLeft:8 }}>
                        {group.cyear}
                      </span>
                    </div>
                    <span style={{ fontSize:12, color:'var(--text3)' }}>
                      {group.subjects.length}/4 matière(s)
                      {allDone && ' · ✅ Complet'}
                      {!allDone && someDone && ' · En cours'}
                    </span>
                  </div>

                  {/* Ligne par matière */}
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {group.subjects.map(sub => {
                      const m       = SUBJECT_META[sub.epreuve?.subject] || { emoji:'📄', label: sub.epreuve?.subject || '—', color:'#4f8ef7' };
                      const ep      = sub.epreuve;
                      const order   = ep?.order ?? 0;
                      const startQ  = order * 20 + 1;
                      const endQ    = (order + 1) * 20;
                      const score   = sub.result?.score;
                      const nb      = sub.result?.nb_questions || 20;
                      const pct     = score !== undefined ? Math.round((score / nb) * 100) : null;

                      return (
                        <div
                          key={sub._id}
                          style={{
                            display:'flex', alignItems:'center', gap:12,
                            padding:'10px 14px',
                            background:'var(--bg2)',
                            borderRadius:'var(--radius-sm)',
                            border:'1px solid var(--border)',
                          }}
                        >
                          {/* Emoji matière */}
                          <span style={{ fontSize:20, flexShrink:0 }}>{m.emoji}</span>

                          {/* Nom + plage */}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:600, color:'var(--text)', fontSize:13, textTransform:'capitalize' }}>
                              {m.label}
                            </div>
                            <div style={{ fontSize:11, color:'var(--text3)' }}>
                              Q{startQ}–Q{endQ} · {new Date(sub.updatedAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>

                          {/* Score si disponible */}
                          {pct !== null && (
                            <div style={{ textAlign:'right', flexShrink:0 }}>
                              <div style={{
                                fontSize:16, fontWeight:800,
                                color: pct >= 70 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171',
                                fontFamily:'var(--mono)'
                              }}>
                                {score}/{nb}
                              </div>
                              <div style={{ fontSize:10, color:'var(--text3)' }}>{pct}%</div>
                            </div>
                          )}

                          {/* Statut + lien */}
                          <div style={{ flexShrink:0, textAlign:'right' }}>
                            <StatusDot status={sub.status} />
                            {sub.status === 'completed' && (
                              <div style={{ marginTop:4 }}>
                                <Link
                                  to={`/submissions/${sub._id}`}
                                  className="btn btn-ghost btn-sm"
                                  style={{ fontSize:11, padding:'3px 8px', gap:4 }}
                                >
                                  Voir <FaArrowRight style={{ fontSize:9 }} />
                                </Link>
                              </div>
                            )}
                            {sub.status === 'saved' && (
                              <div style={{ marginTop:4, fontSize:11, color:'var(--text3)' }}>
                                Déclenchez le feedback depuis Épreuves
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Barre de progression globale du concours */}
                  {group.subjects.length > 0 && (
                    <div style={{ marginTop:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text3)', marginBottom:4 }}>
                        <span>Progression feedback</span>
                        <span>
                          {group.subjects.filter(s => s.status === 'completed').length}/{group.subjects.length} matières
                        </span>
                      </div>
                      <div className="progress" style={{ height:4 }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${Math.round(
                              (group.subjects.filter(s => s.status === 'completed').length / group.subjects.length) * 100
                            )}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}