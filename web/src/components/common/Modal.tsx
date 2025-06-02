import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Założenie użycia Heroicons

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'; // Rozmiary modala
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    } else {
      document.removeEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose} // Zamykanie po kliknięciu na tło
    >
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 w-full ${sizeClasses[size]} transition-all duration-300 ease-in-out transform scale-95 opacity-0 animate-modal-appear`}
        onClick={(e) => e.stopPropagation()} // Zapobieganie zamknięciu przy kliknięciu wewnątrz modala
      >
        <div className="flex items-start justify-between mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white" id="modal-title">
              {title}
            </h3>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        {children}
        
      </div>
    </div>
  );
}; 