import axios from 'axios';

axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
  
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        try {
          await axios.post('/api/users/refresh-token');
  
          return axios(originalRequest);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          window.location.href = '/sign-in';
        }
      }
  
      return Promise.reject(error);
    }
);