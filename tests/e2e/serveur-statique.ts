/**
 * Petit serveur statique pour les tests Playwright : sert `dist/` comme Vercel
 * sert les pages pré-rendues (`/page` → `page/index.html` ou `page.html`,
 * page inconnue → `404.html` avec le statut 404).
 *
 * Usage : node tests/e2e/serveur-statique.ts [dossier] [port]
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const racine = resolve(process.argv[2] ?? 'dist');
const port = Number(process.argv[3] ?? 4321);

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ics': 'text/calendar; charset=utf-8',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

async function fichier(chemin: string): Promise<string | null> {
  try {
    return (await stat(chemin)).isFile() ? chemin : null;
  } catch {
    return null;
  }
}

async function trouver(url: string): Promise<string | null> {
  const chemin = normalize(decodeURIComponent(url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const base = join(racine, chemin);
  if (!base.startsWith(racine)) return null;
  return (
    (await fichier(base)) ?? (await fichier(join(base, 'index.html'))) ?? (await fichier(`${base.replace(/\/$/, '')}.html`))
  );
}

createServer(async (req, res) => {
  const trouve = await trouver(req.url ?? '/');
  const chemin = trouve ?? join(racine, '404.html');
  try {
    const contenu = await readFile(chemin);
    res.writeHead(trouve ? 200 : 404, { 'content-type': TYPES[extname(chemin)] ?? 'application/octet-stream' });
    res.end(contenu);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Page introuvable');
  }
}).listen(port, () => console.log(`Site construit servi sur http://localhost:${port}`));
