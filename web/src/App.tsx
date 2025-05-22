import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <div className="max-w-md mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Logowanie</h2>
                    <LoginForm />
                  </div>
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <div className="max-w-md mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Rejestracja</h2>
                    <RegisterForm />
                  </div>
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div className="space-y-6">
                    <div className="mb-4">
                      <p className="text-sm text-gray-700">Jesteś: {user?.role}</p>
                      <p className="text-sm text-gray-700">Email: {user?.email}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                      <Link
                        to="/login"
                        onClick={logout}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Wyloguj
                      </Link>
                    </div>
                    {/* TODO: Dodaj zawartość dashboardu */}
                  </div>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
