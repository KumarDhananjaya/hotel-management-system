import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, BedDouble, Users, CalendarCheck, CreditCard } from 'lucide-react';
import { AuthService } from '../services/api';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        AuthService.logout();
    };

    if (!token) return null;

    return (
        <nav className="bg-indigo-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="text-xl font-bold flex items-center gap-2">
                            <LayoutDashboard size={24} />
                            HMS
                        </Link>
                        <div className="hidden md:flex space-x-4">
                            <Link to="/" className="hover:text-indigo-200 flex items-center gap-1">
                                <LayoutDashboard size={18} /> Dashboard
                            </Link>
                            <Link to="/rooms" className="hover:text-indigo-200 flex items-center gap-1">
                                <BedDouble size={18} /> Rooms
                            </Link>
                            <Link to="/guests" className="hover:text-indigo-200 flex items-center gap-1">
                                <Users size={18} /> Guests
                            </Link>
                            <Link to="/bookings" className="hover:text-indigo-200 flex items-center gap-1">
                                <CalendarCheck size={18} /> Bookings
                            </Link>
                            <Link to="/payments" className="hover:text-indigo-200 flex items-center gap-1">
                                <CreditCard size={18} /> Payments
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center gap-2">
                            <User size={20} />
                            <span>Admin</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded flex items-center gap-2 transition"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
