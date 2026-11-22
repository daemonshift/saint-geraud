/**
 * Entrées du menu principal et adresses des pages : source unique, reprise
 * par l'en-tête, le pied de page et les tests. Un ticket qui crée une page
 * reprend l'adresse indiquée ici.
 */
import { PAROISSE_SUR_MESSES_INFO } from './messes-info';

/** Lien du site : libellé affiché et adresse. */
export interface EntreeDeMenu {
  libelle: string;
  href: string;
}

export const NOS_EGLISES: EntreeDeMenu = { libelle: 'Nos églises', href: '/nos-eglises' };

export const ACTUALITES: EntreeDeMenu = { libelle: 'Actualités', href: '/actualites' };

export const ENTREES_DU_MENU: EntreeDeMenu[] = [
  { libelle: 'Accueil', href: '/' },
  { libelle: 'La paroisse', href: '/la-paroisse' },
  { libelle: 'Prier et célébrer', href: '/prier-et-celebrer' },
  ACTUALITES,
  NOS_EGLISES,
];

/** Mise en avant à part (bouton) : toujours visible, y compris en mobile sans ouvrir le menu. */
export const HORAIRES_DES_MESSES: EntreeDeMenu = { libelle: 'Horaires des messes', href: '/horaires-des-messes' };

/** Ancre du bloc « Nous contacter » du pied de page, présent sur toutes les pages. */
export const NOUS_CONTACTER: EntreeDeMenu = { libelle: 'Nous contacter', href: '#nous-contacter' };

/** Ancre de l'encart « Recevoir la Lettre d'information » de l'Accueil, joignable depuis toute page. */
export const LETTRE_D_INFORMATION: EntreeDeMenu = { libelle: 'Lettre d’information', href: '/#lettre-d-information' };

/** Formulaire papier d'Inscription à la Lettre d'information, servi depuis `public/`. */
export const FORMULAIRE_LETTRE_D_INFORMATION = '/formulaire-lettre-d-information.pdf';

/** Liens externes (en-tête, pied de page, La paroisse). URL du diocèse à confirmer (en attente diocèse). */
export const LIENS_EXTERNES = {
  diocese: 'https://agen.catholique.fr/',
  /** Page de la paroisse sur messes.info (identifiant relevé à l'essai du widget, #10). */
  messesInfo: PAROISSE_SUR_MESSES_INFO,
};

export const PAGES_LEGALES: EntreeDeMenu[] = [
  { libelle: 'Mentions légales', href: '/mentions-legales' },
  { libelle: 'Confidentialité', href: '/confidentialite' },
  { libelle: 'Accessibilité', href: '/accessibilite' },
];

/** Vrai si `href` désigne la page courante (pour `aria-current="page"`). */
export function estPageCourante(href: string, cheminCourant: string): boolean {
  const normaliser = (c: string) => (c.length > 1 ? c.replace(/\/$/, '') : c);
  return normaliser(href) === normaliser(cheminCourant);
}

/** Adresse du détail d'une Actualité : fondée sur l'identifiant de l'enregistrement Airtable, stable même si le titre change. */
export function lienActualite(id: string): string {
  return `/actualites/${id}`;
}

/** Fichier d'agenda (`.ics`) d'une Actualité qui annonce un événement, généré au build. */
export function lienAgenda(id: string): string {
  return `${lienActualite(id)}.ics`;
}

/** Page vers laquelle redirige (302) l'adresse d'une Actualité Archivée. Route statique : prioritaire sur `/actualites/[id]`. */
export const ACTUALITE_TERMINEE = '/actualites/terminee';

/** Ancre d'une Église sur Nos églises (attribut `id`), fondée sur l'identifiant de l'enregistrement Airtable. */
export function ancreEglise(id: string): string {
  return `eglise-${id}`;
}

/** Position d'une Église sur Nos églises : depuis le détail d'une Actualité (#9), l'Accueil… */
export function lienEglise(id: string): string {
  return `${NOS_EGLISES.href}#${ancreEglise(id)}`;
}

/** Itinéraire Google Maps vers une Église ; libellé attendu : « Itinéraire (Google Maps) ». */
export function lienItineraire({ latitude, longitude }: { latitude: number; longitude: number }): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latitude},${longitude}`)}`;
}
