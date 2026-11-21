/**
 * Dates du site : toujours en heure de Paris, jamais en UTC (ADR 0002).
 * Les dates « jour » d'Airtable (`date`) sont des chaînes `AAAA-MM-JJ`
 * comparées telles quelles ; les instants (`dateTime`) arrivent en UTC.
 */
const FUSEAU = 'Europe/Paris';

const jourCalendaire = new Intl.DateTimeFormat('en-CA', { timeZone: FUSEAU, year: 'numeric', month: '2-digit', day: '2-digit' });

/** Jour calendaire à Paris (`AAAA-MM-JJ`) pour un instant donné. */
export function jourAParis(instant: Date): string {
  return jourCalendaire.format(instant);
}

const jourEnLettres = new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/** « jeudi 25 décembre 2026 » pour `2026-12-25`. */
export function dateEnLettres(jour: string): string {
  return jourEnLettres.format(new Date(`${jour}T00:00:00Z`));
}

const instantEnLettres = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** « jeudi 25 décembre 2026, 10 h 30 » en heure de Paris. */
export function dateHeureEnLettres(instant: Date): string {
  const p = Object.fromEntries(instantEnLettres.formatToParts(instant).map((x) => [x.type, x.value]));
  return `${p.weekday} ${p.day} ${p.month} ${p.year}, ${Number(p.hour)} h ${p.minute}`;
}
