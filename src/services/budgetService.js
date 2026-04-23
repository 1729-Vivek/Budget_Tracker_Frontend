const isLocalBrowser =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const API_BASE_URL = process.env.REACT_APP_API_URL || (isLocalBrowser ? 'http://localhost:5000/api' : '');

const request = async (path, options = {}) => {
  if (!API_BASE_URL) {
    throw new Error('Frontend API is not configured. Set REACT_APP_API_URL in the deployed frontend environment.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
};

const withAuth = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const registerUser = async (payload) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const loginUser = async (payload) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const requestPasswordReset = async (payload) =>
  request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const resetPassword = async (payload) =>
  request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getCurrentUser = async (token) =>
  request('/auth/me', {
    headers: withAuth(token),
  });

export const getBudgets = async (token) =>
  request('/budget', {
    headers: withAuth(token),
  });

export const addBudget = async (budget, token) =>
  request('/budget', {
    method: 'POST',
    headers: withAuth(token),
    body: JSON.stringify(budget),
  });

export const updateBudget = async (id, budget, token) =>
  request(`/budget/${id}`, {
    method: 'PUT',
    headers: withAuth(token),
    body: JSON.stringify(budget),
  });

export const deleteBudget = async (id, token) =>
  request(`/budget/${id}`, {
    method: 'DELETE',
    headers: withAuth(token),
  });
