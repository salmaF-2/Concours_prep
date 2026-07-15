import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  GraduationCap,
  Lock,
  Mail,
  User
} from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const features = [
    { icon: BookOpen, title: 'Annales completes', desc: 'Toutes les matieres officielles' },
    { icon: Brain, title: 'Feedback IA', desc: 'Analyse intelligente des reponses' },
    { icon: Award, title: 'Plan personnalise', desc: 'Adapte a vos lacunes' },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
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
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="brand-name text-lg">ConcoursPrep</div>
              <div className="brand-sub">Preparation Medecine</div>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-ink">
            Construisez une preparation plus claire.
          </h1>

          <p className="mt-4 max-w-md text-sm font-medium leading-7 text-slate-500">
            Creez votre compte et commencez votre parcours vers la reussite du concours.
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
          Acces gratuit · Maroc 2026
        </p>
      </section>

      <section className="auth-form-wrap">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-aqua-50 px-3 py-1.5 text-xs font-extrabold text-aqua-700">
              <Award size={14} />
              Nouveau candidat
            </div>

            <h2 className="text-3xl font-extrabold text-ink">Creer un compte</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Remplissez les informations pour commencer.
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
              <label className="form-label">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text"
                  className="form-input pl-10"
                  placeholder="Prenom Nom"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            </div>

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
                  placeholder="Minimum 8 caracteres"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="password"
                  className="form-input pl-10"
                  placeholder="Confirmez votre mot de passe"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-2">
              {loading ? (
                <>
                  <span className="spinner" />
                  Creation...
                </>
              ) : (
                <>
                  Creer mon compte
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm font-medium text-slate-500">
            Deja un compte ?{' '}
            <Link to="/login" className="font-extrabold text-aqua-700 no-underline">
              Se connecter
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}