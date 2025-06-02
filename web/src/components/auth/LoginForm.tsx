import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';

const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string().min(6, 'Hasło musi mieć minimum 6 znaków'),
});

type LoginData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema) as any,
  });

  const onSubmit = handleSubmit(async (data: LoginData) => {
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      // Błąd jest już obsługiwany w useAuth
    }
  });

  return (
    <>
      {location.state?.fromRegister && (
        <p className="text-center text-green-600 mb-4">
          Rejestracja przebiegła pomyślnie. Możesz się teraz zalogować.
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-4 w-full max-w-md">
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

        <Button
          type="submit"
          isLoading={isSubmitting}
          fullWidth
        >
          {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
        </Button>

        <div className="text-center mt-4">
          <Link to="/register" className="text-indigo-600 hover:underline">
            Zarejestruj się
          </Link>
        </div>
      </form>
    </>
  );
}; 