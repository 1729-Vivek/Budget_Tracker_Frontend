import { render, screen } from '@testing-library/react';
import App from './App';

test('renders authentication prompt', () => {
  render(<App />);
  expect(screen.getByText(/register or sign in/i)).toBeInTheDocument();
});
