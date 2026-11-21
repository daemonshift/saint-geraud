# Astro plutôt que Next.js

Le site est construit avec Astro (TypeScript, Tailwind, adaptateur `@astrojs/vercel`), et non avec Next.js App Router, qui avait été retenu dans un premier temps. Le site sert surtout des pages de contenu statiques à un public âgé, souvent sur des appareils anciens et des connexions rurales. Astro n'envoie du JavaScript que pour les îlots interactifs (carrousel, carte Leaflet). Next.js envoie le runtime React sur chaque page.

## Considered Options

- **Next.js App Router** : écarté. Ses deux avantages cités ne le distinguent pas d'Astro : `next/font` a son équivalent avec l'API Fonts d'Astro ou Fontsource, et les Route Handlers ont leur équivalent avec les endpoints serveur d'Astro. Ses règles de cache et de rendu changent beaucoup d'une version majeure à l'autre, ce qui pèse sur un mainteneur bénévole. Son seul atout réel, le nombre de développeurs capables de reprendre le projet, ne compense pas le poids imposé aux visiteurs.

## Consequences

- Les polices sont auto-hébergées avec l'API Fonts d'Astro ou Fontsource, pas avec `next/font` (la charte design mentionne encore `next/font/google`).
- Tout le site est pré-rendu. Il n'y a pas de formulaire (ADR 0003) ; la seule route rendue à la demande est celle du Vercel Cron (ADR 0002).
