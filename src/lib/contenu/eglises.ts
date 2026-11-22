/**
 * Églises : règles d'affichage (spec #1) et passage d'un enregistrement
 * Airtable au modèle du site.
 */
import type { EnregistrementAirtable } from '../airtable/client';
import { EGLISES } from '../airtable/schema';
import type { StockageImages } from './charger';
import { imageRetenue } from './images';
import type { Eglise } from './modele';
import { booleen, lignesAdresse, nombre, texte } from './valeurs';

const c = EGLISES.champs;

/** Affichée : Active ET Latitude ET Longitude renseignées. */
export function estAffichee(e: EnregistrementAirtable): boolean {
  return booleen(e, c.active) && nombre(e, c.latitude) !== null && nombre(e, c.longitude) !== null;
}

/** Par Ordre croissant (sans Ordre : à la fin), puis par nom. */
export function trierEglises(eglises: EnregistrementAirtable[]): EnregistrementAirtable[] {
  const ordre = (e: EnregistrementAirtable) => nombre(e, c.ordre) ?? Number.POSITIVE_INFINITY;
  return [...eglises].sort((a, b) => ordre(a) - ordre(b) || texte(a, c.nom).localeCompare(texte(b, c.nom), 'fr'));
}

/** À n'appeler que sur une Église affichée (coordonnées renseignées). */
async function versEglise(e: EnregistrementAirtable, images: StockageImages): Promise<Eglise> {
  return {
    id: e.id,
    nom: texte(e, c.nom),
    commune: texte(e, c.commune),
    adresse: lignesAdresse(texte(e, c.adresse)),
    latitude: nombre(e, c.latitude)!,
    longitude: nombre(e, c.longitude)!,
    accesPmr: booleen(e, c.accesPmr),
    lienMessesInfo: texte(e, c.lienMessesInfo) || null,
    photo: await imageRetenue(e, { image: c.photo, texteAlternatif: c.texteAlternatif }, images),
  };
}

/** Églises affichées sur le site, triées ; seules leurs photos sont téléchargées. */
export function eglisesAffichees(eglises: EnregistrementAirtable[], images: StockageImages): Promise<Eglise[]> {
  return Promise.all(trierEglises(eglises.filter(estAffichee)).map((e) => versEglise(e, images)));
}
