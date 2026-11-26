import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './globals.css';
import App from './App';
import {loadRemoteContent} from './remote';

// Wait briefly for edited content so visitors never see the old text flash, then start anyway.
void loadRemoteContent().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
