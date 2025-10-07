import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: { 
    alias: { 
      '@': resolve(__dirname, 'src') 
    } 
  },
}
)
