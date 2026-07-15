import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import {
  History,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Save,
  ClipboardList
} from 'lucide-react';
import { getSubjectMeta } from '../utils/subjectMeta';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const StatusBadge = ({ status }) => {
  const map = {
    completed: { icon: CheckCircle, label: 'Feedback recu', cls: 'badge-success' },
    processing: { icon: Clock, label: 'En traitement', cls: 'badge-warning' },
    saved: { icon: Save, label: 'Sauvegarde', cls: 'badge-info' },
    failed: { icon: XCircle, label: 'Echec', cls: 'badge-danger' },
  };
  const s = map[status] || map.saved;
  const Icon = s.icon;

  return (
    <span className={`badge ${s.cls}`}>
      <Icon size={11} /> {s.label}
    </span>
  );
};

export default function HistoryPage() {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await axios.get(`${API}/api/answers`);
      setAnswers(res.data.data || []);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const grouped = {};
  answers.forEach((sub) => {
    const cid = sub.concours?._id || 'unknown';
    const title = sub.concours?.title || 'Concours';
    const year = sub.concours?.year || '';
    if (!grouped[cid]) grouped[cid] = { cid, title, year, subs: [] };
    grouped[cid].subs.push(sub);
  });

  const groups = Object.values(grouped).sort((a, b) => {
    const dA = Math.max(...a.subs.map((s) => new Date(s.updatedAt)));
    const dB = Math.max(...b.subs.map((s) => new Date(s.updatedAt)));
    return dB - dA;
  });

  return (
    <Layout>
      <div className="page-header">
        <h1>
          <History className="icon" size={20} />
          Historique des reponses
        </h1>
        <p>Consultez toutes vos reponses et feedbacks recus.</p>
      </div>

      {loading ? (
        <div className="page-loading">
          <span className="spinner spinner-lg" />
          <span>Chargement...</span>
        </div>
      ) : groups.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <ClipboardList size={28} />
            </div>
            <h3>Aucune reponse enregistree</h3>
            <p>Commencez par repondre a une epreuve depuis la bibliotheque.</p>
            <Link to="/exams" className="btn btn-primary mt-4">Voir les epreuves</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <div key={group.cid} className="card">
              <div className="card-header">
                <div>
                  <div className="text-sm font-extrabold text-ink">{group.title}</div>
                  <div className="text-xs font-bold text-slate-400">{group.year}</div>
                </div>
                <span className="badge badge-info">
                  {group.subs.length} epreuve{group.subs.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="card-body space-y-2">
                {group.subs.map((sub) => {
                  const meta = getSubjectMeta(sub.epreuve?.subject);
                  const SubjectIcon = meta.Icon;
                  const score = sub.result?.score;
                  const nb = sub.result?.nb_questions || 20;
                  const pct = score !== undefined ? Math.round((score / nb) * 100) : null;

                  return (
                    <div key={sub._id} className="flex items-center gap-3 rounded-xl border border-line bg-slate-50/80 px-3 py-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: meta.bg }}>
                        <SubjectIcon size={17} style={{ color: meta.color }} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-extrabold text-ink">{meta.label}</div>
                        <div className="flex flex-wrap items-center gap-1 text-xs font-medium text-slate-400">
                          <span>{sub.prenom} {sub.nom}</span>
                          <span>·</span>
                          <Calendar size={11} />
                          <span>{new Date(sub.updatedAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>

                      {pct !== null && (
                        <div className="min-w-[52px] text-right">
                          <div className="font-mono text-sm font-extrabold text-ink">{score}/{nb}</div>
                          <div className="text-xs font-bold text-slate-400">{pct}%</div>
                        </div>
                      )}

                      <div className="shrink-0 text-right">
                        <StatusBadge status={sub.status} />
                        {sub.status === 'completed' && (
                          <Link to={`/submissions/${sub._id}`} className="btn btn-ghost btn-sm mt-1">
                            <Eye size={11} /> Voir
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}