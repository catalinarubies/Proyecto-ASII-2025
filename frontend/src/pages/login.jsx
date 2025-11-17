import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  
  // Estados del componente
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validación básica
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      // Llamada al backend
      const data = await login(email, password);
      
      // Guardar datos en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);
      
      console.log('✅ Login exitoso:', data.user);
      
      // Redirigir a Home
      navigate('/home');
      
    } catch (err) {
      setLoading(false);
      
      // Manejo de errores
      if (err.response) {
        if (err.response.status === 401) {
          setError('Email o contraseña incorrectos');
        } else {
          setError('Error en el servidor. Intenta nuevamente.');
        }
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. ¿Está corriendo users-api?');
      } else {
        setError('Error inesperado. Intenta nuevamente.');
      }
      
      console.error('❌ Error en login:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>⚽ Reserva Tu Cancha</h1>
        <p className="subtitle">Inicia sesión para comenzar</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="test-credentials">
          <small>💡 Para probar: test@test.com / 123456</small>
        </div>
      </div>
    </div>
  );
};

export default Login;