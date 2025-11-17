import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(""); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.email || !formData.password) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Email inválido");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Llamar a la API de login
      const response = await api.auth.login(formData.email, formData.password);

      // Guardar token y usuario
      api.auth.saveToken(response.data.token);
      api.auth.saveUser(response.data.user);

      // Redireccionar a Home
      navigate("/home");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError(
        error.response?.data?.message || 
        "Usuario o contraseña incorrectos"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-icon">🏟️</div>
          <h1>Reserva de Canchas</h1>
          <p>Inicia sesión para reservar tu cancha</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-login" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>¿No tienes cuenta? <a href="#register">Regístrate aquí</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;