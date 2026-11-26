import {defineConfig, loadEnv, type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import {nodeHandler} from './server/adapter.mjs';

/** Serves the API (/api/*) from the dev and preview servers, with the same code that runs in production. */
function portfolioApi(): Plugin {
  const mount = (server: {middlewares: {use: (path: string, fn: (req: any, res: any) => void) => void}}) => {
    Object.assign(process.env, {...loadEnv('development', process.cwd(), ''), ...process.env});
    server.middlewares.use('/api', (req, res) => { void nodeHandler(req, res); });
  };
  return {name: 'portfolio-api', configureServer: mount, configurePreviewServer: mount};
}

export default defineConfig({plugins: [react(), portfolioApi()]});
