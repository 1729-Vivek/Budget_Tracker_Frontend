// src/components/BudgetCard.js
import React from 'react';
import {
  FaUtensils,
  FaBus,
  FaHeartbeat,
  FaFilm,
  FaQuestionCircle,
  FaBook,
  FaAppleAlt,
  FaDrumstickBite,
  FaShoppingCart,
  FaPills,
  FaCoffee,
  FaGlassMartiniAlt,
  FaCarrot
} from 'react-icons/fa';

/**
 * BudgetCard - renders a colorful card with per-category icon & accent
 * Props:
 *  - budget: { description/title, amount, category, date, _id }
 *  - onDelete: function(id)
 */

const categoryConfig = {
  food:        { icon: <FaUtensils />,       accent: 'linear-gradient(180deg,#fb923c,#f97316)', avatar: 'linear-gradient(180deg,#fb923c,#ffb36b)' },
  groceries:   { icon: <FaShoppingCart />,   accent: 'linear-gradient(180deg,#fb923c,#f97316)', avatar: 'linear-gradient(180deg,#fb923c,#ffb36b)' },
  fruits:      { icon: <FaAppleAlt />,       accent: 'linear-gradient(180deg,#10b981,#34d399)', avatar: 'linear-gradient(180deg,#10b981,#6ee7b7)' },
  transport:   { icon: <FaBus />,            accent: 'linear-gradient(180deg,#06b6d4,#3b82f6)', avatar: 'linear-gradient(180deg,#06b6d4,#60a5fa)' },
  health:      { icon: <FaHeartbeat />,      accent: 'linear-gradient(180deg,#ef4444,#fb7185)', avatar: 'linear-gradient(180deg,#ef4444,#ff98a7)' },
  medicine:    { icon: <FaPills />,          accent: 'linear-gradient(180deg,#ef4444,#fb7185)', avatar: 'linear-gradient(180deg,#ef4444,#ff98a7)' },
  entertainment:{ icon: <FaFilm />,          accent: 'linear-gradient(180deg,#7c3aed,#06b6d4)', avatar: 'linear-gradient(180deg,#7c3aed,#a78bfa)' },
  books:       { icon: <FaBook />,           accent: 'linear-gradient(180deg,#8b5cf6,#06b6d4)', avatar: 'linear-gradient(180deg,#8b5cf6,#a78bfa)' },
  protein:     { icon: <FaDrumstickBite />,  accent: 'linear-gradient(180deg,#ef4444,#f97316)', avatar: 'linear-gradient(180deg,#ef4444,#ffb36b)' },
  coffee:      { icon: <FaCoffee />,         accent: 'linear-gradient(180deg,#a78bfa,#fb7185)', avatar: 'linear-gradient(180deg,#a78bfa,#fda4af)' },
  drinks:      { icon: <FaGlassMartiniAlt />,accent: 'linear-gradient(180deg,#06b6d4,#3b82f6)', avatar: 'linear-gradient(180deg,#06b6d4,#60a5fa)' },
  veg:         { icon: <FaCarrot />,         accent: 'linear-gradient(180deg,#10b981,#34d399)', avatar: 'linear-gradient(180deg,#34d399,#86efac)' },
  other:       { icon: <FaQuestionCircle />, accent: 'linear-gradient(180deg,#94a3b8,#64748b)', avatar: 'linear-gradient(180deg,#94a3b8,#a7b2bd)' }
};

export default function BudgetCard({ budget, onDelete }) {
  const description = budget.description || budget.title || 'Expense';
  const amount = budget.amount || 0;
  const rawCategory = (budget.category || 'Other').toString().trim();
  const key = rawCategory.toLowerCase();
  const date = budget.date || budget.createdAt || new Date().toISOString();

  // best-effort matching: exact key -> first word -> fallback
  const config = categoryConfig[key] || categoryConfig[key.split(' ')[0]] || categoryConfig.other;
  const displayCategory = rawCategory || 'Other';

  return (
    <div className="card">
      {/* left colorful accent bar */}
      <div className="card-accent" style={{ background: config.accent }} />

      {/* avatar with icon */}
      <div className="avatar" style={{ background: config.avatar }}>
        <span className="avatar-icon" aria-hidden>{config.icon}</span>
      </div>

      {/* content */}
      <div className="card-center">
        <div className="card-title">{description}</div>
        <div className="card-meta">
          <span className="badge" style={{ background: config.accent }}>{displayCategory}</span>
          <span style={{ marginLeft: 10, color: '#94a3b8', fontSize: 12 }}>
            • {new Date(date).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* right side */}
      <div className="card-right">
        <div className="amount">₹{Number(amount).toLocaleString()}</div>
        <button className="btn-link" onClick={() => onDelete(budget._id)}>Delete</button>
      </div>
    </div>
  );
}
