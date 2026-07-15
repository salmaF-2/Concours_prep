import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Stethoscope,
  UserRound
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const active = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/exams', icon: BookOpen, label: 'Epreuves' },
    { to: '/history', icon: History, label: 'Historique' },
  ];

  if (user?.role === 'admin') {
    links.push({ to: '/admin/exams', icon: Settings, label: 'Admin', admin: true });
  }

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/dashboard" className="brand">
            <div className="brand-icon">
              <Stethoscope size={20} />
            </div>
            <div>
              <div className="brand-name">ConcoursPrep</div>
              <div className="brand-sub">Medecine Maroc</div>
            </div>
          </Link>

          <div className={`nav-links ${open ? 'open' : ''}`}>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`nav-link ${active(link.to) ? 'active' : ''} ${link.admin ? 'admin' : ''}`}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="nav-user-area">
            <div className="nav-user">
              <div className="nav-user-avatar">
                {user?.name ? getInitials(user.name) : <UserRound size={15} />}
              </div>
              <span className="nav-user-name">{user?.name || 'Utilisateur'}</span>
              <span className="nav-user-dot" />
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              title="Deconnexion"
              type="button"
            >
              <LogOut size={15} />
            </button>

            <button
              className="mobile-menu-btn"
              onClick={() => setOpen(!open)}
              type="button"
              aria-label="Menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">{children}</main>

      <footer className="footer">
        ConcoursPrep 2026 · Preparation aux concours de medecine au Maroc
      </footer>
    </div>
  );
};

export default Layout;