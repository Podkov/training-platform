import React from 'react';

export type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  className?: string;
  onClose?: () => void; // Opcjonalna funkcja do zamykania alertu
}

const alertStyles = {
  error: {
    bg: 'bg-red-100 dark:bg-red-900',
    border: 'border-red-400 dark:border-red-700',
    text: 'text-red-700 dark:text-red-200',
    icon: '❌', // Można zastąpić SVG
  },
  success: {
    bg: 'bg-green-100 dark:bg-green-900',
    border: 'border-green-400 dark:border-green-700',
    text: 'text-green-700 dark:text-green-200',
    icon: '✅', // Można zastąpić SVG
  },
  warning: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    border: 'border-yellow-400 dark:border-yellow-700',
    text: 'text-yellow-700 dark:text-yellow-200',
    icon: '⚠️', // Można zastąpić SVG
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    border: 'border-blue-400 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-200',
    icon: 'ℹ️', // Można zastąpić SVG
  },
};

export const Alert: React.FC<AlertProps> = ({ 
  type,
  title,
  message,
  className = '',
  onClose 
}) => {
  const styles = alertStyles[type];

  return (
    <div 
      className={`border-l-4 ${styles.border} ${styles.bg} ${styles.text} p-4 rounded-md shadow-md ${className}`}
      role="alert"
    >
      <div className="flex">
        <div className="py-1">
          <span className="text-2xl mr-3">{styles.icon}</span>
        </div>
        <div>
          {title && <p className="font-bold">{title}</p>}
          <p>{message}</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-current rounded-lg focus:ring-2 focus:ring-gray-400 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 inline-flex h-8 w-8"
            aria-label="Zamknij"
          >
            <span className="sr-only">Zamknij</span>
            {/* Ikonka X (można użyć SVG) */}
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        )}
      </div>
    </div>
  );
}; 