/**
 * Petit serveur statique pour les tests Playwright : sert `dist/client/` comme Vercel
 * sert les pages pré-rendues (`/page` → `page/index.html` ou `page.html`,
 * page inconnue → `404.html` avec le statut 404).
 *
 * Il applique aussi, avant les fichiers, les redirections que le build écrit
 * pour Vercel dans `.vercel/output/config.json` (routes avec `status` 3xx et
 * en-tête `Location`, comme celles des Actualités Archivées ou le retrait de
 * la barre finale, avec ses références `$1`…) : les tests
 * portent sur la configuration réellement produite, pas sur une copie.
 *
 * Usage : node tests/e2e/serveur-statique.ts [dossier] [port]
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const racine = resolve(process.argv[2] ?? 'dist/client');
const port = Number(process.argv[3] ?? 4321);

interface RouteVercel {
  src?: string;
  status?: number;
  headers?: Record<string, string>;
}

/** Redirections de la sortie Vercel (Build Output API v3) ; aucune si le fichier est absent. */
async function redirectionsVercel(): Promise<{ motif: RegExp; status: number; location: string }[]> {
  try {
    const config = JSON.parse(await readFile(resolve('.vercel/output/config.json'), 'utf8')) as { routes?: RouteVercel[] };
    return (config.routes ?? []).flatMap((r) =>
      r.src && r.status && r.status >= 300 && r.status < 400 && r.headers?.Location
        ? [{ motif: new RegExp(r.src), status: r.status, location: r.headers.Location }]
        : [],
    );
  } catch {
    return [];
  }
}

const redirections = await redirectionsVercel();

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
  const adresse = (req.url ?? '/').split('?')[0];
  const redirection = redirections.find((r) => r.motif.test(adresse));
  if (redirection) {
    const captures = adresse.match(redirection.motif) ?? [];
    const location = redirection.location.replace(/\$(\d+)/g, (_, n: string) => captures[Number(n)] ?? '');
    res.writeHead(redirection.status, { location });
    res.end();
    return;
  }
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
