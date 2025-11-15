// frontend/src/pages/FieldDetail.jsx

import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { useParams } from 'react-router-dom'; 
import BookingForm from '../components/BookingForm';

function FieldDetail() {
  const { fieldId } = useParams(); 
  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchField = async () => {
      try {
        const response = await api.get(`/fields/${fieldId}`); 
        setField(response.data);
      } catch (error) {
        console.error("Error al cargar la cancha:", error);
        setField(null); // Asegura que si falla, se muestre el mensaje de error
      } finally {
        setLoading(false);
      }
    };
    fetchField();
  }, [fieldId]);

  if (loading) return <div>Cargando detalles de la cancha...</div>;
  if (!field) return <div>Cancha no encontrada o error de carga.</div>;

  return (
    <div className="field-detail-page">
      <div className="field-info">
        <h1>{field.name} - {field.sport}</h1>
        <p>📍 **Ubicación:** {field.location}</p>
        <p>💰 **Precio/hora:** ${field.price_per_hour}</p>
        <p className="description">{field.description}</p>
        
        {/* Renderizado de Amenities */}
        {field.amenities && (
          <div className="amenities">
            <h4>Servicios Adicionales:</h4>
            <ul>
              {field.amenities.map((item, index) => (
                <li key={index}>✅ {item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Renderizado de Imágenes */}
        {field.images && (
          <div className="images-gallery">
            <h4>Galería:</h4>
            {/* NOTA: Usaríamos el componente Image o <img> aquí. */}
            {field.images.map((img, index) => (
              <span key={index} style={{marginRight: '10px'}}>

[Image of Sports Field]
</span>
            ))}
          </div>
        )}
      </div>

      <div className="booking-section">
        <BookingForm fieldId={field.id} />
      </div>
    </div>
  );
}
export default FieldDetail;