import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e6e8e3",
  borderRadius: "18px",
  padding: "22px",
  boxShadow: "0 8px 26px rgba(28, 44, 36, 0.045)"
} as const;

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/setup");

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "owner" && profile?.role !== "admin") {
    redirect("/workspace");
  }

  const isOwner = profile.role === "owner";
  const displayName = profile.display_name || user.email || "Administrateur";

  return (
    <main style={{ minHeight: "100vh", background: "#f5f6f2", color: "#1d2b25", padding: "36px clamp(20px, 5vw, 76px)" }}>
      <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap", marginBottom: "42px" }}>
          <div>
            <div style={{ fontSize: "12px", letterSpacing: "0.16em", color: "#708078", fontWeight: 700 }}>MIA · ESPACE SÉCURISÉ</div>
            <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)", lineHeight: 1.1, margin: "12px 0 8px" }}>Administration</h1>
            <p style={{ margin: 0, color: "#66736c" }}>Centre de contrôle de votre assistant administratif.</p>
          </div>
          <Link href="/workspace" style={{ color: "#285c49", background: "#e7efe9", borderRadius: "999px", padding: "12px 18px", textDecoration: "none", fontWeight: 650 }}>
            ← Retour à MIA
          </Link>
        </header>

        <section style={{ ...cardStyle, background: "linear-gradient(120deg, #183d31, #28644d)", color: "#ffffff", border: 0, padding: "30px", marginBottom: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "12px", letterSpacing: "0.14em", color: "#c6dfd0", fontWeight: 700 }}>ACCÈS {isOwner ? "PROPRIÉTAIRE" : "ADMINISTRATEUR"}</div>
              <h2 style={{ fontSize: "28px", margin: "12px 0 8px" }}>Bienvenue, {displayName}.</h2>
              <p style={{ color: "#e0ebe4", margin: 0, maxWidth: "660px", lineHeight: 1.65 }}>
                Votre compte est reconnu par MIA avec le rôle {isOwner ? "Propriétaire" : "Administrateur"}. Les espaces actuellement disponibles vous sont accessibles.
              </p>
            </div>
            <div style={{ border: "1px solid rgba(255,255,255,.28)", borderRadius: "14px", padding: "14px 18px", minWidth: "150px" }}>
              <div style={{ fontSize: "11px", color: "#c6dfd0", letterSpacing: ".1em" }}>STATUT DU COMPTE</div>
              <strong style={{ display: "block", fontSize: "18px", marginTop: "7px" }}>● Actif</strong>
            </div>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
          <section style={cardStyle}>
            <div style={{ color: "#38745b", fontSize: "12px", fontWeight: 750, letterSpacing: ".12em" }}>01 · IDENTITÉ & ACCÈS</div>
            <h3 style={{ margin: "12px 0 8px", fontSize: "19px" }}>Rôle propriétaire</h3>
            <p style={{ color: "#647169", lineHeight: 1.65, margin: 0 }}>Votre niveau d'accès est enregistré côté serveur et protégé contre les modifications depuis un compte utilisateur ordinaire.</p>
            <div style={{ marginTop: "16px", color: "#28704f", fontWeight: 700, fontSize: "13px" }}>● Configuration active</div>
          </section>
          <section style={cardStyle}>
            <div style={{ color: "#38745b", fontSize: "12px", fontWeight: 750, letterSpacing: ".12em" }}>02 · BASE DOCUMENTAIRE</div>
            <h3 style={{ margin: "12px 0 8px", fontSize: "19px" }}>Espace privé</h3>
            <p style={{ color: "#647169", lineHeight: 1.65, margin: 0 }}>La base Supabase et le stockage privé de documents sont configurés avec des règles d'accès par utilisateur.</p>
            <div style={{ marginTop: "16px", color: "#28704f", fontWeight: 700, fontSize: "13px" }}>● Protection activée</div>
          </section>
          <section style={cardStyle}>
            <div style={{ color: "#9a6a27", fontSize: "12px", fontWeight: 750, letterSpacing: ".12em" }}>03 · COMPTES & PERMISSIONS</div>
            <h3 style={{ margin: "12px 0 8px", fontSize: "19px" }}>Gestion des utilisateurs</h3>
            <p style={{ color: "#647169", lineHeight: 1.65, margin: 0 }}>Le socle des rôles est prêt. L'interface de création, de désactivation et d'attribution des rôles reste à développer.</p>
            <div style={{ marginTop: "16px", color: "#94651f", fontWeight: 700, fontSize: "13px" }}>En cours de construction</div>
          </section>
          <section style={cardStyle}>
            <div style={{ color: "#9a6a27", fontSize: "12px", fontWeight: 750, letterSpacing: ".12em" }}>04 · MOTEUR INTELLIGENT</div>
            <h3 style={{ margin: "12px 0 8px", fontSize: "19px" }}>Connexion IA</h3>
            <p style={{ color: "#647169", lineHeight: 1.65, margin: 0 }}>L'interface de conversation existe, mais le moteur IA et la recherche documentaire ne sont pas encore raccordés.</p>
            <div style={{ marginTop: "16px", color: "#94651f", fontWeight: 700, fontSize: "13px" }}>À connecter</div>
          </section>
        </div>

        <p style={{ color: "#738078", fontSize: "13px", lineHeight: 1.6, marginTop: "28px" }}>
          Connecté en tant que {user.email}. L'accès propriétaire est actif ; les fonctionnalités non encore développées ne sont pas présentées comme opérationnelles.
        </p>
      </div>
    </main>
  );
}
