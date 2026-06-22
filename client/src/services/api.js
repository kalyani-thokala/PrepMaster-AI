import axios from "axios";

// Determine API base url
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HTTP cookies automatically
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor to attach JWT access token in Authorization headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("prepmaster-access-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle JWT Refresh Tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Bypass interceptor if skipAuthRefresh flag is set
    if (originalRequest?.skipAuthRefresh) {
      return Promise.reject(error);
    }

    // Avoid infinite loop if refresh token route itself fails
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes("/auth/refresh-token")) {
      originalRequest._retry = true;

      try {
        // Attempt to request new access token using refresh token cookie
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.status === 200) {
          const { accessToken } = refreshResponse.data.data;
          if (accessToken) {
            localStorage.setItem("prepmaster-access-token", accessToken);
          }
          // Retry the original request that failed
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, log out the user by clearing state
        console.error("Refresh token expired or invalid:", refreshError);
        // Clear local storage and redirect
        localStorage.removeItem("auth-user");
        localStorage.removeItem("prepmaster-access-token");
        window.location.href = "/#/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
