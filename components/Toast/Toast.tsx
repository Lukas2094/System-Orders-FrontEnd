'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

type ToastType = 'success' | 'error' | 'warning';

type ToastMessage = {
    id: number;
    type: ToastType;
    message: string;
};

type ToastContextType = {
    showToast: (message: string, type?: ToastType) => void;
    showConfirm: (message: string) => Promise<boolean>;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let idCounter = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [confirmState, setConfirmState] = useState<{
        message: string;
        resolve?: (v: boolean) => void;
    } | null>(null);

    const showToast = (message: string, type: ToastType = 'success') => {
        const id = ++idCounter;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    const showConfirm = (message: string) => {
        return new Promise<boolean>((resolve) => {
            setConfirmState({ message, resolve });
        });
    };

    const handleConfirm = (result: boolean) => {
        confirmState?.resolve?.(result);
        setConfirmState(null);
    };

    return (
        <ToastContext.Provider value={{ showToast, showConfirm }}>
            {children}

            {/* Toasts */}
            <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className={`px-4 py-2 rounded shadow-md text-white flex items-center gap-2 ${toast.type === 'success'
                                    ? 'bg-green-500'
                                    : toast.type === 'error'
                                        ? 'bg-red-500'
                                        : 'bg-yellow-500'
                                }`}
                        >
                            {toast.type === 'success' && <FaCheckCircle />}
                            {toast.type === 'error' && <FaTimesCircle />}
                            {toast.type === 'warning' && <FaExclamationTriangle />}
                            <span>{toast.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Confirm */}
            {confirmState && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg text-center">
                        <p className="mb-4 text-lg font-semibold">{confirmState.message}</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => handleConfirm(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Sim
                            </button>
                            <button
                                onClick={() => handleConfirm(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Não
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast deve ser usado dentro de ToastProvider');
    return context;
};
