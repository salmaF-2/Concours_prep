import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaBook, FaFileAlt, FaCheckCircle, FaClock } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalExams: 0, totalSubmissions: 0, completed: 0, pending: 0 });
  const [recent, setRecent] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, subsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/exams`),
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/my-submissions`)
      ]);

      const submissions = subsRes.data;
      setStats({
        totalExams: examsRes.data.length,
        totalSubmissions: submissions.length,
        completed: submissions.filter(s => s.status === 'completed').length,
        pending: submissions.filter(s => s.status === 'processing' || s.status === 'pending').length
      });

      setRecent(submissions.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div>
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Bienvenue, {user?.name} 👋</h1>
          <p className="text-gray-600 mt-2">Vous êtes sur la plateforme de préparation aux concours de médecine</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8 md:grid-cols-2">
          <div className="stat-box bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Épreuves disponibles</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalExams}</p>
              </div>
              <FaBook className="text-4xl text-blue-200" />
            </div>
          </div>

          <div className="stat-box bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Copies soumises</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalSubmissions}</p>
              </div>
              <FaFileAlt className="text-4xl text-green-200" />
            </div>
          </div>

          <div className="stat-box bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Feedbacks reçus</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.completed}</p>
              </div>
              <FaCheckCircle className="text-4xl text-emerald-200" />
            </div>
          </div>

          <div className="stat-box bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">En traitement</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending}</p>
              </div>
              <FaClock className="text-4xl text-orange-200" />
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
            <h2 className="text-xl font-bold">📋 Dernières soumissions</h2>
            <p className="text-blue-100 text-sm mt-1">Suivi de vos copies</p>
          </div>

          {recent.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Aucune soumission pour le moment</p>
              <Link to="/exams" className="text-blue-600 font-semibold hover:underline mt-2 inline-block">
                Commencer maintenant →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Épreuve</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((sub, idx) => (
                    <tr key={sub._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">{sub.exam?.title}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(sub.submittedAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            sub.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : sub.status === 'processing' || sub.status === 'pending'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {sub.status === 'completed'
                            ? '✅ Feedback reçu'
                            : sub.status === 'processing' || sub.status === 'pending'
                            ? '⏳ En traitement'
                            : '❌ Échec'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/submissions/${sub._id}`} className="text-blue-600 font-semibold hover:text-blue-700">
                          Voir →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
