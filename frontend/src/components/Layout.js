// import React from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { FaStethoscope, FaThLarge, FaBook, FaClipboardList, FaCog, FaSignOutAlt, FaCircle } from 'react-icons/fa';

// const Layout = ({ children }) => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

//   return (
//     <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
//       <nav className="navbar">
//         <div className="navbar-inner">
//           <Link to="/dashboard" className="brand">
//             <div className="brand-icon">
//               <FaStethoscope />
//             </div>
//             <div className="brand-text">
//               <div className="brand-name">ConcoursPrep</div>
//               <div className="brand-sub">Médecine Maroc</div>
//             </div>
//           </Link>

//           <div className="nav-links">
//             <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
//               <FaThLarge style={{ display:'inline', marginRight:6, fontSize:11 }} />
//               Tableau de bord
//             </Link>
//             <Link to="/exams" className={`nav-link ${isActive('/exams') ? 'active' : ''}`}>
//               <FaBook style={{ display:'inline', marginRight:6, fontSize:11 }} />
//               Épreuves
//             </Link>
//             <Link to="/submissions" className={`nav-link ${isActive('/submissions') ? 'active' : ''}`}>
//               <FaClipboardList style={{ display:'inline', marginRight:6, fontSize:11 }} />
//               Mes copies
//             </Link>
//             {user?.role === 'admin' && (
//               <Link to="/admin/exams" className={`nav-link admin ${isActive('/admin') ? 'active' : ''}`}>
//                 <FaCog style={{ display:'inline', marginRight:6, fontSize:11 }} />
//                 Admin
//               </Link>
//             )}
//           </div>

//           <div style={{ display:'flex', alignItems:'center', gap:10 }}>
//             <div className="nav-user">
//               <div className="nav-user-dot" />
//               <span style={{ fontSize:13, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
//                 {user?.name}
//               </span>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="btn btn-ghost btn-sm"
//               title="Déconnexion"
//               style={{ gap:6 }}
//             >
//               <FaSignOutAlt />
//               <span style={{ display:'none' }}>Déco</span>
//             </button>
//           </div>
//         </div>
//       </nav>

//       <main style={{ flex:1 }}>
//         <div style={{ maxWidth:1280, margin:'0 auto', padding:'32px 24px 64px' }}>
//           {children}
//         </div>
//       </main>

//       <footer style={{ borderTop:'1px solid var(--border)', padding:'18px 24px', textAlign:'center' }}>
//         <p style={{ fontSize:12, color:'var(--text3)' }}>
//           © 2026 ConcoursPrep · Préparation aux concours de médecine au Maroc
//         </p>
//       </footer>
//     </div>
//   );
// };

// export default Layout;

// components/Layout.js
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaStethoscope, FaThLarge, FaBook,
  FaHistory, FaCog, FaSignOutAlt
} from 'react-icons/fa';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };
  const active = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Brand */}
          <Link to="/dashboard" className="brand">
            <div className="brand-icon"><FaStethoscope /></div>
            <div className="brand-text">
              <div className="brand-name">ConcoursPrep</div>
              <div className="brand-sub">Médecine Maroc</div>
            </div>
          </Link>

          {/* Nav links */}
          <div className="nav-links">
            <Link to="/dashboard" className={`nav-link ${active('/dashboard') ? 'active' : ''}`}>
              <FaThLarge style={{ display:'inline', marginRight:6, fontSize:11 }} />
              Tableau de bord
            </Link>
            <Link to="/exams" className={`nav-link ${active('/exams') ? 'active' : ''}`}>
              <FaBook style={{ display:'inline', marginRight:6, fontSize:11 }} />
              Épreuves
            </Link>
            <Link to="/history" className={`nav-link ${active('/history') ? 'active' : ''}`}>
              <FaHistory style={{ display:'inline', marginRight:6, fontSize:11 }} />
              Historique
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin/exams" className={`nav-link admin ${active('/admin') ? 'active' : ''}`}>
                <FaCog style={{ display:'inline', marginRight:6, fontSize:11 }} />
                Admin
              </Link>
            )}
          </div>

          {/* User */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div className="nav-user">
              <div className="nav-user-dot" />
              <span style={{ fontSize:13, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user?.name}
              </span>
            </div>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Déconnexion" style={{ gap:6 }}>
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </nav>

      <main style={{ flex:1 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'32px 24px 64px' }}>
          {children}
        </div>
      </main>

      <footer style={{ borderTop:'1px solid var(--border)', padding:'18px 24px', textAlign:'center' }}>
        <p style={{ fontSize:12, color:'var(--text3)' }}>
          © 2026 ConcoursPrep · Préparation aux concours de médecine au Maroc
        </p>
      </footer>
    </div>
  );
};

export default Layout;