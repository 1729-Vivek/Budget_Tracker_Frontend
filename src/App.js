import React, { useState, useEffect, useCallback } from 'react';
import BudgetForm from './components/BudgetForm';
import BudgetList from './components/BudgetList';
import CategoryPieChart from './components/CategoryPieChart';
import DayWiseTotal from './components/DayWiseTotal';
import AuthForm from './components/AuthForm';
import {
  getBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
  loginUser,
  registerUser,
  getCurrentUser,
} from './services/budgetService';
import './App.css';

function IconMoney() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8c-2 0-3 1-3 3s1 3 3 3 3-1 3-3-1-3-3-3z" />
    </svg>
  );
}

export default function App() {
  const [budgets, setBudgets] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('budgetUser'));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('budgetToken') || '');
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [editingBudget, setEditingBudget] = useState(null);
  const [highlightedBudgetId, setHighlightedBudgetId] = useState(null);
  const [toast, setToast] = useState(null);

  const getCategoryMap = useCallback(() => {
    try {
      const categoryKey = user?._id ? `budgetCategoryMap:${user._id}` : 'budgetCategoryMap:guest';
      return JSON.parse(localStorage.getItem(categoryKey)) || {};
    } catch {
      return {};
    }
  }, [user]);

  const saveCategoryMap = useCallback((map) => {
    const categoryKey = user?._id ? `budgetCategoryMap:${user._id}` : 'budgetCategoryMap:guest';
    localStorage.setItem(categoryKey, JSON.stringify(map));
  }, [user]);

  const getCategoryForBudget = useCallback((budget) => {
    if (budget.category) return budget.category;
    const categoryMap = getCategoryMap();
    return categoryMap[budget._id] || 'other';
  }, [getCategoryMap]);

  const saveBudgetCategory = useCallback((budgetId, category) => {
    const categoryMap = getCategoryMap();
    categoryMap[budgetId] = category;
    saveCategoryMap(categoryMap);
  }, [getCategoryMap, saveCategoryMap]);

  const persistSession = useCallback((sessionToken, sessionUser) => {
    localStorage.setItem('budgetToken', sessionToken);
    localStorage.setItem('budgetUser', JSON.stringify(sessionUser));
    setToken(sessionToken);
    setUser(sessionUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('budgetToken');
    localStorage.removeItem('budgetUser');
    setToken('');
    setUser(null);
    setBudgets([]);
    setEditingBudget(null);
  }, []);

  useEffect(() => {
    const fetchBudgets = async () => {
      if (!token) {
        setBudgets([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetched = await getBudgets(token);
        // Ensure all budgets have a category field using localStorage as backup
        const normalizedBudgets = (fetched || []).map((b) => ({
          ...b,
          category: getCategoryForBudget(b),
        }));
        setBudgets(normalizedBudgets);
      } catch (err) {
        console.error(err);
        if (err.message.toLowerCase().includes('token')) {
          clearSession();
          setAuthError('Your session expired. Please sign in again.');
        } else {
          setError('Could not load budgets. Check backend.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, [clearSession, getCategoryForBudget, token]);

  useEffect(() => {
    const validateStoredSession = async () => {
      if (!token || user) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser(token);
        setUser(response.user);
        localStorage.setItem('budgetUser', JSON.stringify(response.user));
      } catch (err) {
        console.error(err);
        clearSession();
      }
    };

    validateStoredSession();
  }, [clearSession, token, user]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (!highlightedBudgetId) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setHighlightedBudgetId(null);
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedBudgetId]);

  const showToast = useCallback((message) => {
    setToast({ message, id: Date.now() });
  }, []);

  const handleAuthSubmit = async (form) => {
    setAuthLoading(true);
    setAuthError('');

    try {
      const action = authMode === 'register' ? registerUser : loginUser;
      const payload = authMode === 'register' ? form : { email: form.email, password: form.password };
      const response = await action(payload);
      persistSession(response.token, response.user);
      setError(null);
    } catch (err) {
      console.error(err);
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAddBudget = async (newBudget) => {
    try {
      setError(null);
      const created = await addBudget(newBudget, token);
      // Ensure category is preserved from newBudget if not in response
      const budgetToAdd = created && created._id 
        ? { ...newBudget, ...created, category: newBudget.category } 
        : { ...newBudget, _id: Math.random().toString(36).slice(2) };
      
      // Save category to localStorage for persistence across page refreshes
      saveBudgetCategory(budgetToAdd._id, budgetToAdd.category);
      
      setBudgets(prev => [...prev, budgetToAdd]);
      setHighlightedBudgetId(budgetToAdd._id);
      showToast('Expense added successfully.');
      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to add entry.');
      return false;
    }
  };

  const handleStartEditBudget = (budget) => {
    setError(null);
    setEditingBudget(budget);
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
    setError(null);
  };

  const handleUpdateBudget = async (id, updatedBudget) => {
    try {
      setError(null);
      const savedBudget = await updateBudget(id, updatedBudget, token);
      const normalizedBudget = {
        ...savedBudget,
        category: updatedBudget.category,
      };

      saveBudgetCategory(id, updatedBudget.category);
      setBudgets((prev) => prev.map((budget) => (budget._id === id ? normalizedBudget : budget)));
      setEditingBudget(null);
      setHighlightedBudgetId(id);
      showToast('Expense updated successfully.');
      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update entry.');
      return false;
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await deleteBudget(id, token);
      setBudgets(prev => prev.filter(b => b._id !== id));
      if (editingBudget?._id === id) {
        setEditingBudget(null);
      }
      showToast('Expense removed.');
    } catch (err) {
      console.error(err);
      setError('Failed to delete entry.');
    }
  };

  const total = budgets.reduce((s, b) => s + (Number(b.amount) || 0), 0);

  return (
    <div className="app-root">
      {toast ? (
        <div key={toast.id} className="toast-banner" role="status" aria-live="polite">
          {toast.message}
        </div>
      ) : null}
      <div className="container">
        <header className="header">
          <div className="brand">
            <div className="logo">{IconMoney()}</div>
            <div>
              <h1 className="title">Budget Tracker</h1>
              <p className="subtitle">
                {user ? `Signed in as ${user.name}` : 'Register or sign in to manage your budgets'}
              </p>
            </div>
          </div>

          <div className="header-actions">
            <div className="summary">
              <div className="summary-label">Total</div>
              <div className="summary-value">₹{total.toLocaleString()}</div>
            </div>

            {user ? (
              <button className="btn-secondary" type="button" onClick={clearSession}>
                Logout
              </button>
            ) : null}
          </div>
        </header>

        {!user ? (
          <main className="auth-layout">
            <section className="auth-panel">
              <div className="auth-copy">
                <span className="eyebrow">Personal access</span>
                <h2 className="auth-title">Keep your budget private and synced to your account.</h2>
                <p className="auth-text">
                  Create an account to start saving expenses against your own profile, or sign in to continue where you left off.
                </p>
              </div>

              <div className="auth-switch">
                <button
                  className={`toggle-chip ${authMode === 'login' ? 'active' : ''}`}
                  type="button"
                  onClick={() => setAuthMode('login')}
                >
                  Sign in
                </button>
                <button
                  className={`toggle-chip ${authMode === 'register' ? 'active' : ''}`}
                  type="button"
                  onClick={() => setAuthMode('register')}
                >
                  Register
                </button>
              </div>

              {authError ? <div className="error-banner">{authError}</div> : null}

              <AuthForm mode={authMode} onSubmit={handleAuthSubmit} submitting={authLoading} />
            </section>
          </main>
        ) : (
          <main className="main-grid">
            <aside className="left-col">
              <h2 className="section-title">{editingBudget ? 'Edit Entry' : 'Add Entry'}</h2>
              <BudgetForm
                onAddBudget={handleAddBudget}
                onUpdateBudget={handleUpdateBudget}
                editingBudget={editingBudget}
                onCancelEdit={handleCancelEdit}
              />
              <div className="tips">
                <h3>Tips</h3>
                <ul>
                  <li>Each signed-in user now sees only their own budget entries.</li>
                  <li>Edit lets you update an existing expense without creating a duplicate.</li>
                  <li>Delete removes the entry from your account immediately.</li>
                </ul>
              </div>
            </aside>

            <section className="right-col">
              <div className="list-header">
                <h2 className="section-title">Recent Entries</h2>
                <div className="count">{budgets.length} items</div>
              </div>

              {loading ? (
                <div className="skeleton-grid">
                  {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
                </div>
              ) : error ? (
                <div className="error-banner">{error}</div>
              ) : (
                <BudgetList
                  budgets={budgets}
                  onDeleteBudget={handleDeleteBudget}
                  onEditBudget={handleStartEditBudget}
                  editingBudgetId={editingBudget?._id}
                  highlightedBudgetId={highlightedBudgetId}
                />
              )}
            </section>
          </main>
        )}

        {user ? (
          <section className="analytics-section">
            <div className="analytics-grid">
              <CategoryPieChart budgets={budgets} />
              <DayWiseTotal budgets={budgets} />
            </div>
          </section>
        ) : null}

        <footer className="footer">Built for personal, account-based budget tracking.</footer>
      </div>
    </div>
  );
}
