/**
 * Client Airtable en mémoire : sert les données d'exemple hors production, et
 * de faux client aux tests (pagination, schéma modifié, panne d'Airtable).
 */
import type { ClientAirtable, EnregistrementAirtable, SchemaAirtable } from './client';
import { ACTUALITES, EGLISES, GROUPES, INFOS_PRATIQUES, TABLES } from './schema';

/** Contenu des tables, au format de l'API (champs indexés par ID). Une table absente est vide. */
export interface DonneesAirtable {
  actualites?: EnregistrementAirtable[];
  eglises?: EnregistrementAirtable[];
  infosPratiques?: EnregistrementAirtable[];
  groupes?: EnregistrementAirtable[];
}

export interface OptionsClientEnMemoire {
  /** Schéma rendu par `lireSchema` ; par défaut, exactement celui du mapping. */
  schema?: SchemaAirtable;
  /** Taille des pages (100 comme Airtable par défaut). */
  tailleDePage?: number;
  /** Si présent, chaque appel échoue avec cette erreur (Airtable indisponible). */
  erreur?: Error;
}

/** Schéma conforme au mapping : point de départ des tests qui l'altèrent. */
export function schemaDuMapping(): SchemaAirtable {
  return {
    tables: TABLES.map((table) => ({
      id: table.id,
      name: table.nom,
      fields: Object.values(table.champs).map((c) => ({ id: c.id, name: c.nom, type: c.type })),
    })),
  };
}

export function creerClientEnMemoire(donnees: DonneesAirtable, options: OptionsClientEnMemoire = {}): ClientAirtable {
  const { schema = schemaDuMapping(), tailleDePage = 100, erreur } = options;
  const parTable: Record<string, EnregistrementAirtable[]> = {
    [ACTUALITES.id]: donnees.actualites ?? [],
    [EGLISES.id]: donnees.eglises ?? [],
    [INFOS_PRATIQUES.id]: donnees.infosPratiques ?? [],
    [GROUPES.id]: donnees.groupes ?? [],
  };

  return {
    async lireSchema() {
      if (erreur) throw erreur;
      return structuredClone(schema);
    },

    async lirePage(tableId, offset) {
      if (erreur) throw erreur;
      const enregistrements = parTable[tableId];
      if (!enregistrements) throw new Error(`Table inconnue : ${tableId}`);
      const debut = offset ? Number(offset) : 0;
      const fin = debut + tailleDePage;
      return {
        records: structuredClone(enregistrements.slice(debut, fin)),
        ...(fin < enregistrements.length ? { offset: String(fin) } : {}),
      };
    },
  };
}
