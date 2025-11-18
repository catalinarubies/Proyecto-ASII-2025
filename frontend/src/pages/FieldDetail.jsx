import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import BookingForm from '../components/BookingForm';
import '../styles/FieldDetail.css';

function FieldDetail() {
  const { fieldId } = useParams(); 
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchField = async () => {
      try {
        setError(null);
        const response = await api.get(`/fields/${fieldId}`); 
        setField(response.data);
      } catch (error) {
        console.error("Error al cargar la cancha:", error);
        setError(error.response?.data?.message || "No se pudo cargar la cancha");
        setField(null);
      } finally {
        setLoading(false);
      }
    };
    fetchField();
  }, [fieldId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando detalles de la cancha...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Error al cargar</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/home')} className="btn-back">
          Volver a búsqueda
        </button>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="error-container">
        <div className="error-icon">🔍</div>
        <h2>Cancha no encontrada</h2>
        <p>La cancha que buscas no existe o fue eliminada.</p>
        <button onClick={() => navigate('/home')} className="btn-back">
          Volver a búsqueda
        </button>
      </div>
    );
  }

  return (
    <div className="field-detail-page">
      <button onClick={() => navigate('/home')} className="back-button">
        ← Volver a búsqueda
      </button>

      <div className="field-content">
        <div className="field-info-section">
          <div className="field-header">
            <h1>{field.name}</h1>
            <span className="sport-badge">{field.sport}</span>
          </div>

          <div className="field-location">
            <span className="icon">📍</span>
            <span>{field.location}</span>
          </div>

          <div className="price-card">
            <div className="price-label">Precio por hora</div>
            <div className="price-amount">
              ${field.price_per_hour?.toLocaleString('es-AR')}
            </div>
          </div>

          {field.description && (
            <div className="description-section">
              <h3>Descripción</h3>
              <p>{field.description}</p>
            </div>
          )}
          
          {field.amenities && field.amenities.length > 0 && (
            <div className="amenities-section">
              <h3>Servicios Adicionales</h3>
              <ul className="amenities-list">
                {field.amenities.map((item, index) => (
                  <li key={index}>
                    <span className="check-icon">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {field.images && field.images.length > 0 && (
            <div className="images-section">
              <h3>Galería</h3>
              <div className="images-grid">
                {field.images.map((img, index) => (
                  <img 
                    key={index} 
                    src={img} 
                    alt={`${field.name} - ${index + 1}`}
                    className="field-image"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="booking-sidebar">
          <BookingForm fieldId={fieldId} fieldName={field.name} pricePerHour={field.price_per_hour} />
        </div>
      </div>
    </div>
  );
}

export default FieldDetail;