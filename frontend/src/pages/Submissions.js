import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Save,
  FileText
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const StatusBadge = ({ status }) => {
  if (status === 'completed') return <span className="badge badge-success"><CheckCircle size={12} /> Feedback recu</span>;
  if (status === 'processing' || status === 'pending') return <span className="badge badge-warning"><Clock size={12} /> En traitement</span>;
  if (status === 'saved') return <span className="badge badge-info"><Save size={12} /> Sauvegarde</span>;
  return <span className="badge badge-danger"><XCircle size={12} /> Echec</span>;
};

export default function Submissions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await axios.get(`${API}/api/answers`);
      setSubs(res.data.data || []);
    } catch (_) {
    } finally {
      setLoad(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>
          <ClipboardList className="icon" size={24} />
          Mes soumissions
        </h1>
        <p>Suivi de toutes vos reponses et feedbacks recus.</p>
      </div>

      <div className="card">
        {loading ? (
          <div className="page-loading min-h-[300px]">
            <span className="spinner spinner-lg" />
            <span>Chargement...</span>
          </div>
        ) : subs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={28} />
            </div>
            <h3>Aucune soumission pour le moment</h3>
            <p>Repondez a une epreuve pour voir vos resultats ici.</p>
            <Link to="/exams" className="btn btn-primary mt-5">
              Voir les epreuves
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-clean">
              <thead>
                <tr>
                  <th>Matiere</th>
                  <th>Concours</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((sub) => (
                  <tr key={sub._id}>
                    <td>
                      <span className="font-extrabold capitalize text-ink">
                        {sub.epreuve?.subject || '-'}
                      </span>
                    </td>
                    <td className="font-medium text-slate-500">{sub.concours?.title || '-'}</td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
                        <Calendar size={12} />
                        {new Date(sub.updatedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td><StatusBadge status={sub.status} /></td>
                    <td>
                      {sub.status === 'completed' && (
                        <Link to={`/submissions/${sub._id}`} className="btn btn-ghost btn-sm">
                          Voir <ArrowRight size={12} />
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