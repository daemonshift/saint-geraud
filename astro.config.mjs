// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import contenuDuSiteAuBuild from './src/integrations/contenu-du-site';

// Adresse publique (plan du site) : celle de production sur Vercel. Le
// sous-domaine du diocèse est en attente ; ailleurs, la preview locale.
const site = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:4321';

// Toutes les pages sont pré-rendues (ADR 0001, 0002). Seules les routes du
// Cron et de la Mise à jour du site seront rendues à la demande, en déclarant
// `export const prerender = false` dans leur fichier.
export default defineConfig({
  site,
  output: 'static',
  // Redirections des Actualités Archivées et plan du site, tirés du contenu du site.
  integrations: [contenuDuSiteAuBuild()],
  adapter: vercel({
    // Vercel Web Analytics : seule mesure d'audience autorisée (ADR 0003).
    webAnalytics: { enabled: true },
  }),
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
});
