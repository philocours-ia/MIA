# Configuration Supabase de MIA

## Projet
- Nom : MIA
- Région indiquée par Supabase : `eu-central-1`
- État : `ACTIVE_HEALTHY`
- Hébergement : offre Free au moment de la création

## URL d'authentification à autoriser

Dans Supabase Dashboard → Authentication → URL Configuration :

**Site URL**
`https://mia-assistant-julio7271-4573.vercel.app`

**Redirect URLs**
`https://mia-assistant-julio7271-4573.vercel.app/auth/callback`
`http://localhost:3000/auth/callback`

Cette autorisation est nécessaire pour que les liens de confirmation e-mail reviennent vers MIA. En production, configurer un fournisseur SMTP fiable si les e-mails de confirmation doivent être envoyés à grande échelle.

## Variables Vercel
Les deux variables suivantes sont déjà présentes dans les environnements Production, Preview et Development :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

La clé publishable est prévue pour un usage public et ne remplace jamais une politique RLS. Ne jamais placer de clé `service_role` ou de clé `sb_secret_...` dans une variable `NEXT_PUBLIC_...`.

## Base de données
Le schéma initial est dans `supabase/schema.sql`.

| Table | Usage |
| --- | --- |
| `profiles` | Profil et langue préférée |
| `conversations` | Conversations privées |
| `messages` | Messages d'une conversation |
| `documents` | Métadonnées de documents et classification |
| `drafts` | Projets de documents administratifs |
| `activity_logs` | Journal d'activité, en ajout uniquement côté utilisateur |

Toutes les tables ci-dessus ont RLS activé. Les politiques limitent les lignes à `auth.uid()`. Les messages envoyés par un utilisateur sont autorisés avec le rôle `user`; les réponses IA devront être enregistrées par une fonction serveur fiable.

## Stockage privé
Bucket : `mia-documents`
- public : non
- taille maximale par fichier : 20 Mio
- formats acceptés : PDF, PNG, JPEG, DOCX, DOC et TXT
- chemin attendu : `<auth.uid()>/<nom-ou-identifiant-du-fichier>`
- politiques Storage : lecture, ajout, modification et suppression limitées au dossier de l'utilisateur connecté

## Séparation des connaissances
Le champ `knowledge_layer` distingue :
- `legal_official` : textes officiels ;
- `municipal_practice` : modèles et pratiques communales ;
- `general_reference` : documentation complémentaire.

Le champ `verification_status` commence à `pending_review`. Le statut de validation et les champs de révision ne sont pas modifiables par les utilisateurs ordinaires. Un document fourni comme modèle communal ne devient pas automatiquement une référence juridique.

## Limites fonctionnelles actuelles
- L'authentification par e-mail et mot de passe est préparée dans l'application.
- Les droits multi-communes et les rôles d'administrateur ne sont pas encore configurés.
- Le moteur IA n'est pas encore connecté.
- Aucun numéro officiel d'acte, visa, validation ou signature n'est généré automatiquement.
