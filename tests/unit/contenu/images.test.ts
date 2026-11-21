import { describe, expect, it } from 'vitest';
import { creerClientEnMemoire, type DonneesAirtable } from '../../../src/lib/airtable/client-en-memoire';
import { chargerContenuDuSite } from '../../../src/lib/contenu';
import { actualite, pieceJointe } from '../../../src/lib/contenu/donnees-exemple';
import { fauxStockageImages } from './outils';

async function charger(donnees: DonneesAirtable) {
  const images = fauxStockageImages();
  const contenu = await chargerContenuDuSite({
    client: creerClientEnMemoire(donnees),
    horloge: () => new Date('2026-06-15T10:00:00Z'),
    images,
  });
  return { contenu, images };
}

describe('Image d’une Actualité', () => {
  it('Actualité sans image : affichée sans image, rien n’est téléchargé', async () => {
    const { contenu, images } = await charger({ actualites: [actualite('rec1')] });
    expect(contenu.actualites[0]!.image).toBeNull();
    expect(images.enregistrees).toEqual([]);
  });

  it('image sans texte alternatif : ignorée, l’Actualité reste affichée sans image', async () => {
    const { contenu, images } = await charger({
      actualites: [actualite('rec1', { image: [pieceJointe('attSansAlt')] })],
    });
    expect(contenu.actualites).toHaveLength(1);
    expect(contenu.actualites[0]!.image).toBeNull();
    expect(images.enregistrees).toEqual([]);
  });

  it('texte alternatif fait d’espaces : traité comme absent', async () => {
    const { contenu } = await charger({
      actualites: [actualite('rec1', { image: [pieceJointe('att1')], texteAlternatifImage: '   ' })],
    });
    expect(contenu.actualites[0]!.image).toBeNull();
  });

  it('image valide : seule la première pièce jointe est téléchargée, servie par le site avec son texte alternatif', async () => {
    const { contenu, images } = await charger({
      actualites: [
        actualite('rec1', {
          image: [
            pieceJointe('attPremiere', { url: 'https://v5.airtableusercontent.com/premiere', filename: 'Vitrail.JPG' }),
            pieceJointe('attSeconde', { url: 'https://v5.airtableusercontent.com/seconde' }),
          ],
          texteAlternatifImage: 'Vitrail de l’église Saint-Antoine',
        }),
      ],
    });
    expect(images.enregistrees).toEqual(['https://v5.airtableusercontent.com/premiere']);
    expect(contenu.actualites[0]!.image).toEqual({ src: '/images/attPremiere.jpg', alt: 'Vitrail de l’église Saint-Antoine' });
  });

  it('première pièce jointe qui n’est pas une image (PDF) : ignorée', async () => {
    const { contenu, images } = await charger({
      actualites: [
        actualite('rec1', {
          image: [pieceJointe('attPdf', { filename: 'programme.pdf', type: 'application/pdf' })],
          texteAlternatifImage: 'Programme',
        }),
      ],
    });
    expect(contenu.actualites[0]!.image).toBeNull();
    expect(images.enregistrees).toEqual([]);
  });

  it('l’image d’une Actualité qui n’est pas En ligne n’est pas téléchargée', async () => {
    const { images } = await charger({
      actualites: [actualite('rec1', { valide: false, image: [pieceJointe('att1')], texteAlternatifImage: 'Texte' })],
    });
    expect(images.enregistrees).toEqual([]);
  });

  it('échec du téléchargement : le build échoue', async () => {
    await expect(
      chargerContenuDuSite({
        client: creerClientEnMemoire({ actualites: [actualite('rec1', { image: [pieceJointe('att1')], texteAlternatifImage: 'Texte' })] }),
        horloge: () => new Date('2026-06-15T10:00:00Z'),
        images: {
          enregistrer: () => Promise.reject(new Error('Téléchargement impossible : 410')),
        },
      }),
    ).rejects.toThrow('Téléchargement impossible : 410');
  });
});
