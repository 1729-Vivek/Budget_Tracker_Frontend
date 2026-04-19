import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const seoDefaults = {
  siteName: 'Budget Tracker',
  defaultTitle: 'Budget Tracker | Personal Expense Tracking, Budget Planning, and Spending Insights',
  signedInTitle: 'Budget Dashboard | Budget Tracker',
  description:
    'Budget Tracker helps you record expenses, organize spending by category, review trends, and stay on top of personal budgeting with a simple account-based dashboard.',
  canonicalPath: '/',
};

function AdSlot({ slot, format = 'auto', label = 'Advertisement', className = '' }) {
  const publisherId = process.env.REACT_APP_GOOGLE_ADSENSE_PUBLISHER_ID;
  const isLiveAd = Boolean(publisherId && slot);

  useEffect(() => {
    if (!isLiveAd || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const scriptId = 'adsense-js';

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (error) {
      console.error('AdSense placeholder could not initialize.', error);
    }
  }, [isLiveAd, publisherId, slot]);

  return (
    <section className={`ad-slot-card ${className}`.trim()} aria-label={label}>
      <div className="ad-slot-label">{label}</div>
      {isLiveAd ? (
        <ins
          className="adsbygoogle ad-slot-live"
          style={{ display: 'block' }}
          data-ad-client={publisherId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        <div className="ad-slot-placeholder">
          <strong>Ad placement ready</strong>
          <p>
            Add `REACT_APP_GOOGLE_ADSENSE_PUBLISHER_ID` and a slot ID to turn this placeholder into a live AdSense unit.
          </p>
        </div>
      )}
    </section>
  );
}

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
  const [rightPanelHeight, setRightPanelHeight] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [minAmountFilter, setMinAmountFilter] = useState('');
  const [maxAmountFilter, setMaxAmountFilter] = useState('');
  const leftColumnRef = useRef(null);

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

  useEffect(() => {
    const syncPanelHeight = () => {
      if (typeof window === 'undefined') {
        return;
      }

      if (window.innerWidth < 780) {
        setRightPanelHeight(null);
        return;
      }

      if (leftColumnRef.current) {
        setRightPanelHeight(leftColumnRef.current.offsetHeight);
      }
    };

    syncPanelHeight();
    window.addEventListener('resize', syncPanelHeight);

    return () => window.removeEventListener('resize', syncPanelHeight);
  }, [budgets.length, editingBudget, loading, error]);

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

  const filteredBudgets = budgets.filter((budget) => {
    const categoryMatches =
      categoryFilter === 'all' || (budget.category || 'other').toLowerCase() === categoryFilter;

    const amount = Number(budget.amount) || 0;
    const minMatches = minAmountFilter === '' || amount >= Number(minAmountFilter);
    const maxMatches = maxAmountFilter === '' || amount <= Number(maxAmountFilter);

    return categoryMatches && minMatches && maxMatches;
  });

  const total = budgets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://budgettracker.example.com';
  const siteUrl = (process.env.REACT_APP_SITE_URL || currentOrigin).replace(/\/$/, '');
  const publicUrl = process.env.PUBLIC_URL || '';
  const legalLinks = {
    privacy: `${publicUrl}/privacy.html`,
    terms: `${publicUrl}/terms.html`,
    contact: `${publicUrl}/contact.html`,
  };

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const title = user ? seoDefaults.signedInTitle : seoDefaults.defaultTitle;
    const description = seoDefaults.description;
    const canonicalUrl = `${siteUrl}${seoDefaults.canonicalPath}`;

    document.title = title;

    const ensureMeta = (attribute, key, value) => {
      let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);

      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, key);
        document.head.appendChild(tag);
      }

      tag.setAttribute('content', value);
    };

    ensureMeta('name', 'description', description);
    ensureMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    ensureMeta('property', 'og:title', title);
    ensureMeta('property', 'og:description', description);
    ensureMeta('property', 'og:type', 'website');
    ensureMeta('property', 'og:url', canonicalUrl);
    ensureMeta('property', 'og:site_name', seoDefaults.siteName);
    ensureMeta('name', 'twitter:card', 'summary_large_image');
    ensureMeta('name', 'twitter:title', title);
    ensureMeta('name', 'twitter:description', description);

    let canonical = document.head.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }

    canonical.setAttribute('href', canonicalUrl);

    let structuredData = document.getElementById('budget-tracker-structured-data');

    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.type = 'application/ld+json';
      structuredData.id = 'budget-tracker-structured-data';
      document.head.appendChild(structuredData);
    }

    structuredData.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: seoDefaults.siteName,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      description,
      url: canonicalUrl,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Expense tracking',
        'Category-level insights',
        'Daily spending totals',
        'Private account-based budget history',
      ],
    });
  }, [siteUrl, user]);

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
            {!user ? (
              <nav className="header-links" aria-label="Site links">
                <a href={legalLinks.contact}>Contact</a>
                <a href={legalLinks.terms}>Terms</a>
                <a href={legalLinks.privacy}>Privacy</a>
              </nav>
            ) : null}
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
          <>
            <main className="marketing-layout">
              <section className="marketing-panel">
                <div className="hero-copy">
                  <span className="eyebrow">SEO-ready budget tool</span>
                  <h2 className="hero-title">Track daily expenses, review spending habits, and build healthier budgeting routines.</h2>
                  <p className="hero-text">
                    Budget Tracker is a personal finance web app for people who want a simple way to record expenses, understand category trends, and keep their money decisions organized in one place.
                  </p>
                </div>

                <div className="hero-grid" aria-label="Budget Tracker highlights">
                  <article className="hero-stat-card">
                    <span className="hero-stat-label">Track</span>
                    <strong className="hero-stat-value">Daily expenses</strong>
                    <p>Capture purchases quickly and keep your spending history easy to review.</p>
                  </article>
                  <article className="hero-stat-card">
                    <span className="hero-stat-label">Review</span>
                    <strong className="hero-stat-value">Category breakdowns</strong>
                    <p>See where your money goes across food, transport, health, entertainment, and more.</p>
                  </article>
                  <article className="hero-stat-card">
                    <span className="hero-stat-label">Understand</span>
                    <strong className="hero-stat-value">Spending patterns</strong>
                    <p>Use charts and daily totals to spot trends before they become budgeting problems.</p>
                  </article>
                </div>

                <section className="content-panel">
                  <h3>Why this budget tracker is useful</h3>
                  <p>
                    People searching for a free personal budget tracker usually want something fast, clear, and private. This app focuses on practical budgeting basics instead of unnecessary complexity, which makes it easier to build a consistent habit.
                  </p>
                  <ul className="content-list">
                    <li>Private account-based access for each user.</li>
                    <li>Expense logging with editing and deletion controls.</li>
                    <li>Category charts and day-wise totals for better decision-making.</li>
                    <li>Simple filtering to review low-value and high-value spending.</li>
                  </ul>
                </section>

                <AdSlot
                  className="content-panel"
                  label="Sponsored placement"
                  slot={process.env.REACT_APP_ADSENSE_HOME_TOP_SLOT}
                />
              </section>

              <aside className="auth-panel" id="auth-panel">
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
              </aside>
            </main>

            <section className="seo-content-grid" aria-label="Budget Tracker information">
              <article className="content-panel">
                <h2>Budgeting tips for better money management</h2>
                <p>
                  Start by logging every purchase for at least two weeks. Once your spending history is visible, separate essential costs from flexible costs and look for repeat categories where small reductions can make a real difference over time.
                </p>
                <p>
                  Many people improve their monthly budget just by checking where daily spending adds up. A clear budget dashboard helps you compare habits instead of guessing.
                </p>
              </article>

              <article className="content-panel">
                <h2>Frequently asked questions</h2>
                <div className="faq-list">
                  <div>
                    <h3>Is Budget Tracker free to use?</h3>
                    <p>The current version is designed as a free web-based budget and expense tracker.</p>
                  </div>
                  <div>
                    <h3>What can I track?</h3>
                    <p>You can record expense names, amounts, dates, categories, and then review them through lists and charts.</p>
                  </div>
                  <div>
                    <h3>Is the content suitable for ads?</h3>
                    <p>The app focuses on original budgeting content, clear navigation, transparent privacy messaging, and a clean user experience that is better aligned with ad review expectations.</p>
                  </div>
                </div>
              </article>

              <article className="content-panel">
                <h2>Privacy and advertising transparency</h2>
                <p>
                  Budget Tracker is built for personal finance organization. Any future advertisements should be clearly labeled and should not interfere with logging expenses or viewing reports. The app also links to a privacy policy so visitors and ad reviewers can understand how the service is intended to operate.
                </p>
                <p>
                  Read the full policy at <a href={legalLinks.privacy}>Privacy Policy</a>.
                </p>
              </article>
            </section>

            <section className="seo-content-grid seo-content-grid-secondary" aria-label="Trust and support information">
              <article className="content-panel">
                <h2>Need help or business contact?</h2>
                <p>
                  A production-ready finance website should make it easy for users, reviewers, and advertising partners to contact the owner. A dedicated contact page improves transparency and trust.
                </p>
                <p>
                  Visit <a href={legalLinks.contact}>Contact</a> to publish your support email, business details, and response expectations.
                </p>
              </article>

              <article className="content-panel">
                <h2>Terms and acceptable use</h2>
                <p>
                  Terms of Service help explain the intended use of the platform, account responsibilities, and service limitations. This is especially helpful for ad reviews and general site trust.
                </p>
                <p>
                  Review the site terms at <a href={legalLinks.terms}>Terms of Service</a>.
                </p>
              </article>

              <AdSlot
                className="content-panel"
                label="Responsive ad slot"
                slot={process.env.REACT_APP_ADSENSE_HOME_MID_SLOT}
              />
            </section>
          </>
        ) : (
          <main className="main-grid">
            <aside className="left-col" ref={leftColumnRef}>
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

            <section
              className="right-col"
              style={rightPanelHeight ? { height: `${rightPanelHeight}px` } : undefined}
            >
              <div className="list-header">
                <h2 className="section-title">Recent Entries</h2>
                <div className="count">{filteredBudgets.length} items</div>
              </div>

              <div className="filters-panel">
                <select
                  className="select filter-control"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                >
                  <option value="all">All categories</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="health">Health</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>

                <input
                  className="input filter-control"
                  type="number"
                  min="0"
                  placeholder="Min amount"
                  value={minAmountFilter}
                  onChange={(event) => setMinAmountFilter(event.target.value)}
                />

                <input
                  className="input filter-control"
                  type="number"
                  min="0"
                  placeholder="Max amount"
                  value={maxAmountFilter}
                  onChange={(event) => setMaxAmountFilter(event.target.value)}
                />

                <button
                  className="btn-secondary filter-reset"
                  type="button"
                  onClick={() => {
                    setCategoryFilter('all');
                    setMinAmountFilter('');
                    setMaxAmountFilter('');
                  }}
                >
                  Reset
                </button>
              </div>

              {loading ? (
                <div className="skeleton-grid">
                  {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
                </div>
              ) : error ? (
                <div className="error-banner">{error}</div>
              ) : (
                <BudgetList
                  budgets={filteredBudgets}
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

        <footer className="footer">
          <span>Built for personal, account-based budget tracking.</span>
          <div className="footer-links">
            <a href={legalLinks.contact}>Contact</a>
            <a href={legalLinks.terms}>Terms</a>
            <a href={legalLinks.privacy}>Privacy</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
