/**
 * Lecture typée d'un champ d'enregistrement Airtable, par son entrée du
 * mapping. L'API omet les champs vides : chaque lecteur rend une valeur neutre.
 */
import type { EnregistrementAirtable } from '../airtable/client';
import type { ChampAirtable } from '../airtable/schema';

export function texte(e: EnregistrementAirtable, champ: ChampAirtable): string {
  const v = e.fields[champ.id];
  return typeof v === 'string' ? v.trim() : '';
}

export function booleen(e: EnregistrementAirtable, champ: ChampAirtable): boolean {
  return e.fields[champ.id] === true;
}

export function nombre(e: EnregistrementAirtable, champ: ChampAirtable): number | null {
  const v = e.fields[champ.id];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** Identifiants des enregistrements liés (`multipleRecordLinks`). */
export function liens(e: EnregistrementAirtable, champ: ChampAirtable): string[] {
  const v = e.fields[champ.id];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}
