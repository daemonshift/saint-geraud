import { describe, expect, it } from 'vitest';
import { ancreEglise, lienEglise, lienItineraire } from '../../src/lib/navigation';

describe('Liens vers une Église', () => {
  it('ancre de l’Église sur Nos églises, fondée sur l’identifiant de l’enregistrement', () => {
    expect(ancreEglise('recEgliseSaintAntoine')).toBe('eglise-recEgliseSaintAntoine');
    expect(lienEglise('recEgliseSaintAntoine')).toBe('/nos-eglises#eglise-recEgliseSaintAntoine');
  });

  it('itinéraire Google Maps vers les coordonnées de l’Église', () => {
    expect(lienItineraire({ latitude: 44.4986, longitude: 0.9653 })).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=44.4986%2C0.9653',
    );
  });
});
