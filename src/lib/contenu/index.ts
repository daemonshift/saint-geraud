/**
 * Module « contenu du site » (spec #1, ADR 0002) : point d'entrée unique.
 *
 *   const contenu = await chargerContenuDuSite({ client, horloge, images });
 *
 * - `client`  : client Airtable (HTTP au build, en mémoire pour les données d'exemple et les tests) ;
 * - `horloge` : rend l'instant présent ; « aujourd'hui » est calculé en Europe/Paris ;
 * - `images`  : stockage des images téléchargées au build.
 *
 * Les pages n'appellent pas cette fonction directement : elles passent par
 * `contenuDuSite()` (site.ts), qui choisit le client selon l'environnement.
 */
export { chargerContenuDuSite, type DependancesContenu, type Horloge, type StockageImages } from './charger';
export { contactOuPresbytere, contactPour } from './infos-pratiques';
export type * from './modele';
