import React, { useEffect, useState } from 'react';
import { AnalyticsService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DollarSign, TrendingUp, Percent, Award, Calendar, BedDouble } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [dailyRevenue, setDailyRevenue] = useState([]);
    const [roomPerformance, setRoomPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchAllData();
    }, [dateRange]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const analyticsResponse = await AnalyticsService.getAnalytics(
                dateRange.startDate,
                dateRange.endDate
            );
            console.log('Analytics Response:', analyticsResponse.data);
            setAnalytics(analyticsResponse.data);

            const dailyResponse = await AnalyticsService.getDailyRevenue(
                dateRange.startDate,
                dateRange.endDate
            );
            setDailyRevenue(dailyResponse.data);

            const roomResponse = await AnalyticsService.getRoomPerformance();
            setRoomPerformance(roomResponse.data);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="text-red-500 text-xl font-bold mb-2">Failed to load analytics data</div>
                    <button
                        onClick={fetchAllData}
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const usMetrics = analytics.usHotelMetrics || {};
    const revenue = analytics.revenue || {};
    const occupancy = analytics.occupancy || {};
    const bookings = analytics.bookings || {};

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-6">
            <motion.div
                className="max-w-7xl mx-auto space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Hotel Analytics Dashboard</h1>
                        <p className="text-gray-600 mt-1">U.S. Hotel Industry Metrics & Performance</p>
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </motion.div>

                {/* U.S. Hotel Metrics - Primary KPIs */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* ADR */}
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <DollarSign className="w-10 h-10 opacity-80" />
                            <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                                ADR
                            </div>
                        </div>
                        <div className="text-3xl font-bold mb-1">
                            ${(usMetrics.adr || 0).toFixed(2)}
                        </div>
                        <div className="text-indigo-100 text-sm">Average Daily Rate</div>
                        <div className="mt-3 text-xs opacity-75">
                            Industry Avg: $100-$300
                        </div>
                    </div>

                    {/* RevPAR */}
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <TrendingUp className="w-10 h-10 opacity-80" />
                            <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                                RevPAR
                            </div>
                        </div>
                        <div className="text-3xl font-bold mb-1">
                            ${(usMetrics.revpar || 0).toFixed(2)}
                        </div>
                        <div className="text-emerald-100 text-sm">Revenue Per Available Room</div>
                        <div className="mt-3 text-xs opacity-75">
                            Industry Avg: $50-$200
                        </div>
                    </div>

                    {/* Occupancy Rate */}
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <Percent className="w-10 h-10 opacity-80" />
                            <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                                Occupancy
                            </div>
                        </div>
                        <div className="text-3xl font-bold mb-1">
                            {(occupancy.occupancyRate || 0).toFixed(1)}%
                        </div>
                        <div className="text-amber-100 text-sm">
                            {occupancy.roomsSold || 0} / {occupancy.totalAvailableRooms || 0} rooms
                        </div>
                        <div className="mt-3 text-xs opacity-75">
                            Target: 70-80%
                        </div>
                    </div>

                    {/* RevPOR */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <Award className="w-10 h-10 opacity-80" />
                            <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                                RevPOR
                            </div>
                        </div>
                        <div className="text-3xl font-bold mb-1">
                            ${(usMetrics.revpor || 0).toFixed(2)}
                        </div>
                        <div className="text-purple-100 text-sm">Revenue Per Occupied Room</div>
                        <div className="mt-3 text-xs opacity-75">
                            Includes all revenue streams
                        </div>
                    </div>
                </motion.div>

                {/* Revenue & Bookings Summary */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-indigo-100 p-3 rounded-xl">
                                <DollarSign className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Total Revenue</div>
                                <div className="text-2xl font-bold text-gray-800">
                                    ${(revenue.totalRevenue || 0).toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Room Revenue:</span>
                                <span className="font-semibold">${(revenue.totalRoomRevenue || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Taxes Collected:</span>
                                <span className="font-semibold">${(revenue.totalTaxes || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-emerald-100 p-3 rounded-xl">
                                <Calendar className="text-emerald-600" size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Total Bookings</div>
                                <div className="text-2xl font-bold text-gray-800">
                                    {bookings.totalBookings || 0}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Avg Length of Stay:</span>
                                <span className="font-semibold">{(usMetrics.alos || 0).toFixed(1)} nights</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Avg Booking Value:</span>
                                <span className="font-semibold">${(revenue.averageBookingValue || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-amber-100 p-3 rounded-xl">
                                <BedDouble className="text-amber-600" size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Total Rooms</div>
                                <div className="text-2xl font-bold text-gray-800">
                                    {occupancy.totalRooms || 0}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Rooms Sold:</span>
                                <span className="font-semibold">{occupancy.roomsSold || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Available Rooms:</span>
                                <span className="font-semibold">{occupancy.totalAvailableRooms || 0}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Charts Section */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Revenue Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Revenue Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={dailyRevenue}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Room Type Performance */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Room Type Performance</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={roomPerformance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="roomType" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="bookings" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Room Type Details Table */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Detailed Room Type Analysis</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Room Type</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Rooms</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Bookings</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roomPerformance.map((room, index) => (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 font-medium text-gray-800">{room.roomType}</td>
                                        <td className="py-3 px-4 text-right text-gray-600">{room.totalRooms}</td>
                                        <td className="py-3 px-4 text-right text-gray-600">{room.bookings}</td>
                                        <td className="py-3 px-4 text-right font-semibold text-gray-800">
                                            ${(room.revenue || 0).toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                                            ${(room.averageRevenue || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
