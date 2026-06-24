// pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaStethoscope, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';

export function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <div className="auth-side-content">
          <div style={{ marginBottom:32 }}>
            <div style={{ width:48, height:48, background:'linear-gradient(135deg, var(--accent), var(--purple))', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:24, boxShadow:'var(--glow)' }}>
              <FaStethoscope style={{ color:'white' }} />
            </div>
            <h1>Préparez votre concours de médecine</h1>
            <p style={{ marginTop:14 }}>
              Accédez aux annales classées par année, répondez aux QCM et recevez des feedbacks personnalisés générés par IA.
            </p>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { icon:'🎯', title:'Épreuves organisées', desc:'Par année et matière' },
              { icon:'🤖', title:'Feedback IA',         desc:'Analyse personnalisée de vos erreurs' },
              { icon:'📊', title:'Suivi des progrès',   desc:'Historique complet de vos résultats' },
            ].map(f => (
              <div key={f.title} className="auth-feature">
                <span className="auth-feature-icon">{f.icon}</span>
                <div className="auth-feature-text">
                  <strong>{f.title}</strong>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize:12, color:'var(--text3)' }}>
          Plateforme pensée pour les candidats marocains · 2026
        </p>
      </div>

      <div className="auth-form-wrap">
        <div style={{ maxWidth:400, width:'100%', margin:'0 auto' }}>
          <h2>Connexion</h2>
          <p className="subtitle">Entrez vos identifiants pour accéder à votre espace</p>

          {error && (
            <div className="alert alert-danger">⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <div style={{ position:'relative' }}>
                <FaEnvelope style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', fontSize:14 }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft:40 }}
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div style={{ position:'relative' }}>
                <FaLock style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', fontSize:14 }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft:40 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop:8 }}
            >
              {loading
                ? <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> Connexion...</>
                : <>Se connecter <FaArrowRight style={{ fontSize:13 }} /></>
              }
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:13, color:'var(--text3)', marginTop:24 }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// pages/Register.js
export function Register() {
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true); setError('');
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <div className="auth-side-content">
          <div style={{ marginBottom:32 }}>
            <div style={{ width:48, height:48, background:'linear-gradient(135deg, var(--accent), var(--purple))', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:24, boxShadow:'var(--glow)' }}>
              <FaStethoscope style={{ color:'white' }} />
            </div>
            <h1>Rejoignez ConcoursPrep</h1>
            <p style={{ marginTop:14 }}>
              Créez votre compte gratuitement et commencez votre préparation dès aujourd'hui.
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { icon:'📚', title:'Annales complètes',   desc:'Toutes les matières disponibles' },
              { icon:'✏️', title:'Grille de réponses',  desc:'Interface intuitive par matière' },
              { icon:'🧠', title:'Plan de révision IA', desc:'Personnalisé selon vos lacunes' },
            ].map(f => (
              <div key={f.title} className="auth-feature">
                <span className="auth-feature-icon">{f.icon}</span>
                <div className="auth-feature-text">
                  <strong>{f.title}</strong>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize:12, color:'var(--text3)' }}>Accès 100% gratuit · Maroc 2026</p>
      </div>

      <div className="auth-form-wrap">
        <div style={{ maxWidth:400, width:'100%', margin:'0 auto' }}>
          <h2>Créer un compte</h2>
          <p className="subtitle">Remplissez les informations ci-dessous</p>

          {error && <div className="alert alert-danger">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            {[
              { label:'Nom complet',        value:name,     setter:setName,     type:'text',     placeholder:'Prénom Nom' },
              { label:'Adresse email',      value:email,    setter:setEmail,    type:'email',    placeholder:'votre@email.com' },
              { label:'Mot de passe',       value:password, setter:setPassword, type:'password', placeholder:'Min. 6 caractères' },
              { label:'Confirmer le mot de passe', value:confirm,   setter:setConfirm,  type:'password', placeholder:'••••••••' },
            ].map(field => (
              <div key={field.label} className="form-group">
                <label className="form-label">{field.label}</label>
                <input
                  type={field.type}
                  className="form-input"
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop:8 }}
            >
              {loading
                ? <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> Inscription...</>
                : <>Créer mon compte <FaArrowRight style={{ fontSize:13 }} /></>
              }
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:13, color:'var(--text3)', marginTop:24 }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}