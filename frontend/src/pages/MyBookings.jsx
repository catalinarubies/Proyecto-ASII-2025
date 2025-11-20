import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/MyBookings.css';

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = api.auth.getCurrentUser();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = localStorage.getItem('userId');
      const response = await api.get(`/bookings/user/${userId}`);
      setBookings(response.data || []);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      setError('No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return '✓ Confirmada';
      case 'cancelled': return '✗ Cancelada';
      default: return '⏳ Pendiente';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando reservas...</p>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <header className="bookings-header">
        <div className="header-content">
          <h1>🎾 Mis Reservas</h1>
          <div className="user-info">
            <span>Hola, {user?.name || user?.email}</span>
            <button onClick={() => navigate('/home')} className="btn-back">
              ← Volver a búsqueda
            </button>
          </div>
        </div>
      </header>

      <div className="bookings-content">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button onClick={fetchBookings} className="btn-retry">
              Reintentar
            </button>
          </div>
        )}

        {!error && bookings.length === 0 && (
          <div className="no-bookings">
            <span className="no-bookings-icon">📅</span>
            <h3>No tienes reservas todavía</h3>
            <p>Explora nuestras canchas y haz tu primera reserva</p>
            <button onClick={() => navigate('/home')} className="btn-primary">
              Buscar canchas
            </button>
          </div>
        )}

        {!error && bookings.length > 0 && (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.field_name || 'Cancha'}</h3>
                  <span className={`booking-status ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </div>

                <div className="booking-details">
                  <div className="detail-row">
                    <span className="detail-icon">📅</span>
                    <span className="detail-label">Fecha:</span>
                    <span className="detail-value">{formatDate(booking.date)}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-icon">🕐</span>
                    <span className="detail-label">Horario:</span>
                    <span className="detail-value">
                      {booking.start_time} - {booking.end_time}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-icon">💰</span>
                    <span className="detail-label">Total:</span>
                    <span className="detail-value price">
                      ${booking.total_price?.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {booking.status === 'confirmed' && (
                  <div className="booking-actions">
                    <button className="btn-cancel" disabled>
                      Cancelar reserva
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;