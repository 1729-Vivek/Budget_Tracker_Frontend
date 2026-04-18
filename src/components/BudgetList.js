import React from 'react';
import BudgetCard from './BudgetCard';

export default function BudgetList({ budgets = [], onDeleteBudget, onEditBudget, editingBudgetId, highlightedBudgetId }) {
  if (!budgets.length) {
    return <div className="empty">No entries yet — add your first expense.</div>;
  }

  return (
    <div className="cards-grid">
      {budgets.map(b => (
        <BudgetCard
          key={b._id}
          budget={b}
          onDelete={() => onDeleteBudget(b._id)}
          onEdit={onEditBudget}
          isEditing={editingBudgetId === b._id}
          isHighlighted={highlightedBudgetId === b._id}
        />
      ))}
    </div>
  );
}
