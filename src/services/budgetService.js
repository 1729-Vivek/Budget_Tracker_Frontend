const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const request = async (path, options = {}) => {
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

export const deleteBudget = async (id, token) =>
  request(`/budget/${id}`, {
    method: 'DELETE',
    headers: withAuth(token),
  });
