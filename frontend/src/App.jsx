import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import FieldDetail from './pages/FieldDetail';
import Congrats from './pages/Congrats';
import MyBookings from './pages/MyBookings';  // ← NUEVO

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/fields/:fieldId" element={<PrivateRoute><FieldDetail /></PrivateRoute>} />
        <Route path="/congrats" element={<PrivateRoute><Congrats /></PrivateRoute>} />
        <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />  {/* ← NUEVO */}
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 