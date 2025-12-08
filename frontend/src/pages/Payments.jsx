import React, { useEffect, useState } from 'react';
import { PaymentService, BookingService } from '../services/api';
import { Plus, CreditCard, DollarSign, Clock, X, Search, Filter, Edit2, Trash2, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentCheckoutModal from '../components/PaymentCheckoutModal';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [selectedBookingForCheckout, setSelectedBookingForCheckout] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPaymentId, setCurrentPaymentId] = useState(null);
    const [formData, setFormData] = useState({
        bookingId: '',
        amount: '',
        method: 'CARD',
        status: 'PAID'
    });

    useEffect(() => {
        fetchPayments();
        fetchBookings();
    }, []);

    const fetchPayments = async () => {
        try {
            const bookingsRes = await BookingService.getAllBookings();
            const allPayments = [];

            for (const booking of bookingsRes.data) {
                try {
                    const paymentsRes = await PaymentService.getPaymentsByBooking(booking.id);
                    allPayments.push(...paymentsRes.data.map(p => ({ ...p, booking })));
                } catch (error) {
                    // No payments for this booking
                }
            }

            setPayments(allPayments);
        } catch (error) {
            console.error('Failed to fetch payments', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await BookingService.getAllBookings();
            setBookings(response.data.filter(b => b.status !== 'CANCELLED'));
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        }
    };

    const handleEdit = (payment) => {
        setFormData({
            bookingId: payment.booking.id,
            amount: payment.amount,
            method: payment.method,
            status: payment.status
        });
        setCurrentPaymentId(payment.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this payment record?')) {
            try {
                await PaymentService.deletePayment(id);
                fetchPayments();
            } catch (error) {
                console.error('Failed to delete payment', error);
                alert('Failed to delete payment.');
            }
        }
    };

    const openAddModal = () => {
        setFormData({
            bookingId: '',
            amount: '',
            method: 'CARD',
            status: 'PAID'
        });
        setIsEditing(false);
        setCurrentPaymentId(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const paymentData = {
                booking: { id: parseInt(formData.bookingId) },
                amount: parseFloat(formData.amount),
                method: formData.method,
                status: formData.status
            };

            if (isEditing) {
                await PaymentService.updatePayment(currentPaymentId, paymentData);
            } else {
                await PaymentService.processPayment(paymentData);
            }

            setShowModal(false);
            fetchPayments();
        } catch (error) {
            console.error('Failed to process payment', error);
            alert('Failed to process payment. ' + (error.response?.data?.message || 'Please try again.'));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'bookingId' && value) {
            const selectedBooking = bookings.find(b => b.id === parseInt(value));
            if (selectedBooking) {
                setFormData(prev => ({
                    ...prev,
                    amount: selectedBooking.totalAmount
                }));
            }
        }
    };

    const getStatusColor = (status) => {
        return status === 'PAID'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-amber-100 text-amber-700';
    };

    const getMethodIcon = (method) => {
        switch (method) {
            case 'CARD': return <CreditCard size={16} />;
            case 'CASH': return <DollarSign size={16} />;
            case 'UPI': return <DollarSign size={16} />;
            default: return <DollarSign size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payments</h1>
                    <p className="text-gray-500 mt-1">Track revenue and transactions</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search payments..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                        />
                    </div>
                    <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
                        <Filter size={20} />
                    </button>
                    <button
                        onClick={openAddModal}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 font-medium"
                    >
                        <Plus size={20} /> Process Payment
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Transactions</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{payments.length}</p>
                        </div>
                        <div className="bg-indigo-50 p-3 rounded-xl">
                            <CreditCard className="text-indigo-600" size={24} />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                ${payments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-xl">
                            <DollarSign className="text-emerald-600" size={24} />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Pending</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {payments.filter(p => p.status === 'PENDING').length}
                            </p>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-xl">
                            <Clock className="text-amber-600" size={24} />
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking Details</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                    No payments found.
                                </td>
                            </tr>
                        ) : (
                            payments.map((payment, index) => (
                                <motion.tr
                                    key={payment.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">#{payment.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {payment.booking?.guest?.name || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Room {payment.booking?.room?.roomNumber || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">
                                            ${payment.amount?.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            {getMethodIcon(payment.method)}
                                            {payment.method}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(payment)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Edit Payment"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(payment.id)}
                                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Delete Payment"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {isEditing ? 'Edit Payment' : 'Process Payment'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Booking</label>
                                    <select
                                        name="bookingId"
                                        value={formData.bookingId}
                                        onChange={handleChange}
                                        required
                                        disabled={isEditing}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-50"
                                    >
                                        <option value="">Choose a booking...</option>
                                        {bookings.map(booking => (
                                            <option key={booking.id} value={booking.id}>
                                                Booking #{booking.id} - {booking.guest.name} (${booking.totalAmount})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                    <select
                                        name="method"
                                        value={formData.method}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="CARD">Credit/Debit Card</option>
                                        <option value="CASH">Cash</option>
                                        <option value="UPI">UPI</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="PAID">Paid</option>
                                        <option value="PENDING">Pending</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-200"
                                    >
                                        {isEditing ? 'Save Changes' : 'Process Payment'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Payment Checkout Modal with Tax Breakdown */}
            <AnimatePresence>
                {showCheckoutModal && selectedBookingForCheckout && (
                    <PaymentCheckoutModal
                        booking={selectedBookingForCheckout}
                        onSuccess={(payment) => {
                            setShowCheckoutModal(false);
                            setSelectedBookingForCheckout(null);
                            fetchPayments();
                            alert('Payment processed successfully!');
                        }}
                        onClose={() => {
                            setShowCheckoutModal(false);
                            setSelectedBookingForCheckout(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Payments;
