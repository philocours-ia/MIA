"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setNotice("");

    const supabase = createClient();
    if (!supabase) {
      setErrorMessage("La connexion à la base de données n'est pas encore configurée.");
      return;
    }

    if (mode === "signup" && password.length < 10) {
      setErrorMessage("Veuillez choisir un mot de passe d'au moins 10 caractères.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/workspace");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "https://mia-assistant-phi.vercel.app"}/auth/callback`,
            data: { display_name: displayName.trim() || null }
          }
        });
        if (error) throw error;

        if (data.session && data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            display_name: displayName.trim() || null,
            preferred_language: "fr"
          });
          router.replace("/workspace");
          router.refresh();
        } else {
          setNotice("Votre demande de compte a été enregistrée. Consultez votre messagerie pour confirmer votre adresse avant de vous connecter.");
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Une erreur est survenue.";
      setErrorMessage(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <a className="brand auth-brand" href="/" aria-label="MIA, accueil">
          <span className="brand-mark"><span>M</span><i>✦</i></span>
          <span className="brand-copy"><strong>MIA</strong><small>ASSISTANTE ADMINISTRATIVE</small></span>
        </a>

        <div className="auth-intro">
          <p className="eyebrow">MALAGASY INTELLIGENT ASSISTANT</p>
          <h1>{mode === "signin" ? "Ravie de vous retrouver." : "Bienvenue dans votre espace."}</h1>
          <p>{mode === "signin" ? "Connectez-vous pour retrouver votre espace de travail administratif." : "Créez votre compte pour ouvrir votre espace de travail MIA."}</p>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Accès au compte">
          <button type="button" role="tab" aria-selected={mode === "signin"} className={mode === "signin" ? "selected" : ""} onClick={() => { setMode("signin"); setErrorMessage(""); setNotice(""); }}>Se connecter</button>
          <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "selected" : ""} onClick={() => { setMode("signup"); setErrorMessage(""); setNotice(""); }}>Créer un compte</button>
        </div>

        {errorMessage && <div className="auth-alert error" role="alert">{errorMessage}</div>}
        {notice && <div className="auth-alert success" role="status">{notice}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="auth-field">
              <label htmlFor="display-name">Nom affiché <span>(facultatif)</span></label>
              <input id="display-name" type="text" autoComplete="name" maxLength={100} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Votre nom" />
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="email">Adresse e-mail</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nom@exemple.com" />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={mode === "signup" ? 10 : 1} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === "signup" ? "10 caractères minimum" : "Votre mot de passe"} />
            {mode === "signup" && <small>Choisissez une phrase de passe longue et unique.</small>}
          </div>
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Veuillez patienter…" : mode === "signin" ? "Accéder à MIA" : "Créer mon compte"}
            {!busy && <span>→</span>}
          </button>
        </form>

        <div className="auth-assurance">
          <span>▣</span>
          <p>Chaque compte dispose d'un espace privé. Vos documents et conversations ne sont pas partagés avec les autres comptes.</p>
        </div>
        <p className="auth-foot">Les projets de documents restent soumis à la vérification du personnel habilité. MIA ne signe ni n'authentifie aucun acte officiel.</p>
      </section>

      <div className="auth-side">
        <div className="auth-side-orbit orbit-a" />
        <div className="auth-side-orbit orbit-b" />
        <div className="auth-side-content">
          <span className="auth-side-star">✦</span>
          <p>UNE ASSISTANCE ADMINISTRATIVE, EN DEUX LANGUES</p>
          <h2>La bonne information.<br />Au bon moment.</h2>
          <span className="auth-side-tag">FRANÇAIS · MALAGASY</span>
        </div>
        <div className="auth-side-bottom">MIA · MALAGASY INTELLIGENT ASSISTANT</div>
      </div>
    </main>
  );
}
