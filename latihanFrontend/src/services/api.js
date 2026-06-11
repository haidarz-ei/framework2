import axios from "axios";

const APP_URL = "http://localhost:8000";
// const APP_URL = "https://laravel-api.kebunkode.com";

export const STORAGE_URL = `${APP_URL}/storage`;

const api = axios.create({
  baseURL: `${APP_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Tambahkan token jika ada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;