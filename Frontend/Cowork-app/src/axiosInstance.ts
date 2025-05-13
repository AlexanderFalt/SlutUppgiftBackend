import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError
} from 'axios';

interface RefreshResponse {
  accessToken: string;
}

// A queue item that resolves with a new token (string)
interface FailedQueueItem {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

const API = import.meta.env.VITE_API_URL as string;

const api: AxiosInstance = axios.create({
  baseURL: API,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token !== null) {
      resolve(token);
    } else {
      reject(new Error('Could not get refresh token'));
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (err: AxiosError) => {
    const { config, response } = err;
    const originalRequest = config as AxiosRequestConfig & { _retry?: boolean };

    if (originalRequest.url?.includes('/api/users/refresh-token')) {
      return Promise.reject(err);
    }

    if (response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Return a Promise<string>, then map string → AxiosResponse
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            };
            return api(originalRequest);
          })
          .catch(error => Promise.reject(error));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise<AxiosResponse>((resolve, reject) => {
        api
          .post<RefreshResponse>('/api/users/refresh-token')
          .then(({ data }) => {
            const newToken = data.accessToken;
            // set default for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            processQueue(null, newToken);

            // retry original
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newToken}`,
            };
            resolve(api(originalRequest));
          })
          .catch((refreshError) => {
            processQueue(refreshError, null);
            window.location.href = '/sign-in';
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(err);
  }
);

export default api;