import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from './lib/pwa';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

createRoot(rootElement).render(<App />);

// Register PWA Service Worker
registerSW();
