import React, { useEffect, useState } from 'react';

const createDefaultForm = (resetEmail = '') => ({
  name: '',
  email: resetEmail,
  password: '',
  confirmPassword: '',
});

export default function AuthForm({ mode, onSubmit, onModeChange, submitting, resetEmail = '' }) {
  const [form, setForm] = useState(() => createDefaultForm(resetEmail));
  const [localError, setLocalError] = useState('');
  const isRegister = mode === 'register';
  const isForgotPassword = mode === 'forgot';
  const isResetPassword = mode === 'reset';
  const needsPassword = !isForgotPassword;

  useEffect(() => {
    setForm((current) => ({
      ...createDefaultForm(isResetPassword ? resetEmail : ''),
      email: isResetPassword ? resetEmail : current.email,
    }));
    setLocalError('');
  }, [isResetPassword, mode, resetEmail]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setLocalError('');
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isResetPassword && form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    await onSubmit(form);

    setForm((current) => ({
      ...createDefaultForm(isResetPassword ? resetEmail : ''),
      email: isResetPassword ? resetEmail : current.email,
    }));
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {localError ? <div className="error-banner">{localError}</div> : null}

      {isRegister ? (
        <input
          className="input"
          type="text"
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
        />
      ) : null}

      {!isResetPassword ? (
        <input
          className="input"
          type="email"
          name="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          required
        />
      ) : (
        <input
          className="input"
          type="email"
          name="email"
          placeholder="Email address"
          value={resetEmail || 'Email from reset link'}
          readOnly
        />
      )}

      {needsPassword ? (
        <input
          className="input"
          type="password"
          name="password"
          placeholder={isResetPassword ? 'New password' : 'Password'}
          value={form.password}
          onChange={handleChange}
          minLength={6}
          required
        />
      ) : null}

      {isResetPassword ? (
        <input
          className="input"
          type="password"
          name="confirmPassword"
          placeholder="Confirm new password"
          value={form.confirmPassword}
          onChange={handleChange}
          minLength={6}
          required
        />
      ) : null}

      <button className="btn-primary auth-submit" type="submit" disabled={submitting}>
        {submitting
          ? 'Please wait...'
          : isRegister
            ? 'Create account'
            : isForgotPassword
              ? 'Send reset link'
              : isResetPassword
                ? 'Reset password'
                : 'Sign in'}
      </button>

      {mode === 'login' ? (
        <button className="auth-link-button" type="button" onClick={() => onModeChange('forgot')}>
          Forgot password?
        </button>
      ) : null}

      {mode === 'forgot' || mode === 'reset' ? (
        <button className="auth-link-button" type="button" onClick={() => onModeChange('login')}>
          Back to sign in
        </button>
      ) : null}
    </form>
  );
}
