/**
 * Stockage des images du site : implémentation réelle de `StockageImages`.
 *
 * Chaque image retenue est lue (téléchargée depuis Airtable, ou image
 * d'exemple locale), convertie en WebP de 1 200 px de large au plus, puis
 * écrite dans un dossier de travail que l'intégration
 * src/integrations/contenu-du-site.ts sert à `/images-du-site/` (copie au
 * build, middleware en développement) : les pages ne contiennent jamais d'URL
 * Airtable (elles expirent au bout de quelques heures).
 *
 * Deux sources :
 * - Airtable : `https://….airtableusercontent.com/…` (builds avec token) ;
 * - données d'exemple : `exemple:<fichier>` → `src/assets/exemple/<fichier>`.
 *
 * Le dossier est vidé à la création du stockage : il ne contient que les
 * images du contenu en cours (une photo retirée d'Airtable disparaît du site).
 */
import { createHash } from 'node:crypto';
import { mkdirSync, rmSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import type { StockageImages } from './charger';
import { PREFIXE_IMAGE_EXEMPLE } from './images';

/** Hôtes des pièces jointes Airtable. */
const HOTE_AIRTABLE = /^https:\/\/([a-z0-9-]+\.)*airtableusercontent\.com\//i;

/** Largeur maximale servie : colonne de lecture du détail d'une Actualité, écrans haute densité compris. */
const LARGEUR_MAX = 1200;

export interface OptionsStockageImages {
  /** Dossier servi par le site (vidé à la création). */
  dossier: string;
  /** Chemin public de ce dossier, sans barre finale : `/images-du-site`. */
  prefixePublic: string;
  /** Dossier des images d'exemple locales. */
  dossierExemples: string;
  fetch?: typeof globalThis.fetch;
  /** Conversion des octets lus (remplaçable dans les tests). */
  convertir?: (octets: Buffer) => Promise<Buffer>;
}

/** WebP, orientation EXIF appliquée, 1 200 px de large au plus (jamais agrandie). */
export function convertirEnWebp(octets: Buffer): Promise<Buffer> {
  return sharp(octets).rotate().resize({ width: LARGEUR_MAX, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
}

export function creerStockageImagesSurDisque({
  dossier,
  prefixePublic,
  dossierExemples,
  fetch = globalThis.fetch,
  convertir = convertirEnWebp,
}: OptionsStockageImages): StockageImages {
  rmSync(dossier, { recursive: true, force: true });
  mkdirSync(dossier, { recursive: true });

  async function lire(url: string): Promise<Buffer> {
    if (url.startsWith(PREFIXE_IMAGE_EXEMPLE)) {
      const fichier = url.slice(PREFIXE_IMAGE_EXEMPLE.length);
      const chemin = join(dossierExemples, fichier);
      if (!/^[\w.-]+$/.test(fichier)) throw new Error(`Image d’exemple invalide : ${fichier}`);
      return readFile(chemin).catch(() => {
        throw new Error(`Image d’exemple introuvable : ${chemin}`);
      });
    }
    if (!HOTE_AIRTABLE.test(url)) throw new Error(`Image refusée : ${url} n’est pas une pièce jointe Airtable.`);
    const reponse = await fetch(url);
    if (!reponse.ok) throw new Error(`Téléchargement de l’image ${url} impossible : statut ${reponse.status}.`);
    return Buffer.from(await reponse.arrayBuffer());
  }

  return {
    async enregistrer({ url, nom }) {
      const octets = await convertir(await lire(url));
      // Nom lisible et sûr, plus une empreinte du contenu : une image remplacée change d'adresse (pas de cache périmé).
      const base = nom.replace(/\.[^.]*$/, '').replace(/[^\w-]+/g, '-') || 'image';
      const empreinte = createHash('sha256').update(octets).digest('hex').slice(0, 8);
      const fichier = `${base}-${empreinte}.webp`;
      await writeFile(join(dossier, fichier), octets);
      return `${prefixePublic}/${fichier}`;
    },
  };
}
