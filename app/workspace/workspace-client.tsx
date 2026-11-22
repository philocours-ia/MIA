"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Section = "workspace" | "research" | "civil" | "education" | "accounting" | "miora" | "library" | "documents" | "history";

const navigation: { id: Section; label: string; marker: string }[] = [
  { id: "workspace", label: "Accueil", marker: "⌂" },
  { id: "research", label: "Recherche", marker: "⌕" },
  { id: "civil", label: "État civil", marker: "▤" },
  { id: "education", label: "Pédagogie", marker: "▣" },
  { id: "accounting", label: "Comptabilité MIA", marker: "◈" },
  { id: "miora", label: "MIORA · CTD", marker: "✦" },
  { id: "library", label: "Bibliothèque", marker: "▥" },
  { id: "documents", label: "Mes documents", marker: "▧" },
  { id: "history", label: "Historique", marker: "◷" }
];

const sectionCopy: Record<Section, { eyebrow: string; title: string; text: string }> = {
  workspace: {
    eyebrow: "VOTRE BUREAU ADMINISTRATIF",
    title: "Bonjour, je suis MIA.",
    text: "Je vous accompagne dans vos recherches, vos démarches et la préparation de vos documents administratifs."
  },
  research: { eyebrow: "INTELLIGENCE DOCUMENTAIRE", title: "Recherche & analyse", text: "Explorez les textes, manuels et ressources intégrés à la bibliothèque de MIA." },
  education: { eyebrow: "ESPACE PÉDAGOGIQUE", title: "Apprendre avec MIA", text: "Cours, exercices, explications, évaluations et accompagnement adapté à votre niveau." },
  accounting: { eyebrow: "GESTION DE LA PLATEFORME", title: "Comptabilité de MIA", text: "Suivi des abonnements, recettes, dépenses, factures et rapports financiers de la plateforme." },
  miora: { eyebrow: "INTELLIGENCE CTD", title: "MIORA", text: "Votre intelligence spécialisée dans la gestion des collectivités territoriales décentralisées." },
  civil: {
    eyebrow: "PRÉPARATION DES ACTES",
    title: "État civil",
    text: "Préparez vos projets d'actes avec méthode, à partir des modèles et des références validés."
  },
  library: {
    eyebrow: "BASE DOCUMENTAIRE",
    title: "Bibliothèque administrative",
    text: "Retrouvez les textes, manuels, procédures et modèles que vous aurez intégrés à votre espace."
  },
  documents: {
    eyebrow: "ESPACE PERSONNEL",
    title: "Mes documents",
    text: "Un espace destiné à retrouver vos brouillons, analyses et documents de travail."
  },
  history: {
    eyebrow: "SUIVI DES ACTIVITÉS",
    title: "Historique",
    text: "Consultez vos échanges et les travaux réalisés dans votre espace MIA."
  }
};

const quickActions = [
  { icon: "▤", title: "Préparer un acte", description: "Naissance, mariage, décès et autres actes.", prompt: "Je souhaite préparer un projet d'acte d'état civil." },
  { icon: "⌕", title: "Rechercher un texte", description: "Retrouver une loi, un décret ou un article.", prompt: "Je souhaite rechercher un texte officiel applicable à ma démarche." },
  { icon: "▧", title: "Analyser un document", description: "Comprendre, vérifier et résumer un document.", prompt: "Je souhaite analyser un document administratif." },
  { icon: "✦", title: "Consulter MIORA", description: "Gestion communale et CTD.", prompt: "Je souhaite consulter MIORA au sujet de la gestion d’une CTD." }
];

export default function WorkspaceClient({ userEmail, userRole }: { userEmail: string; userRole: string }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("workspace");
  const [language, setLanguage] = useState<"FR" | "MG">("FR");
  const [input, setInput] = useState("");
  const { messages, sendMessage: sendAIMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" })
  });

  const copy = sectionCopy[activeSection];

  async function handleSignOut() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  function sendMessage(event?: FormEvent<HTMLFormElement>, preset?: string) {
    event?.preventDefault();
    const text = (preset ?? input).trim();
    if (!text || status !== "ready") return;
    sendAIMessage({ text });
    setInput("");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="MIA, accueil">
          <span className="brand-mark"><span>M</span><i>✦</i></span>
          <span className="brand-copy">
            <strong>MIA</strong>
            <small>ASSISTANTE ADMINISTRATIVE</small>
          </span>
        </a>

        <div className="workspace-label">ESPACE DE TRAVAIL</div>
        <nav className="side-nav" aria-label="Navigation principale">
          {navigation.map((item) => item.id === "library" ? (
            <a className="nav-item" href="/library" key={item.id}>
              <span className="nav-marker">{item.marker}</span>
              <span>{item.label}</span>
            </a>
          ) : (
            <button
              type="button"
              key={item.id}
              className={activeSection === item.id ? "nav-item active" : "nav-item"}
              onClick={() => setActiveSection(item.id)}
              aria-current={activeSection === item.id ? "page" : undefined}
            >
              <span className="nav-marker">{item.marker}</span>
              <span>{item.label}</span>
              {activeSection === item.id && <span className="nav-active-dot" />}
            </button>
          ))}
          {(userRole === "owner" || userRole === "admin") && (
            <a className="nav-item" href="/admin">
              <span className="nav-marker">⚙</span>
              <span>Administration</span>
              <span className="nav-active-dot" />
            </a>
          )}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <span className="note-spark">✦</span>
          <p>Une assistance claire, rigoureuse et attentive à vos réalités administratives.</p>
        </div>
        <div className="profile-row">
          <div className="profile-avatar">J</div>
          <div className="profile-copy">
            <strong>{userEmail || "Mon espace"}</strong>
            <small>{userRole === "owner" ? "Propriétaire MIA" : userRole === "admin" ? "Administrateur" : "Compte sécurisé"}</small>
          </div>
          <button className="logout-button" type="button" onClick={handleSignOut}>Quitter</button>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumb"><span>Accueil</span><b>/</b><strong>{navigation.find((n) => n.id === activeSection)?.label}</strong></div>
          <div className="topbar-right">
            <span className="status-pill"><i /> Interface prête</span>
            <button className="language-toggle" type="button" onClick={() => setLanguage(language === "FR" ? "MG" : "FR")} aria-label="Changer la langue">
              {language === "FR" ? "FR  ↔  MG" : "MG  ↔  FR"}
            </button>
            <button className="help-button" type="button" onClick={() => setActiveSection("workspace")} aria-label="Aide">?</button>
          </div>
        </header>

        <div className="content-wrap">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1>{language === "FR" ? copy.title : "Miarahaba, MIA aho."}</h1>
              <p className="welcome-text">{language === "FR" ? copy.text : "Mpanampy anao amin'ny fikarohana sy fanomanana antontan-taratasy ara-panjakana aho."}</p>
            </div>
            <div className="welcome-badge">
              <div className="mia-avatar" aria-label="Emblème MIA">
                <span className="avatar-hair" />
                <span className="avatar-face">
                  <i className="glasses left" /><i className="glasses right" />
                  <i className="avatar-smile" />
                </span>
                <span className="avatar-collar" />
              </div>
              <div className="badge-caption"><strong>MIA</strong><small>À votre écoute</small></div>
            </div>
          </div>

          {activeSection === "workspace" ? (
            <>
              <section className="hero-card">
                <div className="hero-orbit orbit-one" />
                <div className="hero-orbit orbit-two" />
                <div className="hero-content">
                  <span className="hero-kicker"><span>✦</span> VOTRE ASSISTANTE INTELLIGENTE</span>
                  <h2>Les démarches avancent<br />mieux quand elles sont claires.</h2>
                  <p>Recherchez une référence, préparez un brouillon ou faites le point sur un document. Je vous accompagne étape par étape.</p>
                  <button className="primary-button" type="button" onClick={() => document.getElementById("mia-input")?.focus()}>
                    Démarrer une demande <span>→</span>
                  </button>
                </div>
                <div className="hero-decoration">
                  <div className="deco-ring ring-a" />
                  <div className="deco-ring ring-b" />
                  <div className="deco-star">✦</div>
                  <span className="deco-caption">FRANÇAIS<br />MALAGASY</span>
                </div>
              </section>

              <div className="section-heading">
                <div><p className="eyebrow">POUR COMMENCER</p><h2>Que souhaitez-vous faire ?</h2></div>
                <span className="subtle-label">ACCÈS RAPIDE</span>
              </div>
              <div className="action-grid">
                {quickActions.map((action, index) => (
                  <button className="action-card" type="button" key={action.title} onClick={() => sendMessage(undefined, action.prompt)}>
                    <span className={"action-icon icon-" + index}>{action.icon}</span>
                    <span className="action-title">{action.title}</span>
                    <span className="action-description">{action.description}</span>
                    <span className="action-arrow">↗</span>
                  </button>
                ))}
              </div>

              <div className="bottom-grid">
                <section className="recent-card">
                  <div className="card-heading"><div><p className="eyebrow">VOTRE ACTIVITÉ</p><h3>Reprendre le fil</h3></div><span className="quiet-tag">RÉCENT</span></div>
                  <div className="empty-activity">
                    <span className="empty-icon">◷</span>
                    <div><strong>Votre espace est prêt.</strong><p>Vos recherches et brouillons apparaîtront ici au fur et à mesure de leur enregistrement.</p></div>
                  </div>
                </section>
                <section className="principle-card">
                  <span className="principle-icon">✧</span>
                  <div><p className="eyebrow">NOTRE ENGAGEMENT</p><h3>La rigueur avant tout.</h3><p>MIA distingue les textes officiels, les modèles fournis et les pratiques locales. La validation reste toujours entre les mains des agents habilités.</p></div>
                </section>
              </div>
            </>
          ) : (
            <section className="section-placeholder">
              <div className="placeholder-symbol">{navigation.find((n) => n.id === activeSection)?.marker}</div>
              <p className="eyebrow">ESPACE EN PRÉPARATION</p>
              <h2>{copy.title}</h2>
              <p>{copy.text}</p>
              <div className="placeholder-info"><span>✦</span> Cet espace sera activé progressivement à mesure que vos ressources et modèles seront intégrés.</div>
              <button className="secondary-button" type="button" onClick={() => setActiveSection("workspace")}>Revenir à l'espace de travail</button>
            </section>
          )}
        </div>
      </section>

      <aside className="assistant-panel">
        <div className="assistant-header">
          <div className="assistant-heading">
            <div className="mini-avatar"><span>M</span><i /></div>
            <div><strong>Parler avec MIA</strong><small><i /> Espace connecté</small></div>
          </div>
          <button className="panel-menu" type="button" aria-label="Options">···</button>
        </div>

        <div className="conversation-label"><span>AUJOURD'HUI</span></div>
        <div className="message-list" aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className={message.role === "assistant" ? "message-row mia-message" : "message-row user-message"}>
              {message.role === "assistant" && <div className="message-avatar">M</div>}
              <div className="message-bubble">
                {message.role === "assistant" && <strong className="message-author">MIA</strong>}
                {message.parts.map((part, index) => part.type === "text" ? <p key={index}>{part.text}</p> : null)}
              </div>
            </div>
          ))}
          {(status === "submitted" || status === "streaming") && <div className="message-row mia-message"><div className="message-avatar">M</div><div className="message-bubble"><strong className="message-author">MIA</strong><p>Je prépare votre réponse…</p></div></div>}
          {error && <div className="chat-error" role="alert">La réponse n’a pas pu être générée. Vérifiez la configuration du moteur IA puis réessayez.</div>}
        </div>

        <div className="suggestion-area">
          <p>VOUS POUVEZ AUSSI DEMANDER</p>
          <button type="button" onClick={() => sendMessage(undefined, "Quelles informations faut-il réunir pour préparer un acte de naissance ?")}>Les pièces à réunir pour un acte <span>↗</span></button>
          <button type="button" onClick={() => sendMessage(undefined, "Aidez-moi à comprendre un article de loi.")}>Comprendre un article de loi <span>↗</span></button>
        </div>

        <form className="chat-composer" onSubmit={(event) => sendMessage(event)}>
          <label className="sr-only" htmlFor="mia-input">Écrire un message à MIA</label>
          <textarea id="mia-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Écrivez votre demande..." rows={2} onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }} />
          <div className="composer-footer">
            <span>FR · MG <i /> Réponse respectueuse et documentée</span>
            <button className="send-button" type="submit" disabled={!input.trim() || status !== "ready"} aria-label="Envoyer le message">↑</button>
          </div>
        </form>
        <p className="privacy-note"><span>▣</span> Votre espace est protégé. Vérifiez toujours les documents avant tout usage officiel.</p>
      </aside>
    </main>
  );
}
