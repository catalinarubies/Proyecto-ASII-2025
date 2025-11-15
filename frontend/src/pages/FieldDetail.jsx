// frontend/src/pages/FieldDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import BookingForm from '../components/BookingForm';

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
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/home')}>Volver a búsqueda</button>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="error-container">
        <h2>Cancha no encontrada</h2>
        <button onClick={() => navigate('/home')}>Volver a búsqueda</button>
      </div>
    );
  }

  return (
    <div className="field-detail-page">
      <button onClick={() => navigate('/home')} className="back-button">
        ← Volver a búsqueda
      </button>

      <div className="field-info">
        <h1>{field.name}</h1>
        <div className="field-meta">
          <span className="sport-badge">{field.sport}</span>
          <span className="location">📍 {field.location}</span>
        </div>

        <div className="price-box">
          <span className="price-label">Precio por hora:</span>
          <span className="price-amount">
            ${field.price_per_hour?.toLocaleString('es-AR')}
          </span>
        </div>

        {field.description && (
          <div className="description">
            <h3>Descripción</h3>
            <p>{field.description}</p>
          </div>
        )}
        
        {field.amenities && field.amenities.length > 0 && (
          <div className="amenities">
            <h3>Servicios Adicionales</h3>
            <ul>
              {field.amenities.map((item, index) => (
                <li key={index}>✅ {item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {field.images && field.images.length > 0 && (
          <div className="images-gallery">
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

      <div className="booking-section">
        <h2>Reservar esta cancha</h2>
        <BookingForm fieldId={fieldId} />
      </div>
    </div>
  );
}

export default FieldDetail;