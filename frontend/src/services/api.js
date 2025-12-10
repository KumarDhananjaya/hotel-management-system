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
    getAvailableRooms: (checkIn, checkOut, type) => api.get('/rooms/available', { params: { checkIn, checkOut, type } }),
    getRoomById: (id) => api.get(`/rooms/${id}`),
    addRoom: (room) => api.post('/rooms', room),
    updateRoom: (id, room) => api.put(`/rooms/${id}`, room),
    deleteRoom: (id) => api.delete(`/rooms/${id}`),
};

export const GuestService = {
    getAllGuests: () => api.get('/guests'),
    addGuest: (guest) => api.post('/guests', guest),
    updateGuest: (id, guest) => api.put(`/guests/${id}`, guest),
    deleteGuest: (id) => api.delete(`/guests/${id}`),
};

export const BookingService = {
    getAllBookings: () => api.get('/bookings'),
    createBooking: (booking) => api.post('/bookings', booking),
    updateBooking: (id, booking) => api.put(`/bookings/${id}`, booking),
    deleteBooking: (id) => api.delete(`/bookings/${id}`),
    cancelBooking: (id) => api.post(`/bookings/${id}/cancel`),
};

export const PaymentService = {
    processPayment: (payment) => api.post('/payments', payment),
    getPaymentsByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
    updatePayment: (id, payment) => api.put(`/payments/${id}`, payment),
    deletePayment: (id) => api.delete(`/payments/${id}`),

    // Enhanced U.S. Payment Methods
    processPaymentWithTaxes: (data) => api.post('/payments/process', data),
    validatePromoCode: (code, amount) => api.post('/payments/validate-promo', { code, amount }),
    processRefund: (id, refundAmount, reason) => api.post(`/payments/${id}/refund`, { refundAmount, reason }),
};

export const UserService = {
    getAllUsers: () => api.get('/users'),
    createUser: (user) => api.post('/users', user),
    updateUser: (id, user) => api.put(`/users/${id}`, user),
    deleteUser: (id) => api.delete(`/users/${id}`),
};

export const HousekeepingService = {
    getAllTasks: () => api.get('/housekeeping/tasks'),
    assignTask: (task) => api.post('/housekeeping/tasks', task),
    updateTaskStatus: (id, status) => api.put(`/housekeeping/tasks/${id}/status`, { status }),
    updateTask: (id, task) => api.put(`/housekeeping/tasks/${id}`, task),
    deleteTask: (id) => api.delete(`/housekeeping/tasks/${id}`),
    getAllMaintenanceLogs: () => api.get('/housekeeping/maintenance'),
    reportIssue: (log) => api.post('/housekeeping/maintenance', log),
    updateMaintenanceLog: (id, log) => api.put(`/housekeeping/maintenance/${id}`, log),
    deleteMaintenanceLog: (id) => api.delete(`/housekeeping/maintenance/${id}`),
    resolveIssue: (id) => api.put(`/housekeeping/maintenance/${id}/resolve`),
};

export const AnalyticsService = {
    getSummary: () => api.get('/analytics/summary'),
    getAnalytics: (startDate, endDate) => api.get('/analytics', { params: { startDate, endDate } }),
    getDailyRevenue: (startDate, endDate) => api.get('/analytics/daily-revenue', { params: { startDate, endDate } }),
    getRoomPerformance: () => api.get('/analytics/room-performance'),
    getMonthlyComparison: (year, month) => api.get('/analytics/monthly-comparison', { params: { year, month } }),
};

export const InventoryService = {
    getAllItems: () => api.get('/inventory/items'),
    getItemById: (id) => api.get(`/inventory/items/${id}`),
    getLowStockItems: () => api.get('/inventory/low-stock'),
    addItem: (item) => api.post('/inventory/items', item),
    updateItem: (id, item) => api.put(`/inventory/items/${id}`, item),
    deleteItem: (id) => api.delete(`/inventory/items/${id}`),
    updateStock: (payload) => api.post('/inventory/update-stock', payload),
    getAllLogs: () => api.get('/inventory/logs'),
};

export default api;


