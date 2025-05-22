import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginData } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    try {
      await login(data);
      navigate('/dashboard');
    } catch (err) {
      // Błąd jest już obsługiwany w useAuth
    }
  };

  return (
    <>
      {location.state?.fromRegister && (
        <p className="text-center text-green-600 mb-4">
          Rejestracja przebiegła pomyślnie. Możesz się teraz zalogować.
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Hasło
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
        </button>

        <div className="text-center mt-4">
          <Link to="/register" className="text-indigo-600 hover:underline">Zarejestruj się</Link>
        </div>
      </form>
    </>
  );
}; 