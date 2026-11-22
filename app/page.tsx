import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  if (!supabase) redirect("/setup");

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  redirect("/workspace");
}
