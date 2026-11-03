import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fontes empacotadas localmente (funcionam offline).
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/sora/600.css';
import '@fontsource/sora/700.css';
import '@fontsource/sora/800.css';
import './styles/index.css';
import App from './App';
import { registerPWA } from './services/pwa';
import { MotionGlobalConfig } from 'framer-motion';

// "?noanim" na URL desliga as animações (aparelhos muito lentos ou testes).
if (new URLSearchParams(window.location.search).has('noanim')) MotionGlobalConfig.skipAnimations = true;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

void registerPWA();
