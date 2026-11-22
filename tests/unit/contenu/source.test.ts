import { describe, expect, it } from 'vitest';
import { chargerContenuDuSite } from '../../../src/lib/contenu';
import { clientSelonEnvironnement } from '../../../src/lib/contenu/site';
import { fauxStockageImages } from './outils';

describe('Choix de la source selon l’environnement', () => {
  it('production sans token Airtable : échec', () => {
    expect(() => clientSelonEnvironnement({ VERCEL_ENV: 'production' })).toThrow(/AIRTABLE_TOKEN/);
    expect(() => clientSelonEnvironnement({ VERCEL_ENV: 'production', AIRTABLE_TOKEN: '  ' })).toThrow(/AIRTABLE_TOKEN/);
  });

  it.each([{}, { VERCEL_ENV: 'preview' }, { VERCEL_ENV: 'development' }])(
    'hors production sans token (%o) : données d’exemple',
    async (env) => {
      const contenu = await chargerContenuDuSite({
        client: clientSelonEnvironnement(env),
        horloge: () => new Date('2026-06-15T10:00:00Z'),
        images: fauxStockageImages(),
      });
      expect(contenu.actualites.map((a) => a.titre)).toEqual([
        'Messe de la nuit de Noël',
        'Inscriptions au catéchisme',
        'Kermesse paroissiale',
        'Concert de la chorale',
        'Pèlerinage diocésain à Lourdes',
      ]);
    },
  );

  it('avec un token : client HTTP, sans aucun appel avant le chargement', () => {
    const client = clientSelonEnvironnement({ VERCEL_ENV: 'production', AIRTABLE_TOKEN: 'pat-test' }, () => {
      throw new Error('aucun appel attendu');
    });
    expect(client).toBeDefined();
  });
});
