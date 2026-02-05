// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  // ⚠️ IMPORTANTE: Esto activa el modo servidor (SSR)
  output: 'server',

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: node({
    mode: 'standalone'
  }),

  // Opcional pero recomendado para VPS/SPanel:
  // Asegura que el servidor escuche en todas las direcciones internas
  server: {
    host: true
  }
});