import { mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { imageExemple } from '../../../src/lib/contenu/donnees-exemple';
import { convertirEnWebp, creerStockageImagesSurDisque } from '../../../src/lib/contenu/stockage-images';

const URL_AIRTABLE = 'https://v5.airtableusercontent.com/v3/u/48/48/1767225600000/abc/def';

/** Stockage dans un dossier temporaire ; faux réseau (rend `octets` ou un statut) et conversion neutre. */
function stockage({ statut = 200, octets = 'image distante' } = {}) {
  const racine = mkdtempSync(join(tmpdir(), 'stockage-images-'));
  const dossier = join(racine, 'public', 'images-du-site');
  writeFileSync(join(racine, 'exemple-vitrail.jpg'), 'image locale');
  const demandees: string[] = [];
  const images = creerStockageImagesSurDisque({
    dossier,
    prefixePublic: '/images-du-site',
    dossierExemples: racine,
    fetch: async (url) => {
      demandees.push(String(url));
      return new Response(octets, { status: statut });
    },
    convertir: async (b) => b,
  });
  return { images, dossier, demandees };
}

describe('Stockage des images du site', () => {
  it('image Airtable : téléchargée, écrite dans le dossier servi, chemin public rendu', async () => {
    const { images, dossier, demandees } = stockage();
    const chemin = await images.enregistrer({ url: URL_AIRTABLE, nom: 'att1.jpg' });
    expect(demandees).toEqual([URL_AIRTABLE]);
    expect(chemin).toMatch(/^\/images-du-site\/att1-[0-9a-f]{8}\.webp$/);
    expect(await readFile(join(dossier, chemin.split('/').pop()!), 'utf8')).toBe('image distante');
  });

  it('image d’exemple : lue en local, sans réseau', async () => {
    const { images, dossier, demandees } = stockage();
    const chemin = await images.enregistrer({ url: imageExemple('exemple-vitrail.jpg'), nom: 'attExemple.jpg' });
    expect(demandees).toEqual([]);
    expect(await readFile(join(dossier, chemin.split('/').pop()!), 'utf8')).toBe('image locale');
  });

  it('une image remplacée change d’adresse', async () => {
    const a = await stockage({ octets: 'ancienne' }).images.enregistrer({ url: URL_AIRTABLE, nom: 'cure-rec1.jpg' });
    const b = await stockage({ octets: 'nouvelle' }).images.enregistrer({ url: URL_AIRTABLE, nom: 'cure-rec1.jpg' });
    expect(a).not.toBe(b);
  });

  it('nom de fichier assaini', async () => {
    const { images } = stockage();
    expect(await images.enregistrer({ url: URL_AIRTABLE, nom: '../../é t/é.png' })).toMatch(/^\/images-du-site\/[\w-]+\.webp$/);
  });

  it('image d’exemple introuvable : échec qui nomme le fichier', async () => {
    const { images } = stockage();
    await expect(images.enregistrer({ url: imageExemple('absente.jpg'), nom: 'a.jpg' })).rejects.toThrow(/absente\.jpg/);
  });

  it('URL ni Airtable ni d’exemple : refusée', async () => {
    const { images } = stockage();
    await expect(images.enregistrer({ url: 'http://exemple.org/image.jpg', nom: 'a.jpg' })).rejects.toThrow(/exemple\.org/);
  });

  it('téléchargement en échec (URL expirée) : le build échoue', async () => {
    const { images } = stockage({ statut: 410 });
    await expect(images.enregistrer({ url: URL_AIRTABLE, nom: 'a.jpg' })).rejects.toThrow(/410/);
  });

  it('le dossier est vidé à la création : seules les images du contenu en cours sont servies', async () => {
    const premier = stockage();
    await premier.images.enregistrer({ url: URL_AIRTABLE, nom: 'retiree.jpg' });
    creerStockageImagesSurDisque({ dossier: premier.dossier, prefixePublic: '/x', dossierExemples: premier.dossier });
    expect(readdirSync(premier.dossier)).toEqual([]);
  });

  it('conversion : WebP, jamais plus large que 1 200 px', async () => {
    const sharp = (await import('sharp')).default;
    const jpeg = await sharp({ create: { width: 2000, height: 1000, channels: 3, background: { r: 128, g: 128, b: 128 } } }).jpeg().toBuffer();
    const meta = await sharp(await convertirEnWebp(jpeg)).metadata();
    expect([meta.format, meta.width, meta.height]).toEqual(['webp', 1200, 600]);
  });
});
