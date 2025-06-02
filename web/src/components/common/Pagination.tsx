import React from 'react';
import { Button } from './Button'; // Zakładając, że Button jest w tym samym katalogu

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number; // Opcjonalnie: ile numerów stron pokazywać
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  maxVisiblePages = 5 // Domyślnie pokażemy 5 stron + pierwszą/ostatnią
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Zawsze pokazuj pierwszą stronę
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...'); // Wskaźnik przerwanych stron
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Zawsze pokazuj ostatnią stronę
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...'); // Wskaźnik przerwanych stron
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 rounded-md shadow-sm border-t border-gray-200 dark:border-gray-700">
      <div className="flex-1 flex justify-between sm:hidden">
        <Button onClick={handlePrevious} disabled={currentPage === 1} variant="outline">
          Poprzednia
        </Button>
        <Button onClick={handleNext} disabled={currentPage === totalPages} variant="outline">
          Następna
        </Button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Strona <span className="font-medium">{currentPage}</span> z <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <ul className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <li>
              <Button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                variant="outline"
                className="rounded-l-md"
              >
                <span className="sr-only">Poprzednia</span>
                {/* Można dodać ikonę strzałki */}
                &laquo;
              </Button>
            </li>
            {pageNumbers.map((page, index) => (
              <li key={index}>
                {page === '...' ? (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                    ...
                  </span>
                ) : (
                  <Button
                    onClick={() => onPageChange(page as number)}
                    variant="outline"
                    className={currentPage === page ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300' : ''}
                  >
                    {page}
                  </Button>
                )}
              </li>
            ))}
            <li>
              <Button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                variant="outline"
                className="rounded-r-md"
              >
                <span className="sr-only">Następna</span>
                &raquo;
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}; 