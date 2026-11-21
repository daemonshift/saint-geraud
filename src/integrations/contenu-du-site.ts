/**
 * Branche le contenu du site sur le build, au-delà des pages :
 * - redirections 302 des Actualités Archivées (configuration `redirects`
 *   d'Astro, que l'adaptateur Vercel écrit dans `.vercel/output/config.json`) ;
 * - plan du site `sitemap.xml`, écrit après le rendu des pages.
 */
import { writeFile } from 'node:fs/promises';
import type { AstroIntegration } from 'astro';
import { contenuDuSite } from '../lib/contenu/site';
import { planDuSite, redirectionsDesArchivees } from '../lib/plan-du-site';

export default function contenuDuSiteAuBuild(): AstroIntegration {
  let site: URL | undefined;
  return {
    name: 'saint-geraud:contenu-du-site',
    hooks: {
      'astro:config:setup': async ({ config, updateConfig }) => {
        const { actualitesArchivees } = await contenuDuSite();
        updateConfig({ redirects: { ...config.redirects, ...redirectionsDesArchivees(actualitesArchivees) } });
      },
      'astro:config:done': ({ config }) => {
        if (!config.site) throw new Error('`site` est requis dans astro.config.mjs pour le plan du site.');
        site = new URL(config.site);
      },
      'astro:build:done': async ({ dir, pages }) => {
        const { actualites } = await contenuDuSite();
        const xml = planDuSite(site!, pages.map((p) => p.pathname), actualites);
        await writeFile(new URL('sitemap.xml', dir), xml);
      },
    },
  };
}
