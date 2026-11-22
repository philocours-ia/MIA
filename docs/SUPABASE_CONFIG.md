# Configuration Supabase de MIA

## Projet
- Nom : MIA
- Région indiquée par Supabase : `eu-central-1`
- État : `ACTIVE_HEALTHY`
- Hébergement : offre Free au moment de la création

## URL d'authentification à autoriser

Dans Supabase Dashboard → Authentication → URL Configuration :

**Site URL**
`https://mia-assistant-phi.vercel.app`

**Redirect URLs**
`https://mia-assistant-phi.vercel.app/auth/callback`

Ajouter uniquement pour les essais locaux, si nécessaire :
`http://localhost:3000/auth/callback`

L'application en production utilise désormais `NEXT_PUBLIC_APP_URL` pour construire le lien de confirmation et le callback. Le code ne reprend plus l'origine du navigateur, qui pouvait être `localhost`. Dans Authentication → Email Templates → Confirm signup, conserver le lien de confirmation Supabase `{{ .ConfirmationURL }}` plutôt qu'une adresse locale codée en dur. La variable `NEXT_PUBLIC_APP_URL` est déjà configurée dans Vercel pour Production, Preview et Development. Après modification de la configuration Supabase, les nouveaux e-mails de confirmation doivent revenir sur le domaine MIA. En production, configurer un fournisseur SMTP fiable si les e-mails doivent être envoyés à grande échelle.

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
| `knowledge_sources` | Catalogue partagé des lois, décrets et manuels |
| `knowledge_chunks` | Extraits structurés et indexés pour la recherche documentaire |

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
- Les rôles `owner`, `admin`, `editor` et `user` sont définis; l'interface de gestion des comptes reste à construire.
- La bibliothèque documentaire partagée est configurée; le moteur de réponse IA n'est pas encore connecté à cette bibliothèque.
- Aucun numéro officiel d'acte, visa, validation ou signature n'est généré automatiquement.
