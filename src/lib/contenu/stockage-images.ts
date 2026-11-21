/**
 * Stockage des images du site : implémentation réelle de `StockageImages`.
 *
 * L'image est confiée à un optimiseur qui, au build, la télécharge, la
 * redimensionne et l'écrit dans le site produit, puis rend son chemin public
 * (`/_astro/….webp`). Les pages ne contiennent donc jamais d'URL Airtable,
 * qui expirent au bout de quelques heures.
 *
 * Deux sources :
 * - Airtable : `https://….airtableusercontent.com/…` (builds avec token) ;
 * - données d'exemple : `exemple:<fichier>` → image locale de `src/assets/exemple/`.
 *
 * Le branchement Astro (`getImage`) est dans stockage-images-astro.ts ; ce
 * fichier n'en dépend pas, pour être testé sans Astro.
 */
import type { StockageImages } from './charger';
import { PREFIXE_IMAGE_EXEMPLE } from './images';

/** Hôtes des pièces jointes Airtable (aussi autorisés dans `image.remotePatterns` d'astro.config.mjs). */
const HOTE_AIRTABLE = /^https:\/\/([a-z0-9-]+\.)*airtableusercontent\.com\//i;

export interface DependancesStockageImages<Locale> {
  /** Images d'exemple locales, par nom de fichier. */
  exemples: Record<string, Locale>;
  /** Télécharge si besoin, optimise et écrit l'image dans le site ; rend son chemin public. */
  optimiser(source: string | Locale): Promise<string>;
}

export function creerStockageImagesDuSite<Locale>({ exemples, optimiser }: DependancesStockageImages<Locale>): StockageImages {
  return {
    async enregistrer({ url }) {
      let source: string | Locale;
      if (url.startsWith(PREFIXE_IMAGE_EXEMPLE)) {
        const fichier = url.slice(PREFIXE_IMAGE_EXEMPLE.length);
        const locale = exemples[fichier];
        if (locale === undefined) throw new Error(`Image d’exemple introuvable : src/assets/exemple/${fichier}`);
        source = locale;
      } else if (HOTE_AIRTABLE.test(url)) {
        source = url;
      } else {
        throw new Error(`Image refusée : ${url} n’est pas une pièce jointe Airtable.`);
      }

      const chemin = await optimiser(source);
      if (!chemin.startsWith('/') || chemin.startsWith('//')) {
        throw new Error(`L’image ${url} n’a pas été téléchargée au build (chemin rendu : ${chemin}).`);
      }
      return chemin;
    },
  };
}
