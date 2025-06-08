import { render, screen } from '@testing-library/react';
import App from './App.jsx';
import { vi, test, expect } from 'vitest';

test('App renders without crashing', async () => {
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: { getUserMedia: vi.fn().mockResolvedValue({}) },
    writable: true,
  });
  Object.defineProperty(global.navigator, 'xr', {
    value: { isSessionSupported: vi.fn().mockResolvedValue(false) },
    writable: true,
  });

  render(<App />);
  expect(await screen.findByText(/WebXR AR/)).toBeInTheDocument();
});
