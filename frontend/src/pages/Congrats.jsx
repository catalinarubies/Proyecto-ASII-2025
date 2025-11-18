import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Congrats.css";

const Congrats = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // Obtener datos de la reserva desde el state de navegación
    if (location.state?.booking) {
      setBooking(location.state.booking);
    } else {
      // Si no hay datos, redirigir a home
      navigate("/home");
    }
  }, [location, navigate]);

  if (!booking) {
    return null; // O un spinner
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="congrats-page">
      <div className="congrats-container">
        <div className="success-animation">
          <div className="checkmark-circle">
            <div className="checkmark">✓</div>
          </div>
        </div>

        <h1 className="congrats-title">¡Reserva Confirmada!</h1>
        <p className="congrats-subtitle">
          Tu cancha ha sido reservada exitosamente
        </p>

        <div className="booking-summary">
          <h2>Detalles de tu reserva</h2>

          <div className="summary-item">
            <span className="summary-label">🏟️ Cancha:</span>
            <span className="summary-value">{booking.fieldName}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">📅 Fecha:</span>
            <span className="summary-value">{formatDate(booking.date)}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">⏰ Horario:</span>
            <span className="summary-value">
              {booking.start_time} - {booking.end_time}
            </span>
          </div>

          {booking.totalPrice && (
            <div className="summary-item total">
              <span className="summary-label">💰 Total:</span>
              <span className="summary-value total-price">
                ${booking.totalPrice.toLocaleString('es-AR')}
              </span>
            </div>
          )}

          {booking._id && (
            <div className="booking-code">
              <span className="code-label">Código de reserva:</span>
              <span className="code-value">{booking._id}</span>
            </div>
          )}
        </div>

        <div className="congrats-message">
          <p>
            ✉️ Te hemos enviado un email de confirmación con todos los detalles
          </p>
          <p>
            📱 Recuerda llevar tu documento de identidad el día de la reserva
          </p>
        </div>

        <div className="congrats-actions">
          <button
            onClick={() => navigate("/home")}
            className="btn-primary"
          >
            🏠 Volver al inicio
          </button>

          <button
            onClick={() => navigate(`/fields/${booking.field_id}`)}
            className="btn-secondary"
          >
            Ver detalles de la cancha
          </button>
        </div>
      </div>
    </div>
  );
};

export default Congrats;