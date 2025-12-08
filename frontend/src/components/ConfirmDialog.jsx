import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
    const getButtonColors = () => {
        switch (type) {
            case 'danger':
                return 'bg-rose-600 hover:bg-rose-700';
            case 'warning':
                return 'bg-amber-600 hover:bg-amber-700';
            default:
                return 'bg-indigo-600 hover:bg-indigo-700';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 rounded-full ${type === 'danger' ? 'bg-rose-100' : type === 'warning' ? 'bg-amber-100' : 'bg-indigo-100'}`}>
                                    <AlertTriangle className={`w-6 h-6 ${type === 'danger' ? 'text-rose-600' : type === 'warning' ? 'text-amber-600' : 'text-indigo-600'}`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                            </div>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`px-6 py-2 text-white rounded-lg transition font-medium ${getButtonColors()}`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDialog;
