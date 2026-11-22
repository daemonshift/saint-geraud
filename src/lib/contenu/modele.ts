/**
 * Modèle du site : ce que rend le module « contenu du site » et ce que lisent
 * les pages. Rien ici ne dépend d'Airtable.
 */

export type Categorie = 'Annonce' | 'Événement' | 'Sacrements' | 'Vie paroissiale';

/** Église liée à une Actualité (lieu affiché sur la carte et le bloc « En pratique » du détail). */
export interface EgliseLiee {
  id: string;
  nom: string;
  commune: string;
  /** Lignes de l'adresse postale ; vide si absente. */
  adresse: string[];
  accesPmr: boolean;
  /** Coordonnées (itinéraire), ou null si non renseignées. */
  position: { latitude: number; longitude: number } | null;
  /** Vrai si l'Église est affichée sur Nos églises (Active, avec coordonnées) : son ancre existe. */
  surNosEglises: boolean;
}

/** Données d'agenda d'une Actualité dont la Date de l'événement est remplie (fichier `.ics` généré au build). */
export interface EvenementAgenda {
  /** Identifiant stable de l'événement (UID iCalendar), fondé sur l'identifiant de l'Actualité. */
  uid: string;
  debut: Date;
  /** Airtable n'a pas de fin d'événement : une heure après le début. */
  fin: Date;
  /** Dernière modification de l'Actualité (instant du build à défaut). */
  horodatage: Date;
  titre: string;
  description: string;
  /** « Église Saint-Antoine, Place de l'Église, 47500 Fumel » (plusieurs Églises séparées par « ; »), ou null. */
  lieu: string | null;
  /** Adresse du fichier `.ics` sur le site. */
  fichier: string;
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
  /** Données d'agenda, seulement si la Date de l'événement est remplie. */
  agenda: EvenementAgenda | null;
}

/** Actualité Archivée : seul son identifiant sert, pour rediriger son ancienne adresse ; son titre n'est jamais repris. */
export interface ActualiteArchivee {
  id: string;
}

/** Image retenue (première pièce jointe, avec texte alternatif), téléchargée au build. */
export interface ImageDuSite {
  /** Chemin public de l'image servie par le site. */
  chemin: string;
  texteAlternatif: string;
}

/** Église affichée sur Nos églises : Active et placée sur la carte. */
export interface Eglise {
  /** Identifiant de l'enregistrement Airtable : fonde l'ancre de l'Église sur Nos églises. */
  id: string;
  nom: string;
  commune: string;
  /** Lignes de l'adresse postale ; vide si absente. */
  adresse: string[];
  latitude: number;
  longitude: number;
  accesPmr: boolean;
  /** Horaires de l'Église sur messes.info, ou null. */
  lienMessesInfo: string | null;
  /** Photo de l'Église, ou null. Pas encore affichée : le ticket #5 branche le stockage des images. */
  photo: ImageDuSite | null;
}

/** Rubriques des Infos pratiques (choix du champ `Rubrique`). */
export type RubriqueInfoPratique = 'Curé' | 'Presbytère' | 'Contacts';

/** Une Info pratique active, telle que saisie dans Airtable. */
export interface InfoPratique {
  id: string;
  libelle: string;
  valeur: string;
  /** Numéro affiché (« 05 53 00 00 00 »), ou null. */
  telephone: string | null;
  /** Texte long ; pour le Curé, ses fonctions (une par ligne). */
  description: string;
  /** Retenue uniquement pour la Rubrique « Curé », avec un texte alternatif. */
  image: ImageDuSite | null;
}

/** Le Curé : seule personne nommée et, avec son accord écrit, photographiée. */
export interface Cure {
  /** Libellé de la ligne (« Curé »). */
  titre: string;
  /** Nom (« Père … »). */
  nom: string;
  fonctions: string[];
  photo: ImageDuSite | null;
}

/** Une permanence d'accueil du presbytère : un jour et ses horaires. */
export interface Permanence {
  jour: string;
  horaires: string;
}

/** Le presbytère : coordonnées de la paroisse et permanences d'accueil (« Accueil »). */
export interface Presbytere {
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  /** Lignes « Permanence d'accueil », une par jour, dans l'ordre. */
  accueil: Permanence[];
  /** Autres lignes de la Rubrique (ni coordonnée, ni permanence), dans l'ordre. */
  autres: { libelle: string; valeur: string }[];
}

/**
 * Contact d'un sacrement ou d'une démarche : un rôle (jamais un nom de
 * bénévole) et ses deux moyens de contact. Source unique, reprise par
 * La paroisse (`#contacts`) et Prier et célébrer.
 */
export interface ContactDemarche {
  id: string;
  /** Rôle ou démarche (« Baptême », « Préparation au mariage »). */
  role: string;
  /** Ancre stable tirée du rôle (« bapteme ») : retrouver un contact depuis une page. */
  cle: string;
  /** E-mail (Valeur), à défaut celui du presbytère. */
  email: string | null;
  /** Téléphone propre, à défaut celui du presbytère. */
  telephone: string | null;
  /** Précision facultative (Description). */
  precision: string;
}

/** Infos pratiques actives, triées par Ordre et regroupées par Rubrique. */
export interface InfosPratiques {
  parRubrique: Record<RubriqueInfoPratique, InfoPratique[]>;
  /** Première ligne active de la Rubrique « Curé », ou null. */
  cure: Cure | null;
  presbytere: Presbytere;
  contacts: ContactDemarche[];
}

export interface ContenuDuSite {
  /** Actualités En ligne : Mises en avant d'abord, puis Date de publication décroissante. */
  actualites: Actualite[];
  /** Actualités Archivées : leur adresse redirige (302) vers `/actualites/terminee`. */
  actualitesArchivees: ActualiteArchivee[];
  /** Églises affichées (Active, coordonnées renseignées), triées par Ordre. */
  eglises: Eglise[];
  /** Infos pratiques actives (Curé, Presbytère, Contacts). */
  infosPratiques: InfosPratiques;
}
