/**
 * Branchement du stockage des images sur Astro (`getImage`) : au build, Astro
 * télécharge l'image distante (hôtes autorisés par `image.remotePatterns`
 * dans astro.config.mjs), la convertit en WebP de 1 200 px de large au plus et
 * l'écrit dans `dist/_astro/`. Importé dynamiquement par site.ts : les tests
 * Vitest, qui n'ont pas `astro:assets`, n'en dépendent pas.
 */
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { creerStockageImagesDuSite } from './stockage-images';

const fichiers = import.meta.glob<ImageMetadata>('../../assets/exemple/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });

const exemples = Object.fromEntries(Object.entries(fichiers).map(([chemin, image]) => [chemin.split('/').pop()!, image]));

export const stockageImagesAstro = creerStockageImagesDuSite<ImageMetadata>({
  exemples,
  async optimiser(source) {
    const image = await getImage({
      src: source,
      width: 1200,
      format: 'webp',
      ...(typeof source === 'string' ? { inferSize: true } : {}),
    });
    return image.src;
  },
});
