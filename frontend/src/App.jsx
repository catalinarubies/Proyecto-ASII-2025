import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Home from './pages/home';

// Componente para proteger rutas (solo usuarios autenticados)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('🚫 Acceso denegado: No hay token. Redirigiendo a login...');
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública: Login */}
        <Route path="/" element={<Login />} />
        
        {/* Ruta protegida: Home */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        
        {/* Rutas para Persona 3 (Juli) - Por ahora páginas temporales */}
        <Route 
          path="/field/:id" 
          element={
            <PrivateRoute>
              <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
                <h1>🚧 Página en Construcción</h1>
                <p>Esta pantalla será implementada por Persona 3 (Juli)</p>
                <p><a href="/home" style={{ color: '#667eea' }}>← Volver a Home</a></p>
              </div>
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/congrats" 
          element={
            <PrivateRoute>
              <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
                <h1>🎉 ¡Reserva Exitosa!</h1>
                <p>Esta pantalla será implementada por Persona 3 (Juli)</p>
                <p><a href="/home" style={{ color: '#667eea' }}>← Volver a Home</a></p>
              </div>
            </PrivateRoute>
          } 
        />
        
        {/* Ruta por defecto: Redirigir a login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;