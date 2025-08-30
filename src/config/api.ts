import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token y ajustar headers según el payload
api.interceptors.request.use(
    (config) => {
        //Si es FormData, dejamos que el browser maneje el Content-Type (boundary) ya que sino NO SE MANDAN LAS IMAGENES
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
