import axios from 'axios';

// URLs base de las APIs (desde variables de entorno o localhost por defecto)
const USERS_API_URL = import.meta.env.VITE_USERS_API_URL || 'http://localhost:8080';
const FIELDS_API_URL = import.meta.env.VITE_FIELDS_API_URL || 'http://localhost:8081';
const SEARCH_API_URL = import.meta.env.VITE_SEARCH_API_URL || 'http://localhost:8082';

// Cliente para users-api (autenticación)
const usersAPI = axios.create({
  baseURL: USERS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cliente para fields-api (canchas y reservas)
const fieldsAPI = axios.create({
  baseURL: FIELDS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cliente para search-api (búsqueda)
const searchAPI = axios.create({
  baseURL: SEARCH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Agregar JWT automáticamente a todas las peticiones
[fieldsAPI, searchAPI].forEach(api => {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
});

// ============ FUNCIONES DE AUTENTICACIÓN ============

/**
 * Login: Autenticar usuario
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{token: string, user: {id: number, name: string, email: string}}>}
 */
export const login = async (email, password) => {
  const response = await usersAPI.post('/login', { email, password });
  return response.data;
};

/**
 * Obtener usuario por ID
 * @param {number} userId 
 * @returns {Promise<{id: number, name: string, email: string}>}
 */
export const getUserById = async (userId) => {
  const response = await usersAPI.get(`/users/${userId}`);
  return response.data;
};

// ============ FUNCIONES DE BÚSQUEDA ============

/**
 * Buscar canchas (MOCK TEMPORAL - Será reemplazado cuando search-api esté lista)
 */
export const searchFields = async (query = '', page = 1, size = 10, filters = {}) => {
  console.log('🔄 USANDO MOCK: search-api no está disponible todavía');
  
  // Mock: devolver datos falsos para poder probar
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        results: [
          {
            id: '1',
            name: 'Cancha Fútbol 7 - Centro',
            sport: 'Fútbol',
            location: 'Centro, Córdoba',
            price_per_hour: 5000,
            description: 'Cancha profesional con césped sintético de última generación',
            image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400',
            available: true
          },
          {
            id: '2',
            name: 'Cancha Básquet Cubierta',
            sport: 'Básquet',
            location: 'Nueva Córdoba',
            price_per_hour: 4000,
            description: 'Cancha cubierta con piso de parquet profesional',
            image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
            available: true
          },
          {
            id: '3',
            name: 'Cancha Fútbol 5 - Güemes',
            sport: 'Fútbol',
            location: 'Barrio Güemes',
            price_per_hour: 3500,
            description: 'Cancha al aire libre, ideal para partidos con amigos',
            image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400',
            available: true
          },
          {
            id: '4',
            name: 'Cancha Tenis Individual',
            sport: 'Tenis',
            location: 'Cerro de las Rosas',
            price_per_hour: 3000,
            description: 'Cancha de tenis con superficie de polvo de ladrillo',
            image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400',
            available: true
          },
          {
            id: '5',
            name: 'Cancha Pádel Doble',
            sport: 'Pádel',
            location: 'Alto Verde',
            price_per_hour: 4500,
            description: 'Cancha profesional de pádel con iluminación LED',
            image: 'https://images.unsplash.com/photo-1709587824751-dd30420f5cf3?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            available: true
          },
          {
            id: '6',
            name: 'Cancha Vóley',
            sport: 'Vóley',
            location: 'Poeta Lugones',
            price_per_hour: 2500,
            description: 'Cancha de arena para vóley playero',
            image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
            available: true
          }
        ],
        total: 6,
        page: 1,
        size: 10
      });
    }, 500); // Simular 500ms de latencia de red
  });
};

// ============ FUNCIONES DE CANCHAS ============

/**
 * Obtener detalle de una cancha por ID
 * @param {string} fieldId 
 * @returns {Promise<Object>}
 */
export const getFieldById = async (fieldId) => {
  const response = await fieldsAPI.get(`/fields/${fieldId}`);
  return response.data;
};

/**
 * Crear una reserva
 * @param {string} fieldId 
 * @param {number} userId 
 * @param {string} date - Formato: "YYYY-MM-DD"
 * @param {string} startTime - Formato: "HH:MM"
 * @param {string} endTime - Formato: "HH:MM"
 * @returns {Promise<Object>}
 */
export const createBooking = async (fieldId, userId, date, startTime, endTime) => {
  const response = await fieldsAPI.post('/bookings', {
    field_id: fieldId,
    user_id: userId,
    date,
    start_time: startTime,
    end_time: endTime,
  });
  return response.data;
};

/**
 * Obtener todas las reservas de un usuario
 * @param {number} userId 
 * @returns {Promise<Array>}
 */
export const getUserBookings = async (userId) => {
  const response = await fieldsAPI.get(`/bookings/user/${userId}`);
  return response.data;
};

// Export por defecto (opcional, para poder importar todo junto)
export default {
  login,
  getUserById,
  searchFields,
  getFieldById,
  createBooking,
  getUserBookings,
};