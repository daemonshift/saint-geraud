/**
 * Fichier d'agenda (`.ics`) de chaque Actualité En ligne dont la Date de
 * l'événement est remplie : `/actualites/{id}.ics`, généré au build.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { fichierIcs } from '../../lib/agenda';
import type { EvenementAgenda } from '../../lib/contenu';
import { contenuDuSite } from '../../lib/contenu/site';
import { lienActualite } from '../../lib/navigation';

export const getStaticPaths = (async () => {
  const { actualites } = await contenuDuSite();
  return actualites.flatMap(({ id, agenda }) => (agenda ? [{ params: { id }, props: { agenda } }] : []));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ agenda: EvenementAgenda }> = ({ params, props, site }) => {
  if (!site) throw new Error('`site` est requis dans astro.config.mjs pour le fichier d’agenda.');
  const url = new URL(lienActualite(params.id!), site).href;
  return new Response(fichierIcs(props.agenda, { url }), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
