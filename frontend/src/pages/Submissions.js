// pages/Submissions.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaArrowRight, FaCalendarAlt } from 'react-icons/fa';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const StatusBadge = ({ status }) => {
  if (status === 'completed') return <span className="badge badge-success">✅ Feedback reçu</span>;
  if (status === 'processing' || status === 'pending') return <span className="badge badge-warning">⏳ En traitement</span>;
  if (status === 'saved') return <span className="badge badge-info">💾 Sauvegardé</span>;
  return <span className="badge badge-danger">❌ Échec</span>;
};

export function Submissions() {
  const [subs, setSubs]     = useState([]);
  const [loading, setLoad]  = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await axios.get(`${API}/api/answers`);
      setSubs(res.data.data || []);
    } catch (_) {}
    finally { setLoad(false); }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>
          <span className="icon"><FaClipboardList /></span>
          Mes soumissions
        </h1>
        <p>Suivi de toutes vos réponses et feedbacks reçus.</p>
      </div>

      <div className="card">
        {loading ? (
          <div className="page-loading" style={{ minHeight:300 }}>
            <span className="spinner spinner-lg" />
            <span>Chargement...</span>
          </div>
        ) : subs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>Aucune soumission pour le moment</h3>
            <p>Répondez à une épreuve pour voir vos résultats ici.</p>
            <Link to="/exams" className="btn btn-primary" style={{ marginTop:20 }}>
              Voir les épreuves
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Matière</th>
                  <th>Concours</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(sub => (
                  <tr key={sub._id}>
                    <td>
                      <span style={{ fontWeight:600, color:'var(--text)', textTransform:'capitalize' }}>
                        {sub.epreuve?.subject || '—'}
                      </span>
                    </td>
                    <td style={{ color:'var(--text3)', fontSize:13 }}>{sub.concours?.title || '—'}</td>
                    <td>
                      <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text3)' }}>
                        <FaCalendarAlt style={{ fontSize:11 }} />
                        {new Date(sub.updatedAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })}
                      </span>
                    </td>
                    <td><StatusBadge status={sub.status} /></td>
                    <td>
                      {sub.status === 'completed' && (
                        <Link
                          to={`/submissions/${sub._id}`}
                          className="btn btn-ghost btn-sm"
                          style={{ gap:6 }}
                        >
                          Voir <FaArrowRight style={{ fontSize:11 }} />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

// pages/SubmissionDetail.js
export function SubmissionDetail() {
  const [sub, setSub]       = useState(null);
  const [loading, setLoad]  = useState(true);
  const id = window.location.pathname.split('/').pop();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await axios.get(`${API}/api/answers/${id}/feedback`);
      setSub(res.data.data);
    } catch (_) {}
    finally { setLoad(false); }
  };

  if (loading) return <Layout><div className="page-loading"><span className="spinner spinner-lg" /></div></Layout>;
  if (!sub)    return <Layout><div className="card"><div className="empty-state"><h3>Soumission introuvable</h3></div></div></Layout>;

  const feedback = sub.result?.feedback || {};
  const questions = feedback.questions || [];

  return (
    <Layout>
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        {/* Back */}
        <Link to="/submissions" className="btn btn-ghost btn-sm" style={{ marginBottom:20 }}>
          ← Retour
        </Link>

        {/* Header */}
        <div className="card" style={{ marginBottom:20 }}>
          <div className="card-header">
            <div>
              <h2 style={{ fontWeight:700, color:'var(--text)', textTransform:'capitalize', marginBottom:4 }}>
                {sub.epreuve?.subject || 'Résultats'}
              </h2>
              <p style={{ fontSize:13, color:'var(--text3)' }}>{sub.concours?.title}</p>
            </div>
            <div style={{ textAlign:'right' }}>
              {sub.result?.score !== undefined && (
                <div style={{ fontSize:36, fontWeight:800, color:'var(--accent)', fontFamily:'JetBrains Mono, monospace' }}>
                  {sub.result.score}<span style={{ fontSize:18, color:'var(--text3)' }}>/{sub.result.nb_questions || 20}</span>
                </div>
              )}
              {sub.result?.mention && (
                <span className="badge badge-info" style={{ marginTop:4 }}>{sub.result.mention}</span>
              )}
            </div>
          </div>

          {sub.result?.score !== undefined && (
            <div style={{ padding:'16px 24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text3)', marginBottom:8 }}>
                <span>Score</span>
                <span style={{ fontWeight:700, color:'var(--accent)' }}>
                  {Math.round((sub.result.score / (sub.result.nb_questions || 20)) * 100)}%
                </span>
              </div>
              <div className="progress" style={{ height:8 }}>
                <div
                  className="progress-bar"
                  style={{ width:`${Math.round((sub.result.score / (sub.result.nb_questions || 20)) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Feedback by question */}
        {questions.length > 0 && (
          <div className="card" style={{ marginBottom:20 }}>
            <div className="card-header">
              <span style={{ fontWeight:700, color:'var(--text)' }}>Analyse par question</span>
            </div>
            <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:8 }}>
              {questions.map(q => (
                <div
                  key={q.num}
                  className={`feedback-question ${q.resultat?.includes('✅') ? 'correct' : 'wrong'}`}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                    <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, color:'var(--text3)', fontWeight:700 }}>
                      {q.num}
                    </span>
                    <span style={{ fontSize:15 }}>{q.resultat?.includes('✅') ? '✅' : '❌'}</span>
                    <span style={{ fontSize:13, color:'var(--text2)', flex:1 }}>{q.theme}</span>
                    {q.type_piege && q.type_piege !== 'Cle' && (
                      <span className="badge badge-warning" style={{ fontSize:10 }}>{q.type_piege}</span>
                    )}
                  </div>
                  {q.retour_personnalise && (
                    <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>{q.retour_personnalise}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Synthesis */}
        {feedback.synthese?.texte_global && (
          <div className="card">
            <div className="card-header">
              <span style={{ fontWeight:700, color:'var(--text)' }}>Synthèse globale</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.8 }}>
                {feedback.synthese.texte_global}
              </p>
              {feedback.synthese?.message_motivation && (
                <div style={{ marginTop:16, padding:'14px 16px', background:'rgba(79,142,247,0.08)', border:'1px solid rgba(79,142,247,0.2)', borderRadius:'var(--radius-sm)', fontSize:14, color:'var(--accent)', fontWeight:500 }}>
                  💪 {feedback.synthese.message_motivation}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}