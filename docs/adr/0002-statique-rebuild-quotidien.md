# Site statique reconstruit chaque nuit, pas d'ISR

Toutes les pages sont pré-rendues au build à partir d'Airtable. Seuls les endpoints des formulaires sont rendus à la demande. Un Vercel Cron (`15 23 * * *` UTC, soit 00 h 15 à Paris en hiver et 01 h 15 en été) appelle une route protégée par `CRON_SECRET`, qui déclenche le Deploy Hook. Si Airtable est indisponible, le build échoue volontairement et Vercel laisse en ligne le déploiement précédent.

## Considered Options

- **ISR avec revalidation quotidienne** : écarté. Les images Airtable doivent être téléchargées et servies par le site, car leurs URL expirent, et une fonction serverless ne peut pas écrire de fichiers servables sans stockage externe. L'ISR produit aussi un site où cohabitent des pages fraîches et des pages anciennes, avec une date du jour calculée au moment de la visite.
- **GitHub Action planifiée** : écartée. L'URL du Deploy Hook devrait vivre dans les secrets GitHub, alors que tous les secrets vivent uniquement dans Vercel. De plus, GitHub désactive les workflows planifiés d'un dépôt inactif depuis 60 jours.

## Consequences

- Le build calcule « aujourd'hui » en `Europe/Paris` : à 23 h 15 UTC, la date UTC est encore celle de la veille.
- Une erreur d'accès à Airtable fait échouer le build ; une liste d'Actualités vide est un résultat valide, pas une erreur.
- Une Actualité validée dans la journée n'apparaît qu'au rebuild suivant, sauf si l'équipe de communication demande une Mise à jour du site.
- **Mise à jour du site à la demande** : dans l'Espace communication, un champ Bouton « Ouvrir une URL » ouvre `/api/mise-a-jour?cle=…`, qui est la même fonction que la route du Cron. Elle déclenche le Deploy Hook, puis affiche « La mise à jour est lancée, le site sera à jour dans quelques minutes. » Les règles de publication restent appliquées par le build. Une automatisation Airtable avec script a été écartée : l'action « Exécuter un script » n'existe pas dans le plan gratuit, et aucun service payant n'est autorisé. **Exception assumée à la règle « secrets uniquement dans Vercel »** : la clé de cette URL est visible par les collaborateurs de la base. Elle ne donne accès à aucune donnée, ne permet que de lancer un rebuild, et se change en un clic.
