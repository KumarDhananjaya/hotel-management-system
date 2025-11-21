import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const AuthService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (user) => api.post('/auth/register', user),
    logout: () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
};

export const RoomService = {
    getAllRooms: () => api.get('/rooms'),
    getRoomById: (id) => api.get(`/rooms/${id}`),
    addRoom: (room) => api.post('/rooms', room),
    updateRoom: (id, room) => api.put(`/rooms/${id}`, room),
    deleteRoom: (id) => api.delete(`/rooms/${id}`),
};

export const GuestService = {
    getAllGuests: () => api.get('/guests'),
    addGuest: (guest) => api.post('/guests', guest),
    updateGuest: (id, guest) => api.put(`/guests/${id}`, guest),
};

export const BookingService = {
    getAllBookings: () => api.get('/bookings'),
    createBooking: (booking) => api.post('/bookings', booking),
    cancelBooking: (id) => api.post(`/bookings/${id}/cancel`),
};

export const PaymentService = {
    processPayment: (payment) => api.post('/payments', payment),
    getPaymentsByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
};

export const AnalyticsService = {
    getSummary: () => api.get('/analytics/summary'),
};

export default api;
