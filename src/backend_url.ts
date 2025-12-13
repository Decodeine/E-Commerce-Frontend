// Detect if we're in development (localhost) or production
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Use local backend in development, Railway backend in production
export const API_PATH = isDevelopment 
  ? "http://localhost:8000/api/" 
  : "https://web-production-a739.up.railway.app/api/";