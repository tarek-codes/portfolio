import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './globals.css';
import App from './App';
import {loadRemoteContent} from './remote';

// Always open at the top, even after a refresh: the browser must not restore an old scroll position or jump to a #section.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
// Drop any leftover router state from an earlier visit so a refresh starts clean.
if (history.state && typeof history.state === 'object' && 'usr' in history.state) history.replaceState({...history.state, usr: null}, '');
window.scrollTo(0, 0);

// Wait briefly for edited content so visitors never see the old text flash, then start anyway.
void loadRemoteContent().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
