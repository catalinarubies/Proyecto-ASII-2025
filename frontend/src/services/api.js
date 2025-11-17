import axios from 'axios';

// URLs base de las APIs
const USERS_API_URL = 'http://localhost:8080/api'; // users-api
const SEARCH_API_URL = 'http://localhost:8081/api'; // search-api
const FIELDS_API_URL = 'http://localhost:8082/api'; // fields-api
const BOOKINGS_API_URL = 'http://localhost:8083/api'; // bookings-api

// Cliente HTTP principal
const api = {
  /**
   * Configuración de headers con JWT
   */
  getHeaders: () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  /**
   * GET requests
   */
  get: async (url, config = {}) => {
    try {
      // Determinar qué API usar según el endpoint
      let baseURL = USERS_API_URL;
      
      if (url.includes('/search') || url.includes('/fields')) {
        baseURL = SEARCH_API_URL;
      } else if (url.includes('/bookings')) {
        baseURL = BOOKINGS_API_URL;
      }

      const response = await axios.get(`${baseURL}${url}`, {
        ...config,
        headers: {
          ...api.getHeaders(),
          ...config.headers
        }
      });
      
      return response;
    } catch (error) {
      console.error(`[API Error] GET ${url}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * POST requests
   */
  post: async (url, data, config = {}) => {
    try {
      // Determinar qué API usar según el endpoint
      let baseURL = USERS_API_URL;
      
      if (url.includes('/bookings')) {
        baseURL = BOOKINGS_API_URL;
      } else if (url.includes('/fields')) {
        baseURL = FIELDS_API_URL;
      }

      const response = await axios.post(`${baseURL}${url}`, data, {
        ...config,
        headers: {
          ...api.getHeaders(),
          ...config.headers
        }
      });
      
      return response;
    } catch (error) {
      console.error(`[API Error] POST ${url}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * PUT requests
   */
  put: async (url, data, config = {}) => {
    try {
      let baseURL = USERS_API_URL;
      
      if (url.includes('/bookings')) {
        baseURL = BOOKINGS_API_URL;
      } else if (url.includes('/fields')) {
        baseURL = FIELDS_API_URL;
      }

      const response = await axios.put(`${baseURL}${url}`, data, {
        ...config,
        headers: {
          ...api.getHeaders(),
          ...config.headers
        }
      });
      
      return response;
    } catch (error) {
      console.error(`[API Error] PUT ${url}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * DELETE requests
   */
  delete: async (url, config = {}) => {
    try {
      let baseURL = USERS_API_URL;
      
      if (url.includes('/bookings')) {
        baseURL = BOOKINGS_API_URL;
      } else if (url.includes('/fields')) {
        baseURL = FIELDS_API_URL;
      }

      const response = await axios.delete(`${baseURL}${url}`, {
        ...config,
        headers: {
          ...api.getHeaders(),
          ...config.headers
        }
      });
      
      return response;
    } catch (error) {
      console.error(`[API Error] DELETE ${url}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Métodos helper específicos
   */
  auth: {
    login: (email, password) => 
      api.post('/login', { email, password }),
    
    register: (userData) => 
      api.post('/register', userData),
    
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    
    getCurrentUser: () => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    },
    
    saveToken: (token) => {
      localStorage.setItem('token', token);
    },
    
    saveUser: (user) => {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  fields: {
    search: (params) => 
      api.get('/search', { params }),
    
    getById: (id) => 
      api.get(`/fields/${id}`),
    
    create: (fieldData) => 
      api.post('/fields', fieldData)
  },

  bookings: {
    create: (bookingData) => 
      api.post('/bookings', bookingData),
    
    getByUser: (userId) => 
      api.get(`/bookings/user/${userId}`),
    
    getById: (id) => 
      api.get(`/bookings/${id}`),
    
    cancel: (id) => 
      api.delete(`/bookings/${id}`)
  }
};

// Interceptor para manejo global de errores
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      api.auth.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;