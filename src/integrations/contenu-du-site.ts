/**
 * Branche le contenu du site sur le build, au-delà des pages :
 * - redirections 302 des Actualités Archivées (configuration `redirects`
 *   d'Astro, que l'adaptateur Vercel écrit dans `.vercel/output/config.json`) ;
 * - plan du site `sitemap.xml`, écrit après le rendu des pages ;
 * - images du contenu (src/lib/contenu/stockage-images.ts) : copiées dans le
 *   site produit au build, servies par un middleware en développement.
 */
import { createReadStream } from 'node:fs';
import { cp, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import type { AstroIntegration } from 'astro';
import { contenuDuSite, IMAGES_DU_SITE } from '../lib/contenu/site';
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
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(IMAGES_DU_SITE.prefixePublic, (req, res, suite) => {
          const fichier = basename(decodeURIComponent((req.url ?? '').split('?')[0] ?? ''));
          if (!/^[\w-]+\.webp$/.test(fichier)) return suite();
          createReadStream(join(IMAGES_DU_SITE.dossier, fichier))
            .on('error', () => suite())
            .once('open', () => res.setHeader('Content-Type', 'image/webp'))
            .pipe(res);
        });
      },
      'astro:build:done': async ({ dir, pages }) => {
        const { actualites } = await contenuDuSite();
        const xml = planDuSite(site!, pages.map((p) => p.pathname), actualites);
        await writeFile(new URL('sitemap.xml', dir), xml);
        // Avant la copie du site produit par l'adaptateur Vercel (hook suivant).
        await cp(IMAGES_DU_SITE.dossier, new URL(`.${IMAGES_DU_SITE.prefixePublic}`, dir), { recursive: true });
      },
    },
  };
}
