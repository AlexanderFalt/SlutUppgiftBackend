import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
axios.interceptors.response.use(
    response => response,
    async error => {
      console.log('[interceptor] got an error:', error.response?.status, error.config.url);
      const originalRequest = error.config;
  
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        try {
          await axios.post(`${API}/api/users/refresh-token`, {}, {withCredentials: true});
  
          originalRequest.withCredentials = true;
          return axios(originalRequest);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          window.location.href = '/sign-in';
        }
      }
  
      return Promise.reject(error);
    }
);