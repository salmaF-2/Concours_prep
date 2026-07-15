import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  FileText,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart3,
  Eye,
  ChevronRight,
  FolderOpen,
  ClipboardList
} from 'lucide-react';
import { getSubjectMeta } from '../utils/subjectMeta';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const StatusBadge = ({ status }) => {
  const map = {
    completed: { color: '#10b981', label: 'Feedback recu' },
    processing: { color: '#f59e0b', label: 'En traitement' },
    saved: { color: '#0891a3', label: 'Sauvegarde' },
    failed: { color: '#ef4444', label: 'Echec' },
  };
  const s = map[status] || map.saved;

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: s.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalExams: 0, totalSubs: 0, completed: 0, pending: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, subsRes] = await Promise.all([
        axios.get(`${API}/api/concours`),
        axios.get(`${API}/api/answers`),
      ]);

      const subs = subsRes.data.data || [];

      setStats({
        totalExams: examsRes.data.data?.length || examsRes.data.length || 0,
        totalSubs: subs.length,
        completed: subs.filter((s) => s.status === 'completed').length,
        pending: subs.filter((s) => ['processing', 'saved'].includes(s.status)).length,
      });

      const grouped = {};
      subs.forEach((sub) => {
        const cid = sub.concours?._id || 'unknown';
        const ctitle = sub.concours?.title || 'Concours';
        const cyear = sub.concours?.year || '';
        if (!grouped[cid]) grouped[cid] = { cid, ctitle, cyear, subjects: [] };
        grouped[cid].subjects.push(sub);
      });

      const sorted = Object.values(grouped).sort((a, b) => {
        const dateA = Math.max(...a.subjects.map((s) => new Date(s.updatedAt)));
        const dateB = Math.max(...b.subjects.map((s) => new Date(s.updatedAt)));
        return dateB - dateA;
      });

      setHistory(sorted);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon apres-midi';
    return 'Bonsoir';
  };

  const statItems = [
    { label: 'Concours disponibles', value: stats.totalExams || 5, icon: FolderOpen, color: 'text-aqua-600', bg: 'bg-aqua-50' },
    { label: 'Epreuves repondues', value: stats.totalSubs, icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Feedbacks recus', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'En attente', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <Layout>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="mb-1 text-xs font-extrabold uppercase tracking-normal text-aqua-700">Espace candidat</p>
          <h1 className="text-2xl font-extrabold text-ink">
            {greeting()}, {user?.name?.split(' ')[0] || 'Candidat'}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Preparation intelligente aux concours de medecine au Maroc.
          </p>
        </div>

        <Link to="/exams" className="btn btn-primary">
          <BookOpen size={16} />
          Commencer une epreuve
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="stat-card">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                <Icon size={20} />
              </div>
              <div className="text-[11px] font-extrabold uppercase tracking-normal text-slate-400">{item.label}</div>
              <div className="mt-1 font-mono text-3xl font-extrabold text-ink">{loading ? '-' : item.value}</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-aqua-600" />
            <span className="text-sm font-extrabold text-ink">Historique par concours</span>
          </div>
          <Link to="/history" className="btn btn-ghost btn-sm">
            Tout voir <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="page-loading min-h-[180px]">
            <span className="spinner" />
            <span>Chargement...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ClipboardList size={28} />
            </div>
            <h3>Aucune activite</h3>
            <p>Commencez par repondre a une epreuve.</p>
            <Link to="/exams" className="btn btn-primary mt-4">Voir les epreuves</Link>
          </div>
        ) : (
          <div>
            {history.slice(0, 3).map((group, idx) => {
              const allDone = group.subjects.every((s) => s.status === 'completed');
              const doneCnt = group.subjects.filter((s) => s.status === 'completed').length;

              return (
                <div key={group.cid} className={`px-5 py-4 ${idx !== history.slice(0, 3).length - 1 ? 'border-b border-line' : ''}`}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-extrabold text-ink">{group.ctitle}</div>
                      <div className="text-xs font-medium text-slate-400">{group.cyear}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-info">{group.subjects.length}/4 matieres</span>
                      {allDone && <span className="badge badge-success">Complet</span>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {group.subjects.slice(0, 3).map((sub) => {
                      const meta = getSubjectMeta(sub.epreuve?.subject);
                      const SubjectIcon = meta.Icon;
                      const ep = sub.epreuve;
                      const order = ep?.order ?? 0;
                      const startQ = order * 20 + 1;
                      const endQ = (order + 1) * 20;
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
                            <div className="text-xs font-medium text-slate-400">
                              Q{startQ}-Q{endQ} · {new Date(sub.updatedAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>

                          {pct !== null && (
                            <div className="min-w-[58px] text-right">
                              <div className="font-mono text-sm font-extrabold text-ink">{score}/{nb}</div>
                              <div className="text-xs font-bold text-slate-400">{pct}%</div>
                            </div>
                          )}

                          <div className="shrink-0 text-right">
                            <StatusBadge status={sub.status} />
                            {sub.status === 'completed' && (
                              <Link to={`/submissions/${sub._id}`} className="btn btn-ghost btn-sm mt-1">
                                <Eye size={12} /> Voir
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs font-bold text-slate-400">
                      <span>Progression feedback</span>
                      <span>{doneCnt}/{group.subjects.length}</span>
                    </div>
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${Math.round((doneCnt / group.subjects.length) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}

            {history.length > 3 && (
              <div className="border-t border-line p-4 text-center">
                <Link to="/history" className="btn btn-ghost btn-sm">
                  Voir tout l'historique <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}