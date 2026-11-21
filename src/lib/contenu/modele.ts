/**
 * Modèle du site : ce que rend le module « contenu du site » et ce que lisent
 * les pages. Rien ici ne dépend d'Airtable.
 */

export type Categorie = 'Annonce' | 'Événement' | 'Sacrements' | 'Vie paroissiale';

/** Église liée à une Actualité (lieu affiché sur la carte et le détail). */
export interface EgliseLiee {
  id: string;
  nom: string;
  commune: string;
}

export interface Actualite {
  /** Identifiant de l'enregistrement Airtable : fonde l'URL `/actualites/{id}`. */
  id: string;
  titre: string;
  resume: string;
  /** Texte en Markdown (champ texte enrichi d'Airtable) ; vide si absent. */
  texte: string;
  categorie: Categorie | null;
  /** Date de publication, jour calendaire `AAAA-MM-JJ`. */
  datePublication: string;
  /** Fin d'affichage, `AAAA-MM-JJ`, ou null (affichage sans limite). */
  finAffichage: string | null;
  miseEnAvant: boolean;
  /** Date de l'événement, en heure de Paris, ou null. */
  evenement: { debut: Date; enLettres: string } | null;
  /** « jeudi 25 décembre 2026 » */
  datePublicationEnLettres: string;
  /** Instant de dernière modification (plan du site). */
  modifieLe: Date | null;
  eglises: EgliseLiee[];
  /** Lieu affiché : « Église Saint-Antoine, Fumel » (plusieurs Églises séparées par « · »), ou null. */
  lieu: string | null;
}

export interface ContenuDuSite {
  /** Actualités En ligne : Mises en avant d'abord, puis Date de publication décroissante. */
  actualites: Actualite[];
}
