import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  ArrowRight,
  Award,
  Bot,
  Lock,
  Mail,
  Stethoscope,
  Target,
  TrendingUp
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const features = [
    { icon: Target, title: 'Epreuves organisees', desc: 'Par annee et par matiere' },
    { icon: Bot, title: 'Feedback IA', desc: 'Analyse detaillee des erreurs' },
    { icon: TrendingUp, title: 'Suivi des progres', desc: 'Tableaux de bord clairs' },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

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
    <div className="auth-wrap">
      <section className="auth-side">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="brand-icon h-12 w-12">
              <Stethoscope size={24} />
            </div>
            <div>
              <div className="brand-name text-lg">ConcoursPrep</div>
              <div className="brand-sub">Preparation Medecine</div>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-ink">
            Preparez votre concours avec precision.
          </h1>

          <p className="mt-4 max-w-md text-sm font-medium leading-7 text-slate-500">
            Annales officielles, QCM interactifs et feedback IA dans une interface claire et professionnelle.
          </p>

          <div className="mt-8 space-y-3">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="auth-feature">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-aqua-50 text-aqua-700">
                    <Icon size={19} />
                  </div>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.desc}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="border-t border-line pt-5 text-xs font-semibold text-slate-400">
          Plateforme pensee pour les candidats marocains · 2026
        </p>
      </section>

      <section className="auth-form-wrap">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-aqua-50 px-3 py-1.5 text-xs font-extrabold text-aqua-700">
              <Award size={14} />
              Espace candidat
            </div>

            <h2 className="text-3xl font-extrabold text-ink">Bienvenue</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Connectez-vous pour acceder a votre preparation.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="email"
                  className="form-input pl-10"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="password"
                  className="form-input pl-10"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-2">
              {loading ? (
                <>
                  <span className="spinner" />
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm font-medium text-slate-500">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-extrabold text-aqua-700 no-underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}