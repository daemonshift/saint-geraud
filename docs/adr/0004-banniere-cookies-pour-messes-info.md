# Bannière cookies pour le widget messes.info

Remplace, dans l'ADR 0003, la règle « Jamais de bannière cookies » et le chargement du widget messes.info au seul clic.

La paroisse veut que les horaires de messes.info s'affichent sans clic. Le widget dépose des cookies de mesure d'audience (Google Analytics) et de consentement (Didomi) sur le domaine du site (essai réel, issue #10). La CNIL exige un consentement préalable pour ces cookies : informer ne suffit pas. Le site affiche donc une bannière cookies, limitée à ce seul service.

- À la première visite, une bannière en bas de chaque page demande « Accepter » ou « Refuser », deux boutons de même poids, avec un lien vers la page Confidentialité.
- Le visiteur répond une fois : son choix vaut pour tout le site, pendant six mois (recommandation CNIL), puis la question est reposée. Il est gardé dans le stockage local du navigateur, pas dans un cookie : le site lui-même ne dépose toujours aucun cookie.
- Après « Accepter », le widget se charge sans clic. Après « Refuser », rien ne part vers messes.info ; le bouton « Afficher les horaires » reste un consentement ponctuel, pour ce seul affichage.
- Le bouton « Gérer les cookies » du pied de page rouvre la bannière : retirer son accord est aussi simple que le donner, et efface les cookies `_ga`, `_gid` et `didomi_token`.
- Sans JavaScript, ni bannière ni widget.

## Considered Options

- **Chargement au clic, sans bannière** (ADR 0003) : conforme et plus simple, mais la paroisse veut les horaires visibles d'emblée.
- **Chargement automatique avec une simple information** : écarté, des cookies déposés sans consentement préalable engagent la responsabilité de la paroisse, éditrice du site.
- **Outil de consentement tiers** (Didomi, Axeptio, tarteaucitron) : écarté, un service de plus, souvent payant, pour un seul contenu tiers.

## Consequences

- Toute nouvelle source de cookies ou de traceurs doit passer par cette bannière, et la page Confidentialité doit la décrire.
- Si messes.info cesse un jour de déposer des cookies, la bannière peut disparaître : revenir alors à l'intégration directe.
- Logique et durée du choix : `src/lib/consentement.ts` ; bannière : `src/components/BanniereCookies.astro`.
