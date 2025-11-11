import React, { useState } from 'react';

export default function BudgetForm({ onAddBudget }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    await onAddBudget({
      description,
      amount: Number(amount),
      category,
      date: new Date().toISOString()
    });
    setDescription('');
    setAmount('');
    setCategory('other');
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

      <button className="btn-primary" type="submit">Add</button>
    </form>
  );
}
