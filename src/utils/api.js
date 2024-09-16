import axios from "axios";
import { code } from "./constant";

// Create an Axios instance
const api = axios.create({
  baseURL:
    "https://ez7bnwrmz5.execute-api.ap-northeast-1.amazonaws.com/" +
    "dev" +
    "/",
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Retrieve the authentication token from wherever it's stored (e.g., localStorage, cookies, etc.)
    let token = localStorage.getItem("accessToken");
    const accessToken = token ? localStorage.getItem("accessToken") : "";
    config.headers["Accept-Language"] = "JP";
    // Add the authentication token to the request headers
    if (accessToken) {
      config.headers["Authorization"] = `${accessToken}`;
    }

    return config;
  },
  (error) => {
    // Handle request error
    // eslint-disable-next-line no-undef
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle successful response
    return response;
  },
  (error) => {
    // Handle error response
    if (
      !error.response ||
      error.response.status == code.UNAUTHORIZED ||
      error.response.status == code.FORBIDDEN
    ) {
      // Handle unauthorized access (e.g., redirect to login page)
      localStorage.clear();
      window.location.href = "/";
    }

    // eslint-disable-next-line no-undef
    return Promise.reject(error);
  }
);

export default api;
