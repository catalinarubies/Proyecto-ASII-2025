// frontend/src/components/BookingForm.jsx

import React, { useState } from 'react';
import api from '../services/api'; 
import { useNavigate } from 'react-router-dom'; 

function BookingForm({ fieldId }) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // MOCK: Asumimos que el USER_ID se obtiene del JWT manejado por Persona 2
  const MOCK_USER_ID = 1; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!date || !startTime || !endTime) {
      setError('Por favor, completa todos los campos de horario.');
      setLoading(false);
      return;
    }

    // --- VALIDACIONES DE FRONT-END ---

    // 1. Hora de Inicio vs Hora de Fin y Duración Mínima
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    if (endTotalMinutes <= startTotalMinutes) {
        setError('La hora de fin debe ser posterior a la hora de inicio.');
        setLoading(false);
        return;
    }
    if (endTotalMinutes - startTotalMinutes < 60) {
        setError('La reserva debe durar al menos 1 hora.');
        setLoading(false);
        return;
    }

    // 2. Fecha no pasada
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Limpiar hora para comparar solo la fecha

    if (selectedDate < today) {
        setError('No puedes reservar una cancha en una fecha pasada.');
        setLoading(false);
        return;
    }

    // --- LLAMADA A LA API ---
    const bookingData = {
      field_id: fieldId,
      user_id: MOCK_USER_ID, 
      date: date,
      start_time: startTime,
      end_time: endTime,
    };

    try {
      await api.post('/bookings', bookingData); 
      navigate('/congrats');

    } catch (err) {
      // Manejo de errores basado en la respuesta esperada del backend (fields-api)
      const message = err.response?.data?.message || 'Error de reserva: Posiblemente ya esté ocupada o los horarios sean inválidos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-card">
      <h3>Reserva tu Cancha</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">Fecha:</label>
          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        
        <div className="form-group">
          <label htmlFor="startTime">Hora de Inicio:</label>
          <input type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        
        <div className="form-group">
          <label htmlFor="endTime">Hora de Fin:</label>
          <input type="time" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>
        
        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Reservando...' : 'Confirmar Reserva'}
        </button>
      </form>
      {/* NOTA: Aquí irían los estilos para hacer que se vea bien. */}
    </div>
  );
}
export default BookingForm;