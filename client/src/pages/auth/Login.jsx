import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import AuthFormField from '../../components/auth/AuthFormField';
import DemoAccounts from '../../components/auth/DemoAccounts';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { validateLoginForm } from '../../utils/authValidation';

const REMEMBER_KEY = 'goal_portal_remember_email';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBER_KEY) || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(!!localStorage.getItem(REMEMBER_KEY));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const sessionMessage = location.state?.message;

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, isValid } = validateLoginForm({ email, password });
    setErrors(validationErrors);
    if (!isValid) return;

    setLoading(true);
    try {
      const loggedInUser = await login(email.trim(), password);
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
      toast.success(`Welcome back, ${loggedInUser.name.split(' ')[0]}!`);
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setErrors({});
  };

  if (user) return null;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in</h2>
        <p className="mt-2 text-sm text-slate-500">
          Use your company credentials to access the goal portal
        </p>
      </div>

      {sessionMessage && (
        <div
          className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          role="alert"
        >
          {sessionMessage}
        </div>
      )}

      {errors.form && (
        <div
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthFormField
          id="email"
          label="Work email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          error={errors.email}
          placeholder="you@company.com"
          autoComplete="email"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />

        <AuthFormField
          id="password"
          label="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
          }}
          error={errors.password}
          placeholder="Enter your password"
          autoComplete="current-password"
          showToggle
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Remember email
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              Signing in…
            </span>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <DemoAccounts onSelect={handleDemoSelect} />

      <p className="mt-8 text-center text-xs text-slate-400">
        Need access? Contact your HR administrator.
      </p>
    </div>
  );
}
