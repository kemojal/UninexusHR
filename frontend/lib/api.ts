import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx triggers this function
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error);
      return Promise.reject({
        message: "Network error. Please check your connection.",
      });
    }

    // Handle API errors
    const errorResponse = error.response.data;
    return Promise.reject(
      errorResponse.detail || errorResponse.message || "An error occurred"
    );
  }
);

export const getOrganization = async (orgId: string) => {
  const response = await api.get(`/organizations/${orgId}`);
  return response.data;
};

export default api;
