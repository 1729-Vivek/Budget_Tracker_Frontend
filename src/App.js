import React, { useState, useEffect } from 'react';
import BudgetForm from './components/BudgetForm';
import BudgetList from './components/BudgetList';
import { getBudgets, addBudget, deleteBudget } from './services/budgetService';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await getBudgets();
      setBudgets(fetched || []);
    } catch (err) {
      console.error(err);
      setError('Could not load budgets. Check backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async (newBudget) => {
    try {
      const created = await addBudget(newBudget);
      setBudgets(prev => [...prev, created || { ...newBudget, _id: Math.random().toString(36).slice(2) }]);
    } catch (err) {
      console.error(err);
      setError('Failed to add entry.');
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await deleteBudget(id);
      setBudgets(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete entry.');
    }
  };

  const total = budgets.reduce((s, b) => s + (Number(b.amount) || 0), 0);

  return (
    <div className="app-root">
      <div className="container">
        <header className="header">
          <div className="brand">
            <div className="logo">{IconMoney()}</div>
            <div>
              <h1 className="title">Budget Tracker</h1>
              <p className="subtitle">Simple, fast and responsive</p>
            </div>
          </div>
          <div className="summary">
            <div className="summary-label">Total</div>
            <div className="summary-value">₹{total.toLocaleString()}</div>
          </div>
        </header>

        <main className="main-grid">
          <aside className="left-col">
            <h2 className="section-title">Add Entry</h2>
            <BudgetForm onAddBudget={handleAddBudget} />
            <div className="tips">
              <h3>Tips</h3>
              <ul>
                <li>Use categories to filter later (coming soon).</li>
                <li>Amounts are saved on the server if backend is running.</li>
                <li>Tap delete to remove an entry.</li>
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
              <BudgetList budgets={budgets} onDeleteBudget={handleDeleteBudget} />
            )}
          </section>
        </main>

        <footer className="footer">Built with ♥ — mobile-first and responsive</footer>
      </div>
    </div>
  );
}
