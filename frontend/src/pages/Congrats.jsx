// frontend/src/pages/Congrats.jsx

import React from 'react';
import { Link } from 'react-router-dom';

function Congrats() {
  return (
    <div className="congrats-page">
      <h1>¡Reserva Exitosa! </h1>
      <p>Tu cancha ha sido reservada con éxito. Revisa tu email para la confirmación.</p>
      <Link to="/home">Volver a la búsqueda</Link>
    </div>
  );
}
export default Congrats;