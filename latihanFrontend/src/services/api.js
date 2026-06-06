import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // sesuaikan dengan laravel 
  // baseURL: 'https://laravel-api.kebunkode.com/api',
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