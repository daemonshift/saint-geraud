/**
 * Contrôle CI : aucune couleur hexadécimale hors du fichier de tokens de la charte.
 *
 * Toute couleur du site passe par un token (charte v2 : 6 couleurs principales,
 * 7 secondaires). Ce contrôle échoue dès qu'une valeur hexadécimale apparaît
 * ailleurs dans le code source.
 *
 * Usage : node scripts/controles/couleurs.ts
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export const FICHIER_TOKENS = 'src/styles/tokens.css';

/** Dossiers et extensions contrôlés : tout ce qui finit dans le site. */
const DOSSIERS = ['src', 'public'];
const EXTENSIONS = ['.astro', '.css', '.ts', '.js', '.mjs', '.tsx', '.jsx', '.svg', '.html', '.md', '.mdx', '.json'];

export interface Fichier {
  chemin: string;
  contenu: string;
}

export interface CouleurHorsToken {
  chemin: string;
  ligne: number;
  valeur: string;
}

// Une couleur hexadécimale (3, 4, 6 ou 8 chiffres), sauf une ancre de lien
// (`href="#cafe"`) ou une entité HTML (`&#8599;`).
const COULEUR = /(?<!href=["']|&)#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![0-9a-z_-])/gi;

export function couleursHorsTokens(fichiers: Fichier[], fichierTokens = FICHIER_TOKENS): CouleurHorsToken[] {
  const resultat: CouleurHorsToken[] = [];
  for (const { chemin, contenu } of fichiers) {
    if (chemin === fichierTokens) continue;
    contenu.split('\n').forEach((texte, index) => {
      for (const m of texte.matchAll(COULEUR)) {
        resultat.push({ chemin, ligne: index + 1, valeur: m[0] });
      }
    });
  }
  return resultat;
}

function lister(dossier: string): string[] {
  let entrees: string[];
  try {
    entrees = readdirSync(dossier);
  } catch {
    return [];
  }
  return entrees.flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return lister(chemin);
    return EXTENSIONS.some((ext) => nom.endsWith(ext)) ? [chemin] : [];
  });
}

function principal() {
  const racine = process.cwd();
  const fichiers = DOSSIERS.flatMap((d) => lister(join(racine, d))).map((absolu) => ({
    chemin: relative(racine, absolu).split(sep).join('/'),
    contenu: readFileSync(absolu, 'utf-8'),
  }));
  const fautes = couleursHorsTokens(fichiers);
  if (fautes.length > 0) {
    console.error(`Couleurs hors tokens de la charte (à remplacer par un token de ${FICHIER_TOKENS}) :`);
    for (const f of fautes) console.error(`  ${f.chemin}:${f.ligne}  ${f.valeur}`);
    process.exit(1);
  }
  console.log(`Couleurs : ${fichiers.length} fichiers contrôlés, aucune valeur hors tokens.`);
}

if (import.meta.url === `file://${process.argv[1]}`) principal();
