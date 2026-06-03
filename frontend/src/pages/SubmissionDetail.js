import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';

const SubmissionDetail = () => {
  const { id } = useParams();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ fetch(); }, [id]);
  const fetch = async ()=>{ try { const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/${id}`); setSub(res.data); } catch (err) { console.error(err); } finally { setLoading(false); } };

  if (loading) return <Layout><div>Chargement...</div></Layout>;
  if (!sub) return <Layout><div>Soumission non trouvée</div></Layout>;

  return (
    <Layout>
      <div className="section-panel max-w-3xl mx-auto">
        <div className="section-header">
          <div>
            <h1 className="section-title">{sub.exam?.title}</h1>
            <p className="text-gray-600 mt-2">Détail de la soumission et accès au feedback.</p>
          </div>
          <div className="badge badge-success">{sub.status === 'completed' ? 'Feedback reçu' : sub.status === 'processing' ? 'En traitement' : sub.status === 'failed' ? 'Échec' : 'En attente'}</div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8 md:grid-cols-1">
          <div className="glass-card">
            <p className="text-sm text-gray-500">Date de soumission</p>
            <p className="font-semibold text-slate-900 mt-2">{new Date(sub.submittedAt).toLocaleString('fr-FR')}</p>
          </div>
          <div className="glass-card">
            <p className="text-sm text-gray-500">Université / Matière</p>
            <p className="font-semibold text-slate-900 mt-2">{sub.exam?.subject || 'Non précisé'}</p>
          </div>
        </div>

        <div className="section-panel mb-6">
          <h2 className="font-semibold text-lg mb-3">Fichiers</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <span className="font-semibold">Votre copie :</span>{' '}
              <a href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${sub.studentFile.path}`} target="_blank" rel="noreferrer" className="text-sky-700 font-semibold hover:text-sky-800">
                Télécharger
              </a>
            </div>
            {sub.feedbackFile && (
              <div>
                <span className="font-semibold">Feedback :</span>{' '}
                <a href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${sub.feedbackFile.path}`} target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold hover:text-emerald-900">
                  Télécharger feedback PDF
                </a>
              </div>
            )}
          </div>
        </div>

        <Link to="/submissions" className="text-slate-700 hover:text-slate-900 font-semibold">
          ← Retour aux soumissions
        </Link>
      </div>
    </Layout>
  );
};

export default SubmissionDetail;
