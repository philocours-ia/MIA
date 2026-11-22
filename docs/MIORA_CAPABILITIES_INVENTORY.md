# Inventaire des compétences MIORA — première extraction

**Source analysée :** `philocours-ia/Gestion-Communale2`, fichier `gestion_communale_madagascar_ctd_classification_base_de_donn_es_2.html` (≈1,14 Mo; prototype HTML autonome).  
**Titre de la source :** Gestion Communale Madagascar (CTD) — Classification & Base de Données.  
**Extraction :** inventaire des titres et interfaces; cela ne constitue pas une validation juridique ou fonctionnelle.

## Compétences recensées

### 1. Référentiel CTD
- Référentiel et classification des communes, sélection/configuration de commune.
- Recherche et filtre par nom, district, code SOA, catégorie, province, région et district.
- Profil de commune, données de population, superficie, voirie, EPP, conseillers, ordonnateurs et comptables.
- Gestion de plusieurs communes, progression comptable, import/export et sauvegarde de dossier.

### 2. Budget Primitif (BP)
- Inscription des dépenses par fiches-action et activités.
- Imputation PCOP CTD, source de financement, bénéficiaire, NIF/STAT, montant, mode de paiement, objet et justificatifs.
- Aperçus des documents de dépense alimentés; ventilation et vérification PCOP.
- Recettes, droits et taxes, tableau synthétique, configuration de barèmes.
- Titres/ordres de recette, bordereaux et quittances.
- Opérations d'ordre en recettes et dépenses.
- Délibération BP (Modèle 3) et dossier documentaire.
- Tableaux de dépenses par programme et tableaux des recettes.

### 3. Annexes, performance et cadre logique
- Annexes obligatoires du projet de BP.
- Conditions d'exécutoire et dépenses obligatoires.
- Cadre logique d'intervention.
- Regroupement, reformulation et élaboration d'actions/activités.
- Document de performance annexé au BP et rapport de performance.

### 4. Budget Additionnel (BA)
- Reports du compte administratif antérieur.
- Crédits additionnels et recettes additionnelles.
- Tableaux par programme, annexes, délibération (Modèle 5).
- Gestion des données de commune, effectifs, dette, subventions, immobilisations/amortissements, projets prioritaires, conventions/contrats à incidence financière.

### 5. Budget Rectificatif (BR) et modification de crédits
- Budget rectificatif (Modèle 6).
- Arrêté de modification de crédit (Modèle 7).
- Ouverture et annulation de crédits, ajustements et pièces de contrôle.

### 6. Compte Administratif (CA)
- Réalisations des recettes (titres et recouvrements).
- Réalisations des dépenses (mandats admis et restes à réaliser).
- Évaluation du document de performance.
- Tableau d'équilibre du CA (Modèle 29).
- Tableaux de recettes et dépenses, délibération (Modèle 30) et annexes.
- Engagements non ordonnancés et ordres de recettes non recouvrés.

### 7. Réglementation et classification
- Simulateur de seuils et comparaison des régimes CR1, CR2 et CU.
- Références réglementaires présentées dans le prototype : décret 2015-959, arrêté 6394-2013, décret 2018-162, arrêté 7275/2016/MFB et manuel DGFAG.
- Les titres/références sont uniquement des pistes : vérifier le texte complet, la version en vigueur et son champ d'application avant d'en tirer une règle.

### 8. Gouvernance et actes
- Paramétrage de documents administratifs.
- Registre des actes et suivi du contrôle de légalité.
- Transmission et pièces de contrôle.

### 9. Ressources humaines, paie et indemnités
- Tableau des effectifs et rémunérations par programme.
- Indemnités des élus, compte 6032 et annexes.
- Statuts et cotisations sociales.
- État récapitulatif de décompte de solde.
- Fiche de paie individuelle.

### 10. Patrimoine et services
- Dette de la CTD.
- Subventions à recevoir/verser.
- Immobilisations et amortissements.
- Conventions et contrats à incidence financière.
- Projets prioritaires et informations de service.

### 11. État civil
- Demande d'acte express (naissance, mariage, décès, adoption) avec commune, demandeur, références d'acte, documents et preuve de paiement.
- Ce flux historique ne doit pas être activé dans MIA sans décision explicite, audit de sécurité, conformité, gestion des données personnelles et validation par autorités habilitées. MIA peut seulement préparer des brouillons ou listes de vérification.

## Règles de migration

1. **Connaissances :** convertir les contenus documentés en fiches de connaissances, puis les indexer dans la bibliothèque MIA avec titre, source, date, statut de vérification, domaine et avertissements.
2. **Fonctionnalités :** migrer séparément chaque outil interactif; ne pas intégrer le HTML source entier comme code actif dans l'espace MIA.
3. **Références juridiques :** valider les textes complets et leur actualité. Le prototype peut contenir des références ou paramètres incomplets.
4. **Calculs :** créer des tests d'entrée/sortie de référence, particulièrement pour BP, BA, BR/MC, CA et PCOP.
5. **Documents :** comparer les formats générés aux modèles officiels originaux; ne pas reformater les modèles réglementaires sans autorisation.
6. **Données :** aucun transfert de données personnelles, identifiants, paiements ou dossiers utilisateurs dans cette première migration.
7. **État actuel :** les compétences contextuelles initiales sont disponibles dans MIA, mais le corpus n'est pas encore indexé dans Supabase et les outils interactifs ne sont pas encore portés. Statut : **migration initiale / non certifiée**.
