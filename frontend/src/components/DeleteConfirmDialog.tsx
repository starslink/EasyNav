import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineExclamation } from 'react-icons/hi';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  triggerRef
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, direction: 'up' as 'up' | 'down' });

  useEffect(() => {
    if (isOpen && triggerRef?.current && dialogRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dialogRect = dialogRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      let direction: 'up' | 'down' = 'up';
      let top: number;
      let left = triggerRect.left + (triggerRect.width / 2) - (dialogRect.width / 2);

      // Check if there's enough space above
      if (triggerRect.top > dialogRect.height + 16) {
        // Show above
        direction = 'up';
        top = triggerRect.top - dialogRect.height - 8;
      } else {
        // Show below
        direction = 'down';
        top = triggerRect.bottom + 8;
      }

      // Adjust horizontal position if dialog would go off screen
      if (left < 8) {
        left = 8;
      } else if (left + dialogRect.width > window.innerWidth - 8) {
        left = window.innerWidth - dialogRect.width - 8;
      }

      // Adjust vertical position if dialog would go off screen
      if (top < 8) {
        top = 8;
      } else if (top + dialogRect.height > windowHeight - 8) {
        top = windowHeight - dialogRect.height - 8;
      }

      setPosition({ top, left, direction });
    }
  }, [isOpen, triggerRef]);

  const slideVariants = {
    hidden: (direction: 'up' | 'down') => ({
      opacity: 0,
      y: direction === 'up' ? 20 : -20,
      scale: 0.95,
    }),
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500,
      },
    },
    exit: (direction: 'up' | 'down') => ({
      opacity: 0,
      y: direction === 'up' ? 20 : -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onCancel}
          />
          <motion.div
            ref={dialogRef}
            custom={position.direction}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideVariants}
            className="fixed z-50 bg-white rounded-lg shadow-xl overflow-hidden"
            style={{ 
              width: '320px',
              top: position.top,
              left: position.left,
            }}
          >
            <div className="p-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 mx-auto mb-3">
                <HiOutlineExclamation className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-500 text-center">
                {message}
              </p>
            </div>
            <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                确认删除
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};