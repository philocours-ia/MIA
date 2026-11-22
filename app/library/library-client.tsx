"use client";

import { useMemo, useState } from "react";

type Source = {
  id: string;
  title: string;
  source_type: string;
  reference_number: string | null;
  published_on: string | null;
  issuing_authority: string;
  official_url: string;
  source_portal: string | null;
  applicability: string | null;
  verification_status: string;
  caution: string | null;
};

type Chunk = {
  id: string;
  source_id: string;
  chunk_index: number;
  topic: string;
  content: string;
  article_refs: string[];
  page_refs: string | null;
  tags: string[];
  language: string;
};

const labels: Record<string, string> = {
  law: "Loi",
  decree: "Décret",
  manual: "Manuel",
  accounting_reference: "Référence comptable",
  official_reference: "Référence officielle",
  amended: "Texte modifié",
  scope_limited: "Champ limité",
  historical_reference: "Référence historique",
  needs_review: "À vérifier / diffusion en attente"
};

const palette: Record<string, { background: string; color: string }> = {
  law: { background: "#eaf2ed", color: "#285b45" },
  decree: { background: "#edf0f8", color: "#475b8e" },
  manual: { background: "#f8f0e5", color: "#8a612e" },
  accounting_reference: { background: "#f1edf8", color: "#6b4c8e" }
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e9e3",
  borderRadius: "18px",
  padding: "22px",
  boxShadow: "0 8px 24px rgba(25, 48, 36, .04)"
};

export default function LibraryClient({
  userEmail,
  sources,
  chunks
}: {
  userEmail: string;
  sources: Source[];
  chunks: Chunk[];
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [expanded, setExpanded] = useState<string[]>([]);

  const bySource = useMemo(() => {
    const result: Record<string, Chunk[]> = {};
    for (const chunk of chunks) {
      (result[chunk.source_id] ||= []).push(chunk);
    }
    return result;
  }, [chunks]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("fr");
    return sources.filter((source) => {
      if (type !== "all" && source.source_type !== type) return false;
      if (!needle) return true;
      const sourceText = [
        source.title,
        source.reference_number,
        source.issuing_authority,
        source.applicability,
        source.caution,
        ...(bySource[source.id] || []).flatMap((chunk) => [
          chunk.topic,
          chunk.content,
          chunk.article_refs.join(" "),
          chunk.tags.join(" ")
        ])
      ].filter(Boolean).join(" ").toLocaleLowerCase("fr");
      return sourceText.includes(needle);
    });
  }, [sources, type, query, bySource]);

  const counts = useMemo(() => ({
    all: sources.length,
    law: sources.filter((s) => s.source_type === "law").length,
    decree: sources.filter((s) => s.source_type === "decree").length,
    manual: sources.filter((s) => s.source_type === "manual").length,
    accounting_reference: sources.filter((s) => s.source_type === "accounting_reference").length
  }), [sources]);

  function toggle(id: string) {
    setExpanded((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f5f7f4", color: "#1d3027", padding: "28px clamp(18px, 4vw, 58px) 56px" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "30px" }}>
          <a href="/workspace" style={{ color: "#2c624a", background: "#e7efe9", borderRadius: "999px", padding: "11px 16px", textDecoration: "none", fontWeight: 700 }}>← Retour à MIA</a>
          <div style={{ color: "#6b7970", fontSize: "13px" }}>Bibliothèque partagée · Connecté : {userEmail}</div>
        </header>

        <section style={{ ...cardStyle, background: "linear-gradient(120deg, #183d31, #2b644d)", color: "white", border: 0, padding: "clamp(24px, 4vw, 38px)", marginBottom: "22px" }}>
          <div style={{ fontSize: "12px", letterSpacing: ".16em", color: "#cfe0d4", fontWeight: 750 }}>MIA · CONNAISSANCES DOCUMENTAIRES</div>
          <h1 style={{ fontSize: "clamp(30px, 4vw, 42px)", lineHeight: 1.1, margin: "12px 0" }}>Bibliothèque juridique et administrative</h1>
          <p style={{ maxWidth: "760px", color: "#e1ebe4", lineHeight: 1.7, margin: 0 }}>
            Lois, décrets, manuels et références comptables concernant les collectivités malagasy. Chaque notice distingue sa valeur juridique, son champ d’application et les réserves à vérifier.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "22px" }}>
            {[
              ["Textes législatifs", counts.law],
              ["Décrets", counts.decree],
              ["Manuels", counts.manual],
              ["Comptabilité", counts.accounting_reference]
            ].map(([label, count]) => (
              <div key={String(label)} style={{ background: "rgba(255,255,255,.11)", border: "1px solid rgba(255,255,255,.18)", borderRadius: "12px", padding: "10px 14px" }}>
                <strong style={{ fontSize: "20px", marginRight: "8px" }}>{count}</strong>
                <span style={{ fontSize: "12px", color: "#e2ebe5" }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: "22px" }}>
          <label htmlFor="library-search" style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Rechercher dans les textes et les procédures</label>
          <input
            id="library-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex. état civil, indemnité, ordonnance de recette, article 17…"
            style={{ width: "100%", padding: "14px 16px", border: "1px solid #dce3dc", borderRadius: "12px", font: "inherit", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "14px" }}>
            {[
              ["all", "Tout", counts.all],
              ["law", "Lois", counts.law],
              ["decree", "Décrets", counts.decree],
              ["manual", "Manuels", counts.manual],
              ["accounting_reference", "Comptabilité", counts.accounting_reference]
            ].map(([value, label, count]) => (
              <button
                type="button"
                key={String(value)}
                onClick={() => setType(String(value))}
                aria-pressed={type === value}
                style={{
                  border: type === value ? "1px solid #286348" : "1px solid #e0e5df",
                  color: type === value ? "#ffffff" : "#43544a",
                  background: type === value ? "#286348" : "#ffffff",
                  borderRadius: "999px",
                  padding: "9px 14px",
                  fontWeight: 650,
                  cursor: "pointer"
                }}
              >{label} · {count}</button>
            ))}
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", gap: "12px", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: "22px" }}>Références disponibles</h2>
          <span style={{ color: "#708077", fontSize: "13px" }}>{filtered.length} résultat(s) · {chunks.length} extraits indexés</span>
        </div>

        {filtered.length === 0 ? (
          <section style={cardStyle}>
            <strong>Aucune référence ne correspond à cette recherche.</strong>
            <p style={{ color: "#6b7970", marginBottom: 0 }}>Essayez un autre mot-clé ou sélectionnez une autre catégorie.</p>
          </section>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: "16px" }}>
            {filtered.map((source) => {
              const sourceChunks = bySource[source.id] || [];
              const isExpanded = expanded.includes(source.id);
              const kind = palette[source.source_type] || palette.manual;
              return (
                <article key={source.id} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ background: kind.background, color: kind.color, fontSize: "11px", fontWeight: 800, letterSpacing: ".07em", padding: "7px 10px", borderRadius: "999px" }}>{labels[source.source_type] || source.source_type}</span>
                    <span style={{ color: "#7b776d", background: "#f4f3ef", fontSize: "11px", fontWeight: 700, padding: "7px 10px", borderRadius: "999px" }}>{labels[source.verification_status] || source.verification_status}</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "19px", lineHeight: 1.35, margin: "2px 0 8px" }}>{source.title}</h3>
                    <p style={{ color: "#647269", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>{source.reference_number || "Référence non précisée"}{source.published_on ? " · " + new Date(source.published_on + "T00:00:00").toLocaleDateString("fr-FR") : ""}</p>
                  </div>
                  <div style={{ color: "#46584d", fontSize: "13px", lineHeight: 1.6 }}>
                    <strong>Autorité :</strong> {source.issuing_authority}
                  </div>
                  {source.applicability && <p style={{ color: "#46584d", fontSize: "13px", lineHeight: 1.65, margin: 0 }}><strong>Champ :</strong> {source.applicability}</p>}
                  {sourceChunks.length > 0 && (
                    <div style={{ background: "#f6f8f5", borderRadius: "12px", padding: "13px 14px" }}>
                      <div style={{ color: "#55705f", fontSize: "11px", letterSpacing: ".08em", fontWeight: 800, marginBottom: "7px" }}>CONNAISSANCES INDEXÉES</div>
                      {sourceChunks.slice(0, isExpanded ? 12 : 2).map((chunk) => (
                        <div key={chunk.id} style={{ marginTop: "10px" }}>
                          <strong style={{ fontSize: "13px" }}>{chunk.topic}</strong>
                          <p style={{ margin: "4px 0 0", color: "#5d6a61", fontSize: "12px", lineHeight: 1.65 }}>{chunk.content.length > 520 ? chunk.content.slice(0, 520) + "…" : chunk.content}</p>
                          {(chunk.article_refs.length > 0 || chunk.page_refs) && <small style={{ color: "#758078", display: "block", marginTop: "4px" }}>{chunk.article_refs.length ? "Articles " + chunk.article_refs.join(", ") : ""}{chunk.page_refs ? " · " + chunk.page_refs : ""}</small>}
                        </div>
                      ))}
                      {sourceChunks.length > 2 && (
                        <button type="button" onClick={() => toggle(source.id)} style={{ marginTop: "12px", padding: 0, border: 0, background: "transparent", color: "#286348", fontWeight: 750, cursor: "pointer" }}>
                          {isExpanded ? "Réduire les extraits" : "Voir les extraits indexés (" + sourceChunks.length + ")"} ↓
                        </button>
                      )}
                    </div>
                  )}
                  {source.caution && <div style={{ background: "#fff7e9", borderLeft: "3px solid #d4a14c", padding: "10px 12px", borderRadius: "0 10px 10px 0", color: "#71572c", fontSize: "12px", lineHeight: 1.6 }}>{source.caution}</div>}
                  <div style={{ marginTop: "auto", display: "flex", flexWrap: "wrap", gap: "10px", paddingTop: "4px" }}>
                    <a href={source.official_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#ffffff", background: "#285f47", borderRadius: "10px", padding: "10px 14px", textDecoration: "none", fontWeight: 700, fontSize: "13px" }}>Ouvrir le texte / manuel ↗</a>
                    {source.source_portal && <a href={source.source_portal} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", color: "#37634d", background: "#edf3ee", borderRadius: "10px", padding: "10px 14px", textDecoration: "none", fontWeight: 700, fontSize: "13px" }}>Portail officiel</a>}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <section style={{ ...cardStyle, marginTop: "22px", background: "#eef3ef" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "17px" }}>Règle de lecture de MIA</h3>
          <p style={{ color: "#56645b", lineHeight: 1.7, margin: 0, fontSize: "13px" }}>
            Un texte officiel prime sur un manuel de procédure. Un manuel sert de guide et peut devenir obsolète lorsque le droit évolue. Les modèles communaux et les habitudes locales sont conservés séparément et ne deviennent jamais une règle de droit par eux-mêmes.
          </p>
          <p style={{ color: "#56645b", lineHeight: 1.7, margin: "12px 0 0", fontSize: "13px" }}>
            État actuel de l’index : {chunks.length} extraits de repérage sont enregistrés. La recherche porte sur ces extraits et les notices, pas encore sur l’intégralité de chaque page PDF. Pour vérifier un passage, ouvrez le texte complet depuis le portail officiel. Le moteur de conversation IA n’est pas encore raccordé à cette bibliothèque.
          </p>
        </section>
      </div>
    </main>
  );
}
