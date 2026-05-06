import axios from "axios";

// Use environment variable for API URL, fallback to localhost for development
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 30000, // Increased timeout to 30 seconds
});

const reAuthenticate = async () => {
  const email = localStorage.getItem("userEmail");
  const role = localStorage.getItem("userRole") || "user";

  if (!email) {
    return null;
  }

  const response = await axios.post(
    `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/auth/login`,
    {
      email,
      password: "default",
      role,
    },
    {
      timeout: 12000,
    }
  );

  const newToken = response.data?.access_token;
  if (newToken) {
    localStorage.setItem("authToken", newToken);
  }

  return newToken || null;
};

// Add request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshedToken = await reAuthenticate();

        if (refreshedToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.log("Re-auth failed, clearing invalid token", refreshError);
      }

      localStorage.removeItem("authToken");
    }

    return Promise.reject(error);
  }
);

export default api;