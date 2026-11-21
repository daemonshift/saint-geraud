import { statSync } from 'node:fs';
import { join } from 'node:path';

const KO = 1024;
const MO = KO * KO;

/**
 * Poids lisible d'un fichier pour un libellé de lien (« Télécharger le
 * formulaire (PDF, 3 Ko) ») : Ko arrondis au supérieur, Mo à une décimale.
 */
export function formaterPoids(octets: number): string {
  if (!Number.isInteger(octets) || octets < 0) {
    throw new Error(`Le poids « ${octets} » n'est pas un nombre d'octets valide.`);
  }
  if (octets < MO) return `${Math.max(1, Math.ceil(octets / KO))} Ko`;
  return `${(octets / MO).toFixed(1).replace('.', ',')} Mo`;
}

/**
 * Poids réel d'un fichier de `public/`, lu au build. `chemin` est l'adresse
 * publique du fichier (« /formulaire.pdf »). Échoue si le fichier manque.
 */
export function poidsFichierPublic(chemin: string): string {
  return formaterPoids(statSync(join(process.cwd(), 'public', chemin)).size);
}
