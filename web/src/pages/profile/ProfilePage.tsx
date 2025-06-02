import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProtectedLayout } from '../../components/layout/ProtectedLayout';
import { Button } from '../../components/common/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userService, changePasswordSchema, ChangePasswordData, deleteAccountSchema, DeleteAccountData } from '../../services/user-service';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);
  const [passwordChangeCompleted, setPasswordChangeCompleted] = useState(false);

  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  const {
    register: registerChangePassword,
    handleSubmit: handleSubmitChangePassword,
    formState: { errors: changePasswordFormErrors, isSubmitting: isSubmittingChangePassword },
    reset: resetChangePasswordForm,
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema) as any,
  });

  const {
    register: registerDeleteAccount,
    handleSubmit: handleSubmitDeleteAccount,
    formState: { errors: deleteAccountFormErrors, isSubmitting: isSubmittingDeleteAccount },
    reset: resetDeleteAccountForm,
  } = useForm<DeleteAccountData>({
    resolver: zodResolver(deleteAccountSchema) as any,
  });

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'TRAINER': return 'Trener';
      case 'PARTICIPANT': return 'Uczestnik';
      default: return 'Użytkownik';
    }
  };

  const getBreadcrumbs = () => [
    { label: 'Home', href: '/dashboard', icon: '🏠' },
    { label: 'Profil', icon: '👤' }
  ];

  const onSubmitChangePassword = handleSubmitChangePassword(async (data: ChangePasswordData) => {
    setChangePasswordError(null);
    setChangePasswordSuccess(null);
    setPasswordChangeCompleted(false);
    try {
      await userService.changePassword(data);
      setChangePasswordSuccess('Hasło zostało pomyślnie zmienione.');
      setPasswordChangeCompleted(true);
      setTimeout(() => {
        resetChangePasswordForm();
        setIsChangePasswordModalOpen(false);
        setChangePasswordSuccess(null);
        setPasswordChangeCompleted(false);
      }, 3000);
      // Opcjonalnie: Można odświeżyć dane użytkownika w AuthContext, jeśli backend zwraca zaktualizowanego użytkownika
      // lub wymusić ponowne logowanie dla bezpieczeństwa
    } catch (err: any) {
      const specificMessage = err.response?.data?.message;
      const errorCode = err.response?.data?.error;
      let displayMessage = 'Wystąpił błąd podczas zmiany hasła.';

      if (specificMessage) {
        displayMessage = specificMessage;
      } else if (errorCode) {
        displayMessage = `Błąd: ${errorCode}. Spróbuj ponownie.`;
      } else if (err.message) {
        displayMessage = err.message;
      }
      
      setChangePasswordError(displayMessage);
    }
  });

  const onSubmitDeleteAccount = handleSubmitDeleteAccount(async (data: DeleteAccountData) => {
    setDeleteAccountError(null);
    if (!user || typeof user.id === 'undefined') {
      setDeleteAccountError('Nie można zidentyfikować użytkownika. Spróbuj zalogować się ponownie.');
      return;
    }
    try {
      await userService.deleteAccount(user.id, data);
      logout();
      navigate('/login', { state: { accountDeleted: true } });
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Wystąpił błąd podczas usuwania konta.';
      setDeleteAccountError(message);
    }
  });

  return (
    <ProtectedLayout 
      breadcrumbs={getBreadcrumbs()}
      pageTitle="Mój profil"
    >
      <div className="container mx-auto px-4 py-8 min-h-full">
        {/* Informacje o profilu */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-6">
              <span className="text-3xl text-blue-600 dark:text-blue-400 font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {user?.email}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {getRoleDisplayName(user?.role)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <span className="text-gray-900 dark:text-white">{user?.email}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rola
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <span className="text-gray-900 dark:text-white">{getRoleDisplayName(user?.role)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Akcje profilu */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🔧 Ustawienia konta
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Zmiana hasła</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Zaktualizuj swoje hasło aby zwiększyć bezpieczeństwo konta
                </p>
              </div>
              <Button variant="outline" onClick={() => {
                setIsChangePasswordModalOpen(true);
                setChangePasswordError(null);
                setChangePasswordSuccess(null);
                setPasswordChangeCompleted(false);
                resetChangePasswordForm();
              }}>
                Zmień hasło
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Edycja profilu</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Zmień swoje dane osobowe i preferencje
                </p>
              </div>
              <Button variant="outline" disabled>
                Wkrótce
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-200">Usunięcie konta</h4>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Trwale usuń swoje konto i wszystkie powiązane dane
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteAccountModalOpen(true)} 
                className="text-red-600 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400"
              >
                Usuń konto
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal zmiany hasła */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-8 bg-white dark:bg-gray-800 w-full max-w-md m-auto flex-col flex rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Zmień hasło</h3>
            <form onSubmit={onSubmitChangePassword} className="space-y-4">
              <div>
                <label 
                  htmlFor="currentPassword" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Aktualne hasło
                </label>
                <input
                  {...registerChangePassword('currentPassword')}
                  type="password"
                  id="currentPassword"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                {changePasswordFormErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{changePasswordFormErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Nowe hasło
                </label>
                <input
                  {...registerChangePassword('newPassword')}
                  type="password"
                  id="newPassword"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                {changePasswordFormErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{changePasswordFormErrors.newPassword.message}</p>
                )}
              </div>

              {changePasswordError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-red-800 dark:text-red-200 text-sm">{changePasswordError}</p>
                </div>
              )}
               {changePasswordSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <p className="text-green-800 dark:text-green-200 text-sm">{changePasswordSuccess}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangePasswordModalOpen(false);
                    resetChangePasswordForm();
                    setChangePasswordError(null);
                    setChangePasswordSuccess(null);
                    setPasswordChangeCompleted(false);
                  }}
                >
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingChangePassword}
                  disabled={isSubmittingChangePassword || passwordChangeCompleted}
                >
                  {isSubmittingChangePassword ? 'Zapisywanie...' : 'Zmień hasło'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal usuwania konta */}
      {isDeleteAccountModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-8 bg-white dark:bg-gray-800 w-full max-w-md m-auto flex-col flex rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">Potwierdź usunięcie konta</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Czy na pewno chcesz trwale usunąć swoje konto? Ta operacja jest nieodwracalna. 
              Wszystkie Twoje dane, w tym zapisy na kursy, zostaną usunięte. 
              Aby potwierdzić, wprowadź swoje aktualne hasło.
            </p>
            <form onSubmit={onSubmitDeleteAccount} className="space-y-4">
              <div>
                <label 
                  htmlFor="deleteAccountPassword" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Hasło
                </label>
                <input
                  {...registerDeleteAccount('password')}
                  type="password"
                  id="deleteAccountPassword"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                {deleteAccountFormErrors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{deleteAccountFormErrors.password.message}</p>
                )}
              </div>

              {deleteAccountError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-red-800 dark:text-red-200 text-sm">{deleteAccountError}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDeleteAccountModalOpen(false);
                    resetDeleteAccountForm();
                    setDeleteAccountError(null);
                  }}
                >
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  className="text-red-600 border-red-500 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:border-red-500 dark:hover:bg-red-800/50 dark:hover:text-red-300 focus-visible:ring-red-500"
                  isLoading={isSubmittingDeleteAccount}
                  disabled={isSubmittingDeleteAccount}
                >
                  {isSubmittingDeleteAccount ? 'Usuwanie...' : 'Potwierdź i usuń konto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
};

export default ProfilePage; 