import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaStethoscope, FaBook, FaFileAlt, FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface text-gray-800">
      <nav className="navbar sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="brand-badge">
              <FaStethoscope className="text-xl" />
            </div>
            <div>
              <div>ConcoursPrep</div>
              <div className="text-xs text-white/80">Préparation aux concours de médecine</div>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2 justify-center">
            <Link to="/dashboard" className="nav-link">
              Tableau de bord
            </Link>
            <Link to="/exams" className="nav-link">
              Épreuves
            </Link>
            <Link to="/submissions" className="nav-link">
              Mes copies
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin/exams" className="nav-link">
                Admin
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-end">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/90">
              <FaUserCircle /> {user?.name}
            </div>
            <button onClick={handleLogout} className="btn btn-danger text-sm px-4 py-2">
              <FaSignOutAlt /> Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-10">
        {children}
      </main>

      <footer className="py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2026 ConcoursPrep - Préparation aux concours de médecine au Maroc</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
