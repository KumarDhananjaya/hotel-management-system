import React, { useEffect, useState } from 'react';
import { GuestService } from '../services/api';
import { Plus, Search, Phone, Mail, MapPin } from 'lucide-react';

const Guests = () => {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                const response = await GuestService.getAllGuests();
                setGuests(response.data);
            } catch (error) {
                console.error('Failed to fetch guests', error);
            } finally {
                setLoading(false);
            }
        };
        fetchGuests();
    }, []);

    const filteredGuests = guests.filter(guest =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.phone.includes(searchTerm)
    );

    if (loading) return <div className="text-center mt-10">Loading guests...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Guests</h1>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
                    <Plus size={20} /> Add Guest
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center gap-2 border">
                <Search className="text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search guests by name, email, or phone..."
                    className="flex-1 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredGuests.map((guest) => (
                            <tr key={guest.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Mail size={14} className="mr-2" /> {guest.email}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Phone size={14} className="mr-2" /> {guest.phone}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin size={14} className="mr-2" /> {guest.address}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    <button className="text-red-600 hover:text-red-900">History</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Guests;
