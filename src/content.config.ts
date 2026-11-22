/**
 * Collections de contenu Astro : textes des Pages fixes, gérés dans le dépôt
 * en Markdown (spec #1, « Textes des Pages fixes dans le dépôt »).
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { PICTOGRAMMES, type NomPictogramme } from './lib/pictogrammes';

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

/**
 * Prier et célébrer : une carte par fichier, nommé d'après son ancre
 * (`bapteme.md` → `/prier-et-celebrer#bapteme`). Le corps Markdown est le
 * texte de la carte. Retirer une carte = supprimer son fichier.
 */
const prierEtCelebrer = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/prier-et-celebrer' }),
  schema: z
    .object({
      titre: z.string(),
      sousTitre: z.string(),
      /** Section de la page : « La prière » ou « Les sacrements ». */
      section: z.enum(['priere', 'sacrements']),
      /** Rang dans la section (et dans le sommaire). */
      ordre: z.number(),
      pictogramme: z.enum(Object.keys(PICTOGRAMMES) as [NomPictogramme, ...NomPictogramme[]]),
      /**
       * Libellé de l'Info pratique de Rubrique Contacts (« Baptême ») : même
       * contact que sur La paroisse ; à défaut, le presbytère.
       */
      contact: z.string().optional(),
      /** Bouton vers une page du site, à la place du contact. */
      lien: z.object({ libelle: z.string(), href: z.string().startsWith('/') }).optional(),
    })
    .refine((carte) => !(carte.contact && carte.lien), 'Une carte a un contact ou un lien, pas les deux.'),
});

export const collections = { pagesLegales, prierEtCelebrer };
