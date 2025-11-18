import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import FieldDetail from './pages/FieldDetail';
import Congrats from './pages/Congrats';

// Componente para proteger rutas (requiere autenticación)
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
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route 
          path="/home" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/fields/:fieldId" 
          element={
            <PrivateRoute>
              <FieldDetail />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/congrats" 
          element={
            <PrivateRoute>
              <Congrats />
            </PrivateRoute>
          } 
        />
        
        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;