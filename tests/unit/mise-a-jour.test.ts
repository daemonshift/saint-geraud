import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { egalEnTempsConstant, traiterMiseAJour, type EnvironnementMiseAJour } from '../../src/lib/mise-a-jour';

const HOOK = 'https://api.vercel.com/v1/integrations/deploy/prj_faux/faux';

const ENV: EnvironnementMiseAJour = {
  DEPLOY_HOOK_URL: HOOK,
  CRON_SECRET: 'secret-du-cron-de-test',
  CLE_MISE_A_JOUR: 'cle-de-mise-a-jour-de-test',
};

/** Faux Deploy Hook : note chaque appel et répond comme Vercel (201). */
function fauxDeployHook(statut = 201) {
  const appels: { url: string; methode: string }[] = [];
  const fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    appels.push({ url: String(url), methode: init?.method ?? 'GET' });
    return new Response('{"job":{"id":"faux"}}', { status: statut });
  }) as typeof globalThis.fetch;
  return { appels, fetch };
}

function requete(chemin: string, entetes: Record<string, string> = {}) {
  return new Request(`https://saint-geraud.example${chemin}`, { headers: entetes });
}

describe('Mise à jour du site à la demande (?cle=…)', () => {
  it('refuse une clé invalide sans appeler le Deploy Hook', async () => {
    const hook = fauxDeployHook();
    const reponse = await traiterMiseAJour(requete('/api/mise-a-jour?cle=mauvaise-cle'), ENV, hook.fetch);
    expect(reponse.status).toBe(401);
    expect(hook.appels).toHaveLength(0);
  });

  it('refuse une requête sans clé sans appeler le Deploy Hook', async () => {
    const hook = fauxDeployHook();
    const reponse = await traiterMiseAJour(requete('/api/mise-a-jour'), ENV, hook.fetch);
    expect(reponse.status).toBe(401);
    expect(hook.appels).toHaveLength(0);
  });

  it('avec la bonne clé, appelle exactement une fois le Deploy Hook et annonce la mise à jour', async () => {
    const hook = fauxDeployHook();
    const reponse = await traiterMiseAJour(requete('/api/mise-a-jour?cle=cle-de-mise-a-jour-de-test'), ENV, hook.fetch);
    expect(reponse.status).toBe(200);
    expect(hook.appels).toEqual([{ url: HOOK, methode: 'POST' }]);
    expect(await reponse.text()).toContain('La mise à jour est lancée, le site sera à jour dans quelques minutes.');
    expect(reponse.headers.get('cache-control')).toBe('no-store');
  });

  it('la clé de mise à jour ne vaut pas comme secret du Cron', async () => {
    const hook = fauxDeployHook();
    const reponse = await traiterMiseAJour(
      requete('/api/mise-a-jour', { authorization: 'Bearer cle-de-mise-a-jour-de-test' }),
      ENV,
      hook.fetch,
    );
    expect(reponse.status).toBe(401);
    expect(hook.appels).toHaveLength(0);
  });

  it('refuse tout, même une clé vide, quand la clé n’est pas configurée', async () => {
    const hook = fauxDeployHook();
    const env = { ...ENV, CLE_MISE_A_JOUR: '', CRON_SECRET: undefined };
    expect((await traiterMiseAJour(requete('/api/mise-a-jour?cle='), env, hook.fetch)).status).toBe(401);
    expect((await traiterMiseAJour(requete('/api/mise-a-jour', { authorization: 'Bearer ' }), env, hook.fetch)).status).toBe(401);
    expect(hook.appels).toHaveLength(0);
  });
});

describe('Mise à jour du site par le Vercel Cron (CRON_SECRET)', () => {
  it('refuse un CRON_SECRET invalide sans appeler le Deploy Hook', async () => {
    const hook = fauxDeployHook();
    const reponse = await traiterMiseAJour(
      requete('/api/mise-a-jour', { authorization: 'Bearer mauvais-secret' }),
      ENV,
      hook.fetch,
    );
    expect(reponse.status).toBe(401);
    expect(hook.appels).toHaveLength(0);
  });

  it('avec le bon CRON_SECRET, appelle exactement une fois le Deploy Hook', async () => {
    const hook = fauxDeployHook();
    const reponse = await traiterMiseAJour(
      requete('/api/mise-a-jour', { authorization: 'Bearer secret-du-cron-de-test' }),
      ENV,
      hook.fetch,
    );
    expect(reponse.status).toBe(200);
    expect(hook.appels).toEqual([{ url: HOOK, methode: 'POST' }]);
  });
});

describe('Échecs du Deploy Hook', () => {
  it('signale l’échec quand le Deploy Hook refuse', async () => {
    const hook = fauxDeployHook(500);
    const reponse = await traiterMiseAJour(requete('/api/mise-a-jour?cle=cle-de-mise-a-jour-de-test'), ENV, hook.fetch);
    expect(reponse.status).toBe(502);
    expect(hook.appels).toHaveLength(1);
    expect(await reponse.text()).toContain('n’a pas pu être lancée');
  });

  it('signale l’échec quand l’URL du Deploy Hook manque', async () => {
    const hook = fauxDeployHook();
    const reponse = await traiterMiseAJour(
      requete('/api/mise-a-jour?cle=cle-de-mise-a-jour-de-test'),
      { ...ENV, DEPLOY_HOOK_URL: undefined },
      hook.fetch,
    );
    expect(reponse.status).toBe(500);
    expect(hook.appels).toHaveLength(0);
  });
});

describe('egalEnTempsConstant', () => {
  it('compare des chaînes de longueurs différentes sans erreur', () => {
    expect(egalEnTempsConstant('a', 'abc')).toBe(false);
    expect(egalEnTempsConstant('abc', 'abc')).toBe(true);
    expect(egalEnTempsConstant('', '')).toBe(false);
  });
});

describe('Secrets de la Mise à jour du site', () => {
  it('ne sont jamais lus par une variable exposée au navigateur ni figés au build', () => {
    const fichiers = readdirSync('src', { recursive: true, withFileTypes: true })
      .filter((f) => f.isFile())
      .map((f) => join(f.parentPath, f.name));
    const fautifs = fichiers.filter((chemin) =>
      /PUBLIC_\w*(DEPLOY|CRON|CLE|AIRTABLE)|import\.meta\.env\.(DEPLOY_HOOK_URL|CRON_SECRET|CLE_MISE_A_JOUR|AIRTABLE_TOKEN)/.test(
        readFileSync(chemin, 'utf8'),
      ),
    );
    expect(fautifs).toEqual([]);
  });
});
