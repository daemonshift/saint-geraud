/**
 * Ce que le build produit à partir du contenu du site, hors pages : les
 * redirections des Actualités Archivées et le plan du site (sitemap.xml).
 * Branché sur le build par `src/integrations/contenu-du-site.ts`.
 */
import type { Actualite, ActualiteArchivee } from './contenu';
import { ACTUALITE_TERMINEE, lienActualite } from './navigation';

/** Format des redirections d'Astro (`redirects`), que l'adaptateur Vercel traduit en routes 302. */
export type Redirections = Record<string, { status: 302; destination: string }>;

/** Chaque Actualité Archivée redirige temporairement vers la page « Actualité terminée ». */
export function redirectionsDesArchivees(archivees: ActualiteArchivee[]): Redirections {
  return Object.fromEntries(archivees.map(({ id }) => [lienActualite(id), { status: 302, destination: ACTUALITE_TERMINEE }]));
}

/** Pages construites qui n'ont rien à faire dans le plan du site. */
const HORS_PLAN = new Set([ACTUALITE_TERMINEE, '/404']);

/**
 * Plan du site : toutes les pages construites (`pages` : chemins relatifs rendus
 * par le build, « actualites/ »), sauf la 404 et « Actualité terminée ».
 * `lastmod` des Actualités = Modifie_le ; les autres pages n'en ont pas.
 */
export function planDuSite(site: URL, pages: string[], actualites: Pick<Actualite, 'id' | 'modifieLe'>[]): string {
  const modifieLe = new Map(actualites.map((a) => [lienActualite(a.id), a.modifieLe]));
  const urls = pages
    .map((page) => `/${page.replace(/^\/+|\/+$/g, '')}`)
    .filter((chemin) => !HORS_PLAN.has(chemin))
    .map((chemin) => {
      const lastmod = modifieLe.get(chemin);
      return `<url><loc>${echapper(new URL(chemin, site).href)}</loc>${lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : ''}</url>`;
    });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

function echapper(texte: string): string {
  return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
