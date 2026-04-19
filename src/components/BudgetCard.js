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
  FaCarrot,
  FaPen,
  FaTrashAlt
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

export default function BudgetCard({ budget, onDelete, onEdit, isEditing, isHighlighted }) {
  const description = budget.description || budget.title || 'Expense';
  const amount = budget.amount || 0;
  const rawCategory = (budget.category || 'Other').toString().trim();
  const key = rawCategory.toLowerCase();
  const date = budget.date || budget.createdAt || new Date().toISOString();

  const config = categoryConfig[key] || categoryConfig[key.split(' ')[0]] || categoryConfig.other;
  const displayCategory = rawCategory
    ? rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase()
    : 'Other';
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className={`card${isHighlighted ? ' card-highlighted' : ''}`}>
      <div className="card-accent" style={{ background: config.accent }} />
      <div className="card-shell">
        <div className="card-top">
          <div className="card-identity">
            <div className="avatar" style={{ background: config.avatar }}>
              <span className="avatar-icon" aria-hidden>{config.icon}</span>
            </div>

            <div className="card-center">
              <div className="card-title">{description}</div>
              <div className="card-meta">
                <span className="card-date">{formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="card-right">
            <div className="amount">₹{Number(amount).toLocaleString('en-IN')}</div>
            <div className="card-note">Expense</div>
          </div>
        </div>

        <div className="card-bottom">
          <span className="badge" style={{ background: config.accent }}>{displayCategory}</span>
          <div className="card-actions">
            <button className={`btn-link btn-link-neutral btn-link-compact${isEditing ? ' active' : ''}`} onClick={() => onEdit(budget)}>
              <FaPen aria-hidden />
              <span>{isEditing ? 'Editing' : 'Edit'}</span>
            </button>
            <button className="btn-link btn-link-icon" onClick={() => onDelete(budget._id)} aria-label={`Remove ${description}`}>
              <FaTrashAlt aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
