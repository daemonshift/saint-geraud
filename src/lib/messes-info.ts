/**
 * Widget messes.info (ticket #10). Méthode d'intégration officielle : un
 * conteneur `<div data-egliseinfo="horaires" data-search="…">` puis le script
 * `Widget.nocache.js` (pas d'iframe). Essai réel (novembre 2026, consigné dans
 * l'issue #10) : le script charge Google Tag Manager, Google Analytics et
 * Didomi, qui déposent des cookies (`_ga`, `_gid`, `didomi_token`) sur le
 * domaine du site. D'où le chargement au clic seulement (ADR 0003).
 */

/** Identifiant messes.info de la communauté (la paroisse). */
export const COMMUNAUTE_MESSES_INFO = 'ag/47/saint-geraud-des-vallees-en-fumelois';

/** Page de la paroisse sur messes.info : cible du bouton « Voir plus de messes ». */
export const PAROISSE_SUR_MESSES_INFO = `https://messes.info/communaute:${COMMUNAUTE_MESSES_INFO}`;

/** Script officiel du widget. */
export const SCRIPT_WIDGET_MESSES_INFO = 'https://messes.info/Widget/Widget.nocache.js';

/** Recherche passée au widget : les seuls horaires de la paroisse. */
export const RECHERCHE_WIDGET_MESSES_INFO = `community:${COMMUNAUTE_MESSES_INFO}`;

/** Libellé du lien vers les horaires d'une Église sur messes.info (Nos églises, sa carte, Horaires des messes). */
export const LIBELLE_HORAIRES_MESSES_INFO = 'Horaires des messes (site messes.info)';

/** Phrase qui présente la source des horaires (Accueil, Horaires des messes). */
export const PROVENANCE_DES_HORAIRES = 'Les horaires sont publiés par le diocèse d’Agen sur messes.info et se mettent à jour automatiquement.';
