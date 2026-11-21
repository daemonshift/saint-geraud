# Mise à jour du site : mise en service

Le code est en place (ADR 0002, ticket #15) : route `/api/mise-a-jour` (`src/pages/api/mise-a-jour.ts`, rendue à la demande) et Vercel Cron `15 23 * * *` UTC dans `vercel.json`. Il reste des actions humaines, à reprendre dans `docs/reprise.md` (#17).

## Secrets, uniquement dans Vercel

Project Settings → Environment Variables, environnement **Production**, jamais préfixés `PUBLIC_` :

| Variable | Rôle | Où l'obtenir |
|---|---|---|
| `DEPLOY_HOOK_URL` | URL appelée pour reconstruire le site | Project Settings → Git → Deploy Hooks → créer un hook sur la branche `main` |
| `CRON_SECRET` | Authentifie le Vercel Cron (Vercel l'envoie dans `Authorization: Bearer …`) | Valeur aléatoire, par ex. `openssl rand -hex 32` |
| `CLE_MISE_A_JOUR` | Clé de l'URL du bouton de l'Espace communication | Valeur aléatoire, par ex. `openssl rand -hex 24` |
| `AIRTABLE_TOKEN` | Lecture d'Airtable au build | Token personnel Airtable en lecture seule |

Sans `CRON_SECRET` ou sans `CLE_MISE_A_JOUR`, la route refuse tout. Après un changement de variable, redéployer.

## Champ Bouton dans Airtable

Dans la table Actualités (ou celle qui porte la page d'accueil de l'Espace communication) :

1. Créer un champ **Bouton** nommé « Mettre à jour le site maintenant », action **Ouvrir une URL**, formule : `"https://<domaine du site>/api/mise-a-jour?cle=<CLE_MISE_A_JOUR>"`.
2. L'ajouter à l'interface « Espace communication » (page Actualités, par ex. dans la description ou sur la fiche Actualité Détail).
3. Cliquer une fois : la page « La mise à jour est lancée, le site sera à jour dans quelques minutes. » doit s'afficher, et un déploiement apparaître dans Vercel.

La clé est visible par les collaborateurs de la base (exception assumée, ADR 0002) : elle ne permet que de lancer un rebuild.

## Changer la clé ou le Deploy Hook

- Clé : nouvelle valeur de `CLE_MISE_A_JOUR` dans Vercel, redéployer, puis mettre à jour la formule du champ Bouton.
- Deploy Hook : le supprimer et en créer un nouveau dans Vercel, puis remplacer `DEPLOY_HOOK_URL` et redéployer.

## Réponses de la route

- 200 : Deploy Hook appelé une fois, message de confirmation.
- 401 : clé ou `CRON_SECRET` invalide, aucun appel.
- 500 : `DEPLOY_HOOK_URL` absent ; 502 : le Deploy Hook a refusé ou est injoignable. Le site reste en ligne tel quel. Détail dans les logs de la fonction (Vercel → Logs).
