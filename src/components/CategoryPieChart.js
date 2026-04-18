import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// Category colors matching the avatars
const CATEGORY_COLORS = {
  food: '#F59E0B',
  transport: '#3B82F6',
  health: '#EF4444',
  entertainment: '#8B5CF6',
  other: '#6B7280'
};

export default function CategoryPieChart({ budgets = [] }) {
  const categoryMap = budgets.reduce((acc, budget) => {
    const categoryKey = (budget.category || 'other').toString().trim().toLowerCase() || 'other';

    if (!acc[categoryKey]) {
      acc[categoryKey] = {
        key: categoryKey,
        name: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
        value: 0,
      };
    }

    acc[categoryKey].value += Number(budget.amount) || 0;
    return acc;
  }, {});

  const categoryData = Object.values(categoryMap);
  const totalAmount = categoryData.reduce((sum, item) => sum + item.value, 0);
  const sortedCategoryData = [...categoryData].sort((a, b) => b.value - a.value);

  if (categoryData.length === 0) {
    return (
      <div className="chart-container empty">
        <p>No data to display. Add expenses to see the pie chart.</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          <h2 className="section-title">Expense Breakdown by Category</h2>
          <p className="chart-subtitle">See where most of your spending is going this period.</p>
        </div>
        <div className="chart-total-pill">
          <span className="chart-total-label">Total spent</span>
          <strong className="chart-total-value">₹{totalAmount.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      <div className="chart-layout">
        <div className="chart-visual">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={sortedCategoryData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={sortedCategoryData.length > 1 ? 3 : 0}
                stroke="#fffdf8"
                strokeWidth={3}
                dataKey="value"
              >
                {sortedCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.key] || '#6B7280'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                contentStyle={{
                  borderRadius: '14px',
                  border: '1px solid rgba(92, 72, 51, 0.12)',
                  boxShadow: '0 12px 30px rgba(61, 43, 24, 0.12)',
                  background: '#fffdf8',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="chart-center">
            <span className="chart-center-label">Spent</span>
            <strong className="chart-center-value">₹{totalAmount.toLocaleString('en-IN')}</strong>
            <span className="chart-center-meta">{sortedCategoryData.length} categories</span>
          </div>
        </div>

        <div className="chart-summary">
          {sortedCategoryData.map((item) => {
            const share = totalAmount ? Math.round((item.value / totalAmount) * 100) : 0;

            return (
              <div key={item.key} className="chart-summary-item">
                <div className="chart-summary-main">
                  <span
                    className="chart-summary-dot"
                    style={{ background: CATEGORY_COLORS[item.key] || '#6B7280' }}
                  />
                  <div>
                    <div className="chart-summary-name">{item.name}</div>
                    <div className="chart-summary-share">{share}% of total</div>
                  </div>
                </div>
                <strong className="chart-summary-value">₹{item.value.toLocaleString('en-IN')}</strong>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
