// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import contenuDuSiteAuBuild from './src/integrations/contenu-du-site';

// En local, `.env` (jamais commité) fournit AIRTABLE_TOKEN au module « contenu
// du site », qui lit `process.env`. Sur Vercel, il n'y a pas de `.env` : les
// variables viennent du projet.
try {
  process.loadEnvFile();
} catch {
  // Pas de `.env` : données d'exemple.
}

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
  // Adresses sans barre finale (comme le plan du site) : sur Vercel, `/page/`
  // est redirigée (308) vers `/page`, ce qui fait aussi aboutir la forme avec
  // barre d'une Actualité Archivée à sa redirection.
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
  },
});
