import React from 'react';
import { BedDouble, DollarSign, CheckCircle, XCircle } from 'lucide-react';

const RoomCard = ({ room }) => {
    const isAvailable = room.status === 'AVAILABLE';

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
                <BedDouble size={48} className="text-gray-400" />
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">Room {room.roomNumber}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {room.status}
                    </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{room.type} Room</p>
                <div className="flex justify-between items-center">
                    <div className="flex items-center text-indigo-600 font-bold">
                        <DollarSign size={16} />
                        <span>{room.price}</span>
                        <span className="text-gray-500 text-sm font-normal">/night</span>
                    </div>
                    <button
                        className={`px-4 py-2 rounded text-sm font-medium transition ${isAvailable
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        disabled={!isAvailable}
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomCard;
