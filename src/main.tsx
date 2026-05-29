import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from './lib/pwa'

createRoot(document.getElementById("root")!).render(<App />);

// Register PWA Service Worker
registerSW();
