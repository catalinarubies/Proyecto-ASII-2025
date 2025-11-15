

/**
 * Mock API temporal para desarrollo en paralelo
 * Este archivo será REEMPLAZADO por Persona 2 con:
 * - Axios real
 * - Interceptores JWT
 * - Endpoints reales del backend
 */

const api = {
  /**
   * Simula GET requests
   */
  get: (url) => {
    console.log(`[MOCK API] GET ${url}`);
    
    // GET /fields (búsqueda - para Persona 2)
    if (url.includes('/search') || url === '/fields') {
      return new Promise(resolve => setTimeout(() => resolve({
        data: {
          fields: [
            { 
              _id: "mock-field-1",
              id: "mock-field-1",
              name: "Cancha Fútbol 5", 
              sport: "Fútbol", 
              location: "Centro, Córdoba",
              price_per_hour: 4000,
              description: "Cancha techada con césped sintético.",
              amenities: ["Vestuarios", "Estacionamiento"],
              images: []
            },
            { 
              _id: "mock-field-2",
              id: "mock-field-2",
              name: "Cancha Fútbol 7", 
              sport: "Fútbol", 
              location: "Nueva Córdoba",
              price_per_hour: 5000,
              description: "Cancha al aire libre con iluminación nocturna.",
              amenities: ["Vestuarios", "Parrilla", "Buffet"],
              images: []
            },
            { 
              _id: "mock-field-3",
              id: "mock-field-3",
              name: "Cancha Básquet", 
              sport: "Básquet", 
              location: "Alberdi",
              price_per_hour: 3500,
              description: "Cancha techada profesional.",
              amenities: ["Vestuarios", "Estacionamiento"],
              images: []
            }
          ],
          total: 3,
          page: 1
        }
      }), 500));
    }
    
    // GET /fields/:id (detalle de cancha)
    if (url.includes('/fields/')) {
      const fieldId = url.split('/').pop();
      
      return new Promise(resolve => setTimeout(() => resolve({
        data: { 
          _id: fieldId,
          id: fieldId,
          name: "Cancha Fútbol 7 - Centro", 
          sport: "Fútbol", 
          location: "Centro, Córdoba", 
          price_per_hour: 5000, 
          description: "Cancha con césped sintético de alta calidad. Ideal para partidos de 7 jugadores. Incluye iluminación nocturna y sistema de riego automático.",
          amenities: ["Vestuarios", "Estacionamiento gratuito", "Parrilla", "Buffet", "Duchas calientes"],
          images: [],
          owner_id: 1,
          created_at: new Date().toISOString(),
        }
      }), 300));
    }
    
    return Promise.reject(new Error(`[MOCK API] Endpoint GET ${url} no mockeado`));
  },

  /**
   * Simula POST requests
   */
  post: (url, data) => {
    console.log(`[MOCK API] POST ${url}`, data);
    
    // POST /bookings (crear reserva)
    if (url === '/bookings') {
      // Validación básica mock
      if (!data.field_id || !data.user_id || !data.date) {
        return Promise.reject({
          response: {
            status: 400,
            data: { message: "Faltan campos requeridos" }
          }
        });
      }

      // Simular error 5% del tiempo (para testing)
      if (Math.random() < 0.05) {
        return Promise.reject({
          response: {
            status: 409,
            data: { message: "Este horario ya está reservado (error simulado)" }
          }
        });
      }
      
      // Respuesta exitosa
      return new Promise(resolve => setTimeout(() => resolve({ 
        status: 201, 
        data: { 
          message: "Reserva creada con éxito",
          booking: {
            _id: `mock-booking-${Date.now()}`,
            field_id: data.field_id,
            user_id: data.user_id,
            date: data.date,
            start_time: data.start_time,
            end_time: data.end_time,
            created_at: new Date().toISOString()
          }
        }
      }), 400));
    }

    // POST /login (para Persona 2)
    if (url === '/login' || url.includes('login')) {
      return new Promise(resolve => setTimeout(() => resolve({
        data: {
          token: "mock-jwt-token-12345",
          user: {
            id: 1,
            name: "Usuario Mock",
            email: data.email || "usuario@example.com"
          }
        }
      }), 300));
    }
    
    return Promise.reject(new Error(`[MOCK API] Endpoint POST ${url} no mockeado`));
  },

  /**
   * Placeholder para otros métodos
   */
  put: (url, data) => {
    console.log(`[MOCK API] PUT ${url}`, data);
    return Promise.reject(new Error(`[MOCK API] PUT no implementado`));
  },

  delete: (url) => {
    console.log(`[MOCK API] DELETE ${url}`);
    return Promise.reject(new Error(`[MOCK API] DELETE no implementado`));
  }
};

export default api;

