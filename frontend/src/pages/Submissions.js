import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaCalendarAlt } from 'react-icons/fa';

const Submissions = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/my-submissions`);
      setSubs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="text-center py-8">Chargement...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="section-panel">
          <div className="section-header">
            <div>
              <h1 className="section-title flex items-center gap-3">
                <FaFileAlt className="text-sky-600" />
                Mes soumissions
              </h1>
              <p className="text-gray-600 mt-2">Suivi clair de toutes vos copies et de vos retours PDF.</p>
            </div>
          </div>
        </div>

        {subs.length === 0 ? (
          <div className="section-panel text-center py-16">
            <FaFileAlt className="text-6xl text-slate-300 mx-auto mb-5" />
            <p className="text-gray-600 text-lg">Aucune soumission pour le moment</p>
            <Link to="/exams" className="inline-block mt-6 button-gradient">
              Commencer maintenant →
            </Link>
          </div>
        ) : (
          <div className="section-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Épreuve</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subs.map((sub) => (
                    <tr key={sub._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">{sub.exam?.title}</span>
                        <p className="text-sm text-gray-600 mt-1">{sub.exam?.subject}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          {new Date(sub.submittedAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {sub.status === 'completed' && (
                          <span className="badge badge-success">✅ Feedback reçu</span>
                        )}
                        {(sub.status === 'processing' || sub.status === 'pending') && (
                          <span className="badge badge-warning">⏳ En traitement</span>
                        )}
                        {sub.status === 'failed' && (
                          <span className="badge badge-danger">❌ Échec</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/submissions/${sub._id}`}
                          className="text-sky-700 font-semibold hover:text-sky-800 transition"
                        >
                          Voir détails →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Submissions;
