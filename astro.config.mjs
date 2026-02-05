import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless'; // Importante para Vercel

// PASO 1: Determinar el entorno
const isVercel = process.env.VERCEL === '1';

export default defineConfig({
  // PASO 2: Configurar el Adaptador
  // Si detecta Vercel, usa el adaptador de Vercel (SSR). 
  // Si es Local o SPanel, puedes usar 'static' o el adaptador de Node.
  output: isVercel ? 'server' : 'static', 
  adapter: isVercel ? vercel() : undefined,

  integrations: [
    tailwind(),
    react()
  ],

  // PASO 3: Configuración de servidor para desarrollo local
  server: {
    port: 3000,
    host: true
  }
});