/**
 * Client-side auth form validation
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email?.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email.trim())) return 'Enter a valid email address';
  return '';
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return '';
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return { errors, isValid: Object.keys(errors).length === 0 };
}
