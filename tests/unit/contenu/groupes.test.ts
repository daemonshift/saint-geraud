import { describe, expect, it } from 'vitest';
import { creerClientEnMemoire } from '../../../src/lib/airtable/client-en-memoire';
import type { EnregistrementAirtable } from '../../../src/lib/airtable/client';
import { chargerContenuDuSite } from '../../../src/lib/contenu';
import { groupe, infoPratique } from '../../../src/lib/contenu/donnees-exemple';
import { fauxStockageImages } from './outils';

const PRESBYTERE = [
  infoPratique('recTel', { rubrique: 'Presbytère', libelle: 'Téléphone', telephone: '05 53 00 00 00' }),
  infoPratique('recEmail', { rubrique: 'Presbytère', libelle: 'E-mail', valeur: 'paroisse@example.org' }),
];

function charger(groupes: EnregistrementAirtable[], images = fauxStockageImages()) {
  return chargerContenuDuSite({
    client: creerClientEnMemoire({ groupes, infosPratiques: PRESBYTERE }),
    horloge: () => new Date('2026-06-15T10:00:00Z'),
    images,
  });
}

describe('Groupes', () => {
  it('seuls les Groupes actifs, triés par Ordre (sans Ordre à la fin, puis par nom)', async () => {
    const { groupes } = await charger([
      groupe('recSansOrdreB', { nom: 'Secours catholique' }),
      groupe('recDeux', { nom: 'Chorale', ordre: 2 }),
      groupe('recInactif', { nom: 'Groupe masqué', ordre: 0, active: false }),
      groupe('recSansOrdreA', { nom: 'Équipe liturgique', type: 'Équipe paroissiale' }),
      groupe('recUn', { nom: 'Scouts', type: 'Mouvement', ordre: 1 }),
    ]);
    expect(groupes.liste.map((g) => g.nom)).toEqual(['Scouts', 'Chorale', 'Équipe liturgique', 'Secours catholique']);
  });

  it('regroupés par Type, dans l’ordre des choix (Association, Mouvement, Équipe paroissiale), les Groupes sans Type à la fin', async () => {
    const { groupes } = await charger([
      groupe('recEquipe', { nom: 'Équipe liturgique', type: 'Équipe paroissiale', ordre: 1 }),
      groupe('recScouts', { nom: 'Scouts', type: 'Mouvement', ordre: 2 }),
      groupe('recSecours', { nom: 'Secours catholique', type: 'Association', ordre: 4 }),
      groupe('recChorale', { nom: 'Chorale', type: 'Association', ordre: 3 }),
      groupe('recSansType', { nom: 'Groupe sans type', type: undefined, ordre: 5 }),
    ]);
    expect(groupes.parType.map(({ type, titre, groupes: g }) => [type, titre, g.map((x) => x.nom)])).toEqual([
      ['Association', 'Associations', ['Chorale', 'Secours catholique']],
      ['Mouvement', 'Mouvements', ['Scouts']],
      ['Équipe paroissiale', 'Équipes paroissiales', ['Équipe liturgique']],
      [null, 'Autres groupes', ['Groupe sans type']],
    ]);
  });

  it('image avec texte alternatif : seule la première pièce jointe, téléchargée au build', async () => {
    const images = fauxStockageImages();
    const { groupes } = await charger(
      [
        groupe('recChorale', {
          image: [
            { id: 'attLogo', url: 'https://airtable.test/logo.PNG', filename: 'logo.PNG' },
            { id: 'attAutre', url: 'https://airtable.test/autre.png', filename: 'autre.png' },
          ],
          texteAlternatif: 'Logo de la chorale',
        }),
      ],
      images,
    );
    expect(groupes.liste[0].image).toEqual({ chemin: '/images/attLogo.png', texteAlternatif: 'Logo de la chorale' });
    expect(images.enregistrees).toEqual(['https://airtable.test/logo.PNG']);
  });

  it('image sans texte alternatif : ignorée et non téléchargée (pictogramme selon le Type)', async () => {
    const images = fauxStockageImages();
    const { groupes } = await charger(
      [
        groupe('recChorale', { image: [{ id: 'attLogo', url: 'https://airtable.test/logo.png' }] }),
        groupe('recInactif', { active: false, image: [{ id: 'attX', url: 'https://airtable.test/x.png' }], texteAlternatif: 'X' }),
      ],
      images,
    );
    expect(groupes.liste.map((g) => g.image)).toEqual([null]);
    expect(images.enregistrees).toEqual([]);
  });

  it('contact : e-mail ou site du groupe, sinon le presbytère (e-mail et téléphone)', async () => {
    const { groupes } = await charger([
      groupe('recEmail', { contact: 'chorale@example.org', ordre: 1 }),
      groupe('recSite', { contact: 'https://scouts.example.org', ordre: 2 }),
      groupe('recVide', { ordre: 3 }),
      groupe('recIllisible', { contact: 'Demander à l’accueil', ordre: 4 }),
    ]);
    expect(groupes.liste.map((g) => g.contact)).toEqual([
      { email: 'chorale@example.org', site: null, telephone: null, duPresbytere: false },
      { email: null, site: 'https://scouts.example.org', telephone: null, duPresbytere: false },
      { email: 'paroisse@example.org', site: null, telephone: '05 53 00 00 00', duPresbytere: true },
      { email: 'paroisse@example.org', site: null, telephone: '05 53 00 00 00', duPresbytere: true },
    ]);
  });

  it('Site_Web facultatif', async () => {
    const { groupes } = await charger([
      groupe('recAvec', { siteWeb: 'https://secours.example.org', ordre: 1 }),
      groupe('recSans', { ordre: 2 }),
    ]);
    expect(groupes.liste.map((g) => g.siteWeb)).toEqual(['https://secours.example.org', null]);
  });

  it('aucun Groupe actif : liste et regroupement vides', async () => {
    const { groupes } = await charger([groupe('recInactif', { active: false })]);
    expect(groupes).toEqual({ liste: [], parType: [] });
  });
});
