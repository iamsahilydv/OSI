import axios from "axios";

const baseURL: string =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080/api/v1"
    : "https://api.onestepindia.in/api/v1";
// const baseURL: string = "https://api.onestepindia.in/api/v1";
// Create an axios instance with default config
const api = axios.create({
  baseURL: baseURL, // This would be your actual API endpoint
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
console.log("NODE_ENV is:", process.env.NODE_ENV);

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    const status = error.response ? error.response.status : null;

    // if (status === 401) {
    //   // Unauthorized, clear local storage and redirect to login
    //   if (typeof window !== "undefined") {
    //     localStorage.removeItem("user");
    //     window.location.href = "/login";
    //   }
    // }

    return Promise.reject(error);
  }
);

export default api;
