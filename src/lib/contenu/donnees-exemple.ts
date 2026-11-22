/**
 * Données d'exemple (fixtures), au format de l'API Airtable.
 *
 * - Les constructeurs (`actualite`, `eglise`…) prennent des noms de code
 *   (`titre`, `valide`…) et produisent un enregistrement indexé par ID de
 *   champ, comme l'API. Ils servent aux tests et à `DONNEES_EXEMPLE`.
 * - `DONNEES_EXEMPLE` alimente les builds sans token hors production (CI,
 *   développement) et donc les tests Playwright. Dates fixes et lointaines :
 *   le résultat ne dépend pas du jour du build.
 *
 * Ajouter une table : un constructeur ici (`enregistrement(TABLE, …)`), et
 * ses enregistrements dans `DONNEES_EXEMPLE`.
 */
import type { EnregistrementAirtable } from '../airtable/client';
import type { DonneesAirtable } from '../airtable/client-en-memoire';
import { ACTUALITES, EGLISES, GROUPES, INFOS_PRATIQUES, type TableAirtable } from '../airtable/schema';
import { PREFIXE_IMAGE_EXEMPLE } from './images';

type Valeurs<T extends TableAirtable> = { [K in keyof T['champs']]?: unknown };

/** Construit un enregistrement : chaque nom de code devient l'ID de son champ. Comme l'API, un champ vide ou faux est omis. */
export function enregistrement<T extends TableAirtable>(table: T, id: string, valeurs: Valeurs<T>): EnregistrementAirtable {
  const fields: Record<string, unknown> = {};
  for (const [code, valeur] of Object.entries(valeurs)) {
    const champ = table.champs[code];
    if (!champ) throw new Error(`Champ inconnu dans la table ${table.nom} : ${code}`);
    if (valeur === undefined || valeur === null || valeur === false || valeur === '') continue;
    if (Array.isArray(valeur) && valeur.length === 0) continue;
    fields[champ.id] = valeur;
  }
  return { id, fields };
}

/**
 * Actualité Validée, En ligne depuis le 1er janvier 2026, sans Fin d'affichage.
 * Les valeurs passées remplacent ces valeurs par défaut (`undefined` vide un champ).
 */
export function actualite(id: string, valeurs: Valeurs<typeof ACTUALITES> = {}): EnregistrementAirtable {
  return enregistrement(ACTUALITES, id, {
    titre: `Actualité ${id}`,
    resume: `Résumé de l'actualité ${id}.`,
    categorie: 'Annonce',
    datePublication: '2026-01-01',
    valide: true,
    modifieLe: '2026-01-01T08:00:00.000Z',
    ...valeurs,
  });
}

/**
 * Pièce jointe au format de l'API (champ `multipleAttachments`). Pour les
 * données d'exemple, l'URL désigne une image locale : `exemple:<fichier>`
 * (fichier de `src/assets/exemple/`), voir `creerStockageImagesSurDisque` (stockage-images.ts).
 */
export function pieceJointe(
  id: string,
  { url = `https://v5.airtableusercontent.com/v3/u/0/0/${id}`, filename = `${id}.jpg`, type = 'image/jpeg' } = {},
) {
  return { id, url, filename, type, size: 1000 };
}

/** URL d'une image d'exemple locale (`src/assets/exemple/<fichier>`). */
export const imageExemple = (fichier: string) => `${PREFIXE_IMAGE_EXEMPLE}${fichier}`;

export function eglise(id: string, valeurs: Valeurs<typeof EGLISES> = {}): EnregistrementAirtable {
  return enregistrement(EGLISES, id, {
    nom: `Église ${id}`,
    commune: 'Fumel',
    active: true,
    ...valeurs,
  });
}

/** Info pratique Active ; les valeurs passées remplacent ces valeurs par défaut. */
export function infoPratique(id: string, valeurs: Valeurs<typeof INFOS_PRATIQUES> = {}): EnregistrementAirtable {
  return enregistrement(INFOS_PRATIQUES, id, {
    libelle: `Info pratique ${id}`,
    rubrique: 'Contacts',
    active: true,
    ...valeurs,
  });
}

/** Groupe Actif, de Type Association ; les valeurs passées remplacent ces valeurs par défaut. */
export function groupe(id: string, valeurs: Valeurs<typeof GROUPES> = {}): EnregistrementAirtable {
  return enregistrement(GROUPES, id, {
    nom: `Groupe ${id}`,
    type: 'Association',
    active: true,
    ...valeurs,
  });
}

export const DONNEES_EXEMPLE: DonneesAirtable = {
  // Valeurs d'exemple, pas les vraies coordonnées. Pas de photo du Curé : on
  // n'invente pas le portrait d'une personne (la photo d'Église couvre le
  // chemin des images).
  infosPratiques: [
    infoPratique('recExempleCure', {
      rubrique: 'Curé',
      libelle: 'Curé',
      valeur: 'Père [Nom du Curé]',
      description: 'Curé de la paroisse Saint-Géraud des Vallées en Fumélois\n[Autres fonctions à confirmer]',
      ordre: 1,
    }),
    infoPratique('recExempleAdresse', { rubrique: 'Presbytère', libelle: 'Adresse', valeur: '[Adresse à confirmer], 47500 Fumel', ordre: 1 }),
    infoPratique('recExempleTelephone', { rubrique: 'Presbytère', libelle: 'Téléphone', telephone: '05 53 00 00 00', ordre: 2 }),
    infoPratique('recExempleEmail', { rubrique: 'Presbytère', libelle: 'E-mail', valeur: 'paroisse@example.org', ordre: 3 }),
    infoPratique('recExempleLundi', { rubrique: 'Presbytère', libelle: 'Lundi', valeur: '9 h 30 – 12 h', description: 'Permanence d’accueil', ordre: 4 }),
    infoPratique('recExempleMercredi', { rubrique: 'Presbytère', libelle: 'Mercredi', valeur: '14 h – 17 h', description: 'Permanence d’accueil', ordre: 5 }),
    infoPratique('recExempleSamedi', { rubrique: 'Presbytère', libelle: 'Samedi', valeur: '10 h – 12 h', description: 'Permanence d’accueil', ordre: 6 }),
    infoPratique('recExempleBapteme', { rubrique: 'Contacts', libelle: 'Baptême', valeur: 'bapteme@example.org', ordre: 1 }),
    infoPratique('recExempleMariage', { rubrique: 'Contacts', libelle: 'Mariage', valeur: 'mariage@example.org', ordre: 2 }),
    infoPratique('recExempleObseques', {
      rubrique: 'Contacts',
      libelle: 'Obsèques',
      valeur: 'obseques@example.org',
      telephone: '05 53 00 00 01',
      description: 'Les familles peuvent appeler à toute heure.',
      ordre: 3,
    }),
    infoPratique('recExempleCatechisme', { rubrique: 'Contacts', libelle: 'Catéchisme', valeur: 'catechisme@example.org', ordre: 4 }),
    // Jamais affichée : inactive.
    infoPratique('recExempleInactive', { rubrique: 'Contacts', libelle: 'Contact masqué', valeur: 'masque@example.org', active: false }),
  ],
  // Groupes d'exemple ; la Chorale a une image (lieu de répétition) qui passe par le stockage des images.
  groupes: [
    groupe('recExempleChorale', {
      nom: 'Chorale paroissiale',
      type: 'Association',
      description: 'Elle anime les messes du dimanche et les grandes fêtes.\nRépétition le jeudi soir.',
      contact: 'chorale@example.org',
      image: [pieceJointe('attExempleChorale', { url: imageExemple('eglise-saint-antoine.jpg'), filename: 'eglise-saint-antoine.jpg' })],
      texteAlternatif: 'Nef de l’église Saint-Antoine, où répète la chorale',
      ordre: 1,
    }),
    groupe('recExempleSecours', {
      nom: 'Secours catholique',
      type: 'Association',
      description: 'Accueil et entraide pour les personnes en difficulté.',
      siteWeb: 'https://secours.example.org/',
      ordre: 2,
    }),
    groupe('recExempleScouts', {
      nom: 'Scouts et guides',
      type: 'Mouvement',
      description: 'Pour les jeunes de 8 à 17 ans.',
      contact: 'https://scouts.example.org/',
      ordre: 3,
    }),
    groupe('recExempleLiturgie', {
      nom: 'Équipe liturgique',
      type: 'Équipe paroissiale',
      description: 'Elle prépare les célébrations avec le Curé.',
      ordre: 4,
    }),
    // Jamais affiché : inactif.
    groupe('recExempleGroupeInactif', { nom: 'Groupe masqué', active: false, ordre: 0 }),
  ],
  eglises: [
    eglise('recEgliseSaintAntoine', {
      nom: 'Église Saint-Antoine',
      commune: 'Fumel',
      adresse: 'Place de l’Église\n47500 Fumel',
      latitude: 44.4986,
      longitude: 0.9653,
      accesPmr: true,
      lienMessesInfo: 'https://messes.info/lieu/47/fumel/eglise-saint-antoine',
      ordre: 1,
      photo: [pieceJointe('attExempleEglise', { url: imageExemple('eglise-saint-antoine.jpg'), filename: 'eglise-saint-antoine.jpg' })],
      texteAlternatif: 'Façade de l’église Saint-Antoine et son clocher',
    }),
    eglise('recEgliseSaintGeraud', {
      nom: 'Église Saint-Géraud',
      commune: 'Monsempron-Libos',
      adresse: 'Le Bourg\n47500 Monsempron-Libos',
      latitude: 44.4889,
      longitude: 0.9411,
      ordre: 2,
    }),
    eglise('recEgliseSaintMartin', {
      nom: 'Église Saint-Martin',
      commune: 'Cuzorn',
      adresse: 'Le Bourg\n47500 Cuzorn',
      latitude: 44.5317,
      longitude: 0.9381,
      lienMessesInfo: 'https://messes.info/lieu/47/cuzorn/eglise-saint-martin',
      ordre: 3,
    }),
    // Ces deux Églises ne doivent jamais apparaître sur Nos églises.
    eglise('recEgliseInactive', { nom: 'Église masquée', latitude: 44.5, longitude: 0.95, active: false, ordre: 4 }),
    eglise('recEgliseSansCoordonnees', { nom: 'Église sans coordonnées', ordre: 5 }),
  ],
  actualites: [
    actualite('recExempleMesseDeNoel', {
      titre: 'Messe de la nuit de Noël',
      resume: 'La messe de la nuit de Noël sera célébrée à l’église Saint-Antoine de Fumel.',
      texte:
        'Toute la paroisse est invitée à la **messe de la nuit de Noël**.\n\n' +
        'Pour préparer la célébration :\n\n' +
        '- répétition des chants le samedi précédent ;\n' +
        '- confessions à l’église le matin même.\n\n' +
        'Renseignements auprès du presbytère.',
      categorie: 'Événement',
      datePublication: '2026-01-05',
      dateEvenement: '2099-12-24T22:30:00.000Z',
      miseEnAvant: true,
      eglises: ['recEgliseSaintAntoine'],
      image: [pieceJointe('attExempleBougies', { url: imageExemple('bougies-de-noel.jpg'), filename: 'bougies-de-noel.jpg' })],
      texteAlternatifImage: 'Trois cierges allumés dans la pénombre',
    }),
    actualite('recExempleCatechisme', {
      titre: 'Inscriptions au catéchisme',
      resume: 'Les inscriptions au catéchisme sont ouvertes pour les enfants de 7 à 11 ans.',
      texte: 'Les familles peuvent inscrire leurs enfants au presbytère, aux heures de permanence.',
      categorie: 'Sacrements',
      datePublication: '2026-01-04',
      // Image sans texte alternatif : ignorée, l'Actualité s'affiche sans image.
      image: [pieceJointe('attExempleSansAlt', { url: imageExemple('fanions-de-kermesse.jpg'), filename: 'fanions.jpg' })],
    }),
    actualite('recExempleKermesse', {
      titre: 'Kermesse paroissiale',
      resume: 'Jeux, repas partagé et tombola au profit de la paroisse.',
      texte: 'Venez nombreux : toutes les générations sont les bienvenues.',
      categorie: 'Vie paroissiale',
      datePublication: '2026-01-03',
      eglises: ['recEgliseSaintGeraud'],
      image: [pieceJointe('attExempleFanions', { url: imageExemple('fanions-de-kermesse.jpg'), filename: 'fanions-de-kermesse.jpg' })],
      texteAlternatifImage: 'Guirlande de fanions au-dessus des stands de la kermesse',
    }),
    // Deux Actualités sans image ni Église : assez d'Actualités pour que les
    // flèches du carrousel servent aussi en ordinateur (trois cartes visibles).
    actualite('recExempleConcert', {
      titre: 'Concert de la chorale',
      resume: 'La chorale paroissiale donne son concert de printemps.',
      texte: 'Entrée libre, participation aux frais au profit de la chorale.',
      categorie: 'Vie paroissiale',
      datePublication: '2026-01-02',
    }),
    actualite('recExemplePelerinage', {
      titre: 'Pèlerinage diocésain à Lourdes',
      resume: 'Les inscriptions au pèlerinage diocésain sont ouvertes au presbytère.',
      texte: 'Le programme et le bulletin d’inscription sont disponibles aux heures de permanence.',
      datePublication: '2026-01-01',
    }),
    // Ces trois Actualités ne doivent jamais apparaître sur le site d'exemple.
    actualite('recExempleBrouillon', { titre: 'Brouillon jamais affiché', valide: false }),
    actualite('recExempleProgrammee', { titre: 'Actualité programmée', datePublication: '2099-01-01' }),
    actualite('recExempleArchivee', { titre: 'Actualité archivée', finAffichage: '2026-01-02' }),
  ],
};
