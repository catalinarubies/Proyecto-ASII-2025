import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../services/api';
import '../styles/BookingForm.css';

function BookingForm({ fieldId, fieldName, pricePerHour }) {
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
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    // Validar que hora fin > hora inicio
    if (endTotalMinutes <= startTotalMinutes) {
      setError('La hora de fin debe ser posterior a la hora de inicio.');
      setLoading(false);
      return;
    }

    // Validar duración mínima (1 hora)
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    if (durationMinutes < 60) {
      setError('La reserva debe durar al menos 1 hora.');
      setLoading(false);
      return;
    }

    // Validar fecha no pasada
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      setError('No puedes reservar en una fecha pasada.');
      setLoading(false);
      return;
    }

    // Validar horario hábil (8:00 - 23:00)
    if (startHour < 8 || endHour > 23) {
      setError('El horario debe estar entre 8:00 y 23:00.');
      setLoading(false);
      return;
    }

    // --- OBTENER USER_ID ---
    const userId = parseInt(localStorage.getItem('userId'));
    if (!userId) {
      setError('Debes iniciar sesión para reservar.');
      setTimeout(() => navigate('/login'), 2000);
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

    // Calcular total
    const hours = durationMinutes / 60;
    const total = Math.round(hours * pricePerHour);

    // --- LLAMADA A LA API ---
    try {
      await api.post('/bookings', bookingData);
      
      // Navegar a confirmación con datos
      navigate('/congrats', {
        state: {
          bookingData: {
            fieldName,
            date,
            start_time: startTime,
            end_time: endTime,
            duration: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60 > 0 ? `${durationMinutes % 60}m` : ''}`,
            total
          }
        }
      });

    } catch (err) {
      console.error('Error al crear reserva:', err);
      
      if (err.response?.status === 401) {
        setError('Tu sesión expiró. Redirigiendo al login...');
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

  // Calcular duración para mostrar
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
    const total = Math.round((diff / 60) * pricePerHour);

    return { hours, minutes, total };
  };

  const duration = calculateDuration();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-card">
      <h3>Reservar Cancha</h3>
      
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="date">
            <span className="label-icon">📅</span>
            Fecha
          </label>
          <input 
            type="date" 
            id="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            min={today}
            required 
            className="form-input"
          />
        </div>
        
        <div className="time-inputs">
          <div className="form-group">
            <label htmlFor="startTime">
              <span className="label-icon">🕐</span>
              Hora Inicio
            </label>
            <input 
              type="time" 
              id="startTime" 
              value={startTime} 
              onChange={(e) => setStartTime(e.target.value)}
              required 
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endTime">
              <span className="label-icon">🕕</span>
              Hora Fin
            </label>
            <input 
              type="time" 
              id="endTime" 
              value={endTime} 
              onChange={(e) => setEndTime(e.target.value)}
              required 
              className="form-input"
            />
          </div>
        </div>

        {duration && (
          <div className="duration-info">
            <div className="duration-row">
              <span className="duration-label">⏱️ Duración:</span>
              <span className="duration-value">
                {duration.hours}h {duration.minutes > 0 && `${duration.minutes}m`}
              </span>
            </div>
            <div className="total-row">
              <span className="total-label">Total a pagar:</span>
              <span className="total-value">
                ${duration.total.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? (
            <>
              <span className="spinner-small"></span>
              Reservando...
            </>
          ) : (
            'Confirmar Reserva'
          )}
        </button>
      </form>

      <div className="booking-note">
        <span className="note-icon">ℹ️</span>
        <p>Se enviará confirmación por email</p>
      </div>
    </div>
  );
}

export default BookingForm;