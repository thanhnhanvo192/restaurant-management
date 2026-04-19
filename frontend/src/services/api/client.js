import axios from "axios";
import { getAdminAccessToken } from "@/services/admin-session";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const requestUrl = config?.url || "";
  const isAdminEndpoint = requestUrl.startsWith("/admin");

  if (!isAdminEndpoint) {
    return config;
  }

  const adminToken = getAdminAccessToken();

  if (!adminToken) {
    const missingAuthError = new Error("Admin login required");
    missingAuthError.code = "ADMIN_AUTH_REQUIRED";
    return Promise.reject(missingAuthError);
  }

  config.headers = config.headers || {};
  config.headers.Authorization = `Bearer ${adminToken}`;

  return config;
});

api.interceptors.response.use(
  (response) => {
    const payload = response?.data;

    if (payload && typeof payload === "object" && "success" in payload) {
      const normalizedData =
        payload.data && typeof payload.data === "object" ? payload.data : {};

      if (
        payload.message !== undefined &&
        normalizedData.message === undefined
      ) {
        normalizedData.message = payload.message;
      }

      normalizedData._meta = {
        success: Boolean(payload.success),
        timestamp: payload.timestamp,
        error: payload.error || null,
      };

      response.data = normalizedData;
    }

    return response;
  },
  (error) => {
    const payload = error?.response?.data;

    if (payload && typeof payload === "object" && "success" in payload) {
      error.message = payload.message || error.message;
      error.response.data = {
        ...(payload.data || {}),
        message: payload.message,
        _meta: {
          success: false,
          timestamp: payload.timestamp,
          error: payload.error || null,
        },
      };
    }

    return Promise.reject(error);
  },
);

export default api;
