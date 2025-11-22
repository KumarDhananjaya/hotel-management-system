import React, { useEffect, useState } from 'react';
import { PaymentService, BookingService } from '../services/api';
import { Plus, CreditCard, DollarSign, CheckCircle, Clock, X } from 'lucide-react';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
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
            // Since there's no getAllPayments endpoint, we'll fetch by bookings
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
            // Filter only confirmed bookings that might need payment
            setBookings(response.data.filter(b => b.status !== 'CANCELLED'));
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        }
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

            await PaymentService.processPayment(paymentData);
            alert('Payment processed successfully!');
            setShowModal(false);
            setFormData({
                bookingId: '',
                amount: '',
                method: 'CARD',
                status: 'PAID'
            });
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

        // Auto-fill amount when booking is selected
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
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800';
    };

    const getMethodIcon = (method) => {
        switch (method) {
            case 'CARD':
                return <CreditCard size={16} />;
            case 'CASH':
                return <DollarSign size={16} />;
            case 'UPI':
                return <DollarSign size={16} />;
            default:
                return <DollarSign size={16} />;
        }
    };

    if (loading) return <div className="text-center mt-10">Loading payments...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
                >
                    <Plus size={20} /> Process Payment
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Payments</p>
                            <p className="text-2xl font-bold text-gray-800">{payments.length}</p>
                        </div>
                        <div className="bg-indigo-100 p-3 rounded-full">
                            <CreditCard className="text-indigo-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-800">
                                ${payments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <DollarSign className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Pending Payments</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {payments.filter(p => p.status === 'PENDING').length}
                            </p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <Clock className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No payments found. Process a payment to get started.
                                </td>
                            </tr>
                        ) : (
                            payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">#{payment.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {payment.booking?.guest?.name || 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-500">
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
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Process Payment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Process Payment</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Booking</label>
                                <select
                                    name="bookingId"
                                    value={formData.bookingId}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Choose a booking...</option>
                                    {bookings.map(booking => (
                                        <option key={booking.id} value={booking.id}>
                                            Booking #{booking.id} - {booking.guest.name} - Room {booking.room.roomNumber} (${booking.totalAmount})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                    name="method"
                                    value={formData.method}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="CARD">Credit/Debit Card</option>
                                    <option value="CASH">Cash</option>
                                    <option value="UPI">UPI</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="PAID">Paid</option>
                                    <option value="PENDING">Pending</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                                >
                                    Process Payment
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
