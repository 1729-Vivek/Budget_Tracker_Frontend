const Budget = require('../models/budgetModel');

// Get all budget entries
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a budget entry
const addBudget = async (req, res) => {
  const { description, amount } = req.body;
  console.log(req.body);  // Debug to check what data is coming from the frontend

  const newBudget = new Budget({
    description,
    amount,
  });

  try {
    const savedBudget = await newBudget.save();
    console.log('Saved budget:', savedBudget);  // Debugging
    res.status(201).json(savedBudget);
  } catch (error) {
    console.error('Error saving budget:', error);  // Debugging
    res.status(500).json({ message: error.message });
  }
};


// Delete a budget entry
const deleteBudget = async (req, res) => {
  const { id } = req.params;
  try {
    await Budget.findByIdAndDelete(id);
    res.status(200).json({ message: 'Budget entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBudgets, addBudget, deleteBudget };
