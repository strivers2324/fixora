import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

let isUserRefreshing = false;
let isAdminRefreshing = false;
let userFailedQueue: any[] = [];
let adminFailedQueue: any[] = [];

const processUserQueue = (error: any, token: string | null = null) => {
  userFailedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  userFailedQueue = [];
};

const processAdminQueue = (error: any, token: string | null = null) => {
  adminFailedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  adminFailedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("/login")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAdminApi = originalRequest.url?.includes("/admin");

      if (isAdminApi) {
        if (isAdminRefreshing) {
          return new Promise((resolve, reject) => {
            adminFailedQueue.push({ resolve, reject });
          })
            .then(() => api(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isAdminRefreshing = true;

        try {
          await axios.post(`${api.defaults.baseURL}/admin/auth/refresh`, {}, { withCredentials: true });
          isAdminRefreshing = false;
          processAdminQueue(null);
          return api(originalRequest);
        } catch (refreshError) {
          isAdminRefreshing = false;
          processAdminQueue(refreshError);
          localStorage.removeItem("admin-storage");
          return Promise.reject(refreshError);
        }
      } else {
        if (isUserRefreshing) {
          return new Promise((resolve, reject) => {
            userFailedQueue.push({ resolve, reject });
          })
            .then(() => api(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isUserRefreshing = true;

        try {
          await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
          isUserRefreshing = false;
          processUserQueue(null);
          return api(originalRequest);
        } catch (refreshError) {
          isUserRefreshing = false;
          processUserQueue(refreshError);
          localStorage.removeItem("accountinfo");
          localStorage.removeItem("auth-storage");
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
