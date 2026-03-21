import axios from "axios";

export const apiBase = import.meta.env.VITE_API_BASE || "/api";

export const api = axios.create({
  baseURL: apiBase,
  timeout: 12000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("waihuli_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const assetUrl = (path) => {
  if (!path) {
    return "";
  }
  if (path.startsWith("http")) {
    return path;
  }
  return path;
};
