/**
 * Rubriques du menu principal et adresses des pages : source unique, reprise
 * par l'en-tête, le pied de page et les tests. Un ticket qui crée une page
 * reprend l'adresse indiquée ici.
 */
export interface Rubrique {
  libelle: string;
  href: string;
}

export const NOS_EGLISES: Rubrique = { libelle: 'Nos églises', href: '/nos-eglises' };

export const RUBRIQUES: Rubrique[] = [
  { libelle: 'Accueil', href: '/' },
  { libelle: 'La paroisse', href: '/la-paroisse' },
  { libelle: 'Prier et célébrer', href: '/prier-et-celebrer' },
  { libelle: 'Actualités', href: '/actualites' },
  NOS_EGLISES,
];

/** Mise en avant à part (bouton) : toujours visible, y compris en mobile sans ouvrir le menu. */
export const HORAIRES_DES_MESSES: Rubrique = { libelle: 'Horaires des messes', href: '/horaires-des-messes' };

/** Ancre du bloc « Nous contacter » du pied de page, présent sur toutes les pages. */
export const NOUS_CONTACTER: Rubrique = { libelle: 'Nous contacter', href: '#nous-contacter' };

/** Ancre de l'encart « Recevoir la Lettre d'information » de l'Accueil, joignable depuis toute page. */
export const LETTRE_D_INFORMATION: Rubrique = { libelle: 'Lettre d’information', href: '/#lettre-d-information' };

/** Formulaire papier d'Inscription à la Lettre d'information, servi depuis `public/`. */
export const FORMULAIRE_LETTRE_D_INFORMATION = '/formulaire-lettre-d-information.pdf';

export const PAGES_LEGALES: Rubrique[] = [
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
