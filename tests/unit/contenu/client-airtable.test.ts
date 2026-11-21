import { describe, expect, it } from 'vitest';
import { creerClientAirtable } from '../../../src/lib/airtable/client';

/** Faux `fetch` : rend les réponses dans l'ordre et note les requêtes. */
function fauxFetch(...reponses: (() => Response)[]) {
  const requetes: { url: string; autorisation: string | null }[] = [];
  const fetch = async (url: string | URL | Request, init?: RequestInit) => {
    requetes.push({ url: String(url), autorisation: new Headers(init?.headers).get('Authorization') });
    const reponse = reponses.shift();
    if (!reponse) throw new Error('requête inattendue');
    return reponse();
  };
  return { fetch: fetch as typeof globalThis.fetch, requetes };
}

const json = (corps: unknown, status = 200) => () => new Response(JSON.stringify(corps), { status });

describe('Client HTTP Airtable', () => {
  it('lit une table par ID de champ, 100 par page, avec le token, et suit l’offset', async () => {
    const { fetch, requetes } = fauxFetch(json({ records: [], offset: 'itr1/rec1' }));
    const client = creerClientAirtable({ token: 'pat-test', baseId: 'appBase', fetch });
    expect(await client.lirePage('tblTable', 'itr0/rec0')).toEqual({ records: [], offset: 'itr1/rec1' });
    const url = new URL(requetes[0]!.url);
    expect(url.pathname).toBe('/v0/appBase/tblTable');
    expect(url.searchParams.get('returnFieldsByFieldId')).toBe('true');
    expect(url.searchParams.get('pageSize')).toBe('100');
    expect(url.searchParams.get('offset')).toBe('itr0/rec0');
    expect(requetes[0]!.autorisation).toBe('Bearer pat-test');
  });

  it('lit le schéma par la Metadata API', async () => {
    const { fetch, requetes } = fauxFetch(json({ tables: [] }));
    await creerClientAirtable({ token: 't', baseId: 'appBase', fetch }).lireSchema();
    expect(new URL(requetes[0]!.url).pathname).toBe('/v0/meta/bases/appBase/tables');
  });

  it('statut HTTP en erreur : échec', async () => {
    const { fetch } = fauxFetch(json({ error: 'NOT_AUTHORIZED' }, 401));
    await expect(creerClientAirtable({ token: 't', fetch }).lirePage('tbl')).rejects.toThrow(/401/);
  });

  it('réponse illisible ou sans enregistrements : échec', async () => {
    const { fetch } = fauxFetch(
      () => new Response('<html>', { status: 200 }),
      json({ rien: true }),
      json({ rien: true }),
    );
    const client = creerClientAirtable({ token: 't', fetch });
    await expect(client.lirePage('tbl')).rejects.toThrow(/illisible/);
    await expect(client.lirePage('tbl')).rejects.toThrow(/invalide/);
    await expect(client.lireSchema()).rejects.toThrow(/invalide/);
  });

  it('erreur réseau : échec', async () => {
    const { fetch } = fauxFetch(() => {
      throw new TypeError('fetch failed');
    });
    await expect(creerClientAirtable({ token: 't', fetch }).lirePage('tbl')).rejects.toThrow('fetch failed');
  });
});
