import React, { useState } from 'react';

export default function DayWiseTotal({ budgets = [] }) {
  const [viewType, setViewType] = useState('date'); // 'date' or 'day'

  // Group budgets by date
  const groupByDate = () => {
    return budgets.reduce((acc, budget) => {
      const dateObj = new Date(budget.date);
      const dateKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
      const existing = acc.find(item => item.date === dateKey);
      
      if (existing) {
        existing.total += Number(budget.amount) || 0;
        existing.count += 1;
      } else {
        acc.push({
          date: dateKey,
          displayDate: dateObj.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
          total: Number(budget.amount) || 0,
          count: 1
        });
      }
      
      return acc;
    }, []).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by newest first
  };

  // Group budgets by day of week
  const groupByDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayData = {};
    
    budgets.forEach(budget => {
      const dateObj = new Date(budget.date);
      const dayName = days[dateObj.getDay()];
      
      if (dayData[dayName]) {
        dayData[dayName].total += Number(budget.amount) || 0;
        dayData[dayName].count += 1;
      } else {
        dayData[dayName] = {
          day: dayName,
          total: Number(budget.amount) || 0,
          count: 1
        };
      }
    });
    
    return days.map(day => dayData[day] || { day, total: 0, count: 0 });
  };

  const data = viewType === 'date' ? groupByDate() : groupByDay();

  if (budgets.length === 0) {
    return (
      <div className="stats-container empty">
        <p>No expenses to display. Add entries to see statistics.</p>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h2 className="section-title">Expense Statistics</h2>
        <div className="stats-toggle">
          <button
            className={`toggle-btn ${viewType === 'date' ? 'active' : ''}`}
            onClick={() => setViewType('date')}
          >
            Date-wise
          </button>
          <button
            className={`toggle-btn ${viewType === 'day' ? 'active' : ''}`}
            onClick={() => setViewType('day')}
          >
            Day-wise
          </button>
        </div>
      </div>

      <div className="stats-list">
        {data.map((item, idx) => (
          <div key={idx} className="stat-item">
            <div className="stat-label">
              <span className="stat-name">{item.displayDate || item.day}</span>
              <span className="stat-count">{item.count} expense{item.count !== 1 ? 's' : ''}</span>
            </div>
            <div className="stat-amount">₹{item.total.toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
