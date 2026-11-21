import type { StockageImages } from '../../../src/lib/contenu';

/** Faux stockage d'images : ne télécharge rien, rend un chemin public prévisible. */
export function fauxStockageImages(): StockageImages & { enregistrees: string[] } {
  const enregistrees: string[] = [];
  return {
    enregistrees,
    async enregistrer(image) {
      enregistrees.push(image.url);
      return `/images/${image.nom}`;
    },
  };
}
