import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal'; // Założenie, że istnieje generyczny komponent Modal
import { Button } from '../common/Button';
import { AdminUserListItemDto } from '../../services/admin.service';

interface ChangeUserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUserListItemDto | null;
  onSubmit: (newRole: AdminUserListItemDto['role']) => Promise<void>;
  error?: string | null;
  isSubmitting?: boolean;
}

const availableRoles: AdminUserListItemDto['role'][] = ['PARTICIPANT', 'TRAINER', 'ADMIN'];

export const ChangeUserRoleModal: React.FC<ChangeUserRoleModalProps> = ({ 
  isOpen, 
  onClose, 
  user,
  onSubmit,
  error,
  isSubmitting
}) => {
  const [selectedRole, setSelectedRole] = useState<AdminUserListItemDto['role'] | undefined>(user?.role);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async () => {
    if (selectedRole) {
      await onSubmit(selectedRole);
    }
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'TRAINER': return 'Trener';
      case 'PARTICIPANT': return 'Uczestnik';
      default: return 'Brak roli';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Zmień rolę dla: ${user.email}`}>
      <div className="mt-4 space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Obecna rola: <span className="font-semibold">{getRoleDisplayName(user.role)}</span>
        </p>
        <div>
          <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Wybierz nową rolę:
          </label>
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as AdminUserListItemDto['role'])}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {availableRoles.map(role => (
              <option key={role} value={role}>
                {getRoleDisplayName(role)}
              </option>
            ))}
          </select>
        </div>
        
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Anuluj
        </Button>
        <Button 
          onClick={handleSubmit} 
          isLoading={isSubmitting} 
          disabled={isSubmitting || selectedRole === user.role}
        >
          Zatwierdź zmianę
        </Button>
      </div>
    </Modal>
  );
}; 