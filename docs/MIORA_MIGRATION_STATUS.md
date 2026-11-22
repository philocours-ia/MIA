# Migration de MIORA vers OMNIA — état des travaux

Date de l'audit : 23 novembre 2026

## Source examinée

Dépôt de référence : `philocours-ia/Gestion-Communale2`

Fichier source principal : `gestion_communale_madagascar_ctd_classification_base_de_donn_es_2.html` (environ 1,15 Mo). Le prototype réunit le HTML, les styles et une grande partie du JavaScript dans un document autonome. Son code comprend notamment des fonctions de rendu de modules, des calculs, des formulaires, des registres et des aperçus d'impression. Le prototype utilise également un état de travail stocké dans le navigateur sous la clé `ctd_communes_state_v2_clean`.

L'audit a identifié les principaux groupes de modules suivants :

- Référentiel et paramétrage des collectivités : recherche, profil et classification.
- Budget : Budget primitif (BP), Budget additionnel (BA), Budget rectificatif et modifications de crédits (BR/MC).
- Compte administratif (CA) : réalisations des recettes et dépenses, équilibre, annexes et délibération.
- Gouvernance et actes : actes, sessions du conseil et suivi du contrôle de légalité.
- Ressources humaines : effectifs, statuts, rémunérations et indemnités.
- Exécution comptable : engagements, mandats, recettes, recouvrements et régies.
- Patrimoine et services : inventaire, dette, subventions, immobilisations et conventions.
- Performance : cadre logique, actions, activités, indicateurs et rapports.
- Fonctions distinctes à risque plus élevé : abonnements/paiements, espace administrateur et demandes d'actes d'état civil express.

Les libellés et références juridiques inscrits dans le prototype sont traités comme des pistes de vérification, et non comme des références officielles confirmées.

## Première migration native dans OMNIA

Le composant `components/miora/miora-workspace.tsx` fournit désormais une interface native Next.js/React pour MIORA, organisée en sous-modules :

- Profil de la CTD.
- BP : dépenses, recettes/droits, opérations d'ordre, liste de contrôle des annexes.
- BA : reports, crédits additionnels de dépenses et recettes additionnelles.
- BR/MC : ouvertures et annulations de crédits.
- CA : réalisations des recettes et des dépenses.
- Gouvernance : actes, délibérations et suivi de transmission.
- RH : effectifs et éléments de rémunération.
- Exécution : dépenses et recettes.
- Patrimoine : inventaire.
- Performance : cadre logique et indicateurs.

Les formulaires enregistrent des brouillons dans le stockage local du navigateur, par compte de connexion, avec une fonction d'export JSON. Les lignes enregistrées et les totaux affichés sont des montants de travail, pas des états comptables certifiés. Le composant n'envoie encore aucune écriture vers Supabase.

## Règles de structure budgétaire à conserver

Dans OMNIA, les dépenses du BP, BA, BR/MC et CA suivent la hiérarchie convenue :

1. Une seule rubrique « Dépenses ».
2. Programme 001 — Administration et coordination.
3. Programme 002 — Développement économique et social.
4. Chaque programme contient deux sections : Fonctionnement et Investissement.

Les programmes ne sont jamais présentés comme des sections. Cette structure convenue prévaut sur les codifications alternatives visibles dans certaines parties du prototype historique.

## Éléments volontairement non activés

Les éléments suivants ne sont pas déclarés migrés :

- La base annoncée de 1 695 communes et les données de classification : à contrôler et rapprocher d'un référentiel officiel avant import.
- Les catalogues PCOP complets, filtres par catégorie/régime et règles de calcul réglementaires.
- Les calculs complets de contrôle budgétaire, les conditions d'exécution et les validations de cohérence.
- Les modèles ministériels d'impression et la génération complète des dossiers BP, BA, BR/MC et CA. Les maquettes officielles doivent être intégrées sans altérer leur en-tête, textes, rubriques, tableaux, colonnes, ordre ni mise en page.
- Les synchronisations Supabase, les politiques d'accès, l'isolation des données et les droits par rôle.
- Les paiements, abonnements, demandes d'actes d'état civil express et opérations d'administration financière.

## Confidentialité et usage actuel

Le stockage local du navigateur n'est ni un coffre-fort ni un stockage partagé sécurisé. Il convient uniquement aux essais avec données fictives. Ne pas y saisir de données personnelles d'agents, de paie réelle, d'usagers ou de dossiers confidentiels. La gestion de données réelles attendra une persistance côté serveur, une authentification/autorisation vérifiée, des politiques RLS et des tests d'isolation.

Aucun enregistrement historique, identifiant, paiement ou dossier personnel du prototype source n'a été copié dans OMNIA.

## Étapes suivantes

1. Comparer chaque formulaire et chaque calcul de l'ancien prototype à la source documentaire et aux modèles officiels applicables.
2. Migrer les calculs du BP et du BA avec tests de non-régression, en respectant la hiérarchie budgétaire définie ci-dessus.
3. Intégrer les maquettes officielles et tester l'impression PDF.
4. Concevoir le schéma Supabase et les politiques RLS avant tout usage de données réelles.
5. Migrer les autres modules par lots, puis auditer les fonctions de paiement et d'état civil séparément avant toute décision d'activation.

## Alerte de sécurité sur le schéma Supabase historique

Le fichier `Supabase/supabase_schema.sql` du projet source a également été consulté. Il active RLS sur certaines tables, mais ses politiques autorisent des accès publics très larges : lecture et modification des abonnements, accès global aux dossiers de communes, ainsi que lecture/mise à jour de demandes d'état civil. Ces règles ne garantissent pas l'isolation des collectivités ni la confidentialité des données.

**Décision de migration : ne pas exécuter ni recopier ce schéma dans le Supabase d'OMNIA.** Il sert uniquement de référence d'audit. Avant de synchroniser les brouillons MIORA, un nouveau modèle devra être conçu avec des politiques RLS restrictives, une séparation par propriétaire/collectivité, des droits par rôle et des tests démontrant qu'un compte ne peut lire ni modifier les données d'un autre.
