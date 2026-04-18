import React, { useEffect, useState } from 'react';

export default function BudgetForm({ onAddBudget, onUpdateBudget, editingBudget, onCancelEdit }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const isEditing = Boolean(editingBudget);

  useEffect(() => {
    if (editingBudget) {
      setDescription(editingBudget.description || '');
      setAmount(
        editingBudget.amount === undefined || editingBudget.amount === null
          ? ''
          : String(editingBudget.amount)
      );
      setCategory(editingBudget.category || 'other');
      return;
    }

    setDescription('');
    setAmount('');
    setCategory('other');
  }, [editingBudget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedDescription = description.trim();
    const parsedAmount = Number(amount);

    if (!trimmedDescription || !Number.isFinite(parsedAmount)) {
      return;
    }

    const payload = {
      description: trimmedDescription,
      amount: parsedAmount,
      category,
      date: editingBudget?.date || new Date().toISOString(),
    };

    const wasSaved = isEditing
      ? await onUpdateBudget(editingBudget._id, payload)
      : await onAddBudget(payload);

    if (wasSaved) {
      setDescription('');
      setAmount('');
      setCategory('other');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        className="input"
        type="text"
        placeholder="Description (e.g. Groceries)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        className="input"
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="food">Food</option>
        <option value="transport">Transport</option>
        <option value="health">Health</option>
        <option value="entertainment">Entertainment</option>
        <option value="other">Other</option>
      </select>

      <button className="btn-primary" type="submit">{isEditing ? 'Save' : 'Add'}</button>
      {isEditing ? (
        <button className="btn-secondary form-cancel-btn" type="button" onClick={onCancelEdit}>
          Cancel
        </button>
      ) : null}
    </form>
  );
}
