import React from 'react';
import BudgetCard from './BudgetCard';

export default function BudgetList({ budgets = [], onDeleteBudget }) {
  if (!budgets.length) {
    return <div className="empty">No entries yet — add your first expense.</div>;
  }

  return (
    <div className="cards-grid">
      {budgets.map(b => (
        <BudgetCard key={b._id} budget={b} onDelete={() => onDeleteBudget(b._id)} />
      ))}
    </div>
  );
}
