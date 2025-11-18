import axios from 'axios';

// URLs base de las APIs
const USERS_API_URL = 'http://localhost:8080';
const FIELDS_API_URL = 'http://localhost:8081';
const SEARCH_API_URL = 'http://localhost:8082';

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
      let baseURL = USERS_API_URL;
      
      if (url.includes('/search') || url.includes('/fields')) {
        baseURL = url.includes('/search') ? SEARCH_API_URL : FIELDS_API_URL;
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
      let baseURL = USERS_API_URL;
      
      if (url.includes('/bookings') || url.includes('/fields')) {
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
   * Métodos helper específicos
   */
  auth: {
    login: (email, password) => 
      api.post('/login', { email, password }),
    
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
    },
    
    getCurrentUser: () => {
      return {
        id: localStorage.getItem('userId'),
        name: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail')
      };
    }
  },

  fields: {
    search: (query = '', page = 1, size = 10) => 
      api.get(`/search?query=${query}&page=${page}&size=${size}`),
    
    getById: (id) => 
      api.get(`/fields/${id}`)
  },

  bookings: {
    create: (fieldId, userId, date, startTime, endTime) => 
      api.post('/bookings', {
        field_id: fieldId,
        user_id: userId,
        date,
        start_time: startTime,
        end_time: endTime
      }),
    
    getByUser: (userId) => 
      api.get(`/bookings/user/${userId}`)
  }
};

// Interceptor para manejo global de errores
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      api.auth.logout();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;