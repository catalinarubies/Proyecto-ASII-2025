import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchFields } from '../services/api';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  
  // Estados
  const [query, setQuery] = useState('');
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const size = 9; // 9 canchas por página (3x3 grid)

  // Datos del usuario logueado
  const userName = localStorage.getItem('userName') || 'Usuario';

  // Cargar canchas al montar el componente y cuando cambia la página
  useEffect(() => {
    loadFields();
  }, [page]);

  const loadFields = async (searchQuery = query) => {
    setLoading(true);
    setError('');

    try {
      const data = await searchFields(searchQuery, page, size);
      
      console.log('📦 Datos recibidos:', data);
      
      setFields(data.results || []);
      setTotalPages(Math.ceil((data.total || 0) / size));
      
    } catch (err) {
      console.error('❌ Error al cargar canchas:', err);
      
      if (err.response) {
        setError(`Error ${err.response.status}: ${err.response.data?.message || 'Error en el servidor'}`);
      } else if (err.request) {
        setError('No se pudo conectar con search-api. Usando datos mock.');
      } else {
        setError('Error inesperado al cargar las canchas');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Resetear a la primera página
    loadFields(query);
  };

  const handleFieldClick = (fieldId) => {
    console.log('🎯 Navegando a detalle de cancha:', fieldId);
    navigate(`/field/${fieldId}`);
  };

  const handleLogout = () => {
    console.log('👋 Cerrando sesión...');
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <h1>⚽ Reserva Tu Cancha</h1>
          <div className="user-info">
            <span>Hola, <strong>{userName}</strong></span>
            <button onClick={handleLogout} className="btn-logout">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Barra de Búsqueda */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Buscar canchas... (ej: fútbol, básquet, centro)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-search">
            🔍 Buscar
          </button>
        </form>
      </div>

      {/* Contenido Principal */}
      <div className="content-section">
        {/* Estado: Cargando */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando canchas...</p>
          </div>
        )}

        {/* Estado: Error */}
        {error && !loading && (
          <div className="error-box">
            <p>{error}</p>
            <button onClick={() => loadFields()} className="btn-retry">
              🔄 Reintentar
            </button>
          </div>
        )}

        {/* Estado: Sin resultados */}
        {!loading && !error && fields.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏟️</div>
            <h2>No se encontraron canchas</h2>
            <p>Intenta con otra búsqueda.</p>
          </div>
        )}

        {/* Estado: Resultados encontrados */}
        {!loading && !error && fields.length > 0 && (
          <>
            <div className="results-header">
              <h2>Canchas disponibles</h2>
              <p>{fields.length} resultados en esta página</p>
            </div>

            <div className="fields-grid">
              {fields.map((field) => (
                <div key={field.id} className="field-card">
                  <div className="field-image-container">
                    <img
                      src={field.image || 'https://via.placeholder.com/300x200?text=Cancha'}
                      alt={field.name}
                      className="field-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
                      }}
                    />
                    {field.available === false && (
                      <div className="unavailable-badge">No Disponible</div>
                    )}
                  </div>
                  
                  <div className="field-info">
                    <h3>{field.name}</h3>
                    <p className="field-sport">🏆 {field.sport}</p>
                    <p className="field-location">📍 {field.location}</p>
                    {field.description && (
                      <p className="field-description">
                        {field.description.substring(0, 80)}
                        {field.description.length > 80 ? '...' : ''}
                      </p>
                    )}
                    <div className="field-footer">
                      <p className="field-price">
                        ${field.price_per_hour.toLocaleString()}/hora
                      </p>
                      <button
                        onClick={() => handleFieldClick(field.id)}
                        className="btn-details"
                        disabled={field.available === false}
                      >
                        Ver Detalles →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-page"
                >
                  ← Anterior
                </button>
                <span className="page-info">
                  Página <strong>{page}</strong> de <strong>{totalPages}</strong>
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-page"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;