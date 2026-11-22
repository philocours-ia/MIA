# MIA — Malagasy Intelligent Assistant

MIA est une assistante administrative bilingue français / malagasy, conçue pour accompagner les agents des collectivités dans la recherche documentaire, l'analyse et la préparation de projets de documents.

## Stack
- Next.js 16, React 19 et TypeScript
- Vercel pour l'hébergement
- Supabase pour l'authentification, PostgreSQL et le stockage privé
- Architecture préparée pour connecter ultérieurement un fournisseur IA et un système RAG documentaire

## Démarrage local
1. Installer Node.js 22.
2. Exécuter `npm install`.
3. Copier `.env.example` vers `.env.local` et renseigner les variables Supabase.
4. Exécuter `npm run dev`.
5. Ouvrir http://localhost:3000.

## Configuration Supabase
Le schéma initial est documenté dans `supabase/schema.sql`. Le projet comporte notamment :
- profils et préférences linguistiques ;
- conversations et messages ;
- documents de référence et métadonnées ;
- brouillons administratifs ;
- journal d'activité ;
- stockage privé `mia-documents`.

Les tables exposées sont protégées par Row Level Security (RLS). Les documents et conversations appartiennent à leur utilisateur. Le statut de vérification des sources ne peut pas être déclaré « validé » par un simple utilisateur.

Voir `docs/SUPABASE_CONFIG.md` pour la configuration des URL d'authentification.

## Sécurité
- Ne jamais committer de mots de passe, clés secrètes, clés de service ou documents administratifs.
- Seule la clé publishable Supabase peut être utilisée côté navigateur, avec RLS activé.
- Les documents importés restent privés.
- MIA prépare des brouillons : la vérification, l'authentification et la signature d'un acte restent réservées au personnel habilité.

## État du projet
La première interface, les comptes utilisateurs et le socle de données Supabase sont en place. Le moteur IA, l'indexation documentaire et les outils spécialisés seront raccordés dans les étapes suivantes.
