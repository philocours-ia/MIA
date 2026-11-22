# MIA — Malagasy Intelligent Assistant

MIA est une assistante administrative bilingue français / malagasy, conçue pour accompagner les agents des collectivités dans la recherche documentaire, l'analyse et la préparation de projets de documents.

## Stack
- Next.js 16
- React 19
- TypeScript
- Vercel pour l'hébergement
- Supabase pour l'authentification, la base de données et la bibliothèque documentaire

## Démarrage local
1. Installer Node.js 20.9 ou plus récent.
2. Exécuter `npm install`.
3. Copier `.env.example` vers `.env.local` lorsque le projet Supabase sera configuré.
4. Exécuter `npm run dev`.
5. Ouvrir http://localhost:3000.

## Configuration
Les clés Supabase et les clés du fournisseur IA doivent rester dans les variables d'environnement. Ne jamais les committer dans GitHub. Le fichier `.env.example` ne contient que des noms de variables et des valeurs fictives.

## État du projet
La première interface de travail est en place. Les connexions Supabase et le moteur IA seront activés après la configuration du projet et des clés. Les réponses de démonstration sont signalées comme telles.
