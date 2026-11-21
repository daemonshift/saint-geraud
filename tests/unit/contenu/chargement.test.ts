import { describe, expect, it } from 'vitest';
import type { SchemaAirtable } from '../../../src/lib/airtable/client';
import {
  creerClientEnMemoire,
  schemaDuMapping,
  type DonneesAirtable,
  type OptionsClientEnMemoire,
} from '../../../src/lib/airtable/client-en-memoire';
import { chargerContenuDuSite } from '../../../src/lib/contenu';
import { actualite } from '../../../src/lib/contenu/donnees-exemple';
import { fauxStockageImages } from './outils';

function charger(donnees: DonneesAirtable, options?: OptionsClientEnMemoire) {
  return chargerContenuDuSite({
    client: creerClientEnMemoire(donnees, options),
    horloge: () => new Date('2026-06-15T10:00:00Z'),
    images: fauxStockageImages(),
  });
}

/** Schéma du mapping dont un champ (désigné par son ID) est modifié ou retiré. */
function schemaModifie(idChamp: string, modification: { type: string } | 'retire'): SchemaAirtable {
  const schema = schemaDuMapping();
  for (const table of schema.tables) {
    table.fields = table.fields.flatMap((f) =>
      f.id !== idChamp ? [f] : modification === 'retire' ? [] : [{ ...f, type: modification.type }],
    );
  }
  return schema;
}

describe('Chargement depuis Airtable', () => {
  it('lit toutes les pages d’une table', async () => {
    const actualites = Array.from({ length: 250 }, (_, i) => actualite(`rec${i}`));
    const contenu = await charger({ actualites }, { tailleDePage: 100 });
    expect(contenu.actualites).toHaveLength(250);
  });

  it('tables vides : succès, aucune Actualité', async () => {
    expect((await charger({})).actualites).toEqual([]);
  });

  it('erreur Airtable : le chargement échoue', async () => {
    await expect(charger({ actualites: [actualite('rec1')] }, { erreur: new Error('Airtable a répondu 503') })).rejects.toThrow(
      'Airtable a répondu 503',
    );
  });
});

describe('Contrôle du schéma avant lecture', () => {
  it('champ attendu absent : échec avec un message qui nomme le champ', async () => {
    await expect(charger({}, { schema: schemaModifie('fldZoGBbYCxqO238c', 'retire') })).rejects.toThrow(
      /Valide.*fldZoGBbYCxqO238c.*Actualités.*absent/,
    );
  });

  it('champ de mauvais type : échec avec un message qui nomme le champ et les deux types', async () => {
    await expect(
      charger({}, { schema: schemaModifie('fldrmVGO6C4alueOW', { type: 'singleLineText' }) }),
    ).rejects.toThrow(/Date_Publication.*fldrmVGO6C4alueOW.*singleLineText.*date/);
  });

  it('vérifie aussi les tables que le site n’exploite pas encore (Groupes)', async () => {
    await expect(charger({}, { schema: schemaModifie('fldVfx3rILg4wd7Fl', 'retire') })).rejects.toThrow(/Active.*Groupes/);
  });

  it('table absente : échec avec un message qui nomme la table', async () => {
    const schema = schemaDuMapping();
    schema.tables = schema.tables.filter((t) => t.id !== 'tbld8JSkv2UAndbqH');
    await expect(charger({}, { schema })).rejects.toThrow(/Infos_Pratiques.*tbld8JSkv2UAndbqH/);
  });

  it('un renommage de champ dans Airtable ne casse rien (lecture par ID)', async () => {
    const schema = schemaDuMapping();
    schema.tables[0]!.fields[0]!.name = 'Titre renommé';
    expect((await charger({ actualites: [actualite('rec1')] }, { schema })).actualites).toHaveLength(1);
  });
});
