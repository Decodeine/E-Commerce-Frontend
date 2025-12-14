// Detect if we're in development (localhost) or production
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Use environment variable if provided, otherwise use defaults
const defaultBackendUrl = isDevelopment 
  ? "http://localhost:8000/api/" 
  : "https://web-production-a739.up.railway.app/api/";

export const API_PATH = import.meta.env.VITE_API_URL || defaultBackendUrl;