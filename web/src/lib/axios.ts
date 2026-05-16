import axios from "axios";

const api = axios.create({
    baseURL: "/api/v1",
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("/login")) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post("/api/v1/auth/refresh", {}, { withCredentials: true });

                isRefreshing = false;
                processQueue(null);

                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError);

                localStorage.removeItem("accountinfo");
                localStorage.removeItem("auth-storage");

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    },
);

export default api;
