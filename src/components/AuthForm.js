import React, { useState } from 'react';

const defaultForm = {
  name: '',
  email: '',
  password: '',
};

export default function AuthForm({ mode, onSubmit, submitting }) {
  const [form, setForm] = useState(defaultForm);
  const isRegister = mode === 'register';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(form);

    setForm((current) => ({
      ...defaultForm,
      email: current.email,
    }));
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
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

      <input
        className="input"
        type="email"
        name="email"
        placeholder="Email address"
        value={form.email}
        onChange={handleChange}
        required
      />

      <input
        className="input"
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        minLength={6}
        required
      />

      <button className="btn-primary auth-submit" type="submit" disabled={submitting}>
        {submitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
      </button>
    </form>
  );
}
