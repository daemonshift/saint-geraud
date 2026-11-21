/**
 * PROVISOIRE (ticket #2, socle) — à remplacer par le module « contenu du site » (#4).
 *
 * Coordonnées du presbytère affichées dans le pied de page « Nous contacter ».
 * Elles viendront des Infos pratiques, Rubrique Presbytère (Adresse,
 * Téléphone, E-mail ; voir docs/context/schema-airtable.md). Les valeurs
 * ci-dessous sont des exemples, pas les vraies coordonnées.
 */
export interface CoordonneesPresbytere {
  /** Lignes de l'adresse postale, dans l'ordre d'affichage. */
  adresse: string[];
  /** Numéro tel qu'affiché (« 05 53 00 00 00 »). */
  telephone: string;
  email: string;
}

export const PRESBYTERE_PROVISOIRE: CoordonneesPresbytere = {
  adresse: ['Presbytère', '[Adresse à confirmer]', '47500 Fumel'],
  telephone: '05 53 00 00 00',
  email: 'paroisse@example.org',
};

/** Liens externes du pied de page. URL du diocèse à confirmer (en attente diocèse). */
export const LIENS_EXTERNES = {
  diocese: 'https://agen.catholique.fr/',
  messesInfo: 'https://messes.info/',
};
