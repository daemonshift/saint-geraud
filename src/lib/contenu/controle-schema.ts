/**
 * Contrôle du schéma avant toute lecture : chaque champ du mapping doit
 * exister dans Airtable avec le type attendu. Sinon le build échoue avec un
 * message qui nomme le champ, avant qu'une page ne soit cassée.
 */
import type { SchemaAirtable } from '../airtable/client';
import type { TableAirtable } from '../airtable/schema';

export function controlerSchema(schema: SchemaAirtable, tables: readonly TableAirtable[]): void {
  const erreurs: string[] = [];
  for (const table of tables) {
    const reelle = schema.tables.find((t) => t.id === table.id);
    if (!reelle) {
      erreurs.push(`la table « ${table.nom} » (${table.id}) est absente`);
      continue;
    }
    for (const champ of Object.values(table.champs)) {
      const reel = reelle.fields.find((f) => f.id === champ.id);
      if (!reel) {
        erreurs.push(`le champ « ${champ.nom} » (${champ.id}) de la table « ${table.nom} » est absent`);
      } else if (reel.type !== champ.type) {
        erreurs.push(
          `le champ « ${champ.nom} » (${champ.id}) de la table « ${table.nom} » est de type « ${reel.type} » au lieu de « ${champ.type} »`,
        );
      }
    }
  }
  if (erreurs.length) {
    throw new Error(
      `Schéma Airtable inattendu (mettre à jour src/lib/airtable/schema.ts ou la base) :\n- ${erreurs.join('\n- ')}`,
    );
  }
}
