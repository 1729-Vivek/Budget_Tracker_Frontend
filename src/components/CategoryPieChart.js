import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

// Category colors matching the avatars
const CATEGORY_COLORS = {
  food: '#F59E0B',
  transport: '#3B82F6',
  health: '#EF4444',
  entertainment: '#8B5CF6',
  other: '#6B7280'
};

export default function CategoryPieChart({ budgets = [] }) {
  // Group budgets by category and calculate totals
  const categoryData = budgets.reduce((acc, budget) => {
    const category = budget.category || 'other';
    const existing = acc.find(item => item.name === category);
    
    if (existing) {
      existing.value += Number(budget.amount) || 0;
    } else {
      acc.push({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: Number(budget.amount) || 0
      });
    }
    
    return acc;
  }, []);

  if (categoryData.length === 0) {
    return (
      <div className="chart-container empty">
        <p>No data to display. Add expenses to see the pie chart.</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h2 className="section-title">Expense Breakdown by Category</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name.toLowerCase()] || '#6B7280'} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
