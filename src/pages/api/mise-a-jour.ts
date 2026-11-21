/**
 * Route de la Mise à jour du site (ADR 0002), rendue à la demande : c'est la
 * seule fonction serverless du site. Appelée chaque nuit par le Vercel Cron
 * (voir `vercel.json`) et par le bouton de l'Espace communication.
 */
import type { APIRoute } from 'astro';
import { traiterMiseAJour } from '../../lib/mise-a-jour';

export const prerender = false;

// `process.env` est lu à chaque requête : aucun secret n'est figé au build.
export const GET: APIRoute = ({ request }) => traiterMiseAJour(request, process.env);
