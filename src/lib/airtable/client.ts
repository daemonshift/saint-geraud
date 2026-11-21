/**
 * Client Airtable : l'interface dont dépend le module « contenu du site ».
 * Deux implémentations :
 * - `creerClientAirtable` (ici) : API HTTP d'Airtable, utilisée au build ;
 * - `creerClientEnMemoire` (client-en-memoire.ts) : données d'exemple hors
 *   production, et faux client des tests.
 *
 * Le client ne fait que transporter des pages : la pagination, le contrôle du
 * schéma et les règles de publication sont dans le module « contenu du site ».
 */
import { BASE_ID } from './schema';

/** Enregistrement tel que le rend l'API avec `returnFieldsByFieldId` : champs indexés par ID. Un champ vide est absent. */
export interface EnregistrementAirtable {
  id: string;
  fields: Record<string, unknown>;
}

/** Une page de résultats (100 enregistrements au plus) ; `offset` présent s'il reste des pages. */
export interface PageAirtable {
  records: EnregistrementAirtable[];
  offset?: string;
}

/** Réponse de la Metadata API (`GET /v0/meta/bases/{base}/tables`), réduite à ce que le contrôle du schéma lit. */
export interface SchemaAirtable {
  tables: { id: string; name: string; fields: { id: string; name: string; type: string }[] }[];
}

export interface ClientAirtable {
  lireSchema(): Promise<SchemaAirtable>;
  /** Lit une page d'une table ; `offset` vient de la page précédente. */
  lirePage(tableId: string, offset?: string): Promise<PageAirtable>;
}

const API = 'https://api.airtable.com/v0';

/** Client HTTP. Toute erreur (réseau, statut HTTP, réponse invalide) est levée : elle fait échouer le build. */
export function creerClientAirtable({
  token,
  baseId = BASE_ID,
  fetch = globalThis.fetch,
}: {
  token: string;
  baseId?: string;
  fetch?: typeof globalThis.fetch;
}): ClientAirtable {
  async function lire(url: string): Promise<unknown> {
    const reponse = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!reponse.ok) {
      throw new Error(`Airtable a répondu ${reponse.status} ${reponse.statusText} pour ${url}`);
    }
    try {
      return await reponse.json();
    } catch {
      throw new Error(`Airtable a rendu une réponse illisible pour ${url}`);
    }
  }

  return {
    async lireSchema() {
      const url = `${API}/meta/bases/${baseId}/tables`;
      const corps = await lire(url);
      if (!estObjet(corps) || !Array.isArray(corps.tables)) {
        throw new Error(`Airtable a rendu un schéma invalide pour ${url}`);
      }
      return corps as unknown as SchemaAirtable;
    },

    async lirePage(tableId, offset) {
      const parametres = new URLSearchParams({ returnFieldsByFieldId: 'true', pageSize: '100' });
      if (offset) parametres.set('offset', offset);
      const url = `${API}/${baseId}/${tableId}?${parametres}`;
      const corps = await lire(url);
      if (!estObjet(corps) || !Array.isArray(corps.records)) {
        throw new Error(`Airtable a rendu une liste d'enregistrements invalide pour ${url}`);
      }
      return corps as unknown as PageAirtable;
    },
  };
}

function estObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === 'object' && valeur !== null;
}
