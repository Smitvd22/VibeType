import { createRoot } from 'react-dom/client';
import { FloatingWidget } from './FloatingWidget';
import tailwindStyle from '../index.css?inline';

// Create a Shadow DOM to isolate styles from the host page
const host = document.createElement('div');
host.id = 'vibetype-extension-root';
document.body.appendChild(host);

const shadowRoot = host.attachShadow({ mode: 'open' });

// Inject Tailwind CSS into the shadow DOM
const style = document.createElement('style');
style.textContent = tailwindStyle;
shadowRoot.appendChild(style);

// Container for React
const rootContainer = document.createElement('div');
shadowRoot.appendChild(rootContainer);

const root = createRoot(rootContainer);
root.render(<FloatingWidget />);

// Listen for messages from the VibeType web app
window.addEventListener('message', (event) => {
  // Allow messages from the live app or local dev server
  const allowedOrigins = ['https://vibe-type-kappa.vercel.app', 'http://localhost:3000'];
  if (!allowedOrigins.includes(event.origin)) return;

  const data = event.data;
  if (data?.type === 'VIBETYPE_MESSAGE' || data?.type === 'VIBETYPE_STREAM_CHUNK' || data?.type === 'VIBETYPE_STREAM_EMOJI') {
    window.dispatchEvent(new CustomEvent('vibetype_msg', { detail: data }));
  }
});
