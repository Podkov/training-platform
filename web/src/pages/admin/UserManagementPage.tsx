import React, { useEffect, useState } from 'react';
import { ProtectedLayout } from '../../components/layout/ProtectedLayout';
import { adminService, AdminUserListItemDto, AdminUserListResponseDto, CreateUserByAdminPayload } from '../../services/admin.service';
import { Button } from '../../components/common/Button';
import { Table, TableHeader, TableRow, TableCell, TableBody } from '../../components/common/Table'; // Założenie, że istnieje taki komponent
import { Pagination } from '../../components/common/Pagination'; // Założenie, że istnieje taki komponent
import { ChangeUserRoleModal } from '../../components/admin/ChangeUserRoleModal'; // Import modala zmiany roli
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'; // Import modala potwierdzenia usunięcia
import { CreateUserModal, CreateUserFormData } from '../../components/admin/CreateUserModal'; // Import modala tworzenia użytkownika

export const UserManagementPage: React.FC = () => {
  const [userListResponse, setUserListResponse] = useState<AdminUserListResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; // Można to później uczynić konfigurowalnym

  // Stany dla modali
  const [selectedUser, setSelectedUser] = useState<AdminUserListItemDto | null>(null);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState<boolean>(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null); // Błędy dla akcji w modalach
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Stan ładowania dla akcji w modalach

  // Stany dla modala tworzenia użytkownika
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createUserError, setCreateUserError] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminService.getAllUsers(currentPage, itemsPerPage);
        setUserListResponse(response);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Nie udało się załadować listy użytkowników.');
      }
      setLoading(false);
    };

    fetchUsers();
  }, [currentPage]);

  const refreshUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllUsers(currentPage, itemsPerPage);
      setUserListResponse(response);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Nie udało się odświeżyć listy użytkowników.');
    }
    setLoading(false);
  };

  // Funkcje otwierające modale
  const openChangeRoleModal = (user: AdminUserListItemDto) => {
    setSelectedUser(user);
    setActionError(null); // Resetuj błąd akcji przy otwieraniu modala
    setIsChangeRoleModalOpen(true);
  };

  const openDeleteConfirmModal = (user: AdminUserListItemDto) => {
    setSelectedUser(user);
    setActionError(null); // Resetuj błąd akcji
    setIsDeleteConfirmModalOpen(true);
  };

  const openCreateUserModal = () => {
    setCreateUserError(null);
    setIsCreateModalOpen(true);
  };

  // Funkcje obsługujące akcje (na razie puste, dodamy logikę później)
  const handleChangeUserRole = async (newRole: AdminUserListItemDto['role']) => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await adminService.changeUserRole(selectedUser.id, { newRole });
      setIsChangeRoleModalOpen(false);
      setSelectedUser(null);
      await refreshUsers(); // Odśwież listę
      // Można dodać komunikat o sukcesie (np. toast)
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Wystąpił błąd podczas zmiany roli.');
    }
    setIsSubmitting(false);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await adminService.deleteUserByAdmin(selectedUser.id);
      setIsDeleteConfirmModalOpen(false);
      setSelectedUser(null);
      await refreshUsers(); // Odśwież listę
       // Można dodać komunikat o sukcesie (np. toast)
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Wystąpił błąd podczas usuwania użytkownika.');
    }
    setIsSubmitting(false);
  };

  const handleCreateUser = async (data: CreateUserByAdminPayload) => {
    setIsCreatingUser(true);
    setCreateUserError(null);
    try {
      await adminService.createUser(data);
      setIsCreateModalOpen(false);
      await refreshUsers();
      // Można dodać komunikat o sukcesie (np. toast)
    } catch (err: any) {
      setCreateUserError(err.response?.data?.message || err.message || 'Wystąpił błąd podczas tworzenia użytkownika.');
    }
    setIsCreatingUser(false);
  };

  const getBreadcrumbs = () => [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { label: 'Panel Administratora', href: '/admin', icon: '⚙️' },
    { label: 'Zarządzanie użytkownikami', icon: '👥' }
  ];

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'TRAINER': return 'Trener';
      case 'PARTICIPANT': return 'Uczestnik';
      default: return 'Brak roli';
    }
  };

  return (
    <ProtectedLayout
      breadcrumbs={getBreadcrumbs()}
      pageTitle="Zarządzanie użytkownikami"
      actions={[
        <Button key="add-user" onClick={openCreateUserModal}>
          Dodaj użytkownika
        </Button>
      ]}
    >
      <div className="container mx-auto px-4 py-8 min-h-full">
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-2">Ładowanie użytkowników...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Błąd! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {!loading && !error && userListResponse && (
          <>
            <Table className="mb-6">
              <TableHeader>
                <TableRow>
                  <TableCell header>ID</TableCell>
                  <TableCell header>Email</TableCell>
                  <TableCell header>Rola</TableCell>
                  <TableCell header>Aktywne zapisy</TableCell>
                  <TableCell header>Akcje</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userListResponse.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Nie znaleziono użytkowników.</TableCell>
                  </TableRow>
                ) : (
                  userListResponse.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleDisplayName(user.role)}</TableCell>
                      <TableCell>{user.enrollmentCount ?? 0}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mr-2"
                          onClick={() => openChangeRoleModal(user)}
                        >
                          Zmień rolę
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-500 dark:border-red-500 dark:hover:bg-red-700/20"
                          onClick={() => openDeleteConfirmModal(user)}
                        >
                          Usuń
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {userListResponse.total > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(userListResponse.total / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      {/* Modale */}
      {selectedUser && (
        <ChangeUserRoleModal
          isOpen={isChangeRoleModalOpen}
          onClose={() => {
            setIsChangeRoleModalOpen(false);
            setSelectedUser(null); // Czyść wybranego użytkownika po zamknięciu
            setActionError(null); // Czyść błąd akcji
          }}
          user={selectedUser}
          onSubmit={handleChangeUserRole}
          error={actionError}
          isSubmitting={isSubmitting}
        />
      )}

      {selectedUser && (
        <ConfirmDeleteModal
          isOpen={isDeleteConfirmModalOpen}
          onClose={() => {
            setIsDeleteConfirmModalOpen(false);
            setSelectedUser(null); // Czyść wybranego użytkownika po zamknięciu
            setActionError(null); // Czyść błąd akcji
          }}
          onConfirm={handleDeleteUser}
          title="Potwierdź usunięcie użytkownika"
          message={`Czy na pewno chcesz usunąć użytkownika ${selectedUser.email}? Tej operacji nie można cofnąć.`}
          error={actionError}
          isSubmitting={isSubmitting}
        />
      )}

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateUserError(null); // Czyść błąd przy zamykaniu
        }}
        onSubmit={handleCreateUser}
        isLoading={isCreatingUser}
        error={createUserError}
      />

    </ProtectedLayout>
  );
};

export default UserManagementPage; 