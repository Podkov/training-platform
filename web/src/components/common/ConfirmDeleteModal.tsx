import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string; // np. "Potwierdź usunięcie użytkownika"
  message: string; // np. "Czy na pewno chcesz usunąć użytkownika X? Tej operacji nie można cofnąć."
  error?: string | null;
  isSubmitting?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title,
  message,
  error,
  isSubmitting
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="mt-2">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {message}
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Anuluj
        </Button>
        <Button 
          variant="outline"
          onClick={onConfirm} 
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-500 dark:border-red-500 dark:hover:bg-red-700/20 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50"
        >
          Potwierdź usunięcie
        </Button>
      </div>
    </Modal>
  );
}; 