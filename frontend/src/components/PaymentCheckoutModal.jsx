import React, { useState, useEffect } from 'react';
import { PaymentService } from '../services/api';
import { DollarSign, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentCheckoutModal = ({ booking, onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        stateCode: 'NY',
        county: 'New York',
        city: 'New York',
        promoCode: ''
    });
    const [taxBreakdown, setTaxBreakdown] = useState(null);
    const [promoValidation, setPromoValidation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // U.S. States for dropdown
    const usStates = [
        { code: 'NY', name: 'New York' },
        { code: 'CA', name: 'California' },
        { code: 'FL', name: 'Florida' },
        { code: 'TX', name: 'Texas' },
        { code: 'NV', name: 'Nevada' }
    ];

    useEffect(() => {
        calculateTaxes();
    }, [formData.stateCode, formData.county, formData.city]);

    const calculateTaxes = async () => {
        try {
            const response = await PaymentService.processPaymentWithTaxes({
                bookingId: booking.id,
                promoCode: formData.promoCode,
                stateCode: formData.stateCode,
                county: formData.county,
                city: formData.city
            });
            setTaxBreakdown(response.data);
        } catch (err) {
            console.error('Tax calculation error:', err);
        }
    };

    const handlePromoCodeValidation = async () => {
        if (!formData.promoCode) return;

        try {
            const response = await PaymentService.validatePromoCode(
                formData.promoCode,
                booking.totalAmount
            );
            setPromoValidation(response.data);
            if (response.data.valid) {
                calculateTaxes();
            }
        } catch (err) {
            setPromoValidation({ valid: false, message: 'Invalid promo code' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await PaymentService.processPaymentWithTaxes({
                bookingId: booking.id,
                promoCode: formData.promoCode,
                stateCode: formData.stateCode,
                county: formData.county,
                city: formData.city
            });

            onSuccess(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Payment processing failed');
        } finally {
            setLoading(false);
        }
    };

    if (!taxBreakdown) {
        return (
            <div className="flex items-center justify-center p-8">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <DollarSign className="text-indigo-600" />
                        Payment Checkout
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Booking #{booking.id} - Room {booking.room?.roomNumber}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Location Selection */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <select
                                value={formData.stateCode}
                                onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {usStates.map(state => (
                                    <option key={state.code} value={state.code}>{state.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                            <input
                                type="text"
                                value={formData.county}
                                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Promo Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Promo Code (Optional)
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={formData.promoCode}
                                    onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                                    placeholder="AAA2024, MILITARY20, etc."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handlePromoCodeValidation}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                            >
                                Apply
                            </button>
                        </div>
                        {promoValidation && (
                            <div className={`mt-2 p-2 rounded-lg flex items-center gap-2 text-sm ${promoValidation.valid
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-red-50 text-red-700'
                                }`}>
                                {promoValidation.valid ? (
                                    <>
                                        <CheckCircle size={16} />
                                        <span>
                                            {promoValidation.description} - Save ${promoValidation.discountAmount}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle size={16} />
                                        <span>{promoValidation.message}</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tax Breakdown */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-3 text-gray-800">Charge Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Room Charges (Subtotal)</span>
                                <span className="font-medium">${taxBreakdown.subtotal?.toFixed(2)}</span>
                            </div>

                            {taxBreakdown.discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <span>Discount ({formData.promoCode})</span>
                                    <span className="font-medium">-${taxBreakdown.discountAmount?.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>State Sales Tax ({taxBreakdown.stateTaxRate?.toFixed(2)}%)</span>
                                    <span>${taxBreakdown.stateTax?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>County Occupancy Tax ({taxBreakdown.countyTaxRate?.toFixed(2)}%)</span>
                                    <span>${taxBreakdown.countyTax?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>City Occupancy Tax ({taxBreakdown.cityTaxRate?.toFixed(2)}%)</span>
                                    <span>${taxBreakdown.cityTax?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Resort Fee ({taxBreakdown.resortFeeRate?.toFixed(2)}%)</span>
                                    <span>${taxBreakdown.resortFee?.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="border-t pt-2 flex justify-between font-bold text-lg text-gray-900">
                                <span>Total Amount</span>
                                <span className="text-indigo-600">${taxBreakdown.amount?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-200 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : `Pay $${taxBreakdown.amount?.toFixed(2)}`}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default PaymentCheckoutModal;
