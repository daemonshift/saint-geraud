/**
 * Mapping Airtable centralisé : SEULE source des IDs de base, de tables et de
 * champs (voir docs/context/schema-airtable.md). Le code lit Airtable par ID de
 * champ (`returnFieldsByFieldId`) : renommer un champ dans Airtable ne casse rien.
 *
 * Chaque champ porte son type Airtable attendu : avant toute lecture, le
 * module « contenu du site » vérifie que chaque champ listé ici existe avec ce
 * type (Metadata API), sinon le build échoue en nommant le champ.
 *
 * Ajouter un champ : l'ajouter ici (ID et type relevés dans Airtable), puis le
 * lire dans le module « contenu du site » avec `valeur(enregistrement, champ)`.
 */

/** Types Airtable utilisés par la base (`type` de la Metadata API). */
export type TypeChampAirtable =
  | 'singleLineText'
  | 'multilineText'
  | 'richText'
  | 'multipleAttachments'
  | 'singleSelect'
  | 'dateTime'
  | 'date'
  | 'checkbox'
  | 'formula'
  | 'createdTime'
  | 'lastModifiedTime'
  | 'multipleRecordLinks'
  | 'number'
  | 'url'
  | 'phoneNumber';

export interface ChampAirtable {
  id: string;
  /** Nom du champ dans Airtable, repris dans les messages d'erreur. */
  nom: string;
  type: TypeChampAirtable;
}

export interface TableAirtable<C extends Record<string, ChampAirtable> = Record<string, ChampAirtable>> {
  id: string;
  nom: string;
  champs: C;
}

const champ = (id: string, nom: string, type: TypeChampAirtable): ChampAirtable => ({ id, nom, type });

/** Base « Paroisse Saint-Géraud ». */
export const BASE_ID = 'appFZ9EorUC2DY3yh';

export const ACTUALITES = {
  id: 'tblEN5ytvb1DdYDYD',
  nom: 'Actualités',
  champs: {
    titre: champ('fldvqk4kWeJQXRvwl', 'Titre', 'singleLineText'),
    resume: champ('fldGSXGf4zCwPVEtH', 'Resume', 'multilineText'),
    texte: champ('fldZ7wo5J3vZwRyXI', 'Texte', 'richText'),
    image: champ('fldbAGeQuvLqQAuSM', 'Image', 'multipleAttachments'),
    texteAlternatifImage: champ('fldhxbS2umR1mgdDO', 'Texte_Alternatif_Image', 'singleLineText'),
    categorie: champ('fld3K6oFqrkLlcpck', 'Categorie', 'singleSelect'),
    dateEvenement: champ('fld3lRSC1ssBsCifr', 'Date_Evenement', 'dateTime'),
    datePublication: champ('fldrmVGO6C4alueOW', 'Date_Publication', 'date'),
    finAffichage: champ('fldVTPJQmkDF6fKiF', 'Fin_Affichage', 'date'),
    miseEnAvant: champ('fldPE7P6ewZ06PK3f', 'Mise_En_Avant', 'checkbox'),
    valide: champ('fldZoGBbYCxqO238c', 'Valide', 'checkbox'),
    modifieLe: champ('fldO5GntSmSW9CcUo', 'Modifie_le', 'lastModifiedTime'),
    eglises: champ('fldmyLr9uDXR9F9nG', 'Eglises', 'multipleRecordLinks'),
  },
} as const satisfies TableAirtable;

export const EGLISES = {
  id: 'tblD9OoLYwEzEHO92',
  nom: 'Eglises',
  champs: {
    nom: champ('fld5eM5Y2RSHVn4Th', 'Nom', 'singleLineText'),
    commune: champ('fldTbs8TDrRXxWEa1', 'Commune', 'singleLineText'),
    adresse: champ('fldLmWuRCpiH9QCoe', 'Adresse', 'multilineText'),
    latitude: champ('fld3pPzXELguWIYf5', 'Latitude', 'number'),
    longitude: champ('fldhmiKcb8Bn52bCQ', 'Longitude', 'number'),
    photo: champ('fldIP3sUS0Mw3Ww68', 'Photo', 'multipleAttachments'),
    texteAlternatif: champ('fldfvGnwKUWglTT1B', 'Texte_Alternatif', 'singleLineText'),
    accesPmr: champ('fldjQ9vGhr9HEdH3M', 'Acces_Pmr', 'checkbox'),
    lienMessesInfo: champ('flds5AZOuZU51KWda', 'Lien_Messes_info', 'url'),
    ordre: champ('fldDdlncJwT6jzxac', 'Ordre', 'number'),
    active: champ('fldmmMoiTcSHCdsij', 'Active', 'checkbox'),
  },
} as const satisfies TableAirtable;

export const INFOS_PRATIQUES = {
  id: 'tbld8JSkv2UAndbqH',
  nom: 'Infos_Pratiques',
  champs: {
    libelle: champ('fldCJ5Q20STin8jKp', 'Libellé', 'singleLineText'),
    valeur: champ('fldo52Uk8agy6YztC', 'Valeur', 'singleLineText'),
    telephone: champ('fldbNWc6Y988uZlW7', 'Téléphone', 'phoneNumber'),
    rubrique: champ('fldja7cGKtIAnFSPZ', 'Rubrique', 'singleSelect'),
    description: champ('fld4DdvFBwiMZN0Jd', 'Description', 'multilineText'),
    image: champ('fld8v6Wg1j8jJaZMd', 'Image', 'multipleAttachments'),
    texteAlternatif: champ('fldOnx28homFLY2FA', 'Texte_Alternatif', 'singleLineText'),
    ordre: champ('flduYWouPgXtsNdTl', 'Ordre', 'number'),
    active: champ('fldKwxQN6RyJ4E1Qc', 'Active', 'checkbox'),
  },
} as const satisfies TableAirtable;

export const GROUPES = {
  id: 'tbltTtMAX4ME7fcQ9',
  nom: 'Groupes',
  champs: {
    nom: champ('fldjHG1O5MSOuHanj', 'Nom', 'singleLineText'),
    type: champ('fld7OYZwcDmH9ZgRh', 'Type', 'singleSelect'),
    description: champ('fldgB5Rmic3ph8Dic', 'Description', 'multilineText'),
    contact: champ('fldUFwRd5ffHOLVwG', 'Contact', 'singleLineText'),
    siteWeb: champ('fldjBvI6jxQTMguWm', 'Site_Web', 'url'),
    image: champ('fld1RmSMUTjg6CuKQ', 'Image', 'multipleAttachments'),
    texteAlternatif: champ('fldpxDeIgTumM1ik3', 'Texte_Alternatif', 'singleLineText'),
    ordre: champ('flddC8HbMuZHGZWoC', 'Ordre', 'number'),
    active: champ('fldVfx3rILg4wd7Fl', 'Active', 'checkbox'),
  },
} as const satisfies TableAirtable;

/** Toutes les tables lues par le site : le contrôle du schéma les vérifie toutes. */
export const TABLES: readonly TableAirtable[] = [ACTUALITES, EGLISES, INFOS_PRATIQUES, GROUPES];
