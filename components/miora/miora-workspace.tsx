"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  wide?: boolean;
};
type Page = {
  id: string;
  group: string;
  label: string;
  title: string;
  description: string;
  fields?: Field[];
  note?: string;
};
type DraftRecord = {
  id: string;
  pageId: string;
  title: string;
  date: string;
  amount: number;
  program: string;
  section: string;
  account: string;
  details: Record<string, string>;
};
type Store = {
  records: DraftRecord[];
  checkedAnnexes: string[];
  updatedAt: string;
};
const STORAGE_VERSION = "omnia:miora:local:v1";
const ANNEXES = [
  "Tableau synthétique des droits et taxes fiscaux et parafiscaux",
  "Organigramme de la collectivité et tableau des effectifs et emplois",
  "État de la dette et tableau d’amortissement des emprunts",
  "Prévision des subventions à recevoir et à verser",
  "État des immobilisations et des amortissements",
  "Résultats du dernier Compte administratif approuvé",
  "Projets prioritaires à réaliser durant l’exercice",
  "Programme d’investissement public pluriannuel",
  "Conventions et contrats à incidence financière"
];
const PROGRAMMES = [
  "001 – Administration et coordination",
  "002 – Développement économique et social"
];
const SECTIONS = ["Fonctionnement", "Investissement"];
const PAGES: Page[] = [
  { id: "profil", group: "Référentiel", label: "Profil de la CTD", title: "Référentiel & paramétrage", description: "Identifiez la collectivité et les paramètres de travail. Les codes et catégories réglementaires devront être confrontés aux sources officielles avant activation.", fields: [
    { name: "commune", label: "Nom de la collectivité", required: true, placeholder: "Nom de la commune", wide: true },
    { name: "code", label: "Code de la collectivité", placeholder: "Code officiel à vérifier" },
    { name: "district", label: "District" }, { name: "region", label: "Région" },
    { name: "category", label: "Catégorie déclarée", placeholder: "À confirmer par le texte applicable" },
    { name: "exercise", label: "Exercice budgétaire", type: "number", required: true, placeholder: "2026" }
  ]},
  { id: "bp-depenses", group: "Budget & opérations", label: "BP · Dépenses", title: "Budget primitif — Dépenses", description: "Inscrivez les dépenses par fiche-action, compte PCOP, programme et section.", note: "Règle de structure : Dépenses → Programmes 001 et 002 → Fonctionnement / Investissement. Les programmes ne sont jamais des sections.", fields: [
    { name: "program", label: "Programme", type: "select", required: true, options: PROGRAMMES },
    { name: "section", label: "Section", type: "select", required: true, options: SECTIONS },
    { name: "action", label: "Action", required: true, placeholder: "Intitulé de l’action", wide: true },
    { name: "activity", label: "Activité", required: true, placeholder: "Activité à financer", wide: true },
    { name: "account", label: "Compte PCOP", required: true, placeholder: "Ex. : 6011" },
    { name: "financing", label: "Source de financement", placeholder: "À préciser" },
    { name: "beneficiary", label: "Bénéficiaire", placeholder: "Service / fournisseur" },
    { name: "payment", label: "Mode de paiement", type: "select", options: ["Virement", "Caisse", "Autre / à préciser"] },
    { name: "amount", label: "Montant prévisionnel (Ar)", type: "number", required: true, placeholder: "0" },
    { name: "object", label: "Objet / justification", wide: true, placeholder: "Description de la dépense" }
  ]},
  { id: "bp-recettes", group: "Budget & opérations", label: "BP · Recettes", title: "Budget primitif — Recettes & droits", description: "Préparez les lignes de recettes et de droits à examiner avant inscription au budget.", note: "Les assiettes, tarifs et taux doivent être justifiés par un texte ou une délibération en vigueur. OMNIA ne propose aucun barème réglementaire non vérifié.", fields: [
    { name: "account", label: "Compte PCOP", required: true, placeholder: "Compte de recette" },
    { name: "designation", label: "Désignation", required: true, wide: true, placeholder: "Droit, taxe, redevance, dotation…" },
    { name: "base", label: "Assiette / quantité", type: "number", placeholder: "0" },
    { name: "tariff", label: "Tarif unitaire (Ar)", type: "number", placeholder: "0" },
    { name: "rate", label: "Part / taux (%)", type: "number", placeholder: "100" },
    { name: "amount", label: "Prévision proposée (Ar)", type: "number", required: true, placeholder: "0" },
    { name: "reference", label: "Référence justificative", wide: true, placeholder: "Texte, délibération, page du manuel…" }
  ]},
  { id: "bp-operations", group: "Budget & opérations", label: "BP · Opérations d’ordre", title: "Budget primitif — Opérations d’ordre", description: "Consignez les opérations d’ordre proposées en recette ou en dépense.", fields: [
    { name: "direction", label: "Sens", type: "select", required: true, options: ["Recette d’ordre", "Dépense d’ordre"] },
    { name: "account", label: "Compte PCOP", required: true, placeholder: "Compte" },
    { name: "label", label: "Libellé de l’opération", required: true, wide: true },
    { name: "amount", label: "Montant (Ar)", type: "number", required: true, placeholder: "0" },
    { name: "reference", label: "Pièce / référence", wide: true }
  ]},
  { id: "bp-annexes", group: "Budget & opérations", label: "BP · Annexes", title: "Budget primitif — Liste de contrôle des annexes", description: "Cochez les pièces qui ont été réunies. Cette liste sert uniquement au suivi du dossier.", note: "La liste ci-dessous reprend les intitulés du prototype source. Les références juridiques et l’applicabilité de chaque annexe doivent être confirmées avant usage officiel." },
  { id: "ba-reports", group: "Budget & opérations", label: "BA · Reports", title: "Budget additionnel — Reports de l’exercice précédent", description: "Consignez les reports issus du compte administratif précédent et les pièces à vérifier.", fields: [
    { name: "sourceYear", label: "Exercice d’origine", type: "number", required: true, placeholder: "2025" },
    { name: "nature", label: "Nature du report", type: "select", required: true, options: ["Excédent", "Déficit", "Reste à réaliser en recette", "Reste à réaliser en dépense"] },
    { name: "account", label: "Compte / imputation", placeholder: "Référence" },
    { name: "amount", label: "Montant du report (Ar)", type: "number", required: true, placeholder: "0" },
    { name: "reference", label: "Référence du compte administratif / pièce", wide: true }
  ]},
  { id: "ba-depenses", group: "Budget & opérations", label: "BA · Crédits de dépense", title: "Budget additionnel — Crédits additionnels de dépense", description: "Enregistrez les crédits additionnels proposés par programme et section.", fields: [
    { name: "program", label: "Programme", type: "select", required: true, options: PROGRAMMES },
    { name: "section", label: "Section", type: "select", required: true, options: SECTIONS },
    { name: "account", label: "Compte PCOP", required: true },
    { name: "designation", label: "Désignation", required: true, wide: true },
    { name: "direction", label: "Mouvement", type: "select", required: true, options: ["Ouverture", "Annulation"] },
    { name: "amount", label: "Montant (Ar)", type: "number", required: true, placeholder: "0" },
    { name: "reference", label: "Justificatif / délibération", wide: true }
  ]},
  { id: "ba-recettes", group: "Budget & opérations", label: "BA · Recettes", title: "Budget additionnel — Recettes additionnelles", description: "Enregistrez les ajustements de recettes et leurs justificatifs.", fields: [
    { name: "account", label: "Compte PCOP", required: true },
    { name: "designation", label: "Désignation", required: true, wide: true },
    { name: "direction", label: "Mouvement", type: "select", required: true, options: ["Augmentation", "Diminution"] },
    { name: "amount", label: "Montant (Ar)", type: "number", required: true, placeholder: "0" },
    { name: "reference", label: "Référence", wide: true }
  ]},
  { id: "br-adjustments", group: "Budget & opérations", label: "BR · Ajustements", title: "Budget rectificatif & modification de crédits", description: "Consignez une ouverture ou une annulation de crédits et conservez la justification du mouvement.", note: "Le calcul des crédits disponibles, les visas et la mise en forme de l’arrêté seront migrés après vérification des règles et maquettes officielles.", fields: [
    { name: "documentType", label: "Type de document", type: "select", required: true, options: ["Budget rectificatif", "Arrêté de modification de crédits"] },
    { name: "direction", label: "Mouvement", type: "select", required: true, options: ["Ouverture", "Annulation"] },
    { name: "program", label: "Programme", type: "select", required: true, options: PROGRAMMES },
    { name: "section", label: "Section", type: "select", required: true, options: SECTIONS },
    { name: "account", label: "Compte PCOP", required: true },
    { name: "designation", label: "Désignation", required: true, wide: true },
    { name: "amount", label: "Montant du mouvement (Ar)", type: "number", required: true, placeholder: "0" },
    { name: "reference", label: "Motif / référence justificative", wide: true }
  ]},
  { id: "ca-recettes", group: "Budget & opérations", label: "CA · Recettes", title: "Compte administratif — Réalisations des recettes", description: "Saisissez les recettes réalisées et les éléments de rapprochement.", fields: [
    { name: "date", label: "Date", type: "date" },
    { name: "account", label: "Compte PCOP", required: true },
    { name: "title", label: "Titre / ordre de recette", required: true, wide: true },
    { name: "amount", label: "Montant réalisé (Ar)", type: "number", required: true, placeholder: "0" },
    { name: "recovered", label: "Montant recouvré (Ar)", type: "number", placeholder: "0" },
    { name: "reference", label: "Pièce justificative", wide: true }
  ]},
  { id: "ca-depenses", group: "Budget & opérations", label: "CA · Dépenses", title: "Compte administratif — Réalisations des dépenses", description: "Saisissez les dépenses réalisées, mandats et restes à réaliser.", fields: [
    { name: "date", label: "Date", type: "date" },
    { name: "program", label: "Programme", type: "select", required: true, options: PROGRAMMES },
    { name: "section", label: "Section", type: "select", required: true, options: SECTIONS },
    { name: "account", label: "Compte PCOP", required: true },
    { name: "mandate", label: "N° mandat / bordereau", wide: true },
    { name: "amount", label: "Montant mandaté (Ar)", type: "number", required: true, placeholder: "0" },
    { name: "rar", label: "Reste à réaliser (Ar)", type: "number", placeholder: "0" },
    { name: "reference", label: "Observation / justificatif", wide: true }
  ]},
  { id: "gov-acts", group: "Gouvernance", label: "Actes & délibérations", title: "Gouvernance — Actes et délibérations", description: "Préparez le suivi des actes, séances du conseil et délibérations. Les documents restent des projets à vérifier.", fields: [
    { name: "documentType", label: "Type d’acte", type: "select", required: true, options: ["Délibération", "Arrêté", "Convocation", "Procès-verbal", "Autre projet"] },
    { name: "title", label: "Objet", required: true, wide: true },
    { name: "number", label: "Numéro de référence (si attribué)" },
    { name: "date", label: "Date", type: "date" },
    { name: "meetingDate", label: "Date de séance", type: "date" },
    { name: "status", label: "État du dossier", type: "select", options: ["Brouillon", "À vérifier", "Soumis à validation", "Validé par l’autorité compétente"] },
    { name: "reference", label: "Base ou pièce justificative", wide: true }
  ]},
  { id: "gov-legality", group: "Gouvernance", label: "Contrôle de légalité", title: "Gouvernance — Registre de transmission", description: "Suivez la transmission des actes et leurs accusés de réception sans simuler une validation administrative.", fields: [
    { name: "actReference", label: "Référence de l’acte", required: true },
    { name: "dateTransmission", label: "Date de transmission", type: "date" },
    { name: "recipient", label: "Autorité destinataire", required: true },
    { name: "receiptDate", label: "Date de réception / accusé", type: "date" },
    { name: "status", label: "État du suivi", type: "select", options: ["À transmettre", "Transmis", "Accusé reçu", "Observation reçue", "Clôturé après vérification"] },
    { name: "reference", label: "Observations", wide: true }
  ]},
  { id: "hr-personnel", group: "RH & paie", label: "Effectifs & rémunérations", title: "Ressources humaines — Effectifs et rémunérations", description: "Suivez les postes et éléments de rémunération à l’aide de codes internes. Évitez d’inscrire des données personnelles non nécessaires.", note: "Les barèmes, cotisations et indemnités doivent être paramétrés à partir de textes officiels vérifiés. Aucun calcul de paie n’est présenté ici comme réglementaire.", fields: [
    { name: "staffCode", label: "Code interne de l’agent", required: true },
    { name: "function", label: "Fonction", required: true },
    { name: "status", label: "Statut", type: "select", options: ["Fonctionnaire", "Contractuel", "Autre / à confirmer"] },
    { name: "grade", label: "Grade / indice (si vérifié)" },
    { name: "baseSalary", label: "Base mensuelle (Ar)", type: "number", placeholder: "0" },
    { name: "allowances", label: "Indemnités saisies (Ar)", type: "number", placeholder: "0" },
    { name: "deductions", label: "Retenues saisies (Ar)", type: "number", placeholder: "0" }
  ]},
  { id: "execution-expenses", group: "Exécution comptable", label: "Dépenses · engagement / mandat", title: "Exécution — Fiche de dépenses", description: "Tracez les engagements, mandats et niveaux de prise en charge.", fields: [
    { name: "program", label: "Programme", type: "select", required: true, options: PROGRAMMES },
    { name: "section", label: "Section", type: "select", required: true, options: SECTIONS },
    { name: "account", label: "Compte PCOP", required: true },
    { name: "date", label: "Date", type: "date" },
    { name: "commitment", label: "N° engagement", required: true },
    { name: "mandate", label: "N° mandat / bordereau" },
    { name: "amount", label: "Montant engagé (Ar)", type: "number", required: true, placeholder: "0" },
    { name: "paid", label: "Montant mandaté (Ar)", type: "number", placeholder: "0" },
    { name: "status", label: "Prise en charge", type: "select", options: ["En attente", "Pris en charge", "Rejeté"] }
  ]},
  { id: "execution-revenue", group: "Exécution comptable", label: "Recettes · titres / recouvrement", title: "Exécution — Fiche de recettes", description: "Suivez les titres, ordres de recette, recouvrements et pièces justificatives.", fields: [
    { name: "account", label: "Compte PCOP", required: true },
    { name: "title", label: "N° titre / ordre de recette", required: true },
    { name: "date", label: "Date", type: "date" },
    { name: "payer", label: "Redevable / bénéficiaire", placeholder: "Libellé non nominatif si possible" },
    { name: "amount", label: "Montant émis (Ar)", type: "number", required: true, placeholder: "0" },
    { name: "recovered", label: "Montant recouvré (Ar)", type: "number", placeholder: "0" },
    { name: "status", label: "Situation", type: "select", options: ["En attente", "Partiellement recouvré", "Recouvré", "À vérifier"] }
  ]},
  { id: "assets", group: "Patrimoine", label: "Inventaire des biens", title: "Patrimoine — Inventaire", description: "Constituez un inventaire de travail des biens, immobilisations et équipements.", fields: [
    { name: "assetCode", label: "Code d’inventaire", required: true },
    { name: "title", label: "Désignation du bien", required: true, wide: true },
    { name: "category", label: "Catégorie", type: "select", options: ["Terrain", "Bâtiment", "Matériel", "Véhicule", "Équipement", "Autre"] },
    { name: "location", label: "Localisation" },
    { name: "value", label: "Valeur estimée / comptable (Ar)", type: "number", placeholder: "0" },
    { name: "condition", label: "État", type: "select", options: ["Bon", "À entretenir", "À réformer", "À expertiser"] },
    { name: "reference", label: "Pièce / justificatif", wide: true }
  ]},
  { id: "performance", group: "Performance", label: "Cadre logique & indicateurs", title: "Performance — Cadre logique", description: "Organisez les actions, activités, indicateurs, sources de vérification et risques.", fields: [
    { name: "program", label: "Programme", type: "select", required: true, options: PROGRAMMES },
    { name: "action", label: "Action", required: true, wide: true },
    { name: "activity", label: "Activité", wide: true },
    { name: "indicator", label: "Indicateur objectivement vérifiable", required: true, wide: true },
    { name: "target", label: "Cible / valeur attendue" },
    { name: "source", label: "Source de vérification" },
    { name: "risk", label: "Hypothèses / risques", wide: true }
  ]}
];
const GROUPS = [
  { id: "Référentiel", label: "Référentiel", icon: "⌂" },
  { id: "Budget & opérations", label: "Budget & opérations", icon: "▤" },
  { id: "Gouvernance", label: "Gouvernance & actes", icon: "§" },
  { id: "RH & paie", label: "RH & paie", icon: "♙" },
  { id: "Exécution comptable", label: "Exécution comptable", icon: "⇄" },
  { id: "Patrimoine", label: "Patrimoine", icon: "▧" },
  { id: "Performance", label: "Performance", icon: "↗" }
];
const EMPTY_STORE: Store = { records: [], checkedAnnexes: [], updatedAt: "" };
const money = (value: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value || 0) + " Ar";
const today = () => new Date().toISOString().slice(0, 10);

export default function MioraWorkspace({ onAsk, storageScope }: { onAsk: (prompt: string) => void; storageScope: string }) {
  const [activeGroup, setActiveGroup] = useState("Budget & opérations");
  const [activePageId, setActivePageId] = useState("bp-depenses");
  const [store, setStore] = useState<Store>(EMPTY_STORE);
  const [ready, setReady] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const page = PAGES.find((item) => item.id === activePageId) ?? PAGES[1];
  const pageList = PAGES.filter((item) => item.group === activeGroup);
  const storageKey = STORAGE_VERSION + ":" + (storageScope || "local-user").toLocaleLowerCase();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Store;
        setStore({ ...EMPTY_STORE, ...parsed, records: Array.isArray(parsed.records) ? parsed.records : [], checkedAnnexes: Array.isArray(parsed.checkedAnnexes) ? parsed.checkedAnnexes : [] });
      }
    } catch {
      setStore(EMPTY_STORE);
    } finally {
      setReady(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify({ ...store, updatedAt: new Date().toISOString() })); } catch { /* Local storage may be unavailable or full. */ }
  }, [store, ready, storageKey]);

  const recordsForPage = useMemo(() => store.records.filter((item) => item.pageId === activePageId).slice().reverse(), [store.records, activePageId]);
  const expenseTotal = store.records.filter((item) => ["bp-depenses", "ba-depenses", "br-adjustments", "ca-depenses", "execution-expenses"].includes(item.pageId)).reduce((sum, item) => sum + item.amount, 0);
  const revenueTotal = store.records.filter((item) => ["bp-recettes", "ba-recettes", "ca-recettes", "execution-revenue"].includes(item.pageId)).reduce((sum, item) => sum + item.amount, 0);

  // Tableau de travail BP isolé des mouvements BA, BR/MC, CA et de l'exécution.
  const bpExpenseRecords = store.records.filter((item) => item.pageId === "bp-depenses");
  const bpRevenueTotal = store.records.filter((item) => item.pageId === "bp-recettes").reduce((sum, item) => sum + item.amount, 0);
  const bpExpenseTotal = bpExpenseRecords.reduce((sum, item) => sum + item.amount, 0);
  const bpBalance = bpRevenueTotal - bpExpenseTotal;
  const bpBreakdown = PROGRAMMES.map((program) => {
    const programRecords = bpExpenseRecords.filter((item) => item.program === program);
    const fonctionnement = programRecords.filter((item) => item.section === "Fonctionnement").reduce((sum, item) => sum + item.amount, 0);
    const investissement = programRecords.filter((item) => item.section === "Investissement").reduce((sum, item) => sum + item.amount, 0);
    return { program, fonctionnement, investissement, total: fonctionnement + investissement };
  });
  const showBpSummary = activeGroup === "Budget & opérations" && activePageId.startsWith("bp-");

  function changeGroup(group: string) {
    setActiveGroup(group);
    const firstPage = PAGES.find((item) => item.group === group);
    if (firstPage) setActivePageId(firstPage.id);
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const details = Object.fromEntries([...formData.entries()].map(([key, value]) => [key, String(value)])) as Record<string, string>;
    const amount = Math.max(0, Number(details.amount ?? details.value ?? 0) || 0);
    const date = details.date || today();
    const title = details.action || details.designation || details.title || details.label || details.assetCode || details.staffCode || details.actReference || page.label;
    const record: DraftRecord = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
      pageId: page.id, title, date, amount,
      program: details.program || "", section: details.section || "", account: details.account || "",
      details
    };
    setStore((current) => ({ ...current, records: [...current.records, record] }));
    event.currentTarget.reset();
    setFormKey((key) => key + 1);
  }
  function deleteRecord(id: string) {
    setStore((current) => ({ ...current, records: current.records.filter((item) => item.id !== id) }));
  }
  function exportBackup() {
    const blob = new Blob([JSON.stringify({ application: "OMNIA / MIORA", version: 1, exportedAt: new Date().toISOString(), store }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "omnia-miora-brouillons.json"; link.click();
    URL.revokeObjectURL(url);
  }
  function toggleAnnex(label: string) {
    setStore((current) => ({ ...current, checkedAnnexes: current.checkedAnnexes.includes(label) ? current.checkedAnnexes.filter((item) => item !== label) : [...current.checkedAnnexes, label] }));
  }

  return <section className="miora-workspace">
    <div className="miora-workspace-header">
      <div className="miora-heading-brand"><span className="miora-brand-mark">⌂</span><div><p className="eyebrow">INTELLIGENCE SPÉCIALISÉE · COLLECTIVITÉS TERRITORIALES</p><h2>MIORA <span>Gestion communale & CTD</span></h2><p className="miora-subline">L’espace métier reprend progressivement l’organisation fonctionnelle du prototype historique.</p></div></div>
      <button className="miora-export-button" type="button" onClick={exportBackup}>Exporter les brouillons ↓</button>
    </div>
    <div className="miora-status-strip"><span className="miora-status-dot"/><strong>{ready ? "Espace local prêt" : "Chargement des brouillons…"}</strong><span>Enregistrement automatique sur cet appareil</span><span className="miora-status-separator">•</span><span>{store.records.length} saisie(s)</span></div>
    <div className="miora-summary-grid">
      <div className="miora-summary-card"><small>Écritures de travail</small><strong>{store.records.length}</strong><span>dans tous les modules</span></div>
      <div className="miora-summary-card"><small>Total des dépenses saisies</small><strong>{money(expenseTotal)}</strong><span>montants de brouillon cumulés</span></div>
      <div className="miora-summary-card"><small>Total des recettes saisies</small><strong>{money(revenueTotal)}</strong><span>montants de brouillon cumulés</span></div>
      <div className="miora-summary-card"><small>Annexes BP cochées</small><strong>{store.checkedAnnexes.length}/9</strong><span>suivi de préparation</span></div>
    </div>
    {showBpSummary && <section className="miora-bp-summary">
      <div className="miora-bp-summary-heading"><div><p className="eyebrow">BUDGET PRIMITIF · ÉCRITURES SAISIES</p><h3>Répartition des dépenses par programme et section</h3></div><span>Sommes calculées à partir des brouillons BP uniquement</span></div>
      <div className="miora-bp-kpis">
        <div><small>Total dépenses BP</small><strong>{money(bpExpenseTotal)}</strong></div>
        <div><small>Total recettes BP</small><strong>{money(bpRevenueTotal)}</strong></div>
        <div><small>Écart indicatif recettes − dépenses</small><strong className={bpBalance < 0 ? "negative" : "positive"}>{money(bpBalance)}</strong></div>
      </div>
      <div className="miora-table-wrap"><table className="miora-record-table miora-bp-table"><thead><tr><th>Programme</th><th className="numeric">Fonctionnement</th><th className="numeric">Investissement</th><th className="numeric">Total</th></tr></thead><tbody>
        {bpBreakdown.map((row) => <tr key={row.program}><td><strong>{row.program}</strong></td><td className="numeric">{money(row.fonctionnement)}</td><td className="numeric">{money(row.investissement)}</td><td className="numeric"><strong>{money(row.total)}</strong></td></tr>)}
        <tr className="miora-bp-total-row"><td><strong>TOTAL DÉPENSES</strong></td><td className="numeric">{money(bpBreakdown.reduce((sum,row)=>sum+row.fonctionnement,0))}</td><td className="numeric">{money(bpBreakdown.reduce((sum,row)=>sum+row.investissement,0))}</td><td className="numeric"><strong>{money(bpExpenseTotal)}</strong></td></tr>
      </tbody></table></div>
      <p className="miora-bp-disclaimer">Cet aperçu ne constitue ni un tableau budgétaire officiel ni un contrôle de conformité. Il n'intègre pas encore les crédits BA, BR/MC, les opérations d'ordre, les reports et les règles réglementaires.</p>
    </section>}
    <div className="miora-module-layout">
      <nav className="miora-module-nav" aria-label="Modules MIORA">
        <p className="miora-nav-caption">MODULES MÉTIER</p>
        {GROUPS.map((group) => <button key={group.id} type="button" className={activeGroup === group.id ? "miora-nav-item active" : "miora-nav-item"} onClick={() => changeGroup(group.id)}><span>{group.icon}</span><strong>{group.label}</strong><small>{PAGES.filter((item) => item.group === group.id).length} espace(s)</small></button>)}
        <div className="miora-nav-note"><strong>Mode brouillon local</strong><p>Les saisies restent sur cet appareil et ne sont pas chiffrées ni synchronisées. Utilisez uniquement des données fictives : aucune donnée réelle de paie, d'usager ou de dossier confidentiel.</p></div>
      </nav>
      <div className="miora-module-content">
        <div className="miora-page-tabs" role="tablist" aria-label="Sous-modules">
          {pageList.map((item) => <button type="button" role="tab" aria-selected={activePageId === item.id} key={item.id} className={activePageId === item.id ? "miora-page-tab active" : "miora-page-tab"} onClick={() => { setActivePageId(item.id); setFormKey((key) => key + 1); }}>{item.label}</button>)}
        </div>
        <div className="miora-page-heading"><div><p className="eyebrow">{page.group.toLocaleUpperCase("fr")}</p><h3>{page.title}</h3><p>{page.description}</p></div><button type="button" className="miora-assist-button" onClick={() => onAsk(`MIORA, accompagne-moi sur « ${page.title} ». Présente les étapes de travail, les informations à réunir et les vérifications réglementaires nécessaires. N'invente aucune règle officielle.`)}>Demander l’aide de MIORA ↗</button></div>
        {page.note && <div className="miora-guidance"><span>ⓘ</span><p>{page.note}</p></div>}
        {page.id === "bp-annexes" ? <div className="miora-annex-list">{ANNEXES.map((annex, index) => <label key={annex} className="miora-annex-item"><input type="checkbox" checked={store.checkedAnnexes.includes(annex)} onChange={() => toggleAnnex(annex)}/><span className="miora-annex-number">{index + 1}</span><span>{annex}</span><small>{store.checkedAnnexes.includes(annex) ? "Réunie" : "À réunir"}</small></label>)}</div> : <form key={page.id + formKey} className="miora-entry-form" onSubmit={handleSubmit}>
          <div className="miora-form-heading"><strong>Nouvelle saisie de travail</strong><span>Les champs marqués d’un * sont requis</span></div>
          <div className="miora-fields-grid">{(page.fields ?? []).map((field) => <div key={field.name} className={field.wide ? "miora-field wide" : "miora-field"}><label htmlFor={page.id + "-" + field.name}>{field.label}{field.required ? " *" : ""}</label>{field.type === "select" ? <select id={page.id + "-" + field.name} name={field.name} required={field.required} defaultValue={field.options?.[0] ?? ""}><option value="" disabled>Choisir…</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input id={page.id + "-" + field.name} name={field.name} type={field.type ?? "text"} required={field.required} placeholder={field.placeholder} min={field.type === "number" ? "0" : undefined} step={field.type === "number" ? "0.01" : undefined} defaultValue={field.name === "date" ? today() : field.name === "exercise" ? new Date().getFullYear() : undefined}/> }</div>)}</div>
          <div className="miora-form-footer"><span>Enregistrement de brouillon · non validé officiellement</span><button type="submit">Enregistrer la saisie</button></div>
        </form>}
        <div className="miora-records-panel"><div className="miora-records-heading"><div><p className="eyebrow">REGISTRE DE TRAVAIL</p><h4>{page.id === "bp-annexes" ? "État des annexes" : "Saisies enregistrées"}</h4></div><span>{page.id === "bp-annexes" ? store.checkedAnnexes.length + " / 9" : recordsForPage.length + " ligne(s)"}</span></div>
          {page.id === "bp-annexes" ? <div className="miora-annex-progress"><div><span style={{ width: (store.checkedAnnexes.length / ANNEXES.length * 100) + "%" }}/></div><small>{store.checkedAnnexes.length} annexe(s) cochée(s). La présence et la conformité des pièces restent à vérifier.</small></div> : recordsForPage.length === 0 ? <div className="miora-empty-records"><span>▤</span><strong>Aucune saisie pour ce sous-module.</strong><p>Les nouvelles lignes apparaîtront ici après leur enregistrement.</p></div> : <div className="miora-table-wrap"><table className="miora-record-table"><thead><tr><th>Date</th><th>Libellé</th><th>Programme</th><th>Section</th><th>Compte</th><th className="numeric">Montant</th><th>Action</th></tr></thead><tbody>{recordsForPage.map((record) => <tr key={record.id}><td>{record.date || "—"}</td><td><strong>{record.title}</strong><small>{record.details.reference || record.details.object || record.details.activity || ""}</small></td><td>{record.program || "—"}</td><td>{record.section || "—"}</td><td>{record.account || "—"}</td><td className="numeric">{record.amount ? money(record.amount) : "—"}</td><td><button type="button" className="miora-delete-button" onClick={() => deleteRecord(record.id)} aria-label={"Supprimer " + record.title}>Supprimer</button></td></tr>)}</tbody></table></div>}
        </div>
      </div>
    </div>
    <div className="miora-migration-footnote"><strong>Migration maîtrisée de MIORA.</strong> Cette première version porte les parcours d’écran, les formulaires de saisie de travail et les brouillons locaux. Les calculs normatifs, données officielles des 1 695 communes, maquettes ministérielles et échanges Supabase seront réintégrés après contrôle des sources et tests de non-régression.</div>
  </section>;
}
