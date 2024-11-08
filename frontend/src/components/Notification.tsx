import React, { forwardRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'react-icons/hi';

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface NotificationProps {
  message: NotificationMessage;
  onDismiss: (id: string) => void;
}

const NotificationIcons = {
  success: Icons.HiOutlineCheckCircle,
  error: Icons.HiOutlineExclamation,
  info: Icons.HiOutlineInformationCircle,
  warning: Icons.HiOutlineExclamationCircle,
};

const NotificationColors = {
  success: 'bg-green-50 text-green-500 border-green-100',
  error: 'bg-red-50 text-red-500 border-red-100',
  info: 'bg-blue-50 text-blue-500 border-blue-100',
  warning: 'bg-yellow-50 text-yellow-500 border-yellow-100',
};

export const Notification = forwardRef<HTMLDivElement, NotificationProps>(
  ({ message, onDismiss }, ref) => {
    const Icon = NotificationIcons[message.type];

    useEffect(() => {
      const timer = setTimeout(() => {
        onDismiss(message.id);
      }, 3000);

      return () => clearTimeout(timer);
    }, [message.id, onDismiss]);

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-96 border rounded-lg shadow-lg ${NotificationColors[message.type]} p-4 flex items-start space-x-3`}
      >
        <Icon className="w-5 h-5 mt-0.5" />
        <span className="flex-1">{message.message}</span>
        <button
          onClick={() => onDismiss(message.id)}
          className="text-current opacity-50 hover:opacity-100 transition-opacity"
        >
          <Icons.HiX className="w-5 h-5" />
        </button>
      </motion.div>
    );
  }
);