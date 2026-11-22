import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WorkspaceClient from "./workspace-client";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const supabase = await createClient();
  if (!supabase) redirect("/setup");

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : null,
    preferred_language: "fr"
  });

  if (profileError) {
    console.error("Profile initialization failed:", profileError.message);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <WorkspaceClient
      userEmail={user.email ?? ""}
      userRole={profile?.role ?? "user"}
    />
  );
}
