import React, { useState, useEffect } from 'react';
import BudgetForm from './components/BudgetForm';
import BudgetList from './components/BudgetList';
import { getBudgets, addBudget, deleteBudget } from './services/budgetService';

const App = () => {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    const fetchedBudgets = await getBudgets();
    setBudgets(fetchedBudgets);
  };

  const handleAddBudget = async (newBudget) => {
    const addedBudget = await addBudget(newBudget);
    setBudgets([...budgets, addedBudget]);
  };

  const handleDeleteBudget = async (id) => {
    await deleteBudget(id);
    setBudgets(budgets.filter((budget) => budget._id !== id));
  };

  return (
    <div>
      <h1>Budget Tracker</h1>
      <BudgetForm onAddBudget={handleAddBudget} />
      <BudgetList budgets={budgets} onDeleteBudget={handleDeleteBudget} />
    </div>
  );
};

export default App;
