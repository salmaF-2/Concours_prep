// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { Login} from './pages/Login';
// import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';
// import Exams from './pages/Exams';
// import { Submissions, SubmissionDetail } from './pages/Submissions';
// import AdminExams from './pages/AdminExams';
// import PrivateRoute from './components/PrivateRoute';
// import './index.css';

// // Wrapper to pass :id param to SubmissionDetail
// function SubmissionDetailWrapper() {
//   return <SubmissionDetail />;
// }

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/login"    element={<Login />} />
//           <Route path="/register" element={<Register />} />

//           <Route path="/dashboard"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />
//           <Route path="/exams"      element={<PrivateRoute><Exams /></PrivateRoute>} />
//           <Route path="/submissions"         element={<PrivateRoute><Submissions /></PrivateRoute>} />
//           <Route path="/submissions/:id"     element={<PrivateRoute><SubmissionDetailWrapper /></PrivateRoute>} />
//           <Route path="/admin/exams"         element={<PrivateRoute adminOnly><AdminExams /></PrivateRoute>} />

//           <Route path="/" element={<Navigate to="/dashboard" />} />
//           <Route path="*" element={<Navigate to="/dashboard" />} />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// export default App;

// App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import  Login    from './pages/Login';
import Register     from './pages/Register';
import Dashboard    from './pages/Dashboard';
import Exams        from './pages/Exams';
import History      from './pages/History';
import  Submissions from './pages/Submissions';
import SubmissionDetail  from './pages/SubmissionDetail';
import AdminExams   from './pages/AdminExams';
import PrivateRoute from './components/PrivateRoute';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard"       element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/exams"           element={<PrivateRoute><Exams /></PrivateRoute>} />
          <Route path="/history"         element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/submissions"     element={<PrivateRoute><Submissions /></PrivateRoute>} />
          <Route path="/submissions/:id" element={<PrivateRoute><SubmissionDetail /></PrivateRoute>} />
          <Route path="/admin/exams"     element={<PrivateRoute adminOnly><AdminExams /></PrivateRoute>} />

          <Route path="/"  element={<Navigate to="/dashboard" />} />
          <Route path="*"  element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;