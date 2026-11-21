/**
 * Contrôle CI sur le site construit : liste blanche des domaines tiers chargés.
 *
 * Protège l'ADR 0003 (pas de traceur, pas de bannière). Seuls messes.info, les
 * tuiles OpenStreetMap et le script Vercel Web Analytics peuvent être chargés
 * depuis un autre domaine ; tout autre domaine, dont Google, fait échouer.
 *
 * Ce contrôle lit le HTML et le CSS de `dist/`. Les requêtes faites par le
 * JavaScript (tuiles de carte, widget) sont vérifiées en plus par le test
 * Playwright `tests/e2e/domaines.spec.ts`, qui observe le réseau du navigateur.
 *
 * Usage (après `npm run build`) : node scripts/controles/domaines.ts [dossier]
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** Domaines tiers autorisés, sous-domaines compris. */
export const DOMAINES_AUTORISES = ['messes.info', 'tile.openstreetmap.org', 'va.vercel-scripts.com'];

export function domaineAutorise(domaine: string): boolean {
  const d = domaine.toLowerCase();
  return DOMAINES_AUTORISES.some((autorise) => d === autorise || d.endsWith(`.${autorise}`));
}

export interface Fichier {
  chemin: string;
  contenu: string;
}

export interface RessourceInterdite {
  chemin: string;
  url: string;
}

const ABSOLUE = /^(?:https?:)?\/\//i;

// Attributs qui font charger une ressource par le navigateur.
const ATTRIBUTS = /\b(?:src|poster|data|action|formaction)\s*=\s*["']([^"']+)["']/gi;
const SRCSET = /\bsrcset\s*=\s*["']([^"']+)["']/gi;
// <link> charge sa cible, sauf les relations purement descriptives.
const LINK = /<link\b[^>]*>/gi;
const LINK_DESCRIPTIF = /\brel\s*=\s*["'](?:canonical|alternate|sitemap|author|license)["']/i;
const HREF = /\bhref\s*=\s*["']([^"']+)["']/i;
// CSS : url(...) et @import "..."
const CSS_URL = /url\(\s*["']?([^"')\s]+)["']?\s*\)/gi;
const CSS_IMPORT = /@import\s+["']([^"']+)["']/gi;

function urlsChargees(contenu: string): string[] {
  const urls: string[] = [];
  for (const m of contenu.matchAll(ATTRIBUTS)) urls.push(m[1]);
  for (const m of contenu.matchAll(SRCSET)) {
    for (const candidat of m[1].split(',')) urls.push(candidat.trim().split(/\s+/)[0]);
  }
  for (const m of contenu.matchAll(LINK)) {
    if (LINK_DESCRIPTIF.test(m[0])) continue;
    const href = m[0].match(HREF);
    if (href) urls.push(href[1]);
  }
  for (const m of contenu.matchAll(CSS_URL)) urls.push(m[1]);
  for (const m of contenu.matchAll(CSS_IMPORT)) urls.push(m[1]);
  return urls;
}

function domaine(url: string): string {
  return new URL(url.startsWith('//') ? `https:${url}` : url).hostname;
}

/**
 * Renvoie les ressources tierces hors liste blanche, dans l'ordre où elles
 * apparaissent. `domainesDuSite` liste le ou les domaines du site lui-même.
 */
export function ressourcesTiersInterdites(fichiers: Fichier[], domainesDuSite: string[] = []): RessourceInterdite[] {
  const resultat: RessourceInterdite[] = [];
  for (const { chemin, contenu } of fichiers) {
    const urls = urlsChargees(contenu)
      .filter((url) => ABSOLUE.test(url))
      .map((url) => ({ url, index: contenu.indexOf(url) }))
      .sort((a, b) => a.index - b.index);
    for (const { url } of urls) {
      const d = domaine(url);
      if (domainesDuSite.includes(d) || domaineAutorise(d)) continue;
      resultat.push({ chemin, url });
    }
  }
  return resultat;
}

function lister(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return lister(chemin);
    return /\.(html|css)$/.test(nom) ? [chemin] : [];
  });
}

function principal() {
  const dossier = process.argv[2] ?? 'dist';
  let chemins: string[];
  try {
    chemins = lister(dossier);
  } catch {
    console.error(`Dossier « ${dossier} » introuvable : lancer d'abord npm run build.`);
    process.exit(1);
  }
  const fichiers = chemins.map((c) => ({
    chemin: relative(process.cwd(), c).split(sep).join('/'),
    contenu: readFileSync(c, 'utf-8'),
  }));
  const site = process.env.SITE_URL ? [new URL(process.env.SITE_URL).hostname] : [];
  const fautes = ressourcesTiersInterdites(fichiers, site);
  if (fautes.length > 0) {
    console.error(`Ressources tierces hors liste blanche (${DOMAINES_AUTORISES.join(', ')}) :`);
    for (const f of fautes) console.error(`  ${f.chemin}  ${f.url}`);
    process.exit(1);
  }
  console.log(`Domaines tiers : ${fichiers.length} fichiers contrôlés, aucune ressource hors liste blanche.`);
}

if (import.meta.url === `file://${process.argv[1]}`) principal();
