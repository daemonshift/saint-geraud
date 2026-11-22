/**
 * Pages du site contrôlées par tous les tests transverses (axe, 18 px, 48 px,
 * débordement, domaines tiers). Chaque ticket qui crée une page l'ajoute ici.
 * Le site testé est construit avec les données d'exemple
 * (src/lib/contenu/donnees-exemple.ts).
 */
export const PAGES: { nom: string; chemin: string }[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: 'Actualités', chemin: '/actualites' },
  { nom: 'Détail d’une Actualité', chemin: '/actualites/recExempleMesseDeNoel' },
  { nom: 'Détail d’une Actualité sans date d’événement', chemin: '/actualites/recExempleKermesse' },
  { nom: 'Actualité terminée', chemin: '/actualites/terminee' },
  { nom: 'Page 404', chemin: '/actualites/recInconnu' },
  { nom: 'Nos églises', chemin: '/nos-eglises' },
  { nom: 'La paroisse', chemin: '/la-paroisse' },
  { nom: 'Mentions légales', chemin: '/mentions-legales' },
  { nom: 'Confidentialité', chemin: '/confidentialite' },
  { nom: 'Accessibilité', chemin: '/accessibilite' },
];
