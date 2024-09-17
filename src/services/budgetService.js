const API_URL = 'https://budget-tracker-frontend-phi.vercel.app/';


export const getBudgets = async () => {
  const response = await fetch(API_URL);
  return await response.json();
};

export const addBudget = async (budget) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(budget),
  });
  return await response.json();
};

export const deleteBudget = async (id) => {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
};
