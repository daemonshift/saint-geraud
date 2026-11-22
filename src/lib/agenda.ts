/**
 * Fichier d'agenda (`.ics`, iCalendar RFC 5545) d'une Actualité qui annonce
 * un événement, généré au build (route `src/pages/actualites/[id].ics.ts`).
 *
 * Les instants sont écrits en UTC explicite (suffixe `Z`) : l'agenda du
 * visiteur les affiche dans son fuseau, donc à la bonne heure de Paris, sans
 * composant VTIMEZONE à maintenir.
 */
import type { EvenementAgenda } from './contenu';

/** « 20261224T223000Z » */
function instantUtc(instant: Date): string {
  return instant.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

/** Échappement d'une valeur TEXT (RFC 5545, 3.3.11). */
function texte(valeur: string): string {
  return valeur.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

const OCTETS_PAR_LIGNE = 75;

/** Pliage des lignes à 75 octets (RFC 5545, 3.1), sans couper un caractère UTF-8. */
function plier(ligne: string): string {
  const morceaux: string[] = [];
  let courant = '';
  let octets = 0;
  for (const caractere of ligne) {
    const taille = Buffer.byteLength(caractere, 'utf8');
    // Les lignes de continuation commencent par une espace, qui compte.
    const limite = morceaux.length === 0 ? OCTETS_PAR_LIGNE : OCTETS_PAR_LIGNE - 1;
    if (octets + taille > limite) {
      morceaux.push(courant);
      courant = '';
      octets = 0;
    }
    courant += caractere;
    octets += taille;
  }
  morceaux.push(courant);
  return morceaux.join('\r\n ');
}

/** Contenu du fichier `.ics` ; `url` : adresse absolue du détail de l'Actualité. */
export function fichierIcs(agenda: EvenementAgenda, { url }: { url: string }): string {
  const description = agenda.description ? `${agenda.description}\n\n${url}` : url;
  const lignes = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Paroisse Saint-Géraud//Site de la paroisse//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${agenda.uid}`,
    `DTSTAMP:${instantUtc(agenda.horodatage)}`,
    `DTSTART:${instantUtc(agenda.debut)}`,
    `DTEND:${instantUtc(agenda.fin)}`,
    `SUMMARY:${texte(agenda.titre)}`,
    `DESCRIPTION:${texte(description)}`,
    ...(agenda.lieu ? [`LOCATION:${texte(agenda.lieu)}`] : []),
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lignes.map(plier).join('\r\n') + '\r\n';
}
