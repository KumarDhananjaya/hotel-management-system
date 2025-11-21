import React, { useEffect, useState } from 'react';
import { RoomService } from '../services/api';
import RoomCard from '../components/RoomCard';
import { Plus } from 'lucide-react';

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await RoomService.getAllRooms();
                setRooms(response.data);
            } catch (error) {
                console.error('Failed to fetch rooms', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    if (loading) return <div className="text-center mt-10">Loading rooms...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Rooms</h1>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
                    <Plus size={20} /> Add Room
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                ))}
            </div>
        </div>
    );
};

export default Rooms;
