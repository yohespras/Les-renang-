import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker immediately for full installability on Laptop, Desktop, and Mobile
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('AquaFlow PWA update available');
  },
  onOfflineReady() {
    console.log('AquaFlow PWA siap digunakan offline');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
