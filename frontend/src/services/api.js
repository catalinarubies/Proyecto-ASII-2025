// frontend/src/services/api.js (TEMPORAL)

// Este objeto simula la funcionalidad de Axios que Persona 2 usará,
// pero sin la configuración real del token JWT ni la ejecución HTTP.

const api = {
  // Simula la llamada para obtener los detalles de una cancha
  get: (url) => {
    console.log(`[MOCK API] GET request to ${url}`);
    if (url.includes('/fields/')) {
      // Retorna datos ficticios de una cancha
      return new Promise(resolve => setTimeout(() => resolve({
        data: { 
          id: url.split('/').pop(), // Usa el ID de la URL
          name: "Cancha Fútbol 7 - MOCK", 
          sport: "Fútbol", 
          location: "Centro, Córdoba", 
          price_per_hour: 5000, 
          description: "Cancha con césped sintético de alta calidad."
        }
      }), 200)); // Simula un pequeño retraso
    }
    return Promise.reject(new Error("Endpoint no mockeado"));
  },

  // Simula la llamada para crear una reserva (POST /bookings)
  post: (url, data) => {
    console.log(`[MOCK API] POST request to ${url} with data:`, data);
    if (url === '/bookings') {
      // Simula una respuesta exitosa (código 201 Created)
      return new Promise(resolve => setTimeout(() => resolve({ 
        status: 201, 
        data: { 
          message: "Reserva creada con éxito", 
          bookingId: `mock-bk-${Math.floor(Math.random() * 1000)}`
        }
      }), 300));
    }
    return Promise.reject(new Error("Endpoint no mockeado"));
  },
};

export default api;