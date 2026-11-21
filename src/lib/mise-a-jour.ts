/**
 * Mise à jour du site (ADR 0002) : une seule fonction pour le Vercel Cron de
 * la nuit et pour le bouton « Mettre à jour le site maintenant » de l'Espace
 * communication. Elle vérifie l'autorisation, puis appelle le Deploy Hook.
 *
 *   - Cron : Vercel envoie `Authorization: Bearer <CRON_SECRET>`.
 *   - Bouton Airtable : il ouvre `/api/mise-a-jour?cle=<CLE_MISE_A_JOUR>`.
 *
 * Les secrets ne vivent que dans Vercel et ne sont lus qu'à l'exécution, côté
 * serveur (jamais une variable `PUBLIC_…`, jamais dans le HTML construit).
 */
import { createHash, timingSafeEqual } from 'node:crypto';

export interface EnvironnementMiseAJour {
  /** URL du Deploy Hook Vercel (Settings → Git → Deploy Hooks). Secrète. */
  DEPLOY_HOOK_URL?: string;
  /** Secret du Vercel Cron, envoyé par Vercel dans l'en-tête Authorization. */
  CRON_SECRET?: string;
  /** Clé de l'URL du bouton de l'Espace communication. */
  CLE_MISE_A_JOUR?: string;
}

/**
 * Compare deux chaînes en temps constant. Les deux valeurs sont d'abord
 * hachées : la durée ne dépend ni du contenu ni de la longueur de la valeur
 * reçue. Un secret absent ou vide n'accepte jamais rien.
 */
export function egalEnTempsConstant(recu: string | null | undefined, attendu: string | undefined): boolean {
  if (!attendu || recu == null) return false;
  const a = createHash('sha256').update(recu).digest();
  const b = createHash('sha256').update(attendu).digest();
  return timingSafeEqual(a, b);
}

/** La requête vient-elle du Cron (bon `CRON_SECRET`) ou du bouton (bonne clé) ? */
function estAutorisee(requete: Request, env: EnvironnementMiseAJour): boolean {
  const autorisation = requete.headers.get('authorization');
  const jeton = autorisation?.startsWith('Bearer ') ? autorisation.slice('Bearer '.length) : null;
  const cle = new URL(requete.url).searchParams.get('cle');
  // Les deux comparaisons sont toujours faites : pas de court-circuit.
  const parLeCron = egalEnTempsConstant(jeton, env.CRON_SECRET?.trim());
  const parLeBouton = egalEnTempsConstant(cle, env.CLE_MISE_A_JOUR?.trim());
  return parLeCron || parLeBouton;
}

export async function traiterMiseAJour(
  requete: Request,
  env: EnvironnementMiseAJour,
  fetch: typeof globalThis.fetch = globalThis.fetch,
): Promise<Response> {
  if (!estAutorisee(requete, env)) {
    return page(401, 'Mise à jour refusée', 'Ce lien de mise à jour n’est pas valide. Utilisez le bouton « Mettre à jour le site maintenant » de l’Espace communication.');
  }

  const hook = env.DEPLOY_HOOK_URL?.trim();
  if (!hook) {
    console.error('Mise à jour du site : DEPLOY_HOOK_URL est absent.');
    return page(500, 'Mise à jour impossible', 'La mise à jour n’a pas pu être lancée. Le site reste en ligne tel quel ; prévenez le mainteneur du site.');
  }

  let lancee = false;
  try {
    const reponse = await fetch(hook, { method: 'POST' });
    lancee = reponse.ok;
    if (!lancee) console.error(`Mise à jour du site : le Deploy Hook a répondu ${reponse.status}.`);
  } catch (erreur) {
    console.error('Mise à jour du site : le Deploy Hook est injoignable.', erreur);
  }
  if (!lancee) {
    return page(502, 'Mise à jour impossible', 'La mise à jour n’a pas pu être lancée. Le site reste en ligne tel quel ; réessayez dans quelques minutes.');
  }

  return page(200, 'Mise à jour lancée', 'La mise à jour est lancée, le site sera à jour dans quelques minutes.');
}

/** Petite page autonome : elle ne dépend ni de la mise en page ni d'Airtable. */
function page(statut: number, titre: string, message: string): Response {
  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${titre} – Paroisse Saint-Géraud</title>
<style>body{font-family:system-ui,sans-serif;font-size:1.25rem;line-height:1.5;max-width:40rem;margin:3rem auto;padding:0 1rem}</style>
</head>
<body>
<main>
<h1>${titre}</h1>
<p>${message}</p>
</main>
</body>
</html>
`;
  return new Response(html, {
    status: statut,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex',
    },
  });
}
