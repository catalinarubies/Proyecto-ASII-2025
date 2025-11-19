import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtros de búsqueda
  const [filters, setFilters] = useState({
    sport: "",
    location: "",
    minPrice: "",
    maxPrice: ""
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Usuario actual
  const user = api.auth.getCurrentUser();

  useEffect(() => {
    searchFields();
  }, [currentPage]);

  const searchFields = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir parámetros de búsqueda
      const params = {
        query: '',  // ← Agregar query vacío para búsqueda general
        page: currentPage,
        size: 10    // ← Cambiar 'limit' por 'size'
      };

      if (filters.sport) params.sport = filters.sport;
      if (filters.location) params.location = filters.location;
      if (filters.minPrice) params.min_price = filters.minPrice;
      if (filters.maxPrice) params.max_price = filters.maxPrice;

      // Llamar a search-api
      const response = await api.fields.search(params);

      setFields(response.data.fields || []);
      setTotalPages(response.data.total_pages || 1);  // ← Usar total_pages
    } catch (error) {
      console.error("Error al buscar canchas:", error);
      setError(error.response?.data?.error || "Error al cargar las canchas");
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    searchFields();
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    api.auth.logout();
    navigate("/login");
  };

  const goToFieldDetail = (fieldId) => {
    navigate(`/fields/${fieldId}`);
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="header-content">
          <h1>🏟️ Reserva de Canchas</h1>
          <div className="user-info">
            <span>Hola, {user?.name || user?.email}</span>
            <button onClick={handleLogout} className="btn-logout">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group">
            <label>Deporte</label>
            <select
              name="sport"
              value={filters.sport}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="Fútbol">Fútbol</option>
              <option value="Básquet">Básquet</option>
              <option value="Tenis">Tenis</option>
              <option value="Vóley">Vóley</option>
              <option value="Pádel">Pádel</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ubicación</label>
            <input
              type="text"
              name="location"
              placeholder="ej: Centro, Nueva Córdoba"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label>Precio mínimo</label>
            <input
              type="number"
              name="minPrice"
              placeholder="$0"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label>Precio máximo</label>
            <input
              type="number"
              name="maxPrice"
              placeholder="$10000"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>

          <button type="submit" className="btn-search" disabled={loading}>
            {loading ? "Buscando..." : "🔍 Buscar"}
          </button>
        </form>
      </div>

      <div className="results-section">
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando canchas...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button onClick={searchFields} className="btn-retry">
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && fields.length === 0 && (
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <h3>No se encontraron canchas</h3>
            <p>Intenta ajustar tus filtros de búsqueda</p>
          </div>
        )}

        {!loading && !error && fields.length > 0 && (
          <>
            <div className="results-header">
              <h2>Resultados ({fields.length} canchas)</h2>
            </div>

            <div className="fields-grid">
              {fields.map((field) => (
                <div key={field._id || field.id} className="field-card">
                  <div className="field-card-header">
                    <h3>{field.name}</h3>
                    <span className="sport-badge">{field.sport}</span>
                  </div>

                  <div className="field-card-body">
                    <div className="field-info">
                      <span className="icon">📍</span>
                      <span>{field.location}</span>
                    </div>

                    <div className="field-price">
                      <span className="price-label">Precio por hora:</span>
                      <span className="price-amount">
                        ${field.price_per_hour?.toLocaleString('es-AR')}
                      </span>
                    </div>

                    {field.description && (
                      <p className="field-description">
                        {field.description.length > 100
                          ? `${field.description.substring(0, 100)}...`
                          : field.description}
                      </p>
                    )}

                    {field.amenities && field.amenities.length > 0 && (
                      <div className="amenities-preview">
                        <strong>Servicios:</strong>{" "}
                        {field.amenities.slice(0, 3).join(", ")}
                        {field.amenities.length > 3 && "..."}
                      </div>
                    )}
                  </div>

                  <div className="field-card-footer">
                    <button
                      onClick={() => goToFieldDetail(field._id || field.id)}
                      className="btn-details"
                    >
                      Ver detalles y reservar →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-page"
                >
                  ← Anterior
                </button>

                <span className="page-info">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
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