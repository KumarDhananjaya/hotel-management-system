import React, { useEffect, useState } from 'react';
import { BookingService, RoomService, GuestService } from '../services/api';
import { Plus, Calendar, CheckCircle, XCircle, Clock, X } from 'lucide-react';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        roomId: '',
        guestId: '',
        email: '',
        checkInDate: '',
        checkOutDate: '',
        totalAmount: '',
        status: 'PENDING'
    });

    useEffect(() => {
        fetchBookings();
        fetchRoomsAndGuests();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await BookingService.getAllBookings();
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
            alert('Failed to load bookings. Please check if you are logged in.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoomsAndGuests = async () => {
        try {
            const [roomsRes, guestsRes] = await Promise.all([
                RoomService.getAllRooms(),
                GuestService.getAllGuests()
            ]);
            setRooms(roomsRes.data);
            setGuests(guestsRes.data);
        } catch (error) {
            console.error('Failed to fetch rooms and guests', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const bookingData = {
                room: { id: parseInt(formData.roomId) },
                guest: {
                    id: parseInt(formData.guestId),
                    email: formData.email
                },
                checkInDate: formData.checkInDate,
                checkOutDate: formData.checkOutDate,
                totalAmount: parseFloat(formData.totalAmount),
                status: formData.status
            };

            await BookingService.createBooking(bookingData);
            alert('Booking created successfully!');
            setShowModal(false);
            setFormData({
                roomId: '',
                guestId: '',
                email: '',
                checkInDate: '',
                checkOutDate: '',
                totalAmount: '',
                status: 'PENDING'
            });
            fetchBookings();
        } catch (error) {
            console.error('Failed to create booking', error);
            alert('Failed to create booking. ' + (error.response?.data?.message || 'Please try again.'));
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleGuestChange = (e) => {
        const guestId = e.target.value;
        const selectedGuest = guests.find(g => g.id === parseInt(guestId));
        setFormData({
            ...formData,
            guestId: guestId,
            email: selectedGuest ? selectedGuest.email : ''
        });
    };

    const handleCancelBooking = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await BookingService.cancelBooking(id);
                alert('Booking cancelled successfully!');
                fetchBookings();
            } catch (error) {
                console.error('Failed to cancel booking', error);
                alert('Failed to cancel booking. Please try again.');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="text-center mt-10">Loading bookings...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Bookings</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
                >
                    <Plus size={20} /> New Booking
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{booking.guest.name}</div>
                                    <div className="text-sm text-gray-500">{booking.guest.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">Room {booking.room.roomNumber}</div>
                                    <div className="text-sm text-gray-500">{booking.room.type}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col space-y-1 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} /> {booking.checkInDate}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} /> {booking.checkOutDate}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${booking.totalAmount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {booking.status !== 'CANCELLED' && (
                                        <button
                                            onClick={() => handleCancelBooking(booking.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* New Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">New Booking</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Guest</label>
                                <select
                                    name="guestId"
                                    value={formData.guestId}
                                    onChange={handleGuestChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Choose a guest...</option>
                                    {guests.map(guest => (
                                        <option key={guest.id} value={guest.id}>
                                            {guest.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Guest Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter guest email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Room</label>
                                <select
                                    name="roomId"
                                    value={formData.roomId}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Choose a room...</option>
                                    {rooms.filter(room => room.status === 'AVAILABLE').map(room => (
                                        <option key={room.id} value={room.id}>
                                            Room {room.roomNumber} - {room.type} (${room.price}/night)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                                <input
                                    type="date"
                                    name="checkInDate"
                                    value={formData.checkInDate}
                                    onChange={handleChange}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                                <input
                                    type="date"
                                    name="checkOutDate"
                                    value={formData.checkOutDate}
                                    onChange={handleChange}
                                    required
                                    min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                                <input
                                    type="number"
                                    name="totalAmount"
                                    value={formData.totalAmount}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                                >
                                    Create Booking
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

export default Bookings;
