/**
 * Choix du visiteur sur les cookies de messes.info (ADR 0004).
 *
 * Le visiteur répond une fois, dans la bannière : son choix est gardé dans le
 * stockage local du navigateur (pas de cookie du site) et vaut six mois,
 * durée recommandée par la CNIL ; la question est ensuite reposée.
 */
export type Choix = 'accepte' | 'refuse';

/** Clé du stockage local. */
export const CLE_CONSENTEMENT = 'consentement-messes-info';

/** Durée de validité d'un choix, en mois. */
export const DUREE_DU_CHOIX_EN_MOIS = 6;

/** Cookies déposés sur le site par le widget (essai réel, issue #10), effacés au retrait de l'accord. */
export const COOKIES_DE_MESSES_INFO = ['_ga', '_gid', 'didomi_token'];

/** Événement émis sur `document` quand le visiteur change son choix. */
export const EVENEMENT_CHOIX = 'consentement-messes-info';

/** Valeur à écrire dans le stockage local pour ce choix. */
export function enregistrementDuChoix(choix: Choix, maintenant: Date): string {
  return JSON.stringify({ choix, le: maintenant.toISOString() });
}

/** Choix encore valable, ou `null` s'il faut (re)poser la question. */
export function choixEnregistre(enregistrement: string | null, maintenant: Date): Choix | null {
  if (!enregistrement) return null;
  let lu: unknown;
  try {
    lu = JSON.parse(enregistrement);
  } catch {
    return null;
  }
  if (typeof lu !== 'object' || lu === null) return null;
  const { choix, le } = lu as { choix?: unknown; le?: unknown };
  if (choix !== 'accepte' && choix !== 'refuse') return null;
  const date = typeof le === 'string' ? new Date(le) : new Date(NaN);
  if (Number.isNaN(date.getTime())) return null;
  const fin = new Date(date);
  fin.setUTCMonth(fin.getUTCMonth() + DUREE_DU_CHOIX_EN_MOIS);
  return maintenant <= fin ? choix : null;
}
