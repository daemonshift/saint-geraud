/**
 * Pictogrammes des médaillons des sous-pages (maquette « Prier et célébrer ») :
 * tracés SVG 24 × 24, en trait. Aucune photo de personne, sauf le Curé.
 */
import { normaliser } from './contenu/infos-pratiques';

export const PICTOGRAMMES = {
  horloge: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  croix: 'M12 3v18M7 8h10',
  goutte: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  alliances: 'M9 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM15 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
  bougie: 'M10 10h4v11h-4zM12 3c1.2 1.6 1.2 3.4 0 5-1.2-1.6-1.2-3.4 0-5z',
  main: 'M8 13V6a1.5 1.5 0 0 1 3 0v6M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7 6 6 0 0 1-5-3l-2-4a1.5 1.5 0 0 1 2.6-1.5L8 15',
  livre: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7',
  maison: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
  personne: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21a8 8 0 0 1 16 0',
  enveloppe: 'M3 6h18v12H3zM3 6l9 7 9-7',
} as const;

export type NomPictogramme = keyof typeof PICTOGRAMMES;

/** Pictogramme d'un contact selon sa démarche (« Baptême » → goutte) ; enveloppe à défaut. */
export function pictogrammeDeDemarche(role: string): NomPictogramme {
  const r = normaliser(role);
  if (r.includes('bapt')) return 'goutte';
  if (r.includes('mariage')) return 'alliances';
  if (r.includes('obseques') || r.includes('deuil') || r.includes('funera')) return 'horloge';
  if (r.includes('confession') || r.includes('reconciliation')) return 'main';
  if (r.includes('malade') || r.includes('onction')) return 'bougie';
  if (r.includes('catechis') || r.includes('catechumen') || r.includes('aumonerie')) return 'livre';
  if (r.includes('communion') || r.includes('confirmation') || r.includes('eucharist')) return 'croix';
  return 'enveloppe';
}
