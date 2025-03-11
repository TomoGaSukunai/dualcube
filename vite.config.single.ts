import { defineConfig, } from 'vite';
import react from '@vitejs/plugin-react';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import { viteSingleFile } from "vite-plugin-singlefile";


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteCommonjs(), viteSingleFile({ removeViteModuleLoader: true })],
});
