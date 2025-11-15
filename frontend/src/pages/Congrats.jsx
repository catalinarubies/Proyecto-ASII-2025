import React from 'react';
import { Link } from 'react-router-dom';

function Congrats() {
  return (
    <div className="congrats-page">
      <div className="congrats-container">
        <div className="success-icon">✅</div>
        
        <h1>¡Reserva Exitosa!</h1>
        
        <p className="success-message">
          Tu cancha ha sido reservada con éxito.
        </p>
        
        <p className="email-notice">
          📧 Recibirás un email de confirmación en breve.
        </p>

        <div className="action-buttons">
          <Link to="/home" className="btn btn-primary">
            Volver a la búsqueda
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Congrats;