import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CreateUserByAdminPayload } from '../../services/admin.service'; // Potrzebujemy tego typu
import { UserRole } from '../../types'; // Załóżmy, że mamy UserRole enum/type globalnie

const createUserSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: 'Nieprawidłowa rola' }) }),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserByAdminPayload) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  isLoading,
  error 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      role: UserRole.Participant, // Domyślna rola
    }
  });

  const handleFormSubmit = async (data: CreateUserFormData) => {
    await onSubmit(data as CreateUserByAdminPayload); // Typy są zgodne
    if (!error && !isLoading) { // Reset only on success, will be cleared by parent if error
      reset();
    }
  };

  // Reset formularza przy zamknięciu modala, jeśli nie było błędu
  const handleClose = () => {
    if (!error) {
        reset();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Dodaj nowego użytkownika">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Adres email
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Hasło
          </label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Rola
          </label>
          <select
            id="role"
            {...register('role')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {Object.values(UserRole).map((roleValue) => (
              <option key={roleValue} value={roleValue}>
                {roleValue}
              </option>
            ))}
          </select>
          {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Anuluj
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Dodawanie...' : 'Dodaj użytkownika'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}; 