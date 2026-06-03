import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaStethoscope, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur d\'inscription');
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
            <h1 className="text-4xl font-bold mb-4 text-slate-900">Inscrivez-vous et démarrez votre entraînement</h1>
            <p className="text-gray-600 leading-relaxed mb-8">
              Accédez aux annales classées par année et université, téléchargez les corrections et suivez vos progrès.
            </p>

            <div className="grid gap-4">
              <div className="glass-card">
                <p className="text-sm text-gray-500">Système simple</p>
                <p className="font-semibold text-slate-900">Organisez votre révision</p>
              </div>
              <div className="glass-card">
                <p className="text-sm text-gray-500">Feedback rapide</p>
                <p className="font-semibold text-slate-900">Recevez vos corrections PDF</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500 mt-8">
            <p>Plateforme pensée pour les candidats marocains, avec une interface claire et moderne.</p>
          </div>
        </div>

        <div className="auth-card">
          <h2 className="text-3xl font-bold mb-3 text-slate-900">Créer un compte</h2>
          <p className="text-gray-600 mb-6">Complétez les informations ci-dessous pour commencer.</p>

          {error && (
            <div className="alert alert-danger mb-6">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Nom complet</label>
              <div className="relative">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

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

            <div>
              <label className="label">Confirmer mot de passe</label>
              <div className="relative">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="button-gradient w-full">
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="text-sky-700 font-semibold hover:text-sky-800">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
