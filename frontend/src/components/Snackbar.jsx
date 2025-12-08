import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Snackbar = ({ message, type = 'info', isOpen, onClose, duration = 3000 }) => {
    React.useEffect(() => {
        if (isOpen && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5" />;
            case 'error':
                return <XCircle className="w-5 h-5" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return 'bg-emerald-500 text-white';
            case 'error':
                return 'bg-rose-500 text-white';
            case 'warning':
                return 'bg-amber-500 text-white';
            default:
                return 'bg-indigo-500 text-white';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                    className={`fixed top-4 left-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-lg shadow-2xl ${getColors()}`}
                >
                    {getIcon()}
                    <span className="font-medium">{message}</span>
                    <button
                        onClick={onClose}
                        className="ml-2 hover:bg-white/20 rounded-full p-1 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Snackbar;
