# Migration MIORA → MIA

## Objectif
Centraliser progressivement dans MIA les compétences, les connaissances, les outils et les fonctions de MIORA sans supprimer ni altérer le projet source. Les modules sont activés par étapes et les migrations doivent être traçables.

## Sources identifiées
- `philocours-ia/Gestion-Communale2`: fichier HTML `gestion_communale_madagascar_ctd_classification_base_de_donn_es_2.html` (environ 1,15 Mo), prototype CTD/classification. Son contenu complet n'a pas encore pu être extrait via l'intégration GitHub.
- `philocours-ia/gestion-communale`: application web privée, avec une version HTML Gestion Communale (Budget & État civil), un prototype Smart Computing Comptable pour le compte administratif, et des fichiers d'application. Ce dépôt doit être audité en détail avant migration de code/fonctions.
- Connaissances de projet explicitement confirmées : hiérarchie des dépenses communales Programme 001 — Administration et coordination et Programme 002 — Développement économique et social; chacun contient Fonctionnement et Investissement. Ces règles de structure ne remplacent pas la vérification des documents officiels.

## État
- [x] Création du registre des compétences dans MIA.
- [x] Injection contextuelle initiale des compétences CTD, mathématiques, philosophie, recherche documentaire et rédaction administrative dans le chat.
- [x] Modules CTD et Mathématiques identifiés comme migration « foundation ».
- [ ] Extraction complète et vérification du contenu de MIORA.
- [ ] Migration des manuels, références juridiques et nomenclatures vers la bibliothèque MIA.
- [ ] Migration et tests des fonctionnalités interactives (budgets, compte administratif, état civil, calculs, impressions/PDF).
- [ ] Paramètres d'activation administrables depuis l'interface.
- [ ] Tests comparatifs de chaque module avec jeux d'essai et sources vérifiées.

## Principes
1. Ne pas remplacer ou supprimer le dépôt source MIORA.
2. Migrer d'abord les connaissances et instructions; migrer les fonctionnalités applicatives ensuite, par module.
3. Tout contenu juridique/comptable doit être sourcé et daté; les règles non vérifiées sont signalées.
4. Les documents officiels et actions sensibles exigent validation humaine.
5. Un module n'est marqué « actif » qu'après tests; le statut « foundation » signifie prompt spécialisé initial, pas migration complète.
