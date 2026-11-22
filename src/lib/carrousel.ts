/**
 * Logique du carrousel des Actualités de l'Accueil, indépendante du DOM :
 * texte annoncé (`aria-live`) et état des flèches.
 */

/** Nombre maximal d'Actualités dans le carrousel ; les autres sont sur la liste. */
export const ACTUALITES_DANS_LE_CARROUSEL = 6;

export interface MesureDuCarrousel {
  /** Index (à partir de 0) de la première carte visible. */
  premiere: number;
  /** Nombre de cartes entièrement visibles (1 en mobile, 3 en ordinateur). */
  visibles: number;
  total: number;
}

export interface PositionDuCarrousel {
  /** « 2 sur 5 », ou « 1 à 3 sur 5 » quand plusieurs cartes sont visibles. */
  texte: string;
  auDebut: boolean;
  aLaFin: boolean;
}

export function positionDuCarrousel({ premiere, visibles, total }: MesureDuCarrousel): PositionDuCarrousel {
  const nombreVisibles = Math.min(Math.max(visibles, 1), total);
  const debut = Math.min(Math.max(premiere, 0), total - nombreVisibles);
  const fin = debut + nombreVisibles;
  return {
    texte: nombreVisibles === 1 ? `${debut + 1} sur ${total}` : `${debut + 1} à ${fin} sur ${total}`,
    auDebut: debut === 0,
    aLaFin: fin >= total,
  };
}
