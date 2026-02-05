import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store/store.js'
import axios from 'axios'

// 1. Configuración Base
axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

// 2. INTERCEPTOR DE SOLICITUDES (El portero de salida)
axios.interceptors.request.use(
  (config) => {
    // Intentamos leer el token del localStorage (es lo más rápido y seguro aquí)
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. INTERCEPTOR DE RESPUESTAS (El portero de entrada)
// Si el token venció (Error 401), cerramos la sesión automáticamente.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si estamos en una ruta de admin, forzamos logout
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
