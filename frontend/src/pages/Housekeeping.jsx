import React, { useEffect, useState } from 'react';
import { HousekeepingService, RoomService, UserService } from '../services/api';
import { Plus, CheckCircle, Clock, AlertTriangle, Search, Filter, User, Calendar, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Housekeeping = () => {
    const [activeTab, setActiveTab] = useState('tasks'); // tasks, maintenance
    const [tasks, setTasks] = useState([]);
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form Data
    const [taskForm, setTaskForm] = useState({
        roomId: '',
        staffId: '',
        description: '',
        scheduledDate: new Date().toISOString().split('T')[0]
    });
    const [maintenanceForm, setMaintenanceForm] = useState({
        roomId: '',
        issue: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, maintenanceRes, roomsRes, usersRes] = await Promise.all([
                HousekeepingService.getAllTasks(),
                HousekeepingService.getAllMaintenanceLogs(),
                RoomService.getAllRooms(),
                UserService.getAllUsers()
            ]);
            setTasks(tasksRes.data);
            setMaintenanceLogs(maintenanceRes.data);
            setRooms(roomsRes.data);
            setStaff(usersRes.data.filter(u => u.role === 'HOUSEKEEPING' || u.role === 'STAFF'));
        } catch (error) {
            console.error('Failed to fetch housekeeping data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignTask = async (e) => {
        e.preventDefault();
        try {
            await HousekeepingService.assignTask({
                room: { id: parseInt(taskForm.roomId) },
                assignedStaff: taskForm.staffId ? { id: parseInt(taskForm.staffId) } : null,
                description: taskForm.description,
                scheduledDate: taskForm.scheduledDate
            });
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert('Failed to assign task');
        }
    };

    const handleReportIssue = async (e) => {
        e.preventDefault();
        try {
            await HousekeepingService.reportIssue({
                room: { id: parseInt(maintenanceForm.roomId) },
                issue: maintenanceForm.issue
            });
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert('Failed to report issue');
        }
    };

    const updateTaskStatus = async (id, status) => {
        try {
            await HousekeepingService.updateTaskStatus(id, status);
            fetchData();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const resolveIssue = async (id) => {
        try {
            await HousekeepingService.resolveIssue(id);
            fetchData();
        } catch (error) {
            console.error('Failed to resolve issue', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
            case 'RESOLVED': return 'bg-emerald-100 text-emerald-700';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
            case 'PENDING': return 'bg-amber-100 text-amber-700';
            default: return 'bg-gray-100 text-gray-700';
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
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Housekeeping</h1>
                    <p className="text-gray-500 mt-1">Manage cleaning schedules and maintenance</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 font-medium"
                    >
                        <Plus size={20} />
                        {activeTab === 'tasks' ? 'Assign Task' : 'Report Issue'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tasks' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Cleaning Tasks
                </button>
                <button
                    onClick={() => setActiveTab('maintenance')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'maintenance' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Maintenance Logs
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {activeTab === 'tasks' ? (
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tasks.map((task, index) => (
                                <motion.tr
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        Room {task.room.roomNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {task.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {task.assignedStaff ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-600 font-bold">
                                                    {task.assignedStaff.name.charAt(0)}
                                                </div>
                                                <span className="text-sm text-gray-700">{task.assignedStaff.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {task.scheduledDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {task.status !== 'COMPLETED' && (
                                            <div className="flex gap-2">
                                                {task.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                                                        className="text-blue-600 hover:text-blue-800 text-xs border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50"
                                                    >
                                                        Start
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                                                    className="text-emerald-600 hover:text-emerald-800 text-xs border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50"
                                                >
                                                    Complete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Issue</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reported By</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {maintenanceLogs.map((log, index) => (
                                <motion.tr
                                    key={log.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        Room {log.room.roomNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle size={16} className="text-amber-500" />
                                            {log.issue}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {log.reportedBy ? log.reportedBy.name : 'System'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(log.reportedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {log.status !== 'RESOLVED' && (
                                            <button
                                                onClick={() => resolveIssue(log.id)}
                                                className="text-emerald-600 hover:text-emerald-800 text-xs border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50"
                                            >
                                                Mark Resolved
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
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
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {activeTab === 'tasks' ? 'Assign Cleaning Task' : 'Report Maintenance Issue'}
                                </h2>
                            </div>

                            <form onSubmit={activeTab === 'tasks' ? handleAssignTask : handleReportIssue} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Room</label>
                                    <select
                                        value={activeTab === 'tasks' ? taskForm.roomId : maintenanceForm.roomId}
                                        onChange={(e) => activeTab === 'tasks'
                                            ? setTaskForm({ ...taskForm, roomId: e.target.value })
                                            : setMaintenanceForm({ ...maintenanceForm, roomId: e.target.value })
                                        }
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="">Choose a room...</option>
                                        {rooms.map(room => (
                                            <option key={room.id} value={room.id}>
                                                Room {room.roomNumber} ({room.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {activeTab === 'tasks' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
                                            <input
                                                type="text"
                                                value={taskForm.description}
                                                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                                required
                                                placeholder="e.g. Deep Cleaning, Towel Change"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To (Optional)</label>
                                            <select
                                                value={taskForm.staffId}
                                                onChange={(e) => setTaskForm({ ...taskForm, staffId: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                            >
                                                <option value="">Unassigned</option>
                                                {staff.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                                            <input
                                                type="date"
                                                value={taskForm.scheduledDate}
                                                onChange={(e) => setTaskForm({ ...taskForm, scheduledDate: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                                        <textarea
                                            rows="3"
                                            value={maintenanceForm.issue}
                                            onChange={(e) => setMaintenanceForm({ ...maintenanceForm, issue: e.target.value })}
                                            required
                                            placeholder="e.g. AC not cooling, Leaky faucet"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                )}

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
                                        {activeTab === 'tasks' ? 'Assign Task' : 'Report Issue'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Housekeeping;
