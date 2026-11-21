import { describe, expect, it } from 'vitest';
import { imageExemple } from '../../../src/lib/contenu/donnees-exemple';
import { creerStockageImagesDuSite } from '../../../src/lib/contenu/stockage-images';

const URL_AIRTABLE = 'https://v5.airtableusercontent.com/v3/u/48/48/1767225600000/abc/def';

/** Faux optimiseur : note ce qu'on lui confie, rend un chemin public comme le ferait Astro. */
function stockage(rendu = '/_astro/image.webp') {
  const confiees: unknown[] = [];
  const images = creerStockageImagesDuSite({
    exemples: { 'vitrail.jpg': { src: '/src/assets/exemple/vitrail.jpg' } },
    optimiser: async (source) => {
      confiees.push(source);
      return rendu;
    },
  });
  return { images, confiees };
}

describe('Stockage des images du site', () => {
  it('image Airtable : confiée à l’optimiseur (téléchargée au build), rend un chemin public', async () => {
    const { images, confiees } = stockage();
    expect(await images.enregistrer({ url: URL_AIRTABLE, nom: 'att1.jpg' })).toBe('/_astro/image.webp');
    expect(confiees).toEqual([URL_AIRTABLE]);
  });

  it('image d’exemple : l’image locale correspondante est confiée à l’optimiseur', async () => {
    const { images, confiees } = stockage();
    await images.enregistrer({ url: imageExemple('vitrail.jpg'), nom: 'att1.jpg' });
    expect(confiees).toEqual([{ src: '/src/assets/exemple/vitrail.jpg' }]);
  });

  it('image d’exemple introuvable : échec qui nomme le fichier', async () => {
    const { images } = stockage();
    await expect(images.enregistrer({ url: imageExemple('absente.jpg'), nom: 'att1.jpg' })).rejects.toThrow(/absente\.jpg/);
  });

  it('URL ni Airtable ni d’exemple : refusée', async () => {
    const { images } = stockage();
    await expect(images.enregistrer({ url: 'http://exemple.org/image.jpg', nom: 'att1.jpg' })).rejects.toThrow(/exemple\.org/);
  });

  it('image restée distante après optimisation : échec (aucune URL Airtable dans les pages)', async () => {
    const { images } = stockage(URL_AIRTABLE);
    await expect(images.enregistrer({ url: URL_AIRTABLE, nom: 'att1.jpg' })).rejects.toThrow(/pas été téléchargée/);
  });
});
