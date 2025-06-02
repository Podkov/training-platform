import React from 'react';

interface PageLoadingProps {
  message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({ message = 'Ładowanie strony...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-gray-600 dark:text-gray-300">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
      <p className="text-lg">{message}</p>
    </div>
  );
}; 