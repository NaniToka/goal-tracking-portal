import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthFormField from '../../components/auth/AuthFormField';
import { validateEmail } from '../../utils/authValidation';

/**
 * Password reset UI — backend endpoint can be wired later
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    setError('');
    setLoading(true);
    // Simulated request — replace with API when backend supports reset
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
    toast.success('If an account exists, reset instructions were sent.');
  };

  if (submitted) {
    return (
      <div className="text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
          ✉️
        </span>
        <h2 className="mt-6 text-2xl font-bold text-slate-900">Check your inbox</h2>
        <p className="mt-3 text-sm text-slate-500">
          If <strong className="text-slate-700">{email}</strong> is registered, you will receive
          password reset instructions shortly.
        </p>
        <Link to="/login" className="btn-primary mt-8 inline-flex">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Forgot password?</h2>
        <p className="mt-2 text-sm text-slate-500">
          Enter your work email and we will send reset instructions if the account exists.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthFormField
          id="email"
          label="Work email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          error={error}
          placeholder="you@company.com"
          autoComplete="email"
        />

        <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
