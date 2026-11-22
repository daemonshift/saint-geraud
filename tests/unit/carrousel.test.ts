import { describe, expect, it } from 'vitest';
import { positionDuCarrousel } from '../../src/lib/carrousel';

describe('Position annoncée du carrousel', () => {
  it('annonce « 2 sur 5 » quand une seule carte est visible', () => {
    expect(positionDuCarrousel({ premiere: 1, visibles: 1, total: 5 })).toEqual({ texte: '2 sur 5', auDebut: false, aLaFin: false });
  });

  it('annonce l’intervalle visible quand plusieurs cartes le sont', () => {
    expect(positionDuCarrousel({ premiere: 0, visibles: 3, total: 5 })).toEqual({ texte: '1 à 3 sur 5', auDebut: true, aLaFin: false });
  });

  it('signale la fin quand la dernière carte est visible', () => {
    expect(positionDuCarrousel({ premiere: 2, visibles: 3, total: 5 })).toEqual({ texte: '3 à 5 sur 5', auDebut: false, aLaFin: true });
    expect(positionDuCarrousel({ premiere: 4, visibles: 1, total: 5 })).toMatchObject({ texte: '5 sur 5', aLaFin: true });
  });

  it('signale début et fin quand toutes les cartes tiennent à l’écran', () => {
    expect(positionDuCarrousel({ premiere: 0, visibles: 3, total: 2 })).toEqual({ texte: '1 à 2 sur 2', auDebut: true, aLaFin: true });
    expect(positionDuCarrousel({ premiere: 0, visibles: 1, total: 1 })).toEqual({ texte: '1 sur 1', auDebut: true, aLaFin: true });
  });

  it('reste dans les bornes si la mesure déborde', () => {
    expect(positionDuCarrousel({ premiere: 7, visibles: 1, total: 5 })).toMatchObject({ texte: '5 sur 5', aLaFin: true });
    expect(positionDuCarrousel({ premiere: -1, visibles: 0, total: 5 })).toMatchObject({ texte: '1 sur 5', auDebut: true });
  });
});
