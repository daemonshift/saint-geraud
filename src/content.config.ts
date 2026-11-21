/**
 * Collections de contenu Astro : textes des Pages fixes, gérés dans le dépôt
 * en Markdown (spec #1, « Textes des Pages fixes dans le dépôt »).
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Pages légales : un fichier par page, nommé d'après son adresse
 * (`mentions-legales.md` → `/mentions-legales`, voir src/lib/navigation.ts).
 */
const pagesLegales = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages-legales' }),
  schema: z.object({
    titre: z.string(),
    description: z.string(),
    /** Date de la dernière révision du texte, affichée en bas de page. */
    miseAJour: z.coerce.date(),
  }),
});

export const collections = { pagesLegales };
