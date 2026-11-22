export default function SetupPage() {
  return (
    <main className="auth-page">
      <section className="auth-card setup-card">
        <div className="brand auth-brand">
          <span className="brand-mark omnia-auth-mark"><img src="/omnia-logo.svg" alt="" /></span>
          <span className="brand-copy"><strong>OMNIA</strong><small>INTELLIGENCE EN SYNERGIE</small></span>
        </div>
        <p className="eyebrow">CONFIGURATION TECHNIQUE</p>
        <h1>Connexion à la base en préparation.</h1>
        <p>Les variables publiques Supabase ne sont pas encore disponibles dans ce déploiement. Vérifiez les paramètres du projet Vercel, puis relancez le déploiement.</p>
      </section>
      <aside className="auth-side">
        <div className="auth-side-orbit orbit-a" /><div className="auth-side-orbit orbit-b" />
        <div className="auth-side-content"><span className="auth-side-star">✦</span><p>TOUTES LES INTELLIGENCES · UN SEUL UNIVERS</p><h2>La connaissance<br/>en synergie.</h2><span className="auth-side-tag">OMNIA</span></div>
        <div className="auth-side-bottom">OMNIA · TOUTE L'INTELLIGENCE. UNE SEULE VISION.</div>
      </aside>
    </main>
  );
}