import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../common/Button';

const registerSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string().min(6, 'Hasło musi mieć minimum 6 znaków'),
  role: z.enum(['ADMIN', 'TRAINER', 'PARTICIPANT']).default('PARTICIPANT'),
});

type RegisterData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const { register: registerUser, error } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      role: 'PARTICIPANT',
    },
  });

  const onSubmit = handleSubmit(async (data: RegisterData) => {
    try {
      await registerUser(data.email, data.password, data.role);
      navigate('/login', { state: { fromRegister: true, email: data.email } });
    } catch (err) {
      // Błąd jest już obsługiwany w useAuth
    }
  });

  return (
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

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Rola
        </label>
        <select
          {...register('role')}
          id="role"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="PARTICIPANT">Uczestnik</option>
          <option value="TRAINER">Trener</option>
          <option value="ADMIN">Administrator</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        isLoading={isSubmitting}
        fullWidth
      >
        {isSubmitting ? 'Rejestracja...' : 'Zarejestruj się'}
      </Button>

      <div className="text-center mt-4">
        <Link to="/login" className="text-indigo-600 hover:underline">
          Zaloguj się
        </Link>
      </div>
    </form>
  );
}; 