// frontend/src/components/BookingForm.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../services/api'; 

function BookingForm({ fieldId }) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validación de campos vacíos
    if (!date || !startTime || !endTime) {
      setError('Por favor, completa todos los campos.');
      setLoading(false);
      return;
    }

    // --- VALIDACIONES ---

    // 1. Calcular minutos totales
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    // 2. Validar que hora fin > hora inicio
    if (endTotalMinutes <= startTotalMinutes) {
      setError('La hora de fin debe ser posterior a la hora de inicio.');
      setLoading(false);
      return;
    }

    // 3. Validar duración mínima (1 hora)
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    if (durationMinutes < 60) {
      setError('La reserva debe durar al menos 1 hora.');
      setLoading(false);
      return;
    }

    // 4. Validar fecha no pasada (comparación de strings)
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      setError('No puedes reservar en una fecha pasada.');
      setLoading(false);
      return;
    }

    // 5. Validar horario hábil (opcional)
    if (startHour < 8 || endHour > 23) {
      setError('El horario debe estar entre 8:00 y 23:00.');
      setLoading(false);
      return;
    }

    // --- OBTENER USER_ID ---
    const userId = parseInt(localStorage.getItem('userId'));
    if (!userId) {
      setError('Debes iniciar sesión para reservar.');
      setLoading(false);
      return;
    }

    // --- PREPARAR DATOS ---
    const bookingData = {
      field_id: fieldId,
      user_id: userId,
      date: date,
      start_time: startTime,
      end_time: endTime,
    };

    // --- LLAMADA A LA API ---
    try {
      await api.post('/bookings', bookingData);
      
      // Navegar a confirmación
      navigate('/congrats', {
        state: {
          bookingData: {
            date,
            start_time: startTime,
            end_time: endTime,
            duration: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
          }
        }
      });

    } catch (err) {
      console.error('Error al crear reserva:', err);
      
      // Manejo específico de errores
      if (err.response?.status === 401) {
        setError('Tu sesión expiró. Por favor, inicia sesión nuevamente.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 409) {
        setError('Este horario ya está reservado. Elige otro.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Datos inválidos.');
      } else {
        setError('Error al crear la reserva. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calcular duración para mostrar al usuario
  const calculateDuration = () => {
    if (!startTime || !endTime) return null;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    const diff = endTotal - startTotal;

    if (diff <= 0) return null;

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  };

  const duration = calculateDuration();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-card">
      <h3>Reserva tu Cancha</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">📅 Fecha:</label>
          <input 
            type="date" 
            id="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            min={today}
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="startTime">🕐 Hora de Inicio:</label>
          <input 
            type="time" 
            id="startTime" 
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)}
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="endTime">🕕 Hora de Fin:</label>
          <input 
            type="time" 
            id="endTime" 
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)}
            required 
          />
        </div>

        {duration && (
          <p className="duration-info">
            ⏱️ Duración: <strong>{duration}</strong>
          </p>
        )}
        
        {error && <p className="error-message">❌ {error}</p>}

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Reservando...' : 'Confirmar Reserva'}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;