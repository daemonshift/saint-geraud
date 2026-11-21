// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// Toutes les pages sont pré-rendues (ADR 0001, 0002). Seules les routes du
// Cron et de la Mise à jour du site seront rendues à la demande, en déclarant
// `export const prerender = false` dans leur fichier.
export default defineConfig({
  output: 'static',
  adapter: vercel({
    // Vercel Web Analytics : seule mesure d'audience autorisée (ADR 0003).
    webAnalytics: { enabled: true },
  }),
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
});
