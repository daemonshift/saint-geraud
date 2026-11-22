## Projet

- **Périmètre** : site statique, aucun service payant, aucun formulaire ni donnée personnelle collectée ; une bannière cookies pour le seul widget messes.info. Lire `docs/adr/0003-aucune-donnee-personnelle-collectee.md` et `docs/adr/0004-banniere-cookies-pour-messes-info.md` avant de proposer une fonctionnalité.
- **Airtable** (lecture, IDs de champs, règles de publication) : `docs/context/schema-airtable.md`.
- **Interface** (couleurs, typographie, tailles, maquettes) : `docs/context/charte-design.md` et les planches de `docs/context/maquettes/planches/` (1440 = ordinateur, 390 = mobile). Après une nouvelle maquette source, relancer `python3 -I scripts/extraire-maquettes.py`.

## Agent skills

### Issue tracker

Les issues et specs vivent dans les GitHub Issues de daemonshift/saint-geraud (CLI `gh`). See `docs/agents/issue-tracker.md`.

### Triage labels

Les cinq labels canoniques par défaut (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context : un `GLOSSARY.md` + `docs/adr/` à la racine. See `docs/agents/domain.md`.
