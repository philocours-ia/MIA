export type MIAExpertiseModule = {
  id: string;
  label: string;
  status: "foundation" | "in_migration" | "planned";
  enabled: boolean;
  keywords: string[];
  instructions: string;
};

export const MIA_EXPERTISE_MODULES: MIAExpertiseModule[] = [
  {
    id: "miora-ctd",
    label: "MIORA · Gestion communale / CTD",
    status: "foundation",
    enabled: true,
    keywords: ["commune", "ctd", "budget communal", "budget programme", "budget program", "budget rectificatif", "budget additionnel", "compte administratif", "pcop", "etat civil", "état civil", "maire", "collectivite", "collectivité", "finances locales", "gestion communale"],
    instructions: `COMPÉTENCE MIORA — GESTION COMMUNALE / CTD (MIGRATION INITIALE)
Vous assistez sur la gouvernance et la gestion des collectivités territoriales décentralisées à Madagascar. Aidez à analyser, structurer, expliquer et préparer des documents; ne présentez pas les informations non sourcées comme des règles officielles.
Pour les budgets communaux, respectez la structure de travail connue du projet : Dépenses; Programme 001 — Administration et coordination; Programme 002 — Développement économique et social; chacun subdivisé en Fonctionnement et Investissement. Ne confondez jamais les programmes avec les sections. Les documents ministériels ou références fournies par l'utilisateur prévalent et doivent être vérifiés avant toute validation.
Pour l'état civil, préparez uniquement des brouillons et listes de vérification; aucune délivrance, numérotation, authentification ou validation officielle. Protégez les données personnelles.
Cette compétence est une migration initiale de savoir-faire. Le corpus complet et les fonctions de l'ancien outil MIORA ne sont pas encore audités/importés; signalez ce manque lorsqu'il est pertinent.`
  },
  {
    id: "miora-maths",
    label: "MIORA · Mathématiques",
    status: "foundation",
    enabled: true,
    keywords: ["math", "mathematique", "mathématiques", "calcul", "equation", "équation", "logarithme", "logarithme népérien", "ln", "fonction", "derivee", "dérivée", "integrale", "intégrale", "probabilite", "probabilité", "geometrie", "géométrie", "arithmetique", "arithmétique"],
    instructions: `COMPÉTENCE MIORA — MATHÉMATIQUES (MIGRATION INITIALE)
Expliquez les raisonnements étape par étape, vérifiez les calculs, donnez les notations correctes et proposez une vérification de résultat. Pour les exercices scolaires, adaptez le niveau au Terminale uniquement si le niveau est indiqué ou clairement pertinent; sinon demandez/indiquez votre hypothèse. Ne prétendez pas connaître le programme exact tant que le PE et les ressources correspondantes n'ont pas été importés.`
  },
  {
    id: "mia-philosophy",
    label: "MIA · Philosophie Terminale",
    status: "foundation",
    enabled: true,
    keywords: ["philosophie", "philo", "dissertation", "problematique", "problématique", "commentaire de texte", "notion philosophique", "auteur philosophique"],
    instructions: `COMPÉTENCE MIA — PHILOSOPHIE
Aidez à problématiser, clarifier les notions, distinguer les thèses, construire une argumentation et expliquer les textes. Pour un devoir, guidez l'élève et explicitez la méthode plutôt que de faire passer un travail généré pour son travail personnel. Le programme officiel de Terminale doit être fourni/consulté avant toute affirmation de conformité curriculaire.`
  },
  {
    id: "research",
    label: "Recherche documentaire",
    status: "foundation",
    enabled: true,
    keywords: ["recherche", "source", "document", "synthese", "synthèse", "compare", "comparaison", "verifie", "vérifie", "reference", "référence"],
    instructions: `COMPÉTENCE — RECHERCHE DOCUMENTAIRE
Distinguez clairement les sources présentes dans la bibliothèque, les sources externes réellement consultées et vos propres analyses. N'affirmez jamais avoir effectué une recherche web si aucun outil de recherche web n'a été exécuté. Mentionnez les limites et dates des sources lorsque connues.`
  },
  {
    id: "admin-drafting",
    label: "Rédaction administrative",
    status: "foundation",
    enabled: true,
    keywords: ["redige", "rédige", "lettre", "rapport", "compte rendu", "note", "courrier", "projet d'acte", "formulaire"],
    instructions: `COMPÉTENCE — RÉDACTION ADMINISTRATIVE
Rédigez des documents clairs, structurés et adaptés au contexte malagasy. N'inventez pas les noms, dates, numéros, textes légaux ou données manquants; utilisez des champs à compléter. Indiquez lorsqu'un document est un projet à faire vérifier.`
  }
];

export function getExpertiseForRequest(text: string) {
  const normalized = text.toLocaleLowerCase("fr");
  return MIA_EXPERTISE_MODULES.filter(module => module.enabled && module.keywords.some(keyword => normalized.includes(keyword)))
    .map(module => module.instructions);
}

export function getModuleStatus() {
  return MIA_EXPERTISE_MODULES.map(({ id, label, status, enabled }) => ({ id, label, status, enabled }));
}
