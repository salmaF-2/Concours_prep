import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaStethoscope, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <div className="hero-panel">
          <div>
            <div className="brand-badge mb-6">
              <FaStethoscope className="text-3xl" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-slate-900">Préparez votre concours de médecine</h1>
            <p className="text-gray-600 leading-relaxed mb-8">
              Accédez aux épreuves par année et université, téléchargez les grilles de correction et suivez vos soumissions.
            </p>

            <div className="grid gap-4">
              <div className="glass-card">
                <p className="text-sm text-gray-500">Organisé par année</p>
                <p className="font-semibold text-slate-900">Révisez de manière structurée</p>
              </div>
              <div className="glass-card">
                <p className="text-sm text-gray-500">Suivi centralisé</p>
                <p className="font-semibold text-slate-900">Tous vos feedbacks au même endroit</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500 mt-8">
            <p>Plateforme pensée pour les candidats marocains, simple et claire.</p>
          </div>
        </div>

        <div className="auth-card">
          <h2 className="text-3xl font-bold mb-3 text-slate-900">Connexion</h2>
          <p className="text-gray-600 mb-6">Entrez vos informations pour accéder à votre espace de préparation.</p>

          {error && (
            <div className="alert alert-danger mb-6">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="button-gradient w-full">
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Pas de compte ?{' '}
            <Link to="/register" className="text-sky-700 font-semibold hover:text-sky-800">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
